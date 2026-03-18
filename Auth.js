const jwt = require("jsonwebtoken");
require("dotenv").config();

const sk = process.env.SECRET_KEY || "fallback_secret_key";

function auth() {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Hiányzik az autorizációs header" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Érvénytelen token formátum" });
        }

       
        jwt.verify(token, sk, (err, decoded) => {
            if (err) {
                console.error("JWT hiba:", err.message);
                return res.status(403).json({ message: "Érvénytelen vagy lejárt token" });
            }
            req.uid = decoded.uid;
            next(); 
        });
    };
}

module.exports = auth;