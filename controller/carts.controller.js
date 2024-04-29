const handleError = require("../middleware/handleError");
const Users = require("../models/users.model");
const Products = require("../models/products.model");
const Carts = require("../models/carts.model");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const addToCart = handleError(async (req, res, next) => {
    const userId = req.params.id;

    const user = await Users.findById(userId);

    if(!user) {
        return next(appError.create("User Not Defined", 400, httpStatusText.FAIL));
    }

    const productId = req.body.id;

    const product = await Products.findById(productId);

    if(!product) {
        return next(appError.create("Product Not Found", 400, httpStatusText.FAIL));
    }

    const cart = {
        "productId": product._id,
        "name": product.name,
        "price": product.price,
        "category": product.category,
        "quantity": 1,
        "image": product.image
    }

    const oldCart = await Carts.findOne({"userId": userId});
    // console.log(oldCart);

    if(oldCart) {
        const oldProduct = oldCart.cart.find(product => product.productId == productId);
        oldProductId = oldProduct.productId;
        console.log(oldProduct);
        if(oldProductId) {
            console.log("ok");
            const quantity = oldProduct.quantity + 1;
            console.log(quantity);
            const updatedCart = await Carts.updateOne({"userId": userId}, {$set: {"cart.quantity": quantity}});
            return res.status(201).json({"status": httpStatusText.SUCCESS, "data": {updatedCart}});
        } else {
            oldCart.cart.push(cart);
            await oldCart.save();
            res.status(201).json({"status": httpStatusText.SUCCESS, "data": {oldCart}});
        }
    } else {
        const newCart = await new Carts({
            userId,
            cart: cart
        })
        await newCart.save();
        res.status(201).json({"status": httpStatusText.SUCCESS, "data": {newCart}});
    }
})

module.exports = {
    addToCart
}