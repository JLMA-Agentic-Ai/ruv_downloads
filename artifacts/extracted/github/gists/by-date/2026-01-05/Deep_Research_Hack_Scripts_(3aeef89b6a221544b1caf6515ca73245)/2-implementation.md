Below is an example “full source code” implementation of the Ethical Cybersecurity Penetration Testing Framework described earlier. This example uses a folder structure with Markdown documentation and Bash scripts. **Remember:** You must only run these scripts on systems for which you have explicit authorization. Use this framework solely for educational or authorized security testing purposes.

---

### Folder Structure

```
pentest-framework/
├── guidelines/
│   └── legal-ethical.md
├── best-practices/
│   ├── application-security.md
│   └── discord-bot-security.md
├── tools/
│   ├── install_kali.sh
│   ├── install_metasploit.sh
│   ├── install_wireshark.sh
│   └── install_burp.sh
├── lab/
│   └── lab-setup.md
├── disclosure/
│   ├── responsible-disclosure.md
│   └── case-studies.md
└── scripts/
    ├── network_scan.sh
    ├── vuln_scan.sh
    └── README.md
```

---

Below are the contents of each file.

---

#### File: `guidelines/legal-ethical.md`

```markdown
# Legal and Ethical Guidelines for Penetration Testing

**Disclaimer:** This document is intended for ethical and authorized cybersecurity professionals. **Do not** perform penetration testing on systems without explicit written permission.

## 1. Authorization and Scope
- Always obtain written authorization from the system owner before testing.
- Clearly define the scope (IP ranges, domains, applications) in a Rules of Engagement (RoE) document.
- Ensure that all tests are conducted only on the systems that have been authorized.

## 2. Compliance with Laws
- Adhere to all applicable laws and regulations (e.g., CFAA in the U.S., GDPR in the EU).
- Understand that unauthorized access is illegal and subject to prosecution.
- Maintain documentation to prove authorization if challenged legally.

## 3. Non-Destructive Testing
- Use safe testing methods that do not cause damage or data loss.
- Avoid aggressive exploits that might crash systems or affect service availability.
- Only demonstrate proof-of-concept exploits without fully compromising the target.

## 4. Confidentiality and Data Protection
- Treat all data encountered during testing as confidential.
- Do not disclose sensitive data to unauthorized parties.
- Use non-disclosure agreements (NDAs) to ensure data and findings remain secure.

## 5. Professionalism and Reporting
- Document all findings in a clear and factual manner.
- Provide remediation advice along with vulnerability reports.
- Follow up with the client to ensure vulnerabilities are addressed.

## 6. Ethical Conduct
- Act in the best interests of the client and the users.
- Avoid any actions that could be interpreted as malicious or self-serving.
- Engage in continuous education and stay updated with ethical guidelines.

## 7. Liability and Safe Harbor
- Ensure you are covered by appropriate liability insurance.
- Follow any safe harbor clauses included in the engagement to protect against legal repercussions.

*By following these guidelines, you ensure that your penetration testing is both ethical and legally compliant.*

*References: OWASP Code of Ethics, NIST guidelines on cybersecurity testing.*
```

---

#### File: `best-practices/application-security.md`

```markdown
# Best Practices for Securing Applications

This document outlines secure coding and configuration practices to protect applications from vulnerabilities.

## 1. Input Validation and Sanitization
- Always validate and sanitize user input on both the client and server sides.
- Use whitelist validation and avoid blacklisting.
- Use frameworks that provide built-in security measures (e.g., parameterized queries).

## 2. Secure Data Handling
- Store sensitive data (passwords, tokens) securely using encryption and hashing.
- Never hardcode sensitive information; use environment variables or secure vaults.
- Apply the principle of least privilege in data access.

## 3. Authentication and Session Management
- Enforce strong password policies and multi-factor authentication.
- Use secure session management practices (e.g., session expiration, HTTPS).
- Regularly review and update authentication mechanisms.

## 4. Access Control
- Implement role-based access control (RBAC) to restrict user permissions.
- Verify user permissions on every request for sensitive operations.
- Regularly audit roles and privileges to remove any unnecessary access.

## 5. Dependency and Configuration Management
- Keep libraries and dependencies up-to-date to avoid known vulnerabilities.
- Regularly review and update configuration files to follow security best practices.
- Use tools like Snyk or Dependabot for continuous dependency security scanning.

## 6. Secure Defaults and Error Handling
- Configure systems with secure default settings (disable unnecessary services).
- Handle errors gracefully without revealing sensitive information.
- Log errors securely and monitor for abnormal patterns.

*Implement these best practices to reduce the risk of vulnerabilities and secure your applications effectively.*

*References: OWASP Secure Coding Practices, NIST SP 800-53.*
```

---

#### File: `best-practices/discord-bot-security.md`

```markdown
# Discord Bot Security Best Practices

This document provides specific guidelines to secure Discord bots from exploitation.

## 1. Protecting Bot Tokens
- **Never** hardcode your bot token in the code or repository.
- Store the token in an environment variable or a secure configuration file.
- Use `.gitignore` to prevent accidental commits of sensitive tokens.
- Rotate the token regularly and immediately if a leak is suspected.

## 2. Least Privilege
- When inviting your bot to a server, assign only the necessary permissions.
- Avoid granting administrator or excessive permissions unless required.
- Use role-based checks within your bot code to limit command access.

## 3. Input Validation
- Sanitize and validate all user input to avoid injection attacks.
- Do not execute system commands or evaluate code based on user input without strict validation.
- Use safe APIs provided by libraries like `discord.py` or `Discord.js`.

## 4. Rate Limiting and Monitoring
- Implement rate limiting on commands to prevent abuse and denial-of-service attacks.
- Log bot activities and monitor for unusual usage patterns.
- Set up alerts for potential abuse or abnormal behavior.

## 5. Keep Dependencies Updated
- Regularly update your bot's libraries and dependencies to patch known vulnerabilities.
- Follow Discord’s developer guidelines and security advisories.

## 6. Secure Data Storage
- Encrypt sensitive data stored by the bot.
- Secure any integrations (e.g., databases, external APIs) with proper authentication and encrypted connections.

*By following these practices, you help ensure your Discord bot remains secure and operates within ethical boundaries.*

*References: Discord Developer Documentation, OWASP API Security Project.*
```

---

#### File: `tools/install_kali.sh`

```bash
#!/bin/bash
# install_kali.sh - A script to set up a Kali Linux environment or install Kali tools on a Debian/Ubuntu-based system.
# Disclaimer: This script is for educational purposes only. Ensure you run it on a system you control and for which you have authorization.

echo "Starting Kali Linux tools installation..."
echo "This script will update your system and install the kali-linux-default meta-package."

# Check if the script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (e.g., using sudo)."
  exit 1
fi

# Update package list
echo "Updating package list..."
apt update

# Install Kali Linux default meta-package
echo "Installing kali-linux-default meta-package..."
apt install -y kali-linux-default

# Optionally, install additional common tools
echo "Installing additional tools (nmap, net-tools)..."
apt install -y nmap net-tools

echo "Kali Linux tools installation completed."
```

---

#### File: `tools/install_metasploit.sh`

```bash
#!/bin/bash
# install_metasploit.sh - A script to install or update the Metasploit Framework.
# Disclaimer: Use this script only in authorized environments.

echo "Starting Metasploit Framework installation/update..."

# Check if run as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo)."
  exit 1
fi

# Update system and install dependencies
echo "Updating system packages..."
apt update && apt upgrade -y

echo "Installing prerequisites..."
apt install -y curl gnupg2 wget build-essential

# Download the Metasploit installer
echo "Downloading Metasploit installer..."
curl https://raw.githubusercontent.com/rapid7/metasploit-framework/master/msfupdate > msfinstall
chmod +x msfinstall

echo "Running the Metasploit installer..."
./msfinstall

echo "Metasploit Framework installation/update completed."
```

---

#### File: `tools/install_wireshark.sh`

```bash
#!/bin/bash
# install_wireshark.sh - A script to install and configure Wireshark.
# Disclaimer: Use responsibly and only on systems you are authorized to test.

echo "Starting Wireshark installation..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo)."
  exit 1
fi

# Update package list and install Wireshark
apt update
apt install -y wireshark

# Configure Wireshark permissions
echo "Configuring Wireshark permissions..."
dpkg-reconfigure wireshark-common

# Add the invoking user to the wireshark group (ensure $SUDO_USER is defined)
if [ -n "$SUDO_USER" ]; then
  usermod -a -G wireshark "$SUDO_USER"
  echo "Added user $SUDO_USER to the wireshark group."
else
  echo "Could not determine the invoking user."
fi

echo "Wireshark installation and configuration completed."
```

---

#### File: `tools/install_burp.sh`

```bash
#!/bin/bash
# install_burp.sh - A script to install Burp Suite Community Edition.
# Disclaimer: This script is for educational purposes only. Use it on authorized systems only.

echo "Starting Burp Suite Community Edition installation..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo)."
  exit 1
fi

# Update package list
apt update

# Install Java (if not installed), as Burp Suite requires Java
echo "Installing OpenJDK..."
apt install -y default-jre

# Download Burp Suite Community Edition installer
echo "Downloading Burp Suite Community Edition..."
wget -O burpsuite_community.sh "https://portswigger.net/burp/releases/download?product=community&version=2022.8.2&type=Linux"

# Make the installer executable
chmod +x burpsuite_community.sh

# Run the installer (this may launch a GUI installer)
./burpsuite_community.sh

echo "Burp Suite installation completed. You may launch it from your applications menu."
```

> **Note:** The Burp Suite installer URL may change over time; please verify the current download link from the [official site](https://portswigger.net/burp).

---

#### File: `lab/lab-setup.md`

```markdown
# Ethical Hacking Lab Setup Guide

This guide explains how to create an isolated ethical hacking lab using virtual machines (VMs). The lab allows you to practice penetration testing on authorized, vulnerable targets without risking harm to production systems.

## Requirements
- A computer with at least 16 GB of RAM and a multi-core CPU.
- Virtualization software (e.g., VirtualBox or VMware Workstation).
- ISO images or VM appliances for:
  - **Kali Linux** (attacker machine)
  - **Metasploitable2** or other vulnerable VMs (target machines)

## Steps to Set Up the Lab

### 1. Install Virtualization Software
- Download and install [VirtualBox](https://www.virtualbox.org/) or your preferred VM software.
- Ensure virtualization is enabled in your BIOS/UEFI settings.

### 2. Set Up the Attacker Machine (Kali Linux)
- Download the latest Kali Linux VirtualBox image from the [official site](https://www.kali.org/get-kali/#kali-virtual-machines).
- Import the image into VirtualBox:
  - Go to **File > Import Appliance**.
  - Select the downloaded `.ova` file and follow the prompts.
- Configure network settings:
  - Attach one network adapter to NAT for internet access.
  - Attach a second adapter to a Host-Only network for isolated testing with target machines.
- Start the Kali Linux VM and log in (default credentials: `kali/kali`).

### 3. Set Up Vulnerable Target VMs
- Download vulnerable VM images such as **Metasploitable2** or images from [VulnHub](https://www.vulnhub.com/).
- Import the target VMs into VirtualBox.
- Connect target VMs to the same Host-Only network as your Kali VM.
- Configure static IP addresses if necessary (e.g., Kali: 192.168.56.101, Metasploitable2: 192.168.56.102).

### 4. Verify Lab Network Connectivity
- In your Kali VM, open a terminal and run:
  ```bash
  ping 192.168.56.102
  ```
- Ensure that the target VM responds.

### 5. Create Snapshots
- Once your lab is set up and configured, take snapshots of your VMs.
- Snapshots allow you to revert to a clean state if a VM becomes compromised during testing.

### 6. Additional Lab Enhancements (Optional)
- Set up an Active Directory lab with Windows Server and client VMs for advanced testing.
- Configure shared folders or networks for file exchange between VMs if needed.

*Follow these steps to create a safe, isolated environment for ethical penetration testing. Always ensure you only test systems you have explicit permission to test.*
```

---

#### File: `disclosure/responsible-disclosure.md`

```markdown
# Responsible Disclosure Guidelines

Responsible disclosure is a best practice that helps ensure vulnerabilities are fixed before public disclosure. Use the following steps to report a vulnerability responsibly:

## 1. Initial Private Reporting
- Report the vulnerability privately to the affected vendor or organization.
- Use official channels (e.g., a security contact email, bug bounty platform, or Vulnerability Disclosure Policy page).
- Provide sufficient detail to allow the vendor to verify and reproduce the issue—but avoid sharing overly sensitive data.

## 2. Allow Reasonable Time for Remediation
- Allow the vendor a reasonable period (typically 60–90 days) to fix the vulnerability.
- Maintain open communication; if the vendor needs more time or clarification, work with them.
- Document all correspondence for your records.

## 3. Escalation and Coordination
- If the vendor is unresponsive, consider involving a coordinating body (such as a CERT).
- Follow industry standards (for example, Project Zero’s 90-day disclosure policy) before going public.

## 4. Public Disclosure
- Once a fix has been released (or the agreed time has elapsed), coordinate public disclosure.
- Provide enough detail for the community to understand the vulnerability without enabling malicious exploitation.
- Credit all parties involved appropriately.

## 5. Legal and Ethical Considerations
- Ensure that all testing and reporting were conducted legally and ethically.
- Do not publish exploit code until it is safe to do so.
- Follow any safe harbor provisions offered by the vendor.

*By following these guidelines, you help improve security while minimizing risk to users and systems.*

*References: OWASP Vulnerability Disclosure Guidelines, Project Zero Disclosure Policy.*
```

---

#### File: `disclosure/case-studies.md`

```markdown
# Ethical Penetration Testing Case Studies

This document highlights several case studies that demonstrate the value of ethical penetration testing and responsible disclosure.

## 1. WordPress Plugin Vulnerability
- **Scenario:** A researcher discovered a vulnerability in a popular WordPress plugin that exposed user tokens.
- **Action:** The researcher reported the issue to the plugin vendor and coordinated a fix before public disclosure.
- **Outcome:** The vulnerability was patched, protecting thousands of websites from potential exploitation.

## 2. Visa Contactless Payment Vulnerability
- **Scenario:** Ethical hackers uncovered a method to bypass limits on Visa's contactless payment system.
- **Action:** The vulnerability was responsibly disclosed to Visa.
- **Outcome:** The issue prompted an industry-wide review and improvements in contactless payment security.

## 3. Zoom Webcam Vulnerability
- **Scenario:** A critical vulnerability in Zoom allowed remote activation of webcams.
- **Action:** The researcher disclosed the issue, prompting immediate patches from both Zoom and Apple.
- **Outcome:** Rapid remediation prevented widespread privacy breaches.

## 4. Canon DSLR Firmware Vulnerability
- **Scenario:** Vulnerabilities in Canon camera firmware could have allowed ransomware to encrypt users’ photos.
- **Action:** The researcher worked with Canon to patch the firmware.
- **Outcome:** The vulnerability was fixed, ensuring users’ data remained secure.

## 5. Physical Security Test at a Courthouse
- **Scenario:** A penetration test on an Iowa courthouse resulted in an unexpected arrest due to miscommunication.
- **Action:** Although fully authorized, the incident highlighted the importance of coordination with local law enforcement.
- **Outcome:** The incident led to improved procedures for physical penetration tests.

*These case studies illustrate the importance of ethical hacking and responsible disclosure. They show that when vulnerabilities are reported responsibly, organizations can fix issues before they are exploited by malicious actors.*

*References: Various industry reports and news articles on vulnerability disclosures and bug bounty successes.*
```

---

#### File: `scripts/network_scan.sh`

```bash
#!/bin/bash
# network_scan.sh - A script to perform a network scan using Nmap.
# Disclaimer: Use this script only on networks for which you have explicit permission to scan.

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <target-IP-or-network>"
  exit 1
fi

TARGET="$1"

echo "Starting network scan on target: $TARGET"
echo "Please ensure you have authorization to scan this network."

# Perform a ping sweep and a detailed scan (service/version detection and OS fingerprinting)
nmap -sn "$TARGET" -oN ping_sweep.txt
nmap -sV -O "$TARGET" -oN detailed_scan.txt

echo "Scan completed."
echo "Ping sweep results saved to ping_sweep.txt"
echo "Detailed scan results saved to detailed_scan.txt"
```

---

#### File: `scripts/vuln_scan.sh`

```bash
#!/bin/bash
# vuln_scan.sh - A script to perform vulnerability scanning using Nmap's NSE scripts.
# Disclaimer: Use this script only on systems you are authorized to test.

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <target-IP>"
  exit 1
fi

TARGET="$1"

echo "Starting vulnerability scan on target: $TARGET"
echo "Please ensure you have authorization to scan this target."

# Run Nmap with vulnerability scripts and output the results
nmap -sV --script vuln "$TARGET" -oN vuln_scan.txt

echo "Vulnerability scan completed."
echo "Results saved to vuln_scan.txt"
```

---

#### File: `scripts/README.md`

```markdown
# Scripts Usage Guide

This folder contains scripts designed to assist with network and vulnerability scanning during penetration testing engagements.

## Files

- **network_scan.sh**
  - **Description:** Performs a basic network scan using Nmap. It runs a ping sweep and a detailed scan (service/version detection and OS fingerprinting).
  - **Usage:** `./network_scan.sh <target-IP-or-network>`
  - **Output:** Results are saved in `ping_sweep.txt` and `detailed_scan.txt`.

- **vuln_scan.sh**
  - **Description:** Uses Nmap's vulnerability scripts (NSE) to scan a target for known vulnerabilities.
  - **Usage:** `./vuln_scan.sh <target-IP>`
  - **Output:** Results are saved in `vuln_scan.txt`.

## Pre-requisites
- Ensure that Nmap is installed on your system.
- Run these scripts only on networks and systems for which you have explicit permission to perform security testing.

## Disclaimer
These scripts are intended for educational and authorized penetration testing purposes only. Unauthorized scanning or exploitation is illegal and unethical.

For further customization, review the script comments and adjust parameters as needed.
```

---

### Deployment and Usage

1. **Clone or download the repository:**  
   Place the entire `pentest-framework` folder on your lab machine.

2. **Review the Documentation:**  
   Read through the Markdown files in the `guidelines`, `best-practices`, `lab`, and `disclosure` folders to understand legal, ethical, and technical considerations.

3. **Install Tools:**  
   Run the installation scripts in the `tools` folder (using `sudo` as necessary) to set up your testing environment. For example:  
   ```bash
   cd pentest-framework/tools
   sudo ./install_kali.sh
   sudo ./install_metasploit.sh
   sudo ./install_wireshark.sh
   sudo ./install_burp.sh
   ```

4. **Set Up Your Lab:**  
   Follow the instructions in `lab/lab-setup.md` to configure your virtual machines and isolated testing network.

5. **Run Scans:**  
   Use the scripts in the `scripts` folder to perform network reconnaissance and vulnerability scans. For example:  
   ```bash
   cd pentest-framework/scripts
   chmod +x network_scan.sh vuln_scan.sh
   ./network_scan.sh 192.168.56.0/24
   ./vuln_scan.sh 192.168.56.102
   ```

6. **Review Results and Report:**  
   Analyze the output files and cross-reference with the best practices to develop remediation recommendations. Use your findings as a basis for a formal report following the guidelines provided.

---

**Important:**  
This framework is provided as an educational example. Ensure that all testing is performed only on systems for which you have explicit authorization, and always adhere to legal and ethical guidelines.

Feel free to adjust and expand on these files to suit your environment and testing requirements.