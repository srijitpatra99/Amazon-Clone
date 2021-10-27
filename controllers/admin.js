const fileHelper = require('../util/file');
const Product = require('../models/product');
const { validationResult } = require("express-validator");

exports.getaddproduct = (req, res, next)=>{
    res.render('admin/edit-product' , 
    { pageTitle : "add-product" , 
      path :"/add-product" , 
      editing:false,
      hasError: false,
      errorMessage: null,
      validationErrors:[]
    });
};

exports.postaddproduct = (req, res ,next)=>{
    const title = req.body.title;
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;
    if(!image)
    {
        return res.status(422).render('admin/edit-product' , {
            pageTitle : "add-product" , 
            path :"/add-product" , 
            editing:false , 
            product : {
                title : title,
                price: price,
                description: description
            },
            hasError: true,
            errorMessage: "Attached File is Not An Image !!",
            validationErrors: []
        });
    }
    const errors = validationResult(req);

    if(!errors.isEmpty())
    {
        console.log(errors.array());
        return res.status(422).render('admin/edit-product' , {
                pageTitle : "add-product" , 
                path :"/add-product" , 
                editing:false , 
                product : {
                    title : title,
                    price: price,
                    description: description
                },
                hasError: true,
                errorMessage: errors.array()[0].msg,
                validationErrors:errors.array()
            });
    }

    const imageUrl = image.path;

    const product = new Product({
        title: title , 
        price: price , 
        description: description , 
        imageUrl: imageUrl,
        userId: req.user
    });
    product
        .save()
        .then(result =>{
            console.log('created Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditproduct = (req, res, next)=>{
    const editMode = req.query.edit;
    if(!editMode)
    {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product
        .findById(prodId)
        .then(product =>{
            if(!product)
            {
                return res.redirect('/');
            }
            res.render('admin/edit-product' , { 
                    pageTitle : "edit-product" , 
                    path :"/edit-product" , 
                    editing:editMode , 
                    product : product, 
                    hasError: false,
                    errorMessage: null,
                    validationErrors: []
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditproduct = (req , res , next) =>{
    const prodId = req.body.productId;
    const updatedtitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description; 
    const errors = validationResult(req);

    if(!errors.isEmpty())
    {
        console.log(errors.array());
        return res.status(422).render('admin/edit-product' , {
                pageTitle : "edit-product" , 
                path :"/edit-product" , 
                editing:true , 
                product : {
                    _id: prodId,
                    title : updatedtitle,
                    price: updatedPrice,
                    description: updatedDesc
                },
                hasError: true,
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array()
            });
    }

    Product.findById(prodId)//returns full mongoose object
           .then(product =>{
               if(product.userId.toString() !== req.user._id.toString())
               {
                   return res.redirect('/');
               }
               product.title = updatedtitle;
               product.price = updatedPrice;
               product.description = updatedDesc;
               if(image)
               {
                   fileHelper.deleteFile(product.imageUrl);
                   product.imageUrl = image.path;
               }

               return product.save()
                            .then(result => {
                                console.log("Updated Product Sucessfully!!!");
                                res.redirect('/admin/products');
                             });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
};

exports.getproducts = (req, res, next) =>{
    Product
        .find({ userId:req.user._id })
        // .select('title price -_id')
        // .populate('userId' , 'title')
        .then((products) =>{
            res.render('admin/products' , 
            { prods : products ,
              pageTitle:"Admin Products" , 
              path : "/admin/products"
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postDeleteProduct = (req , res , next) =>{
    const prodId = req.body.productId;
    Product.findById(prodId)
           .then(product =>{
               fileHelper.deleteFile(product.imageUrl);
               return Product.deleteOne({ _id:prodId , userId: req.user._id });
           })
           .then(() =>{
               console.log('ANNIHIALTED Product');
               res.redirect('/admin/products');
           })
           .catch(err => {
               const error = new Error(err);
               error.httpStatusCode = 500;
               return next(error);
           });
           
    
    // Product
    //     .destroy({where: {id: prodId}})
    //     .then(() => {
    //         res.redirect('/admin/products')
    //     })
    //     .catch(err => console.log(err));
};