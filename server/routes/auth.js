const express = require("express");
const router = express.Router();
const { User } = require("../models/userModel");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).send({ message: "Invalid Email or Password." });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(401).send({ message: "Invalid Email or Password." });
    }

    const token = jwt.sign(
      { userId: user._id, tenantId: user.tenantId },
      "my_secret_key",
      { expiresIn: "7d" }
    );

    console.log("Generated token:", token);

    res.status(200).send({ data: token, message: "Logged in successfully." });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).send({ message: "Internal Server Error." });
  }
});

const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = router;
