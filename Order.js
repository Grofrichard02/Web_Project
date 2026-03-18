const express = require("express");
const router = express.Router();
const dbhandler = require("./dbhandler");
const Auth = require("./Auth.js");

router.post("/createOrder", Auth(), async (req, res) => {
    try {
        const { cart, AddressId } = req.body;
        const UserId = req.uid;
        if (!cart || cart.length === 0) return res.status(400).json({ message: "Üres a kosár" });
        if (!AddressId) return res.status(400).json({ message: "Hiányzó cím azonosító" });
        const newOrder = await dbhandler.Order.create({
            UserId: UserId,
            AddressId: AddressId,
            Date: new Date(),
            Phase: "Feldolgozás alatt"
        });
        for (const item of cart) {
            await dbhandler.OrderItem.create({
                OrderId: newOrder.Id,
                ProductId: item.Id,
                Quantity: item.quantity,
                PriceAtPurchase: item.Price
            });
            const product = await dbhandler.Products.findByPk(item.Id);
            if (product) {
                const currentStock = product.Ammount || 0;
                const newStock = currentStock - item.quantity;
                await product.update({ Ammount: newStock > 0 ? newStock : 0 });
            }
        }
        return res.status(201).json({ 
            message: "Rendelés sikeres!", 
            orderId: newOrder.Id 
        });

    } catch (err) {
        return res.status(500).json({ 
            message: "Szerver hiba a rendelés során", 
            error: err.message 
        });
    }
});

module.exports = router;