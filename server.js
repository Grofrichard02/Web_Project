
require("dotenv").config();
const express = require("express");
const db = require("./dbhandler");

const User = require("./User");
const Order = require("./Order");
const Products = require("./Products");
const Address = require("./Address");
const BillingAddress = require("./BillingAddress");
const Log = require("./Log");
const Company = require("./Company");
const server = express();
const path = require('path');

server.use(cors()); 
server.use(express.json());
server.use(express.static("public",{extensions: ["html"] }));
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));
server.use((req, res, next) => {
    console.log(`>>> BEÉRKEZŐ KÉRÉS: ${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 3000;
server.get(['/products', '/products/:brand'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

server.use("/", Company);
server.use("/", User);
server.use("/", Order);
server.use("/", Products);
server.use("/", Address);
server.use("/", BillingAddress);
server.use("/", Log);
server.use((req, res) => {
    res.status(404).redirect('/404');
});
db.dbhandler.sync()
  .then(() => {
    console.log("-----------------------------------------");
    server.listen(PORT, () => {
      console.log(`Szerver állapot: FUT (Port: ${PORT})`);
      console.log("-----------------------------------------");
    });
  })
  .catch((error) => {
    console.error("KRITIKUS HIBA");
    console.error(error);
});

module.exports = server;