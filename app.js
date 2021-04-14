//jshint esversion:6

//Create 4 constants to require packages/modules
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
//const mongoose = require("mongoose");

//Create a new app instance using express
const app = express();

//Tell the app to use EJS as its view engine as the templating engine
app.set("view engine", "ejs");

//Require body-parser module to parser the requests
app.use(bodyParser.urlencoded({
  extended: true
}));

//Tell the app to use all the statics files inside the public folder
app.use(express.static("public"));

//Add some GETs to view the EJS files/websites
//Target the home/root route to render the home page
app.get("/", function(req, res) {
  res.render("home");
});

//Target the login route to render the login page
app.get("/login", function(req, res) {
  res.render("login");
});

//Target the register route to render the register page
app.get("/register", function(req, res) {
  res.render("register");
});









//Set up the server to listen to port 3000
app.listen(3000, function() {
  console.log("Server started on port 3000!!!");
});