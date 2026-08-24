# SQL Injection Protection 

## Secure Pattern (Used in authController.js)

*SECURE — Prepared statement*
The driver separates the SQL command from the user data.
await pool.query(
  'SELECT * FROM users WHERE email = ?',
  [email]
);

Little comparaison between the two ways to write it, good practice or not. 

### Vulnerable pattern (NOT used) :
```js// Dangerous — direct string concatenationconst query = `SELECT * FROM users WHERE email = '${email}'`;```

### Secure pattern (used throughout the project) :
 ```js// Safe — prepared statementawait pool.query(  'SELECT * FROM users WHERE email = ?',  [email]);```


2. **Why This Approach is Infallible**

Using the *?* symbol and passing variables as an array provides two critical layers of protection:

Execution Plan Separation: The SQL query structure is sent and analyzed by the database before injecting the data. The database "knows" that the ? can only be a text value, not an additional command.

Neutralization (Escaping): The driver (mysql2) processes the data to ensure that reserved characters (such as ', ;, --) lose their command power. They are treated as simple pieces of text.

3. **Evidence of Implementation**

- File: controllers/authController.js

- General Rule: No pool.query() call contains variables injected directly via template strings (${variable}).

4. **NoSQL Protection**

The same rigor is applied to NoSQL interactions:

Data type validation (e.g., ensuring an email is indeed a String).

Using structured query objects instead of passing the raw request body (req.body) to search functions.

5. **Summary**

Security Conclusion: Our backend strictly enforces prepared statements (using the ? placeholder) for all database interactions. By separating the SQL command structure from user data, we make SQL and NoSQL injections impossible: malicious characters are neutralized and treated as literal text, ensuring that no external code can ever be executed.