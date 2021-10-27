const express = require("express");
const { check , body} = require("express-validator");

const router=express.Router();//obj to export route to app.js

const authController = require("../controllers/auth");
const User = require('../models/user');

router.get('/login' , authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset' , authController.getReset);

router.post('/login', 
                check('email')
                .isEmail()
                .withMessage("Please Enter A valid Email Address")
                .normalizeEmail()
                .bail()
                .custom((value) =>{
                    return  User.findOne({ email: value })
                                .then(userDoc =>{
                                    if(!userDoc)//if user email doesn't exists
                                    {
                                        return Promise.reject("New User? SignUp!!");
                                    }
                                });
                }),
                body('password', "The password must be valid")
                .isLength({min :5})
                .isAlphanumeric()
                .trim(),
                authController.postLogin);

router.post('/logout' , authController.postLogout);

router.post('/signup', 
            check('email')
                .isEmail()
                .withMessage('Enter A Valid Email')
                .bail()
                .custom((value)=>{
                    // if(value === 'test@test.com')
                    // {
                    //     throw new Error("enter a valid email");
                    // }
                    // Indicates the success of this synchronous custom validator
                    // return true;
                   return  User.findOne({ email: value })
                                .then(userDoc =>{
                                    if(userDoc)//if user email already exists
                                    {
                                        return Promise.reject('Email already exists and enter a new one');
                                    }
                                });
                    })
                .normalizeEmail(),
            body('password' , "The password must be atleast 5 characters long containing numbers and texts")
                .isLength({min: 5})
                .isAlphanumeric()
                .trim(), 
            body('confirmPassword')
                .custom((value , {req}) =>{
                    if(value !== req.body.password)
                    {
                        throw new Error('Passwords have to match');
                    }
                    // Indicates the success of this synchronous custom validator
                    return true;
                })
                .trim(),
            authController.postSignup
        );

router.post('/reset' , authController.postReset);

router.get('/reset/:token' , authController.getNewPassword);

router.post('/new-password' , authController.postNewPassword);

module.exports = router;