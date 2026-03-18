
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



module.exports = server;