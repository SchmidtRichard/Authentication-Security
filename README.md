# Table of Contents

1.  [Express](#express)
    1.1 [Installation](#installation)</br>
    1.2 [Other Packages Installation](#other-packages-installation)</br>
2.  [Security Level 1 - The Lowest Level](#security-level-1---the-lowest-level)</br>
    2.1. [HTTP POST Request/POST Route Code Example](#http-post-requestpost-route-code-example)</br>
      2.1.1. [POST Request to Register Route Code Example](#post-request-to-register-route-code-example)</br>
      2.1.2. [POST Request to Login Route Code Example](#post-request-to-login-route-code-example)</br>
3.  [Security Level 2 - mongoose-encryption](#security-level-2--mongooseencryption)</br>
    3.1 [How it Works](#how-it-works)</br>
    3.2 [Installation](#installation)</br>
    3.3 [Usage](#usage)</br>
      3.1.1 [Basic](#basic)</br>
      3.1.2 [Encrypt Only Certain Fields](#encrypt-only-certain-fields)</br>
      3.1.3 [Secret String Instead of Two Keys](#secret-string-instead-of-two-keys)</br>
    3.4 [Mongoose Encryption Code Example](#mongoose-encryption-code-example)</br>
    3.5 [Environment Variables to Keep Secrets Safe](#environment-variables-to-keep-secrets-safe)</br>
      3.5.1 [dotenv](#dotenv)</br>
      3.5.2 [Installation](#installation)</br>
      3.5.3 [Usage](#usage)</br>
      3.5.4 [Environment Variables to Keep Secrets Safe Code Example](#environment-variables-to-keep-secrets-safe-code-example)</br>
    3.6 [.gitignore](#gitignore)</br>
4.  [Security Level 3 - Hash](#security-level-3--hash)</br>
    4.1 [MD5](#md5)</br>
    4.2 [Installation](#installation)</br>
    4.3 [Usage](#usage)</br>
    4.4 [Hash Function (MD5) Code Example](#hash-function-md5-code-example)</br>
5.  [Security Level 4 - Salting and Hashing Passwords with bcryptjs](#security-level-4--salting-and-hashing-passwords-with-bcryptjs)</br>
    5.1 [bcryptjs Hashing Algorithm (replaces MD5)](#bcryptjs-hashing-algorithm-replaces-md5)</br>
    5.2 [Salting](#salting)</br>
      5.2.1 [Salt Rounds](#salt-rounds)</br>
    5.3 [Installation](#installation)</br>
    5.4 [Usage](#usage)</br>
    5.5 [Basic](#basic)</br>
    5.6 [bcryptjs and Salting Code Example](#bcryptjs-and-salting-code-example)</br>
6.  [Security Level 5 - Cookies & Sessions](#security-level-5--cookies--sessions)
        6.1 [Implementation with Passport.js](#implementation-with-passportjs)</br>
        6.2 [Passport.js and Other Packages Installation](#passportjs-and-other-packages-installation)</br>
        6.3 [express-session & Usage](#expresssession--usage)</br>
          6.3.1 [Setup Express Session](#setup-express-session)</br>
          6.3.2 [Initialize and Start Using passport.js](#initialize-and-start-using-passportjs)</br>
          6.3.3 [Setup passport-local-mongoose](#setup-passportlocalmongoose)</br>
          6.3.4 [passport-local Configuration](#passportlocal-configuration)</br>
          6.3.5 [Fixing Deprecation Warning](#fixing-deprecation-warning)</br>
        6.4 [GET Request to Secrets Route Code Example](#get-request-to-secrets-route-code-example)</br>
        6.5 [GET Request to Logout Route Code Example](#get-request-to-logout-route-code-example)</br>
        6.6 [POST Request to Register Route Code Example](#post-request-to-register-route-code-example)</br>
        6.7 [POST Request to Login Route Code Example](#post-request-to-login-route-code-example)</br>

* * *

# [Express](https://expressjs.com/en/starter/installing.html)

`Express.js`, or simply `Express`, is a _back end web application framework_ for `Node.js`, released as free and open-source software under the MIT License. It is designed for building web applications and APIs. It has been called the de facto standard server framework for `Node.js`.

`Express` is the _back-end component_ of popular development stacks like the `MEAN`, `MERN` or `MEVN stack`, together with the `MongoDB` database software and a `JavaScript` front-end framework or library.

The primary use of `Express` is to _provide server-side logic_ for web and mobile applications, and as such it's used all over the place.

## Installation

Use the npm init command to create a `package.json` file for your application.

```express
npm init -y
```

## Other Packages Installation

Install some packages(`express`, `ejs`, `body-parser` and `mongoose`)

```express
npm i express ejs body-parser mongoose
```

* * *

# Security Level 1 - The Lowest Level

Simply creating an account for the user to store the email & password into mongoDB (users collection)

## HTTP POST Request/POST Route Code Example

### POST Request to Register Route Code Example

```js
//POST request (register route) to post the username and password the user enter when registering
app.post("/register", function(req, res) {
  //Create the new user using the User model
  const newUser = new User({
    //Values from the userSchema checked against the register.ejs variables
    email: req.body.username,
    password: req.body.password
  });
  //Save the new user
  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      /*
      Only render the secrets page if the user is logged in
      that is why there is no app.get("/secrets")... route
      */
      res.render("secrets");
    }
  });
});
```

### POST Request to Login Route Code Example

```js
//POST request (login route) to login the user
app.post("/login", function(req, res) {
  //Check in mongoDB if the credentials entered exist in the DB
  const username = req.body.username;
  const password = req.body.password;

  /*
  Check the details entered above (username & password)
  if the details exist in the DB and match what is in the DB
  Look through the collection of Users (User)
  */
  User.findOne({
    email: username
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      /*
      If the user has been found in the DB
      Check if the password is correct, if correct render to the secrets page
      */
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    }
  });
});
```

* * *

# Security Level 2 - [mongoose-encryption](https://www.npmjs.com/package/mongoose-encryption)

Simple encryption and authentication for mongoose documents. Relies on the Node `crypto` module. Encryption and decryption happen transparently during save and find. Rather than encrypting fields individually, this plugin takes advantage of the BSON nature of mongoDB documents to encrypt multiple fields at once.

## How it Works

Encryption is performed using `AES-256-CBC` with a random, unique initialization vector for each operation. Authentication is performed using `HMAC-SHA-512`.

## Installation

`npm install mongoose-encryption`

## Usage

Generate and store keys separately. They should probably live in environment variables, but be sure not to lose them. You can either use a single `secret` string of any length; or a pair of base64 strings (a 32-byte `encryptionKey` and a 64-byte `signingKey`).

```js
var mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');
```

### Basic

By default, all fields are encrypted except for `_id`, `__v`, and fields with indexes

```js
var mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');

var userSchema = new mongoose.Schema({
    name: String,
    age: Number
    // whatever else
});

// Add any other plugins or middleware here. For example, middleware for hashing passwords

var encKey = process.env.SOME_32BYTE_BASE64_STRING;
var sigKey = process.env.SOME_64BYTE_BASE64_STRING;

userSchema.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey });
// This adds _ct and _ac fields to the schema, as well as pre 'init' and pre 'save' middleware,
// and encrypt, decrypt, sign, and authenticate instance methods

User = mongoose.model('User', userSchema);
```

And you're all set. `find` works transparently (though you cannot query fields that are encrypted) and you can make New documents as normal, but you should not use the `lean` option on a `find` if you want the document to be authenticated and decrypted. `findOne`, `findById`, etc..., as well as `save` and `create` also all work as normal. `update` will work fine on unencrypted and unauthenticated fields, but will not work correctly if encrypted or authenticated fields are involved.

### Encrypt Only Certain Fields

You can also specify exactly which fields to encrypt with the `encryptedFields` option. This overrides the defaults and all other options.

```js
// encrypt age regardless of any other options. name and _id will be left unencrypted
userSchema.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey, encryptedFields: ['age'] });
```

### Secret String Instead of Two Keys

For convenience, you can also pass in a single secret string instead of two keys.

```js
var secret = process.env.SOME_LONG_UNGUESSABLE_STRING;
userSchema.plugin(encrypt, { secret: secret });
```

## Mongoose Encryption Code Example

```js
/*Replace the simple version of the schema above to the below one
The userSchema is no longer a simple javascript object,
it is now an object create from the mongoose.Schema class
*/
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

/*
Mongoose Encryption Secret String
It defines a secret (a long unguessable string) then uses this secret to encrypt the DB
*/
const secret = "Thisisourlittlesecret.";
/*
Use the secret to above to encrypt the DB by taking the userSchema and add
mongoose.encrypt as a plugin to the schema and pass over the secret as a JS object

It is important to add the plugin before the mongoose.model

Encrypt Only Certain Fields (password) -> encryptedFields: ['password']
*/
userSchema.plugin(encrypt, {
  secret: secret,
  encryptedFields: ['password']
});
```

# Environment Variables to Keep Secrets Safe

## [dotenv](https://www.npmjs.com/package/dotenv)

Dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`.

## Installation

```js
npm install dotenv
```

## Usage

As early as possible in your application, require and configure dotenv.

```js
require('dotenv').config()
```

Create a `.env` file in the root directory of your project. Add environment-specific variables on new lines in the form of `NAME=VALUE`. For example:

```js
DB_HOST=localhost
DB_USER=root
DB_PASS=s1mpl3
```

`process.env` now has the keys and values you defined in your `.env` file.

```js
    const db = require('db')
    db.connect({
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASS
    })
```

## Environment Variables to Keep Secrets Safe Code Example

.env file

```js
# Add the enviroment variables

# Mongoose Encryption Secret String
# It defines a secret (a long unguessable string) then uses this secret to encrypt the DB

SECRET=Thisisourlittlesecret.
```

Back in the `app.js` file, you need to delete and update the the below (check against previous code)

```js
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
userSchema.plugin(encrypt, {
  secret: process.env.SECRET, //Enviroment variables -> .env file
  encryptedFields: ['password']
});
```

## [.gitignore](https://github.com/github/gitignore/blob/master/Node.gitignore)

Tell git which files and folders it should ignore when uploading to GitHub, the `.env` file should always be kept hidden from GitHub and any other public place in order to keep the secrets safe.

1.  From the Hyper terminal stop `nodemon app.js` and type in `touch .gitignore`, this will create the `.gitignore` file that you can configure to ignore all the files and folders you want to

Examples:

```js
# Dependency directories
node_modules/
jspm_packages/

# dotenv environment variables file
.env
.env.test
```

* * *

# Security Level 3 - Hash

Hashing takes away the need for an encryption key. Hashing does not decrypt the password back into plain text. Hash functions turns the password the user has chosen into a hash, and store the hash into the DB.

Hash functions are mathematical equations designed to make it almost impossible to go backwards, in other words, it is almost impossible to turn a hash back into a password.

## [(MD5)](https://www.npmjs.com/package/md5)

A JavaScript function for hashing messages with MD5.

## Installation

You can use this package on the server side as well as the client side.

Node.js:

```js
npm install md5
```

## Usage

```js
var md5 = require('md5');

console.log(md5('message'));
```

This will print the following

```js
78e731027d8fd50ed642340b7c9a63b3
```

## Hash Function (MD5) Code Example

```js
//POST request (register route) to post the username and password the user enter when registering
app.post("/register", function(req, res) {
  //Create the new user using the User model
  const newUser = new User({
    //Values from the userSchema checked against the register.ejs variables
    email: req.body.username,

    /*
    Instead of saving the password, we will use the hash function (md5)
    to turn the password into an inrreversabel hash
    */
    password: md5(req.body.password)
  });
  //Save the new user
  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      /*
      Only render the secrets page if the user is logged in
      that is why there is no app.get("/secrets")... route
      */
      res.render("secrets");
    }
  });
});

//POST request (login route) to login the user
app.post("/login", function(req, res) {
  //Check in mongoDB if the credentials entered exist in the DB
  const username = req.body.username;

  /*
  Instead of saving the password, we will use the hash function (md5)
  to turn the password into an inrreversabel hash

  Hash the password the password the user type in using the same hash function (md5)
  and compare the outcome of this with the hash that has being stored in our database (registration)
  */
  const password = md5(req.body.password);

  /*
  Check the details entered above (username & password)
  if the details exist in the DB and match what is in the DB
  Look through the collection of Users (User)
  */
  User.findOne({
    email: username
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      /*
      If the user has been found in the DB
      Check if the password is correct, if correct render to the secrets page
      */
      if (foundUser) {

        /*
        Hash function - now compare the hash inside the DB with the
        hashed version of the user's password
        */
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    }
  });
});
```

* * *

# Security Level 4 - Salting and Hashing Passwords with [bcryptjs](https://www.npmjs.com/package/bcryptjs)

## bcryptjs Hashing Algorithm (replaces MD5)

Optimized `bcrypt` in JavaScript with zero `dependencies`. Compatible to the `C++ bcrypt` binding on `node.js` and also working in the browser.

> :warning: [(node.bcrypt.js)](https://www.npmjs.com/package/bcrypt) installation did not work for Windows, so bcrypt.js was used instead

## Salting

Salting takes the hashing a little bit further. In addition to the password, it also generates a random set of characters and those characters along with the user's password gets combined and then put through the hash function. So the resulting hash is created from both the password as well as the random unique `salt`. So adding the `salt` increases the number of characters which makes the database a lot more secure.

The latest computers (2019) can calculate about 20 billion MD5 hashes per second, however, they can only calculate about 17 thousand `bcrypt` hashes per second which makes it dramatically harder for a hacker to generate those pre-compiled hash tables.

### Salt Rounds

How many `rounds` will you `salt` the password with, the more `rounds` the more secure the password is from hackers.

_Example:_ to have two `rounds` of salting, we take the `hash` that was generated in `round` 1 and we add the same `salt` from before. And now run it through `bcrypt hash function` again and we end up with a different `hash`. And the number of times you do this is the number of `salt rounds`.

When it comes to checking the user's password when they login, we will take the password that they entered and combine it with the `salt` that is stored in the database and run it through the same number of salting rounds until we end up with the final `hash` and we compare the `hash` against the one that is stored in the database to see if the user entered the correct password.

## Installation

```js
npm install bcryptjs
```

## Usage

```js
const bcrypt = require("bcryptjs");
```

## Basic

Auto-gen a salt and hash:

```js
bcrypt.hash('bacon', 8, function(err, hash) {
});
```

To check a password:

```js
// Load hash from your password DB.
bcrypt.compare("B4c0/\/", hash, function(err, res) {
    // res === true
});
```

## bcryptjs and Salting Code Example

```js
//POST request (register route) to post the username and password the user enter when registering
app.post("/register", function(req, res) {
  /*
  bcrypt.hash('bacon', 8, function(err, hash) {
  });

    use the hash function passing in the password that the user has typed in when
    they registered and also the number of rounds of salting we want to do and bcryptjs
    will automatically genereate the random salt and also hash our password with the
    number of salt rounds that we designed
  */
  bcrypt.hash(req.body.password, 15, function(err, hash) {

    //Create the new user using the User model
    const newUser = new User({
      //Values from the userSchema checked against the register.ejs variables
      email: req.body.username,

      password: hash // replace the previous code with the hash that has being generated
    });
    //Save the new user
    newUser.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        /*
        Only render the secrets page if the user is logged in,
        that is why there is no app.get("/secrets")... route
        */
        res.render("secrets");
      }
    });
  });
});

//POST request (login route) to login the user
app.post("/login", function(req, res) {
  //Check in mongoDB if the credentials entered exist in the DB
  const username = req.body.username;

  //Get the password entered by the user
  const password = req.body.password;

  /*
  Check the details entered above (username & password)
  if the details exist in the DB and match what is in the DB
  Look through the collection of Users (User)
  */
  User.findOne({
    email: username
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      /*
      If the user has been found in the DB
      Check if the password is correct, if correct render to the secrets page
      */
      if (foundUser) {
        /*
        bcryptjs Hash function - now compare the hash inside the DB with the
        hashed version of the user's password entered by the user

        // Load hash from your password DB.
        bcrypt.compare("B4c0/\/", hash, function(err, res) {
          // res === true
        });

        compare the password ("B4c0/\/") entered by the user against the
        hash (hash) one stored in the DB

        Rename the res to result inside the call back function so it does not get
        confused with the res we are trying to use
        */
        bcrypt.compare(password, foundUser.password, function(err, result) {
          /*
          if the result of the comparison is equals to true,
          then the password after hashing with the salt is equal to
          the hash we get stored the DB, then it means the user got the
          correct login password, then res.render the secrets page
          */
          if (result === true) {
            res.render("secrets");
          }
        });
      }
    }
  });
});
```

* * *

# Security Level 5 - Cookies & Sessions

There are lots of different types of cookies but the types we are going to be looking at for this project are the ones that are used to establish and maintain a session. A session is a period of time when a browser interacts with a server.

Usually when the user log into a website that is when the session starts and that is when the cookie gets created, and inside that cookie there will be the user's credentials that says this user is logged in and has been successfully authenticate, which means as the user continues to browse the website he will not be asked to login again when he tries to access a page that requires authentication because they can always check against that active cookie that is on the browser and it maintains the authentication for this browsing session until the point when the user log out, which is when the session ends and the cookie that is related to the session gest _destroyed_.

## Implementation with Passport.js

The _cookies_ and _sessions_ will be implemented into the website using 'Passport.js'.

Passport.js is an authentication middleware for 'Node.js. Extremely flexible and modular, Passport.js can be unobtrusively dropped in to any 'Express-based' web application. A comprehensive set of strategies support authentication using a _username_ and a _password_, _Facebook_, _Twitter_, and _more_.

## Passport.js and Other Packages Installation

The packages to install are: `passport`, `passport-local`, `passport-local-mongoose`, and `express-session`.

```js
npm i passport passport-local passport-local-mongoose express-session
```

`express-session` is the first package that needs to be configured.

It is extremely important to place the parts of the new code exactly where it is shown placed in the examples to follow.

## [express-session](https://www.npmjs.com/package/express-session) & [passport-local-mongoose](http://www.passportjs.org/docs/) Usage

```js
const session = require('express-session')
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
```

> :warning: We don't need to require passport-local because it's one of those dependencies that will be needed by passport-local-mongoose

### Setup Express Session

```js
//Set up express session
app.use(session({
  //js object with a number of properties (secret, resave, saveUninitialized)
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
```

### Initialize and Start Using passport.js

```js
//Initialize and start using passport.js
app.use(passport.initialize());
//Tell the app to use passport to also setup the sessions
app.use(passport.session());
```

### Setup passport-local-mongoose

In order to set up the passport-local-mongoose, it needs to be added to the mongoose schema as a plugin.

That is what we will use now to hash and salt the passwords and to save the users into the mongoDB database.

```js
userSchema.plugin(passportLocalMongoose);
```

### passport-local Configuration

Create a strategy which is going to be the _local_ strategy to authenticate users' by using their username and password and also to `serialize` and `deserialize` the user.

_Serialize_ the user is to basically create the cookie and add inside the message - which is namely the users' identification - into the cookie.

_Deserialize_ the user is to basically allow passport to be able to crumble the cookie and discover the message inside which is who the user is all of the users' identification so that we can _authenticate_ the user on the server.

```js
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
```

#### [Fixing Deprecation Warning](https://github.com/Automattic/mongoose/issues/6890#issuecomment-416218953)

```js
mongoose.set("useCreateIndex", true);
```

> :warning: After running nodemon app.js we may get the error below:
> DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead

## GET Request to Secrets Route Code Example

```js
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
```

## GET Request to Logout Route Code Example

```js
//Target the logout route
app.get("/logout", function(req, res) {
  //deauthenticate the user and end the user session
  req.logout();
  //redirect the user to the root route (home page)
  res.redirect("/");
});
```

## POST Request to Register Route Code Example

Now we will incorporate `hashing`, `salting` and `authentication` using `passport.js` and the packages just added (`passport` `passport-local` `passport-local-mongoose` `express-session`).

```js
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
});
```

## POST Request to Login Route Code Example

Now we will incorporate `hashing`, `salting` and `authentication` using `passport.js` and the packages just added (`passport` `passport-local` `passport-local-mongoose` `express-session`).

```js
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
});
```
