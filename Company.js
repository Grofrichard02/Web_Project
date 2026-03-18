const express=require("express")
const router = express()
const dbhandler=require("./dbhandler.js")
const Auth = require("./Auth.js");

router.post("/postCompany",Auth(),async(req,res)=>{
    const onecompany=await dbhandler.CompanyTable.FindOne({
        where:{
            Name:req.body.Name,
            Description:req.body.Description,
            Location:req.body.Location
        }
    })
    if(!onecompany){
        await dbhandler.CompanyTable.create({
            Name:req.body.Name,
            Description:req.body.Description,
            Location:req.body.Location
        })
        res.status(200).json({"message":"Sikeres létrehozás"})
    }
    else{
        res.status(409).json({"message":"Sikertelen létrehozás"})
    }
})

router.get("/getcompany", async (req, res) => {
    try {
        await dbhandler.dbhandler.authenticate();
        const companies = await dbhandler.Company.findAll();
        if (companies.length === 0) {
            return res.status(200).json([]);
        }
        return res.status(200).json(companies);
    } catch (err) {
        return res.status(500).json({ 
            error: "Adatbázis hiba", 
            message: err.message 
        });
    }
});

module.exports = router;