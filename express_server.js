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
        password: "password"
    }
}

var urlDatabase = {
    userRandomID: {
        "b2xVn2": "http://www.lighthouselabs.ca",
        "9sm5xK": "http://www.google.com"
    },
    user2RandomID: {
        "g9KVn2": "http://www.format.com",
        "MNB5xK": "http://www.reddit.com"
    }
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

function findUser(email) {
    for (var user in users) {
        if (email === users[user].email) {
            return users[user];
        }
    }
    return null;
}

//handles username form submission and posts to /login from header
app.post("/login", (req, res) => {
    //checks if login email matches user from database
    let foundUser = findUser(req.body.email)
    if (foundUser) {
        if (foundUser.password === req.body.password) {
            res.cookie("user_id", foundUser.id)
            res.redirect('/');
        }
        else {
            res.status(403).send('Bad email & password login');
        }
    }
    else {
        res.status(403).send('Email cannot be found');

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
        urls: urlDatabase[req.cookies.user_id],
        username: req.cookies["user_id"],
    };
    res.render("urls_index", templateVars);
});

//generates short link ID and redirects to urls/randomID
app.post("/urls", (req, res) => {
    let randomID = generateRandomString();
    urlDatabase[req.cookies.user_id][randomID] = req.body.longURL;
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
        longURL: urlDatabase[req.cookies.user_id][req.params.id],
        username: req.cookies["user_id"],
    };
    res.render("urls_show", templateVars);
});

//deletes an existing short url
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.cookies.user_id][req.params.id];
    res.redirect('/urls');
});

//lets you edit existing long url
app.post("/urls/:id/", (req, res) => {
    urlDatabase[req.cookies.user_id][req.params.id] = req.body.longURL;
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