const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const nodemailer=require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname + "/public"));
mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://127.0.0.1:27017/FeedBackDB")
  .then(() => console.log("Connected at localhost port no 12707!"));

const feedbackSchema = new mongoose.Schema({
    email:{
        type:String,
        unique:true
    },
    password: String
});

const feedbackDetailSchema=new mongoose.Schema({
        name:String,
        subject:String,
        section:String,
        faculty:String,
        q1ans:String,
        q2ans:String,
        q3ans:String,
        q4ans:String,
        q5ans:String
});

let mailTransporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user:process.env.USER,
      pass: process.env.PASS
   }
});



const User = new mongoose.model("User", feedbackSchema);
const Fdetail = new mongoose.model("Fdetail", feedbackDetailSchema);

app.get("/", function(req, res) {
    res.render("home");
});
app.get("/home", function(req, res) {
    res.render("home");
});


app.get("/login", function(req, res) {
    res.render("login");
});
let tempEmail = "";

app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    const newUser = new User({
        email:req.body.email,
        password:req.body.password
    });

    newUser.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/login");
        }
    })
});


app.post("/login", function(req,res) {
    const username = req.body.email;
    const password = req.body.password;
    User.findOne({
        email: username
    },function(err,foundUser) {
        if (foundUser.password === password) {
            tempEmail=username;
            res.render("feedback");
        } else {
            res.render("register");
        }
    });
});

app.post("/feedback", function(req, res) {

    const newDetail=new Fdetail({
        name:req.body.name,
        subject:req.body.sub,
        section:req.body.sec,
        faculty:req.body.staff,
        q1ans:req.body.q1,
        q2ans:req.body.q2,
        q3ans:req.body.q3,
        q4ans:req.body.q4,
        q5ans:req.body.q5
    });

    newDetail.save(function(err) {
        if (err) {
            console.log(err);
        }
    });

    let mailDetails = {
        from:'subhranshu060@gmail.com' ,
        to: tempEmail,
        subject: 'FeedBack Mail',
        text: `this mail is from the feedback system website of the university `
    };
    mailTransporter.sendMail(mailDetails, (err) => {
        if (err) {
            console.log(`error at mail detail is : ${err}`);
        } else {
            console.log('Email sent successfully');
            res.redirect("/home")
        }
    });

});


app.listen(3000, function() {
    console.log("server started on port 3000");

});
