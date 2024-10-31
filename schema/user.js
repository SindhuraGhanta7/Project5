"use strict";

const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a User.
 */
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  location: { type: String, default: "" },
  description: { type: String, default: "" },
  occupation: { type: String, default: "" },
  login_name: { type: String, required: true, unique: true }, // New field for login name
  password: { type: String, required: true }, // New field for password
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
function createUserModel() {
  return mongoose.model("User", userSchema);
}

/**
 * Make this available to our application.
 */
module.exports = createUserModel();
