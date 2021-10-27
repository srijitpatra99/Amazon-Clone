const fs=require("fs");
const path=require("path");
const stripe = require("stripe")('sk_test_51Jj2UzSJ6T3ZT4CM0rBaDtCG1NSU7qKCFT02K1yB8trfgIKKYkioL7HbfC8RCVCUpTiGbri6uDJ9ibwgCFSFkQGV00c9yRelPT');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 1;

exports.getIndex = (req ,res, next) =>{
    const page = +req.query.page || 1;
    let totalItems;

    Product
        .find()
        .countDocuments()
        .then(numProducts =>{
            totalItems = numProducts;
            return Product
                    .find()
                    .skip((page - 1) * ITEMS_PER_PAGE)//skip page-1 fetched items from start
                    .limit(ITEMS_PER_PAGE);// max items_per_page products are allowed to be displayed 
        })
        .then(products =>{
            res.render('shop/index' , 
            { prods : products , 
              pageTitle:"shop" , 
              path : "/",
              currentPage: page,
              hasNextPage: ITEMS_PER_PAGE * page < totalItems,
              hasPreviousPage: page>1,
              nextPage: page+1,
              previousPage: page-1,
              lastPage: Math.ceil( totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    }
        

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product
                    .find()
                    .skip((page - 1) * ITEMS_PER_PAGE)
                    .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'Products',
                path: '/products',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getProduct = (req , res, next) =>{
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {//here product is object of product model
            res.render('shop/product-detail' , 
                        { product : product , 
                          pageTitle: product.title , 
                          path : "/products"
                        }
                       )
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });   
        // OR
    // Product
    //     .findAll({where: {id: prodId}})
    //     .then(products =>{
    //         res.render('shop/product-detail' , {product : products[0] , pageTitle: products[0].title , path : "/products"})
    //     })
    //     .catch(err =>{
    //         console.log(err);
    //     });
}

exports.getcart = async (req, res, next) => {
    await req.user     
            .populate('cart.items.productId')     
            .then(user => {  
                    // console.log(user.cart.items);       
                    const products = user.cart.items;       
                    res.render('shop/cart', 
                                { path: '/cart', 
                                  pageTitle: 'Your Cart', 
                                  products: products
                                });    
                })     
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
}

exports.postcart = (req, res, next) =>{
    const prodId = req.body.productId;
    Product.findById(prodId)
            .then(product =>{
                return req.user.addToCart(product);
            })
            .then(result =>{
                // console.log(result);
                res.redirect('/cart');
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
}

exports.getCheckout = async (req, res, next) => {
    let products;
    let total;
    await req.user     
            .populate('cart.items.productId')     
            .then(user => {  
                    // console.log(user.cart.items);       
                    products = user.cart.items;    
                    total=0;
                    products.forEach(p =>{
                        total+= p.quantity * p.productId.price;
                    });
                    //initialize a stripe session
                    return stripe.checkout.sessions.create({
                        payment_method_types: ['card'],
                        line_items: products.map( p=>{
                            return {
                                name:p.productId.title,
                                description: p.productId.description,
                                amount: p.productId.price * 100,
                                currency: 'usd',
                                quantity: p.quantity,
                            };
                        }),
                                   //https://localhost:3000/checkout
                        success_url: req.protocol + '://' + req.get('host') + '/checkout/success' ,
                        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
                    });
                }) 
                .then(session =>{
                    res.render('shop/checkout', 
                                { path: '/checkout', 
                                  pageTitle: 'Checkout', 
                                  products: products,
                                  totalSum: total,
                                  sessionId: session.id
                                });   
                })    
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
};

exports.getCheckoutSuccess = async (req, res, next) => {
    await req.user     
            .populate('cart.items.productId')     
            .then(user => {    
                console.log(user);
                const products = user.cart.items.map(i =>{
                    return { product: {...i.productId._doc } , quantity:i.quantity };
                             //the above argument fetch the entire product doc.
                });  
                //creating and saving a new order object     
                const order = new Order({
                    user:{
                        email: req.user.email,
                        userId: req.user._id
                    },
                    products: products                    
                }); 
                return order.save();
            })
            .then(result =>{
                return req.user.clearCart();
            })
            .then(result =>{
                res.redirect('/orders');
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
};


exports.postDeleteCartProducts = (req , res, next) =>{
    const prodId = req.body.productId;
    req.user
            .removeFromCart(prodId)
            .then( cart =>{
                res.redirect('/cart');
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
}

exports.getorders = (req, res , next) =>{
    Order.find({ "user.userId": req.user._id })
            .then(orders =>{
                res.render('shop/orders' , 
                            { orders : orders , 
                              pageTitle:"Your Orders" , 
                              path : "/orders"
                            });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
}

exports.getInvoice = (req, res, next)=>{
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order =>{
            if(!order)
            {
                return next(new Error("No Order Found"));
            }
            if(order.user.userId.toString() !== req.user._id.toString())
            {
                return next(new Error("Unauthorized User"));
            }
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices' , invoiceName);
            // const file = fs.createReadStream(invoicePath);
            // res.setHeader('Content-Type', 'application/pdf');
            // file.pipe(res);
            const pdfDoc = new PDFDocument();
            pdfDoc.pipe(fs.createWriteStream(invoicePath)); //this also stores the pdf in our file system
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text('Invoice', {
                underline: true
            });
            pdfDoc.text('-----------------------');

            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc
                    .fontSize(14)
                    .text(
                    prod.product.title +
                        ' - ' +
                        prod.quantity +
                        ' x ' +
                        '$' +
                        prod.product.price
                    );
            });
            pdfDoc.text('---');
            pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

            pdfDoc.end();
        })
        .catch(err => next(err));
};