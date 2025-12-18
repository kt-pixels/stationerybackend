// ==========================
// src/controllers/auth.controller.js
// ==========================
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// GENERATE JWT
const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

/**
 * @route   POST /api/auth/register
 * @access  OWNER only (first time open)
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email }).select("+password");

    // ✅ IF USER DOES NOT EXIST → AUTO REGISTER
    if (!user) {
      user = await User.create({
        name: "Shop Owner",
        email,
        password,
        role: "OWNER",
      });
    } else {
      // ✅ IF USER EXISTS → CHECK PASSWORD
      const isMatch = await user.comparePassword(password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ ALWAYS RETURN TOKEN
    res.json({
      success: true,
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
