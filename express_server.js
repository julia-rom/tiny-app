var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

function generateRandomString() {
    var randomString = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++) {
        randomString += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return randomString;
}

// JSON body parser as variable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//add cookie parser as variable
app.use(cookieParser())


//user database
let users = {
    "userRandomID": {
        id: "userRandomID",
        email: "code@lh.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "hey@whatever.com",
        password: "dishwasher-funk"
    }
}

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

//direct to login page
app.get("/login", (req, res) => {
    res.render('login');
});

//handles username form submission and posts to /login from header
app.post("/login", (req, res) => {
    //checks if login email matches user from database
    for (var user in users) {
        if (req.body.email !== users[user].email) {
            console.log(req.body.email);
            console.log(users[user].email);
            res.status(403).send('Email cannot be found');
        }
        //checks is email and password matchs database
        else if (req.body.email === users[user].email && req.body.password !== users[user].password) {
            res.status(403).send('Bad email & password login');
        }
        else {
            res.cookie("user_id", value)
            res.redirect('/');
        }
    }
});

//clears username cookie after logout
app.post("/logout", (req, res) => {
    res.clearCookie("user_id")
    res.redirect('/urls');
});

//returns registration page
app.get("/register", (req, res) => {
    res.render('register_page');
});

//save registration page login and add to user database & handle reg errors
app.post("/register", (req, res) => {
    //check if email and password inputs are empty
    if (req.body.email === "" || req.body.password === "") {
        res.status(400).send('Email or password field is empty.');
    }
    //check if email isn't already in use
    else {
        for (var user in users) {
            if (users[user].email === req.body.email) {
                res.status(400).send('Email is taken, sorry!');
            }
        }
    }

    let randomUserID = generateRandomString();
    users[randomUserID] = {
        id: randomUserID,
        email: req.body.email,
        password: req.body.password
    };
    res.cookie("user_id", randomUserID)
    res.redirect('/urls');

});

//shows full database
app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies["user_id"],
    };
    res.render("urls_index", templateVars);
});

//generates short link ID and redirects to urls/randomID
app.post("/urls", (req, res) => {
    let randomID = generateRandomString();
    urlDatabase[randomID] = req.body.longURL;
    res.redirect('/urls/' + randomID);
});

//brings you to main page where you generate a short url
app.get("/urls/new", (req, res) => {
    let templateVars = {
        username: req.cookies["user_id"],
    };
    let loggedIn = req.cookies["user_id"];
    //checks if user is logged in
    if (loggedIn) {
        //displays url shortener if logged in
        res.render("urls_new", templateVars);
    }
    else {
        res.redirect("/login")
    }
});

//brings you to unique ID page: shows long url & short url versions
app.get("/urls/:id", (req, res) => {
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id],
        username: req.cookies["user_id"],
    };
    res.render("urls_show", templateVars);
});

//deletes an existing short url
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
});

//lets you edit existing long url
app.post("/urls/:id/", (req, res) => {
    urlDatabase[req.params.id] = req.body.longURL;
    res.redirect('/urls');
});

//ensures short url brings you to corresponding long url
app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
});


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});