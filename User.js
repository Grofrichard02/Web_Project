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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, `profile-${req.uid || 'anon'}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });


router.get("/getMyAddresses", Auth(), async (req, res) => {
    try {
        const shipping = await dbhandler.Address.findOne({ 
            where: { UserId: req.uid } 
        });
        const billing = await dbhandler.BillingAddress.findOne({ 
            where: { UserId: req.uid } 
        });
        
        res.status(200).json({ shipping, billing });
    } catch (err) {
        console.error("Cím lekérés hiba:", err);
        res.status(500).json({ message: "Hiba történt a címek lekérésekor" });
    }
});
















module.exports = router;
