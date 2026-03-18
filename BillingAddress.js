
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


router.get("/BillingAddressGets", auth(), async (req, res) => {
    try {
        const address = await dbhandler.BillingAddress.findOne({
            where: { UserId: req.uid }
        });

        if (address) {
            return res.status(200).json(address);
        } else {
            return res.status(404).json({ message: "Nincs ilyen számlázási cím" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Szerver hiba" });
    }
});


router.put("/EditBillingAddress", auth(), async (req, res) => {
    try {
        const userId = req.uid;
        const address = await dbhandler.BillingAddress.findOne({ where: { UserId: userId } });
        
        if (!address) {
            return res.status(404).json({ "message": "Nincs mentett számlázási cím" });
        }
        
        if (!req.body.City || !req.body.Zip || !req.body.Address1) {
            return res.status(400).json({ "message": "Hiányzó adatok" });
        }

        await dbhandler.BillingAddress.update({
            City: req.body.City,
            Zip: req.body.Zip,
            Address1: req.body.Address1
        }, {
            where: { UserId: userId }
        });
        
        return res.status(200).json({ "message": "Sikeres módosítás" });
    } catch (err) {
        return res.status(500).json({ message: "Szerver hiba" });
    }
});

module.exports = router;
