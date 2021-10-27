const express = require("express");

const routes = express.Router();

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = require("./admin");

routes.get('/', shopController.getIndex);

routes.get('/products' , shopController.getProducts);

routes.get('/products/:productId' , shopController.getProduct);
     
routes.get('/cart' , isAuth, shopController.getcart);

routes.post('/cart' ,isAuth, shopController.postcart);

router.post('/cart-delete-item' ,isAuth, shopController.postDeleteCartProducts)

router.get('/checkout' , isAuth , shopController.getCheckout);

router.get('/checkout/success', shopController.getCheckoutSuccess);

router.get('/checkout/cancel' , shopController.getCheckout); 

routes.get('/orders' ,isAuth, shopController.getorders);

routes.get('/order/:orderId' , isAuth, shopController.getInvoice);

module.exports = routes;