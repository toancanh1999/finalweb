const express = require('express');
const router = express.Router();
const securedLogin = (req, res, next) => {
    if (req.user) {
        return next();
    }
    res.redirect("/login");
};
const securedRole = (req, res, next) => {
    if (req.user.role != "admin") {
        res.redirect('back')
    }
    next();
};
router.get('/', securedLogin, securedRole, (req, res, next) => {
    req.app.db.collection("users").find({
        "role": {
            $nin: ['admin', 'student']
        }
    }).toArray(function (err, result) {
        res.render('adminPage', {
            user : req.user,
            role : req.user.role,
            faculties: result
        })
    })
})
router.post('/register', securedLogin, securedRole, (req, res) => {
    const formData = req.body;
    console.log(formData);
    req.app.db.collection("users").insertOne({
        "username": formData.username,
        "password": formData.password,
        "role": formData.role,
        "email": formData.email,
        "name": formData.name,
        "picture": '/images/icons/favicon.ico'
    }, (err, user) => {
        if (!err) {
            res.redirect('back');
        }
    });

})

module.exports = router