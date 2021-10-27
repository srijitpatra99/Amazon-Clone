const path = require('path');

const express = require("express");
const { body } = require("express-validator");

const router=express.Router();//obj to export route to app.js

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');//this a way to protect our routes from direct access by typing in google search box

router.get('/add-product', isAuth, adminController.getaddproduct);

router.get('/admin/products', isAuth, adminController.getproducts);

router.post('/add-product',
    [
        body('title', "Please Enter A Valid Product Title")
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('price', "Please Enter A Valid Product Price")
            .isFloat(),
        body('description', "Please Enter A Valid Product Description")
            .isLength( {max:200})
            .trim()
    ], 
    isAuth,
    adminController.postaddproduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditproduct);

router.post('/edit-product', 
    [
        body('title', "Please Enter A Valid Product Title")
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('price', "Please Enter A Valid Product Price")
            .isFloat(),
        body('description', "Please Enter A Valid Product Description")
            .isLength( {max:200})
            .trim()
    ], 
    isAuth, 
    adminController.postEditproduct
);

router.post('/admin/delete-product',isAuth, adminController.postDeleteProduct);

module.exports = router;