const jwt = require("jsonwebtoken");
require("dotenv").config();

const sk = process.env.SECRET_KEY || "fallback_secret_key";



module.exports = auth;