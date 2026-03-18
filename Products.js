const express=require("express")
const router = express()
const dbhandler=require("./dbhandler.js")
const Auth = require("./Auth.js");

router.post("/postproduct", Auth(), async (req, res) => {
    try {
        const oneproduct = await dbhandler.Products.findOne({
            where: { Name: req.body.Name }
        });

        if (!oneproduct) {
            await dbhandler.Products.create({
                Name: req.body.Name,
                Description: req.body.Description,
                Price: req.body.Price,
                Ammount: req.body.Ammount,
                CompanyId: req.body.CompanyId,
                IMGURL: req.body.IMGURL
            });
            return res.status(200).json({ "message": "Sikeres létrehozás" });
        } else {
            return res.status(409).json({ "message": "Ez a terméknév már létezik!" });
        }
    } catch (err) {
        return res.status(500).json({ "message": "Szerver hiba a mentés során" });
    }
});






module.exports = router