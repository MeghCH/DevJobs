# Security Analysis: Threats and Implemented Controls

This document outlines the primary security threats considered during the development of our project and the specific technical controls implemented to mitigate them.

---

## 1. SQL & NoSQL Injection
### **Threat Considered**
An attacker could attempt to send malicious code through input fields (login, search, etc.) to manipulate database queries, bypass authentication, or leak sensitive data.

### **Implemented Controls**
* **Parameterized Queries (Prepared Statements):** We use the `?` placeholder methodology with the `mysql2` driver. This ensures a strict separation between the SQL command logic and the user-provided data.
* **Data Sanitization:** All incoming data is treated as literal strings and is never concatenated directly into database queries.
* **Input Validation:** Strict type checking is applied to ensure that data matches expected formats (e.g., ensuring an email is a string, not an object).

---

## 2. Brute Force Attacks
### **Threat Considered**
Automated bots or malicious actors may attempt to guess user credentials by submitting thousands of password combinations per minute to gain unauthorized access to accounts.

### **Implemented Controls**
* **Rate Limiting:** We have implemented a rate limiter (e.g., `express-rate-limit`) that restricts the number of requests a single IP address can make to the `/auth` endpoints within a specific timeframe.
* **Account Lockout Policy:** (If applicable) Consecutive failed login attempts trigger a temporary cooldown period for the targeted account.
* **Password Hashing:** Passwords are never stored in plain text; we use high-entropy hashing algorithms (like `bcrypt`) to ensure that even if data is leaked, passwords remain unreadable.

---

## 3. Cross-Site Request Forgery (CSRF)
### **Threat Considered**
An attacker might trick a logged-in user into performing unwanted actions on our application (like changing their password or deleting data) by using a malicious link or a third-party site.

### **Implemented Controls**
* **SameSite Cookie Attribute:** We set the `SameSite` attribute of our session/JWT cookies to `Strict` or `Lax`. This prevents the browser from sending the authentication cookie during cross-site requests.
* **Anti-CSRF Tokens:** (If applicable) For sensitive state-changing operations, we require a unique, cryptographically strong token that must match the server-side secret.
* **CORS Policy:** We use a restrictive Cross-Origin Resource Sharing (CORS) policy to allow requests only from trusted and verified domains.

---

## 4. Cross-Site Scripting (XSS)
### **Threat Considered**
Attackers may try to inject malicious scripts into the web pages viewed by other users to steal session cookies or hijack user sessions.

### **Implemented Controls**
* **HTTP-Only Cookies:** Authentication cookies are marked as `HttpOnly`, making them inaccessible to JavaScript and protecting them from being stolen via XSS.
* **Output Encoding:** All data rendered in the browser is automatically escaped by our frontend framework to prevent the execution of injected scripts.
* **Content Security Policy (CSP):** We implement CSP headers to restrict the sources from which scripts can be executed.

---

## Summary of Controls Table

| Threat | Control Mechanism | Status |
| :--- | :--- | :--- |
| **Injection** | Prepared Statements (`?`)
| **Brute Force** | Rate Limiting & Cooldowns 
| **CSRF** | SameSite Cookies / CORS 
| **XSS** | HttpOnly Cookies & Escaping 
