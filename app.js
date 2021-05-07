//jshint esversion:6

//Create some constants to require packages/modules

/*
It is important to put (require("dotenv").config();) on the top otherwise
you may not be able to access it if it is not configured
*/
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
//We don't need to require passport-local because it's one of those dependencies that will be needed by passport-local-mongoose
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const emoji = require('node-emoji');

//Create a new app instance using express
const app = express();

//Tell the app to use EJS as its view engine as the templating engine
app.set('view engine', 'ejs');

//Require body-parser module to parser the requests
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);

//Tell the app to use all the statics files inside the public folder
app.use(express.static('public'));

//Set up express session
app.use(
	session({
		//js object with a number of properties (secret, resave, saveUninitialized)
		secret: 'Our little secret.',
		resave: false,
		saveUninitialized: false
	})
);

//Initialize and start using passport.js
app.use(passport.initialize());
//Tell the app to use passport to also setup the sessions
app.use(passport.session());

//Connect to mongoDB
mongoose.connect('mongodb://localhost:27017/userDB', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

/*
Fix the below error after running nodemon app.js

DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
*/
mongoose.set('useCreateIndex', true);

/*Replace the simple version of the schema above to the below one
The userSchema is no longer a simple javascript object,
it is now an object created from the mongoose.Schema class
*/

//Code updated, now the secrets are saved into an array (secret)

const userSchema = new mongoose.Schema({
	email: String,
	password: String,
	googleId: String,
	secret: Array
});

/*
In order to set up the passport-local-mongoose, it needs to be added to
the mongoose schema as a plugin

That is what we will use now to hash and salt the passwords
and to save the users into the mongoDB database
*/
userSchema.plugin(passportLocalMongoose);

/*
Simple plugin for Mongoose which adds a findOrCreate method to models.
This is useful for libraries like Passport which require it.
*/
userSchema.plugin(findOrCreate);

//Setup a new User model and specify the name of the collection User
const User = new mongoose.model('User', userSchema);

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
/*
Error: Failed to serialize user into session

In order to fix the error above we need to replace our serialize
and deserialize code to work for all different strategies,
not just for the local strategy
*/
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

/*
Set up the Google Strategy and configure it using all of those details we received when we created
the passport-google-oauth20 application such as the Client ID and Client Secret, as well
as the Authorised redirect URIs
*/
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: 'http://localhost:3000/auth/google/secrets',
			/*
    So now when we use passport to authenticate our users using Google OAuth we are no longer
    gonna be retrieving their profile information from their Google+ account but instead we are
    going to retrieve it from their info which is simply another endpoint on Google.

    It is very likely that at some point if the Google+ API deprecates then the code might
    not work and we are probably going to get some warnings down the line in the console telling
    something like: "Google+ API deprecated. Fix it by doing this..."
    So now the code looks like the below:
    */
			userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
		},
		/*
  In this callback function is where Google sends back an access token (accessToken), which is
  the thing that allows us to get data related to that user which allows us to access the user's
  data for a longer period of time

  We also get their profile which is essentially what we are interested in because that is what
  will contain their email, Google ID, and anything else that we have access to
  */
		function(accessToken, refreshToken, profile, cb) {
			//Check out what we get back from Google
			console.log('\n');
			console.log(
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' '
			);
			console.log('\n');
			console.log(
				emoji.get('earth_americas'),
				' ',
				emoji.get('computer'),
				' ',
				emoji.get('fireworks'),
				'  CHECK OUT WHAT WE GOT BACK FROM GOOGLE ',
				emoji.get('dart'),
				' ',
				emoji.get('trophy'),
				' ',
				emoji.get('milky_way')
			);
			console.log(profile);
			console.log('\n');
			console.log(
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' ',
				emoji.get('balloon'),
				' '
			);
			console.log('\n');

			/*
    And finally we use the data that we get back, namely their Google ID to either find a
    user with that ID in our database of users or to create them if they don't exist

    _____________________________________________________________________________________________________________________

    User.findOrCreate is not actually a function, it is something that passport came up with as a pseudo code(fake code)
    and they are basically trying to tell you to implement some sort of functionality to find or create the user, and we
    can use mongoose-findorcreate to do it as this Mongoose Plugin essentially allows us to make that pseudo code work as
    Mongoose Plugin's team created that function in the package and it does exactly what the pseudo code was supposed to do.

    We only need to install the `mongoose-findorcreate` package, require it, and add it as a plugin to our
    schema to make it work.

    Now the last step is to add it as a **plugin** to our **schema**

    Now the code should work and we should be able to tap into our User model and call the `findOrCreate` function
    that previously did not exist
    */
			User.findOrCreate(
				{
					googleId: profile.id
				},
				function(err, user) {
					return cb(err, user);
				}
			);
		}
	)
);

//Add some GETs to view the EJS files/websites
//Target the home/root route to render the home page
app.get('/', function(req, res) {
	res.render('home');
});

/*
GET request for the button the user clicks when trying to
login/register with Google (login.ejs - register.ejs)
*/
app.get(
	'/auth/google',
	/*
  Use passport to authenticate our user using the strategy (google strategy)
  that we want to authenticate our user with
  */
	passport.authenticate('google', {
		/*
    Then we are saying when we hit up Google, we are goint to tell
    them that what we want is the user 's profile and this includes
    their email address as well as their user ID on Google which
    we will be able to use and identify them in the future. Once that's
    been successful, Google will redirect the user back to our website
    and make a GET request to "/auth/google/secrets" (next app.get... code below)
    and that is where will authenticate them locally and save their login session
    */
		scope: [ 'profile' ]
		/*
    passport.authenticate('google', { scope: ['profile'] })
    should be enough to bring up a pop up that allows the user
    to sign into their Google account
    */
	})
);

/*
This GET request gets made by Google when they try to redirect the user back
to our website and this string "/auth/google/callback" has to match what
we specified to Google previously
*/
app.get(
	'/auth/google/secrets',
	/*
  authenticate the user locally and if there were any
  problems send them back to the login page again
  */
	passport.authenticate('google', {
		failureRedirect: '/login'
	}),
	function(req, res) {
		/*
    Successful authentication

    But if there are no problems then we can redirect them to the /secrets page
    or any other sort of privileged page we may have
    */
		res.redirect('/secrets');
	}
);

//Target the login route to render the login page
app.get('/login', function(req, res) {
	res.render('login');
});

//Target the register route to render the register page
app.get('/register', function(req, res) {
	res.render('register');
});

//Target the secrets route to render the secrets page
app.get('/secrets', function(req, res) {
	/*
  secrets will no longer be a privileged page, anybody logged in or
  not logged in will now be able to see the secrets that have been
  submitted anonymously by the users of the page, so we are only going
  to trawl through mongoDB and find all the secrets that have been
  submitted on the mongoDB, we are going to use our model of Users (User)
  and use find and look through the collection users and find all
  ({$ne: null})the places where the secret field actually has a value stored
  */

	//Code updated, now the secrets are saved into an array (secret)
	User.find(
		{
			secret: {
				$ne: null
			}
		},
		function(err, users) {
			if (!err) {
				if (users) {
					res.render('secrets', {
						usersWithSecrets: users
					});
				} else {
					console.log(err);
				}
			} else {
				console.log(err);
			}
		}
	);
});

//Target the submit route
app.get('/submit', function(req, res) {
	//Check to see if the user is logged in, then render the submit page
	if (req.isAuthenticated()) {
		res.render('submit');
	} else {
		res.redirect('/login');
	}
});

//Target the logout route
app.get('/logout', function(req, res) {
	//deauthenticate the user and end the user session
	req.logout();
	//redirect the user to the root route (home page)
	res.redirect('/');
});

//POST request (submit route) to submit a secret
app.post('/submit', function(req, res) {
	/*
  Find the current user in the DB and save the secret into their file
  Passport saves the users details because when we initiate a new login session
  it will save that user's details into the request (req) variable
  test it by console.log(req.user); to output the current logged in
  user (id and username) into the terminal
  */

	//Code updated, now the secrets are saved into an array (secret)
	if (req.isAuthenticated()) {
		//Add the secret the user submitted to the secret field created in the schema
		User.findById(req.user.id, function(err, user) {
			user.secret.push(req.body.secret);
			//Save the user with their newly updated secret
			user.save(function() {
				res.redirect('/secrets');
			});
		});
	} else {
		res.redirect('/login');
	}
	console.log(emoji.get('blush'));
	console.log('\n');
	console.log(req.user);
	console.log('\n');
	console.log(emoji.get('blush'));
});

//POST request (register route) to post the username and password the user enter when registering
app.post('/register', function(req, res) {
	/*
  Now we will incorporate hashing and salting and authentication using passport.js and the
  packages just added (passport passport-local passport-local-mongoose express-session)
  */

	/*
  Tap into the User model and call the register method, this method comes from
  passport-local-mongoose package which will act as a middle-man to create and save the new user
  and to interact with mongoose directly

  js object -> {username: req.body.username}
  */
	User.register(
		{
			username: req.body.username
		},
		req.body.password,
		function(err, user) {
			if (err) {
				consolo.log(err);
				//Redirect the user back to the register page if there are any error
				res.redirect('/register');
			} else {
				/*
      Authentica the user using passport if there are no errors
      the callback (function()) below is only triggered if the authentication
      is successfull and we managed to successfully setup a cookie that saved
      their current logged in session
      */
				passport.authenticate('local')(req, res, function() {
					/*
        As we are authenticating the user and setting up a logged in session for him
        then the user can go directly to the secret page, they should automatically
        be able to view it if they are still logged in - so now we need to create a secrets route
        */
					res.redirect('/secrets');
				});
			}
		}
	);
});

//POST request (login route) to login the user
/*
passport.authenticate("local")

Course code was allowing the user to enter the right username (email) and wrong password
and go to the secrets page by typing in http://localhost:3000/secrets in the browser after getting
the Unauthorized page message, now the addition of passport.authenticate("local")to the
app.post... route fixes this issue
*/
app.post('/login', passport.authenticate('local'), function(req, res) {
	/*
  Now we will incorporate hashing and salting and authentication using passport.js and the
  packages just added (passport passport-local passport-local-mongoose express-session)
  */

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
			passport.authenticate('local')(req, res, function() {
				res.redirect('/secrets');
			});
		}
	});
});

//Set up the server to listen to port 3000
app.listen(3000, function() {
	console.log('\n');
	console.log('###############################################################################');
	console.log('###############################################################################');
	console.log('###############################################################################');
	console.log('###############################################################################');
	console.log('###############################################################################');
	console.log('\n');
	console.log(
		emoji.get('bamboo'),
		' ',
		emoji.get('hamburger'),
		' ',
		emoji.get('meat_on_bone'),
		' ',
		emoji.get('poultry_leg'),
		' ',
		emoji.get('rice_cracker'),
		' ',
		emoji.get('tomato'),
		' ',
		emoji.get('rice'),
		' ',
		emoji.get('cupid'),
		' ',
		emoji.get('panda_face'),
		' ',
		emoji.get('bearded_person'),
		' ',
		emoji.get('cupid'),
		' ',
		emoji.get('taco'),
		' ',
		emoji.get('pizza'),
		' ',
		emoji.get('hotdog'),
		' ',
		emoji.get('beers'),
		' ',
		emoji.get('popcorn'),
		' ',
		emoji.get('fries'),
		' ',
		emoji.get('cookie'),
		' ',
		emoji.get('ice_cream'),
		' ',
		emoji.get('strawberry')
	);
	console.log('\n');
	console.log(
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		'  SERVER STARTED ON PORT 3000!!! ',
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket'),
		emoji.get('rocket')
	);
	console.log('\n');
	console.log(
		emoji.get('bamboo'),
		' ',
		emoji.get('hamburger'),
		' ',
		emoji.get('meat_on_bone'),
		' ',
		emoji.get('poultry_leg'),
		' ',
		emoji.get('rice_cracker'),
		' ',
		emoji.get('tomato'),
		' ',
		emoji.get('rice'),
		' ',
		emoji.get('cupid'),
		' ',
		emoji.get('panda_face'),
		' ',
		emoji.get('bearded_person'),
		' ',
		emoji.get('cupid'),
		' ',
		emoji.get('taco'),
		' ',
		emoji.get('pizza'),
		' ',
		emoji.get('hotdog'),
		' ',
		emoji.get('beers'),
		' ',
		emoji.get('popcorn'),
		' ',
		emoji.get('fries'),
		' ',
		emoji.get('cookie'),
		' ',
		emoji.get('ice_cream'),
		' ',
		emoji.get('strawberry')
	);
	console.log('\n');
	console.log('###############################################################################');
	console.log('###############################################################################');
	console.log('###############################################################################');
	console.log('###############################################################################');
	console.log('###############################################################################');
	console.log('\n');
});
