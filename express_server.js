const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

// JSON body parser as variable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//cookie session encryption
app.use(cookieSession({
    name: 'session',
    keys: ["thisIsMySecretKeyMeowMeow"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

function generateRandomString() {
    var randomString = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++) {
        randomString += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return randomString;
}

//user database
//since they are hard coded in, they do not have a hashed password. In other words,
//the passwords below are just for testing a hardcoded login example
let users = {
    "userRandomID": {
        id: "userRandomID",
        email: "code@lh.com",
        hashPass: bcrypt.hashSync("purple-monkey-dinosaur", 10)
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "hey@whatever.com",
        hashPass: bcrypt.hashSync("password", 10)
    }
}

var urlDatabase = {
    "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID"
    },
    "9sm5xK": {
        longURL: "http://www.google.com",
        userID: "userRandomID"
    },
    "g9KVn2": {
        longURL: "http://www.format.com",
        userID: "user2RandomID"
    },
    "MNB5xK": {
        longURL: "http://www.reddit.com",
        userID: "user2RandomID"
    },
};


app.get("/", (req, res) => {
    res.send("Hello!");
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
        // if (bcrypt.compareSync(foundUser.password, hashPass)) {
        if (bcrypt.compareSync(foundUser.hashPass, req.body.password)) {
            //cookie doesn't seem to be setting after login
            // req.session.user_id;
            req.session.user_id = foundUser[user].id;
            res.redirect('/urls');
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
    // res.clearCookie("user_id")
    delete req.session.user_id;
    res.redirect('/login');
});

//returns registration page
app.get("/register", (req, res) => {
    res.render('register_page');
});

//Checks if password and email are not empty
function validatePasswordEmailNotEmpty(email, password) {
    if (!email || !password) {
        return {
            status: "error",
            message: "Email or password field is empty."
        }
    }
    else {
        return {
            status: "ok"
        }
    }
}

//Ensures new email is not taken
function validateEmailNotTaken(email, users) {
    for (var user in users) {
        if (users[user].email === email) {
            return {
                status: "error",
                message: "Email is taken, sorry!"
            }
        }
    }
    return {
        status: "ok"
    }
}

//registers new users & handles reg errors
app.post("/register", (req, res) => {
    const randomUserID = generateRandomString();
    const notEmpty = validatePasswordEmailNotEmpty(req.body.email, req.body.password);
    const notTaken = validateEmailNotTaken(req.body.email, users);
    const password = req.body.password;

    if (notEmpty["status"] === "error") {
        res.status(400).send(notEmpty["message"]);
    }
    else if (notTaken["status"] === "error") {
        res.status(400).send(notTaken["message"]);
    }
    else {
        users[randomUserID] = {
            id: randomUserID,
            email: req.body.email,
            hashPass: bcrypt.hashSync(password, 10)
        };
        req.session.user_id = randomUserID;
        res.redirect('/urls');
    }
});

//shows full database
app.get("/urls", (req, res) => {
    let urlList = {}
    let userID = req.session.user_id
    if (userID) {
        for (var url in urlDatabase) {
            if (urlDatabase[url]["userID"] === userID) {
                urlList[url] = urlDatabase[url]["longURL"];
            };
        }
        let templateVars = {
            urls: urlList,
            username: userID,
            email: users[userID].email
        };
        res.render("urls_index", templateVars);
    }
    else {
        res.redirect("/login");
    }
});

//brings you to main page where you generate a short url

app.get("/urls/new", (req, res) => {
    let loggedIn = req.session.user_id;
    //checks if user is logged in
    if (loggedIn) {
        let templateVars = {
            username: req.session.user_id,
            email: users[req.session.user_id].email
        };
        //displays url shortener if logged in
        res.render("urls_new", templateVars);
    }
    else {
        res.redirect("/login")
    }
});

//generates short link ID and redirects to urls/randomID
app.post("/urls/new", (req, res) => {
    let randomID = generateRandomString();
    urlDatabase[randomID] = {
        longURL: req.body.longURL,
        userID: req.session.user_id,
        email: users[req.session.user_id].email
    }
    res.redirect('/urls/' + randomID);
});

//brings you to unique ID page: shows long url & short url versions
app.get("/urls/:id", (req, res) => {
    if (req.session.user_id) {
        let templateVars = {
            shortURL: req.params.id,
            longURL: req.session.user_id && urlDatabase[req.params.id]["longURL"],
            username: req.session.user_id,
            email: users[req.session.user_id].email
        };
        res.render("urls_show", templateVars);
    }
    else {
        res.redirect('/login');
    }
});

//deletes an existing short url
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
});

//lets you edit existing long url
app.post("/urls/:id/", (req, res) => {
    urlDatabase[req.params.id]["longURL"] = req.body.longURL;
    res.redirect('/urls');
});

//ensures short url brings you to corresponding long url whether you're logged in or not
app.get("/u/:shortURL", (req, res) => {
    console.log("Short url: ", req.params.shortURL)
    if (urlDatabase[req.params.shortURL]) {
        let longURL = urlDatabase[req.params.shortURL]["longURL"];
        res.redirect(longURL);
    }
    else {
        res.status(400).send('Sorry, the short url you are trying to reach does not exist!');
    }
});


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});