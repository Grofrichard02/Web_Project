const express = require("express");
const router = express.Router();
require("dotenv").config();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Auth = require("./Auth.js");
const dbhandler = require("./dbhandler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const auth = require("./Auth.js");

const sk = process.env.SECRET_KEY;
const expiresin = process.env.EXPIRES_IN;





















module.exports = router;
