const loginRouter = require('./login');
const siteRouter = require('./site');
const adminRouter = require('./admin');
const facultyRouter = require('./faculty');
const notificationRouter = require('./notification');
function route(app) {
    app.use('/login', loginRouter);
    app.use('/logout', (req, res) => {
        req.logout();
        res.redirect('/login');
    })
    app.use('/',  siteRouter);
    app.use('/addPost',  siteRouter);
    app.use('/homePage',  siteRouter);
    app.use('/getNewsfeed',  siteRouter);
    app.use('/toggleLikePost',  siteRouter);
    app.use('/admin',  adminRouter);
    app.use('/faculty', facultyRouter);
    app.use('/notifications', notificationRouter)

}

module.exports = route