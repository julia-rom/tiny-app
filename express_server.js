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

//handles username form submission and posts to /login from header
app.post("/login", (req, res) => {
    let value = req.body.username;
    res.cookie("username", value)
    res.redirect('/urls');
});

//shows full database
app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"],
    };
    res.render("urls_index", templateVars);
});

//generates short link ID and redirects to urls/randomID
app.post("/urls", (req, res) => {
    let randomID = generateRandomString()
    urlDatabase[randomID] = req.body.longURL;
    res.redirect('/urls/' + randomID);
});

//brings you to main page where you generate a short url
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

//brings you to unique ID page: shows long url & short url versions
app.get("/urls/:id", (req, res) => {
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id]
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