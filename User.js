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

router.post("/UserLogin", async (req, res) => {
    try {
        const oneuser = await dbhandler.User.findOne({
            where: { Username: req.body.Username }
        });
        if (!oneuser) {
            return res.status(409).json({ message: "Nincs ilyen felhasználó" });
        }
        const match = await bcrypt.compare(req.body.Password, oneuser.Password);
        if (!match) {
            return res.status(401).json({ message: "Hibás felhasználónév vagy jelszó" });
        }
        const token = jwt.sign({ uid: oneuser.Id }, sk, { expiresIn: expiresin || "6h" });
        return res.status(200).json({ message: "Sikeres bejelentkezés", token });
    } catch (err) {
        return res.status(500).json({ message: "Szerver hiba" });
    }
});

router.post("/UserRegister", async (req, res) => {
    try {
        const oneuser = await dbhandler.User.findOne({ where: { Email: req.body.Email } });
        if (oneuser) return res.status(409).json({ message: "Van már ilyen felhasználó" });

        const hashedpassword = await bcrypt.hash(req.body.Password, 15);
        await dbhandler.User.create({
            Username: req.body.Username,
            Password: hashedpassword,
            Email: req.body.Email,
            Pfp: "/uploads/default-avatar.png"
        });
        return res.status(201).json({ message: "Sikeres regisztráció" });
    } catch (err) {
        console.log("HIBA:");
        console.error(err);
        res.status(500).send("Szerver hiba");
    }
});

router.get("/getUser", auth(), async (req, res) => {
    try {
        const oneUser = await dbhandler.User.findOne({
            where: { Id: req.uid },
            attributes: { exclude: ["Password"] }
        });

        return res.status(200).json(oneUser);
    } catch (err) {
        return res.status(500).json({ message: "Szerver hiba" });
    }
});

router.get("/getAllUsers", auth(), async (req, res) => {

    try {
        const requester = await dbhandler.User.findOne({ where: { Id: req.uid } });
        if (!requester || requester.isAdmin !== true) {
            return res.status(403).json({ message: "Nincs admin jogosultságod!" });
        }
        const users = await dbhandler.User.findAll({
            attributes: ["Id", "Username", "Email", "Pfp", "isAdmin"]
        });

        console.log("Lekérdezés sikeres, userek száma:", users.length);
        return res.status(200).json(users);

    } catch (err) {
        console.error("HIBA a getAllUsersnél:", err);
        return res.status(500).json({ message: "Szerver hiba történt a lekérdezés során" });
    }
});









module.exports = router;
