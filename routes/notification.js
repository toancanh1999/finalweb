const express = require('express');
const router = express.Router();
const mongodb = require("mongodb");
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
      if (file.mimetype.startsWith('image/')) {
        callback(null, 'public/images');
      }
      else if (file.mimetype.startsWith('video/')) {
        callback(null, 'public/videos');
      }
    },
    filename: function (req, file, callback) {
      callback(null, file.originalname);
    }
  });
var upload = multer({ storage: storage });
const ObjectId = mongodb.ObjectId;
const securedLogin = (req, res, next) => {
    if (req.user) {
        return next();
    }
    res.redirect("/login");
};
router.get('/pagesByFacul/:email/:page', securedLogin, (req, res) => {
    let perPage = 10
    let page = req.params.page || 1
    var email = req.params.email;
    let notiQuery = req.app.db.collection("notifications").find({ "user": email })
        .sort({ "createdAt": -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage).toArray();
    let facultyQuery = req.app.db.collection("users").find({ role: { $nin: ['admin', 'student'] } }).toArray();
    Promise.all([facultyQuery, notiQuery])
        .then(([faculties, notifications]) => {
            var list_falcul_name = toRawFacul(faculties);
            res.render('notifications/all', {
                user : req.user,
                role : req.user.role,
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
                    user : req.user,
                    role : req.user.role,
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
router.post('/create', securedLogin,upload.any("litsfile"), (req, res) => {
    var createdAt = new Date().getTime();
    const formData = req.body;
    console.log(formData);
    req.app.db.collection("notifications").insertOne({
        "title": formData.title,
        "categories": formData.categories,
        "briefText": formData.briefText,
        "content": formData.content,
        "createdAt": createdAt,
        "user": req.user.email,
        "userName" : req.user.name
    }, (err, user) => {
        if (!err) {
            res.json({
                "status": "success",
                "message": "Noti has been Create.",
                "data" : user.ops[0]
            });
        }
        else {
            res.send("Bi loi roi: " + err);
        }
    });
});

router.get('/detail/:id', securedLogin, (req, res) => {
    req.app.db.collection("notifications").findOne({
        "_id": ObjectId(req.params.id)
    }, (err, noti) => {
        if (!err) {
            res.render('notifications/detail', {
                user : req.user,
                role : req.user.role,
                currentUser: req.user,
                notification: noti
            })
        }
    });
})


module.exports = router