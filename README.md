# Secrets Project

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

# Security Level 1 - The Lowest Level

## Simply creating an account for the user to store the email & password into mongoDB (users collection)

### HTTP POST Request/POST Route Code Example

#### POST Request to Register Route

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
      /_
      Only render the secrets page if the user is logged in
      that is why there is no app.get("/secrets")... route
      _/
      res.render("secrets");
    }
  });
});
```

#### POST Request to Login Route

```js
//POST request (login route) to login the user
app.post("/login", function(req, res) {
  //Check in mongoDB if the credentials entered exist in the DB
  const username = req.body.username;
  const password = req.body.password;

  /_
  Check the details entered above (username & password)
  if the details exist in the DB and match what is in the DB
  Look through the collection of Users (User)
  _/
  User.findOne({
    email: username
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      /_
      If the user has been found in the DB
      Check if the password is correct, if correct render to the secrets page
      _/
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    }
  });
});
```
