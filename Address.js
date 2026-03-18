
const express = require("express");
const router = express.Router(); 
const dbhandler = require("./dbhandler.js");
const auth = require("./Auth.js");


router.post("/AddressRegister", auth(), async (req, res) => {
    try {
        await dbhandler.Address.create({
            City: req.body.City,
            UserId: req.uid, 
            Zip: req.body.Zip,
            Address1: req.body.Address1
        });
        return res.status(201).json({ message: "Sikeres Lakhely regisztráció" });
    } catch (err) {
        return res.status(500).json({ message: "Hiba a mentés során" });
    }
});


router.get("/AddressGets", auth(), async (req, res) => {
    try {
        const address = await dbhandler.Address.findOne({
            where: { UserId: req.uid } 
        });

        if (address) {
            return res.status(200).json(address);
        } else {
            return res.status(404).json({ message: "Nincs ilyen Lakhely" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Szerver hiba" });
    }
});



module.exports = router;
