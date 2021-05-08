//Toan
const express = require('express');
const app = express();
const route = require('./routes')
const session = require('express-session');
const passport = require('passport');
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;
const http = require("http").createServer(app);
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}));
app.use(passport.initialize());
app.use(passport.session());
//test
app.use(express.urlencoded({
    extended: false,
}));
const flash = require('express-flash');
app.use(flash());
//test
const socketIO = require("socket.io")(http);
const socketID = "";
const users = [];

const mainURL = "http://localhost:8080";
socketIO.on("connection", function (socket) {
    console.log("User connected", socket.id);
    socket.on('id_post',(noti) => {
        socketIO.emit("id_post", noti)
    })
});
const port = process.env.PORT;
const urlConnect = "mongodb://localhost:27017"
const clientMongo = new mongoClient(urlConnect)
const myDB = "my_social_sv"
clientMongo.connect((error, client) => {
    console.log("Database connected.");
    const dataB = client.db(myDB)
    app.db = dataB
    passport.serializeUser(function (user, cb) {
        cb(null, user);
    });

    passport.deserializeUser(function (obj, cb) {
        cb(null, obj);
    });


    app.use((req, res, next) => {
        res.locals.isAuthenticated = req.isAuthenticated();
        next();
    });

    route(app)
    http.listen(port, () => {
        console.log("Server started at " + mainURL);
    })
})
