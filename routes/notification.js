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
router.get('/pagesByFacul/:fId/:page', securedLogin, (req, res) => {
    let perPage = 10
    let page = req.params.page || 1
    var fcId = req.params.fId;
    let notiQuery = req.app.db.collection("notifications").find({ "user": fcId })
        .sort({ "createdAt": -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage).toArray();
    let facultyQuery = req.app.db.collection("users").find({ role: { $nin: ['admin', 'student'] } }).toArray();
    Promise.all([facultyQuery, notiQuery])
        .then(([faculties, notifications]) => {
                var list_falcul_name = toRawFacul(faculties);
                res.render('notifications/all', {
                    currentUser: req.user,
                    notifications,
                    faculties,
                    current: page,
                    list_falcul_name,
                    pages: Math.ceil(notifications.length / perPage)
                })
            
        })
    // var abc = '' + req.params.fId;
    // res.send(abc);
})
router.get('/pages/:page', securedLogin, (req, res) => {
    let perPage = 10
    let page = req.params.page || 1

    let notiQuery = req.app.db.collection("notifications").find()
        .sort({ "createdAt": -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage).toArray();
    let facultyQuery = req.app.db.collection("users").find({ role: { $nin: ['admin', 'student'] } }).toArray();
    Promise.all([facultyQuery, notiQuery])
        .then(([faculties, notifications]) => {
            req.app.db.collection("notifications").countDocuments((err, count) => {
                if (err) return next(err)
                var list_falcul_name = toRawFacul(faculties);
                res.render('notifications/all', {
                    currentUser: req.user,
                    notifications,
                    faculties,
                    current: page,
                    list_falcul_name,
                    pages: Math.ceil(count / perPage)
                })
            })
        })
})
function toRawFacul(faculties) {
    var list_fal = {};
    faculties.forEach(element => {
        list_fal[element._id] = element.name;
    });
    return list_fal;
}
// router.get('/filter/pages/:page', securedLv1, NotifyController.filter)

router.post('/update/:id', securedLogin, (req, res) => {
    var createdAt = new Date().getTime();
    const formData = req.body;
    var id_notify = req.params.id;
    req.app.db.collection("notifications").updateOne({
        "_id": ObjectId(id_notify)
    }, {
        $set: {
            "title": formData.title,
            "categories": formData.categories,
            "briefText": formData.briefText,
            "content": formData.content,
            "createdAt": createdAt
        }
    }, (err, user) => {
        if (!err) {
            res.redirect('back');
        }
        else {
            res.send("Bi loi roi: " + err);
        }
    });
})
router.post('/delete/:id', securedLogin, (req, res) => {
    var id_notify = req.params.id;
    req.app.db.collection("notifications").remove({
        "_id": ObjectId(id_notify)
    }, (err, user) => {
        if (!err) {
            res.redirect('back');
        }
        else {
            res.send("Bi loi roi: " + err);
        }
    });
})
router.post('/:fcId', securedLogin, (req, res) => {
    var createdAt = new Date().getTime();
    const formData = req.body;
    formData.user = req.params.fcId;
    console.log(formData);
    req.app.db.collection("notifications").insertOne({
        "title": formData.title,
        "categories": formData.categories,
        "briefText": formData.briefText,
        "content": formData.content,
        "createdAt": createdAt,
        "user": req.user._id
    }, (err, user) => {
        if (!err) {
            res.redirect('back');
        }
        else {
            res.send("Bi loi roi: " + err);
        }
    });
});

// router.get('/detail/:id', securedLv1, NotifyController.detail)


module.exports = router