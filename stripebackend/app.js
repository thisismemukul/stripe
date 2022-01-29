const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
console.log(process.env) // remove this after you've confirmed it working

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

const app = express();
//middlewares
app.use(express.json());
app.use(cors());
//routes
app.get("/", (req, res) => {
    res.send("It works")
});
app.post("/payment", (req, res) => {
    const { product, token } = req.body;
    console.log("PRODUCT", product);
    console.log("PRODUCT", product.price);
    const idempotencyKey = uuidv4();
    return stripe.customers.create({
            email: token.email,
            source: token.id
        }).then(customer => {
            stripe.charges.create({
                amount: product.price * 100,
                currency: "usd",
                customer: customer.id,
                receipt_email: token.email,
                description: `purchase of ${product.name}`,
                shipping: {
                    name: token.card.name,
                    address: {
                        country: token.card.address_country
                    }
                }
            }, { idempotencyKey })
        })
        .then(result => res.status(200).json(result))
        .catch(err => console.log(err));
});
//listen
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`App is running on port${PORT}`));