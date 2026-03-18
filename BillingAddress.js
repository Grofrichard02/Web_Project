
const express = require("express");
const router = express.Router();
const dbhandler = require("./dbhandler.js");
const auth = require("./Auth.js");


router.post("/BillingAddressRegister", auth(), async (req, res) => {
    try {
        await dbhandler.BillingAddress.create({
            City: req.body.City,
            UserId: req.uid,
            Zip: req.body.Zip,
            Address1: req.body.Address1
        });
        return res.status(201).json({ message: "Sikeres számlázási cím regisztráció" });
    } catch (err) {
        return res.status(500).json({ message: "Hiba a mentés során" });
    }
});





module.exports = router;
