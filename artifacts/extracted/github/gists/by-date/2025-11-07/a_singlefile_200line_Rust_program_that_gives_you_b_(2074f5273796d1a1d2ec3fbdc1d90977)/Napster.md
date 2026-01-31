Below is a **single‑file, \~200‑line Rust program** that gives you both a **central index server** and a **peer client** in the spirit of the original Napster:

* Central server keeps an in‑memory map **file → Vec\<Peer>**.
* Each peer starts a tiny file server, registers its song list, can search, and then pulls files directly from the chosen peer.
* Blocking I/O, zero external crates, so it compiles with plain `rustc`.
* Run as `napster server 0.0.0.0:8080` for the index, and
  `napster client 127.0.0.1:8080 ./music 9000` on each peer (share dir + local port).

> **Educational use only.** No authentication, encryption, or rate‑limiting—so never expose to the open Internet.

```rust
// napster.rs  –  build:  rustc napster.rs
use std::{
    collections::HashMap,
    env, fs,
    io::{BufRead, BufReader, Read, Write},
    net::{TcpListener, TcpStream},
    path::PathBuf,
    sync::{Arc, Mutex},
    thread,
};

#[derive(Clone, Debug)]
struct Peer {
    ip: String,
    port: u16,
}

type Index = Arc<Mutex<HashMap<String, Vec<Peer>>>>;

/* ========== CENTRAL INDEX ========== */
fn run_server(bind: &str) -> std::io::Result<()> {
    let index: Index = Arc::new(Mutex::new(HashMap::new()));
    let listener = TcpListener::bind(bind)?;
    println!("Index listening on {bind}");

    for conn in listener.incoming() {
        let idx = index.clone();
        thread::spawn(move || {
            if let Ok(mut stream) = conn {
                if let Err(e) = handle_server_conn(&mut stream, idx) {
                    eprintln!("Server err: {e}");
                }
            }
        });
    }
    Ok(())
}

fn handle_server_conn(stream: &mut TcpStream, index: Index) -> std::io::Result<()> {
    let mut reader = BufReader::new(stream.try_clone()?);
    let mut line = String::new();

    // 1) expect: HELLO <port>
    reader.read_line(&mut line)?;
    let parts: Vec<_> = line.trim_end().split_whitespace().collect();
    if parts.len() != 2 || parts[0] != "HELLO" {
        return Ok(());
    }
    let peer = Peer {
        ip: stream.peer_addr()?.ip().to_string(),
        port: parts[1].parse().unwrap_or(0),
    };

    // 2) subsequent lines: FILE <name> | DONE | SEARCH <name>
    loop {
        line.clear();
        if reader.read_line(&mut line)? == 0 {
            break;
        }
        let words: Vec<_> = line.trim_end().splitn(2, ' ').collect();
        match words.as_slice() {
            ["FILE", f] => {
                index
                    .lock()
                    .unwrap()
                    .entry(f.to_string())
                    .or_default()
                    .push(peer.clone());
            }
            ["SEARCH", f] => {
                let peers = index.lock().unwrap();
                if let Some(list) = peers.get(*f) {
                    for p in list {
                        writeln!(stream, "{}:{}", p.ip, p.port)?;
                    }
                }
                writeln!(stream, "END")?;
            }
            ["DONE"] => break,
            _ => {}
        }
    }
    Ok(())
}

/* ========== PEER FILE‑SERVER ========== */
fn file_server(dir: PathBuf, port: u16) {
    thread::spawn(move || {
        let listener = TcpListener::bind(("0.0.0.0", port)).expect("bind file server");
        println!("File server on 0.0.0.0:{port}");
        for conn in listener.incoming() {
            if let Ok(mut s) = conn {
                thread::spawn({
                    let d = dir.clone();
                    move || {
                        if let Err(e) = handle_file_req(&mut s, d) {
                            eprintln!("file tx err: {e}");
                        }
                    }
                });
            }
        }
    });
}

fn handle_file_req(stream: &mut TcpStream, dir: PathBuf) -> std::io::Result<()> {
    let mut line = String::new();
    BufReader::new(stream.try_clone()?).read_line(&mut line)?;
    let parts: Vec<_> = line.trim_end().splitn(2, ' ').collect();
    if parts.len() != 2 || parts[0] != "GET" {
        return Ok(());
    }
    let mut path = dir.clone();
    path.push(parts[1]);
    let mut file = fs::File::open(path)?;
    std::io::copy(&mut file, stream)?;
    Ok(())
}

/* ========== PEER CLIENT ========== */
fn run_client(index_addr: &str, share_dir: &str, listen_port: u16) -> std::io::Result<()> {
    let dir = PathBuf::from(share_dir);
    file_server(dir.clone(), listen_port);

    let mut idx = TcpStream::connect(index_addr)?;
    // send hello
    writeln!(idx, "HELLO {listen_port}")?;

    // register files
    for entry in fs::read_dir(&dir)? {
        let f = entry?.file_name();
        let name = f.to_string_lossy();
        writeln!(idx, "FILE {name}")?;
    }
    writeln!(idx, "DONE")?;
    println!("Registered with index {index_addr}");

    // interactively search & download
    let stdin = std::io::stdin();
    for line in stdin.lock().lines() {
        let cmd = line?;
        let parts: Vec<_> = cmd.split_whitespace().collect();
        if parts.len() == 2 && parts[0] == "find" {
            let song = parts[1];
            writeln!(idx, "SEARCH {song}")?;
            let mut reader = BufReader::new(idx.try_clone()?);
            loop {
                let mut res = String::new();
                reader.read_line(&mut res)?;
                let target = res.trim_end();
                if target == "END" || target.is_empty() {
                    break;
                }
                println!("found at {target}");
                if let Some(p) = target.split_once(':') {
                    download(song, p.0, p.1.parse().unwrap(), &dir)?;
                    break;
                }
            }
        } else {
            println!("usage: find <filename>");
        }
    }
    Ok(())
}

fn download(song: &str, host: &str, port: u16, dir: &PathBuf) -> std::io::Result<()> {
    println!("Downloading {song} from {host}:{port}");
    let mut stream = TcpStream::connect((host, port))?;
    writeln!(stream, "GET {song}")?;
    let mut out = fs::File::create(dir.join(song))?;
    std::io::copy(&mut stream, &mut out)?;
    println!("saved {}", dir.join(song).display());
    Ok(())
}

/* ========== MAIN ========== */
fn main() -> std::io::Result<()> {
    let mut args = env::args().skip(1).collect::<Vec<_>>();
    if args.len() < 2 {
        eprintln!("USAGE:\n  napster server <bind_addr>\n  napster client <index_addr> <share_dir> <listen_port>");
        std::process::exit(1);
    }
    match args.remove(0).as_str() {
        "server" => run_server(&args[0]),
        "client" => {
            let port: u16 = args[2].parse().unwrap();
            run_client(&args[0], &args[1], port)
        }
        _ => Ok(()),
    }
}
```

### Quick test

```bash
# terminal 1 – index
$ rustc napster.rs
$ ./napster server 0.0.0.0:8080

# terminal 2 – peer A
$ ./napster client 127.0.0.1:8080 ./alice_songs 9000
find song.mp3            # downloads if another peer has it

# terminal 3 – peer B
$ ./napster client 127.0.0.1:8080 ./bob_songs 9001
```

This is the bare minimum—about two hundred lines, zero dependencies, one source file. Extend with TLS, hashing, and multi‑threaded index writes if you want a production‑worthy tool.
