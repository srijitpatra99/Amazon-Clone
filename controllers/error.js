exports.get404 = (req, res, next)=> {
    res.render('error' , {pageTitle: 'page not found' , path:'', isAuthenticated : req.session.isLoggedIn});
}

exports.get500 = (req, res, next) =>{
    res.render('505' , {pageTitle: 'Error!' , path:'', isAuthenticated : req.session.isLoggedIn});
}