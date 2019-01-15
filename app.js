const http = require("http");
const PORT = 8080;

// produce a string of 6 random alphnumeric characters
function generateRandomString() {
    var randomString = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++) {
        randomString += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return randomString;
}

// a function which handles requests and sends response
function requestHandler(request, response) {
    if (request.url == "/") {
        response.end("Welcome!");
    } else if (request.url == "/urls") {
        response.end("www.lighthouselabs.ca\nwww.google.com");
    } else {
        response.statusCode = 404;
        response.end("Unknown Path");
    }
}

var server = http.createServer(requestHandler);

server.listen(PORT, () => {
    console.log(`Server listening on: http://localhost:${PORT}`);
});