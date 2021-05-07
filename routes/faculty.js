const e = require('express');
const express = require('express');
const router = express.Router();
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const securedLogin = (req, res, next) => {
    if (req.user) {
        return next();
    }
    res.redirect("/login");
};
const securedRole = (req, res, next) => {
    if (req.user.role != "student") {
        return next();
    }
    res.redirect('back')
};

router.get('/:fcid', securedLogin, securedRole, (req, res) => {
    var fcId = req.params.fcid;
    req.app.db.collection("users").findOne({ "_id": ObjectId(fcId) }, (err, user) => {
        req.app.db.collection("notifications").find({
            "user": fcId
        }).toArray((err,result) => {
            res.render('faculty', {
                role : req.user.role,
                user: user,
                notifications: result
            })
        });
    });
})


module.exports = router