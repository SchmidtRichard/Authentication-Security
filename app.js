//jshint esversion:6

//Create some constants to require packages/modules

/*
It is important to put (require("dotenv").config();) on the top otherwise
you may not be able to access it if it is not configured
*/
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption"); <- Remove to use md5 (hash function)
//const md5 = require("md5"); <- delete, now use bcryptjs
//const bcrypt = require("bcryptjs"); <- delete on cookies and sessions module
const session = require("express-session");
const passport = require("passport");
/*
We don't need to require passport-local because it's one of those dependencies that will be needed by passport-local-mongoose
*/
const passportLocalMongoose = require("passport-local-mongoose");


//Create a new app instance using express
const app = express();


//Test to get the API_KEY from the .env file printed
console.log(process.env.API_KEY);
//Test password hashed from the hash function (md5)
//console.log(md5("12345")); //Weak password hash. <- delete, now use bcryptjs



//Tell the app to use EJS as its view engine as the templating engine
app.set("view engine", "ejs");

//Require body-parser module to parser the requests
app.use(bodyParser.urlencoded({
  extended: true
}));

//Tell the app to use all the statics files inside the public folder
app.use(express.static("public"));


//Set up express session
app.use(session({
  //js object with a number of properties (secret, resave, saveUninitialized)
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

//Initialize and start using passport.js
app.use(passport.initialize());
//Tell the app to use passport to also setup the sessions
app.use(passport.session());




//Connect to mongoDB
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/*
Fix the below error after running nodemon app.js

DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
*/
mongoose.set("useCreateIndex", true);

//Setup the new userDB
//Create the userSchema
// const userSchema = {
//   email: String,
//   password: String
// };

/*Replace the simple version of the schema above to the below one
The userSchema is no longer a simple javascript object,
it is now an object created from the mongoose.Schema class
*/
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

/*
In order to set up the passport-local-mongoose, it needs to be added to
the mongoose schema as a plugin

That is what we will use now to hash and salt the passwords
and to save the users into the mongoDB database
*/
userSchema.plugin(passportLocalMongoose);



/*
Mongoose Encryption Secret String
It defines a secret (a long unguessable string) then uses this secret to encrypt the DB
*/
//Move to below code to the .env file


//const secret = "Thisisourlittlesecret."; <- Delete this (Environment Variables to Keep Secrets Safe)

/*
Use the secret above to encrypt the DB by taking the userSchema and add
mongoose.encrypt as a plugin to the schema and pass over the secret as a JS object

It is important to add the plugin before the mongoose.model

Encrypt Only Certain Fields (password) -> encryptedFields: ['password']
*/

//Remove the plugin below to use md5 (hash function)

// userSchema.plugin(encrypt, {
//   secret: process.env.SECRET, //Environment variables -> .env file
//   encryptedFields: ['password']
// });




//Setup a new User model and specify the name of the collection User
const User = new mongoose.model("User", userSchema);

/*
passport-local Configuration

Create a strategy which is going to be the local strategy to
authenticate users using their username and password and also to
serialize and deserialize the user

Serialize the user is to basically create the cookie and add inside the
message, namely the user's identification into the cookie

Deserialize the user is to basically allow passport to be able to crumble
the cookie and discover the message inside which is who the user is all of the user's
identification so that we can authenticate the user on the server
*/
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



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

//Target the secrets route to render the secrets page
app.get("/secrets", function(req, res) {
  /*
  Check if the user is authenticated and this is where we are relying on
  passport.js, session, passport-local and passport-local-mongoose to make sure
  that if the user is already logged in then we should simply render the secrets page
  but if the user is not logged in then we are going to redirect the user to the login page
  */
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.render("login");
  }
});

//Target the logout route
app.get("/logout", function(req, res) {
  //deauthenticate the user and end the user session
  req.logout();
  //redirect the user to the root route (home page)
  res.redirect("/");
});

//POST request (register route) to post the username and password the user enter when registering
app.post("/register", function(req, res) {

  /*
  Tap into the User model and call the register method, this method comes from
  passport-local-mongoose package which will act as a middle-man to create and save the new user
  and to interact with mongoose directly

  js object -> {username: req.body.username}
  */
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      consolo.log(err);
      //Redirect the user back to the register page if there are any error
      res.redirect("/register");
    } else {
      /*
      Authentica the user using passport if there are no errors
      the callback (function()) below is only triggered if the authentication
      is successfull and we managed to successfully setup a cookie that saved
      their current logged in session
      */
      passport.authenticate("local")(req, res, function() {
        /*
        As we are authenticating the user and setting up a logged in session for him
        then the user can go directly to the secret page, they should automatically
        be able to view it if they are still logged in - so now we need to create a secrets route
        */
        res.redirect("/secrets");
      });
    }
  });
  /*

  delete the below (all code from the register post route) now workinig on cookies and sessions module

  Now we will incorporate (code above) hashing and salting and authentication using passport.js and the packages just added (passport passport-local passport-local-mongoose express-session)

  */




  // /*
  // bcrypt.hash('bacon', 8, function(err, hash) {
  // });
  //
  //   use the hash function passing in the password that the user has typed in when
  //   they registered and also the number of rounds of salting we want to do and bcryptjs
  //   will automatically genereate the random salt and also hash our password with the
  //   number of salt rounds that we designed
  // */
  // bcrypt.hash(req.body.password, 15, function(err, hash) {
  //
  //
  //   //Create the new user using the User model
  //   const newUser = new User({
  //     //Values from the userSchema checked against the register.ejs variables
  //     email: req.body.username,
  //
  //     /*
  //     Instead of saving the password, we will use the hash function (md5)
  //     to turn the password into an inrreversabel hash
  //     */
  //
  //     password: hash // replace the previous code (password) with the hash that has being generated
  //   });
  //   //Save the new user
  //   newUser.save(function(err) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       /*
  //       Only render the secrets page if the user is logged in
  //       that is why there is no app.get("/secrets")... route
  //       */
  //       res.render("secrets");
  //     }
  //   });
  // });


  //Replace the below with the one above


  // //Create the new user using the User model
  // const newUser = new User({
  //   //Values from the userSchema checked against the register.ejs variables
  //   email: req.body.username,
  //
  //   /*
  //   Instead of saving the password, we will use the hash function (md5)
  //   to turn the password into an inrreversabel hash
  //   */
  //   password: md5(req.body.password)
  // });
  // //Save the new user
  // newUser.save(function(err) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     /*
  //     Only render the secrets page if the user is logged in
  //     that is why there is no app.get("/secrets")... route
  //     */
  //     res.render("secrets");
  //   }
  // });


});

//POST request (login route) to login the user
app.post("/login", function(req, res) {

  //Create a new user from the mongoose model with its two properties (username, password)
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  //Now use passport to login the user and authenticate him - take the user created from above
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      //Authenticate the user if there are no errors
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  });




  /*

  delete the below (all code from the login post route) now workinig on cookies and sessions module

  Now we will incorporate (code above) hashing and salting and authentication using passport.js and the packages just added (passport passport-local passport-local-mongoose express-session)

  */




  // //Check in mongoDB if the credentials entered exist in the DB
  // const username = req.body.username;
  //
  // /*
  // Instead of saving the password, we will use the hash function (md5)
  // to turn the password into an inrreversabel hash
  //
  // Hash the password the password the user type in using the same hash function (md5)
  // and compare the outcome of this with the hash that has being stored in our database (registration)
  // */
  // //const password = md5(req.body.password); <- replace with bcryptjs
  // const password = req.body.password;
  //
  //
  // /*
  // Check the details entered above (username & password)
  // if the details exist in the DB and match what is in the DB
  // Look through the collection of Users (User)
  // */
  // User.findOne({
  //   email: username
  // }, function(err, foundUser) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     /*
  //     If the user has been found in the DB
  //     Check if the password is correct, if correct render to the secrets page
  //     */
  //     if (foundUser) {
  //
  //       /*
  //       Hash function - now compare the hash inside the DB with the
  //       hashed version of the user's password
  //       */
  //       //if (foundUser.password === password) { <- replace with bcryptjs
  //
  //       // Load hash from your password DB.
  //
  //
  //       /*
  //       bcryptjs Hash function - now compare the hash inside the DB with the
  //       hashed version of the user's password entered by the user
  //
  //       // Load hash from your password DB.
  //       bcrypt.compare("B4c0/\/", hash, function(err, res) {
  //         // res === true
  //       });
  //
  //       compare the password ("B4c0/\/") entered by the user against the
  //       hash (hash) one stored in the DB
  //
  //       Rename the res to result inside the call back function so it does not get
  //       confused with the res we are trying to use
  //       */
  //       bcrypt.compare(password, foundUser.password, function(err, result) {
  //         /*
  //         if the result of the comparison is equals to true,
  //         then the password after hashing with the salt is equal to
  //         the hash we get stored the DB, then it means the user got the
  //         correct login password, then res.render the secrets page
  //         */
  //         if (result === true) {
  //           res.render("secrets");
  //         }
  //       });
  //     }
  //   }
  // });
});

//Set up the server to listen to port 3000
app.listen(3000, function() {
  console.log("Server started on port 3000!!!");
});