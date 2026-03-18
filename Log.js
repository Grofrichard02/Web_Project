const express=require("express")
const dbhandler=require("./dbhandler")
const jwt=require("jsonwebtoken")


function Log(valami){
    return(req,res,next)=>{
        dbhandler.Log.create({
            Uid:req.Id||null,
            name:valami
            

        })
    }
}


module.exports = Log