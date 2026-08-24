const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * @description Auth Controller
 * Handles user registration and login
 */
const AuthController = {
  /**
   * @route POST /api/auth/register
   * @desc Register a new user
   */
  async register(req, res) {
    try {
      const { name, firstname, email, password, role, company, siret } =
        req.body;

      if (!name || !firstname || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide name, firstname, email and password",
        });
      }

      const userRole = role || "user";
      if (!["user", "recruiter"].includes(userRole)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be either "user" or "recruiter"',
        });
      }

      if (userRole === "recruiter" && !company) {
        return res.status(400).json({
          success: false,
          message: "Recruiters must provide a company name",
        });
      }

      // Check if user exists
      const [existingUsers] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const [result] = await pool.query(
        "INSERT INTO users (name, firstname, email, password, role, company, siret) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          firstname,
          email,
          hashedPassword,
          userRole,
          company || null,
          siret || null,
        ],
      );

      const [newUser] = await pool.query(
        "SELECT id, name, firstname, email, role, company, siret, created_at FROM users WHERE id = ?",
        [result.insertId],
      );

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: newUser[0],
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        success: false,
        message: "Error registering user",
      });
    }
  },

  /**
   * @route POST /api/auth/login
   * @desc Login a user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password",
        });
      }

      const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const user = users[0];

      if (user.role === "banned") {
        return res.status(403).json({
          success: false,
          message: "Votre compte a été suspendu.",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
      );

      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("token", token, {
        // Protege contre xss
        httpOnly: true,
        // HTTPS uniquement en prod
        secure: isProduction,
        // Bloque les requetes cross-site
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1h
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          firstname: user.firstname,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Error logging in",
      });
    }
  },

  /**
   * @route GET /api/auth/me
   * @desc Get current authenticated user
   */
  async me(req, res) {
    try {
      const [users] = await pool.query(
        "SELECT id, name, firstname, email, role, company, siret, skills, location, created_at FROM users WHERE id = ?",
        [req.user.userId],
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: users[0],
      });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching user",
      });
    }
  },

  /**
   * @route PATCH /api/auth/me
   * @desc Update current authenticated user's info
   */
  async updateMe(req, res) {
    try {
      const { name, firstname, email, skills, location } = req.body;

      if (!name && !firstname && !email && skills === undefined && !location) {
        return res
          .status(400)
          .json({ success: false, message: "No fields to update" });
      }

      const fields = [];
      const values = [];
      if (name) {
        fields.push("name = ?");
        values.push(name);
      }
      if (firstname) {
        fields.push("firstname = ?");
        values.push(firstname);
      }
      if (email) {
        fields.push("email = ?");
        values.push(email);
      }
      if (skills !== undefined) {
        fields.push("skills = ?");
        values.push(JSON.stringify(skills));
      }
      if (location) {
        fields.push("location = ?");
        values.push(location);
      }
      values.push(req.user.userId);

      await pool.query(
        `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
        values,
      );

      const [updated] = await pool.query(
        "SELECT id, name, firstname, email, role, skills, location, created_at FROM users WHERE id = ?",
        [req.user.userId],
      );

      return res.status(200).json({ success: true, data: updated[0] });
    } catch (error) {
      console.error("Update user error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error updating user" });
    }
  },

  /**
   * @route POST /api/auth/logout
   * @desc Clear the auth cookie
   */
  logout(req, res) {
    res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  },
};

module.exports = AuthController;
