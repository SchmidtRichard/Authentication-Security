# Table of Contents

1.  [Express](#express)
2.  [Security Level 1 - The Lowest Level](#security-level-1---the-lowest-level)</br>
    2.1. [HTTP POST Request/POST Route Code Example](#http-post-requestpost-route-code-example)</br>
    2.1.1. [POST Request to Register Route Code Example](#post-request-to-register-route-code-example)</br>
    2.1.2. [POST Request to Login Route Code Example](#post-request-to-login-route-code-example)</br>

* * *

# [Express](https://expressjs.com/en/starter/installing.html)

Use the npm init command to create a `package.json` file for your application.

```express
npm init -y
```

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

  //bcryptjs - hash password with 15 salt rounds
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
      Check if the password is correct, if correct render the secrets page
      */
      if (foundUser) {
        // Load hash from your password DB.
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result === true) {
            res.render("secrets");
          }
        });
      }
    }
  });
});
```
