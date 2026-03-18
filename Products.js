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

router.get("/getproduct", async (req, res) => {
    try {
        const products = await dbhandler.Products.findAll({
            include: [{
                model: dbhandler.Company, 
                as: 'Company',
                attributes: ['Name']
            }]
        });
        if (products.length > 0) {
            console.log("Adatstruktúra teszt:", JSON.stringify(products[0], null, 2));
        }

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: "Szerver hiba" });
    }
});

router.put("/updateproduct/:id", Auth(), async (req, res) => {
    try {
        const { Name, Description, Price, Ammount, IMGURL } = req.body;
        await dbhandler.Products.update(
            { Name, Description, Price, Ammount, IMGURL },
            { where: { Id: req.params.id } }
        );
        res.status(200).json({ message: "Termék sikeresen frissítve" });
    } catch (err) {
        res.status(500).json({ message: "Hiba a frissítés során" });
    }
});


router.delete("/deleteproduct/:id", Auth(), async (req, res) => {
    try {
        await dbhandler.Products.destroy({
            where: { Id: req.params.id }
        });
        res.status(200).json({ message: "Termék törölve" });
    } catch (err) {
        res.status(500).json({ message: "Hiba a törlés során" });
    }
});
module.exports = router