# A Secure Express.js + Node.js API and Frontend

### 

# Purpose

This application serves as a secure counterpart to its vulnerable predecessor. It is designed to demonstrate best practices in application security for Node.js and Express.js, providing a reference for developers on how to build robust and resilient applications. This project can be used for:

*   **Learning Secure Coding:** Understand and implement secure coding practices for Node.js/Express.js applications.
*   **Benchmarking Security Tools:** Evaluate the effectiveness of DAST (Dynamic Application Security Testing) and SAST (Static Application Security Testing) tools against a secure codebase.
*   **Reference for Secure Development:** Use as a starting point for new projects to ensure security is built in from the ground up.

# Security Features

This project incorporates a wide range of security measures to protect against common vulnerabilities. The following table summarizes the key security features implemented:

| Category | Security Feature | Description |
| :--- | :--- | :--- |
| **Authentication & Authorization** | Strong Password Policies | Enforces complex password requirements and secure storage using bcrypt. |
| | Secure Session Management | Implements secure session handling with HttpOnly, Secure, and SameSite cookies. |
| | Role-Based Access Control (RBAC) | Ensures users can only access resources and functions they are authorized for. |
| | Multi-Factor Authentication (MFA) | Adds an extra layer of security for user logins. |
| **Input Validation & Sanitization** | Comprehensive Input Validation | Validates all user inputs on both the client and server side to prevent injection attacks. |
| | Output Encoding | Encodes all data before rendering it in the browser to prevent XSS attacks. |
| | Parameterized Queries | Uses parameterized queries to prevent SQL injection. |
| **Data Protection** | Secure Data Storage | Encrypts sensitive data at rest using strong encryption algorithms. |
| | Secure Data Transmission | Enforces HTTPS for all data in transit. |
| | Data Minimization | Only collects and stores the minimum amount of data necessary. |
| **API Security** | Secure API Design | Implements proper authentication, authorization, and rate limiting for all API endpoints. |
| | Input Validation for APIs | Validates all API inputs to prevent injection and other attacks. |
| | Secure Error Handling | Provides generic error messages to avoid leaking sensitive information. |
| **Security Headers** | Content Security Policy (CSP) | Restricts the sources from which content can be loaded to prevent XSS and data injection. |
| | HTTP Strict Transport Security (HSTS) | Forces the browser to only use HTTPS for the website. |
| | X-Frame-Options | Protects against clickjacking attacks. |
| | X-Content-Type-Options | Prevents MIME type sniffing. |
| | Referrer-Policy | Controls how much referrer information is sent with requests. |
| **Other Security Measures** | Regular Security Audits | Conducts regular security audits and code reviews to identify and fix vulnerabilities. |
| | Dependency Scanning | Scans for known vulnerabilities in dependencies and updates them regularly. |
| | Secure Configuration | Ensures all configurations are secure and follow best practices. |

# Quick Start

## Prerequisites

*   Node.js (v18 or higher)
*   npm (v9 or higher)
*   Docker (optional, for containerized deployment)

## Installation

### Using Docker (Recommended)

1.  **Pull the Docker Image:**
    ```bash
    docker pull sirappsec/nodejs-secure-app
    ```

2.  **Run the Docker Container:**
    ```bash
    docker run --rm -p 5000:5000 sirappsec/nodejs-secure-app
    ```

3.  **Access the Application:**
    Open your browser and navigate to `http://localhost:5000`.

### Using npm

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/SirAppSec/secure-node.js-express.js-app.git
    ```

2.  **Navigate to the Project Directory:**
    ```bash
    cd secure-node.js-express.js-app
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Start the Application:**
    ```bash
    npm start
    ```

5.  **Access the Application:**
    Open your browser and navigate to `http://localhost:5000`.

# Documentation

The Swagger documentation for the secure API is available at `http://localhost:5000/api-docs`. The documentation provides a clear overview of the API endpoints, their expected inputs, and the security measures in place.

# License

This repository is licensed under the MIT License. See the `LICENSE` file for more details.

# References

*   [OWASP Top 10](https://owasp.org/www-project-top-ten/)
*   [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
*   [Node.js Security Best Practices](https://github.com/nodejs/security-wg/blob/master/processes/threat_modeling.md)
*   [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
