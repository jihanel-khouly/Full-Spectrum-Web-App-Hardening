# Full Spectrum Web App Hardening

A security-focused project that demonstrates common web application vulnerabilities and their secure mitigations using **Node.js** and **Express.js**.  
This repository provides a clear, side-by-side comparison between an intentionally vulnerable application and its hardened, secure counterpart.

---

## Project Structure

```
Full-Spectrum-Web-App-Hardening/
│
├── vuln-node-js-express.js-app/     # Vulnerable version (intentionally insecure)
│
├── safe-node-js-express.js-app/     # Secured & hardened version
│
└── README.md
```

---

##  Project Goals

- Demonstrate real-world web application vulnerabilities
- Show how insecure coding leads to exploitation
- Apply secure coding and hardening techniques
- Compare vulnerable vs secured implementations
- Practice ethical web application security testing

---

## Security Concepts Demonstrated

This project focuses on practical web security concepts, including but not limited to:

- Cross-Site Scripting (XSS)
- Input Validation and Sanitization
- Secure HTTP Headers
- Error Handling and Information Disclosure
- Dependency Security
- Secure Express.js Configuration

---

##  Technologies Used

- Node.js (LTS)
- Express.js
- JavaScript
- npm

---

## Installation & Setup

### Prerequisites

Ensure the following tools are installed on your system:

- **Node.js (LTS)**  
  https://nodejs.org
- **Git**  
  https://git-scm.com

Verify installation:
```bash
node -v
npm -v
git --version
```

---

###  Clone the Repository

```bash
git clone https://github.com/jihanel-khouly/Full-Spectrum-Web-App-Hardening.git
cd Full-Spectrum-Web-App-Hardening
```

---

## Running the Applications

###  Run the Vulnerable Application

```bash
cd vuln-node-js-express.js-app
npm install
npm start
```

The application will run on:

```
http://localhost:3000
```

---

###  Run the Secured Application

Stop the vulnerable server or open a new terminal, then run:

```bash
cd safe-node-js-express.js-app
npm install
npm start
```

The application will run on:

```
http://localhost:3000
```

---

##  Recommended Testing Workflow

1. Start the **vulnerable application**
2. Test it using:

   * Manual payloads
   * Browser-based attacks
   * Security testing tools (e.g., Burp Suite)
3. Observe the vulnerabilities
4. Stop the server
5. Start the **secured application**
6. Re-test using the same techniques
7. Confirm that vulnerabilities are mitigated

---

##  Educational Disclaimer

This project is created **for educational and ethical security research purposes only**.
The vulnerable version **must not** be deployed in a production environment.

---


##  Project Value

This project demonstrates:

* Secure coding awareness
* Web application security fundamentals
* Hands-on vulnerability mitigation
* Real-world application hardening skills


* Technical interviews
* Learning web application security
