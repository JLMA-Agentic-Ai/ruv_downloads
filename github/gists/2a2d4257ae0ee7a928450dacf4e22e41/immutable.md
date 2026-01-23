## Immutable System Implementation without Blockchain

Creating an immutable system without employing blockchain technology involves utilizing various strategies and technologies to ensure data integrity, non-repudiation, and permanence. Here are some approaches and a Python code example to demonstrate key concepts.

### Strategies:

1. **Use of Write-Once, Read-Many (WORM) Storage:**
   - Ensure that once data is written, it cannot be modified or deleted.
   
2. **Digital Signatures and Hashing:**
   - Ensure the authenticity and integrity of the data with cryptographic techniques.
   
3. **Append-only Databases:**
   - Allow data to be added but not altered or deleted.
   
4. **File System Permissions:**
   - Restrict write access to data files to prevent unauthorized modifications.
   
5. **Version Control Systems:**
   - Track changes to any set of files to ensure data integrity and immutability.
   
6. **Tamper-evident Logs:**
   - Implement secure logging mechanisms to detect any tampering.
   
7. **Regular Audits and Monitoring:**
   - Conduct regular audits of the data and systems managing it to verify integrity.

### Python Code Example:

#### Digital Signatures, Hashing, and Append-Only Operations:

```python
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
import os

# Generate RSA keys
def generate_keys():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    public_key = private_key.public_key()
    return private_key, public_key

# Sign data with the private key
def sign_data(private_key, data):
    signature = private_key.sign(
        data,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    return signature

# Verify signature with the public key
def verify_signature(public_key, data, signature):
    try:
        public_key.verify(
            signature,
            data,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except:
        return False

# Hash data
def hash_data(data):
    digest = hashes.Hash(hashes.SHA256(), backend=default_backend())
    digest.update(data)
    return digest.finalize()

# Append-only file operation
def append_to_file(filename, data):
    with open(filename, "ab") as file:  # Open in append mode
        file.write(data)

# Main function to demonstrate usage
def main():
    private_key, public_key = generate_keys()
    data = b"Immutable Data Example"
    signature = sign_data(private_key, data)
    
    # Verify the signature
    if verify_signature(public_key, data, signature):
        print("Signature verified.")
    else:
        print("Signature verification failed.")
    
    # Hash the data
    data_hash = hash_data(data)
    print("Data hash:", data_hash.hex())
    
    # Append data to a file
    append_to_file("append_only_log.txt", data + b"\n")

if __name__ == "__main__":
    main()
```

This Python script demonstrates generating RSA keys for digital signatures, hashing data using SHA-256, and appending data to a file to simulate an immutable system without blockchain technology. It's crucial to adapt and enhance these code snippets according to the specific requirements and security standards of your project or system.