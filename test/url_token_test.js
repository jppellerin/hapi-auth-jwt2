var test   = require('tape');
var JWT    = require('jsonwebtoken');
var secret = 'NeverShareYourSecret';

var server = require('./basic_server.js');

test("Attempt to access restricted content (without auth token)", function(t) {
  var options = {
    method: "POST",
    url: "/privado"
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "No Token supplied > fails (as expected)");
    t.end();
  });
});

test("Attempt to access restricted content (with an INVALID URL Token)", function(t) {
  var token = "?token=my.invalid.token";
  var options = {
    method: "POST",
    url: "/privado" + token
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "INVALID Token should fail");
    t.end();
  });
});

test("Try using an incorrect secret to sign the JWT", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, 'incorrectSecret');
  token = "?token=" + token;
  // console.log(" - - - - - - token  - - - - -")
  // console.log(token);
  var options = {
    method: "POST",
    url: "/privado" + token
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "URL Token signed with incorrect key fails");
    t.end();
  });
});

test("URL Token is well formed but is allowed=false so should be denied", function(t) {
  // use the token as the 'authorization' header in requests
  // var token = jwt.sign({ "id": 1 ,"name":"Old Greg" }, 'incorrectSecret');
  var token = JWT.sign({ id: 321, "name": "Old Gregg" }, secret);
  token = "?token=" + token;
  var options = {
    method: "POST",
    url: "/privado" + token
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "User is Denied");
    t.end();
  });
});

test("Access restricted content (with VALID Token)", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 123, "name": "Charlie" }, secret);
  token = "?token=" + token;
  var options = {
    method: "POST",
    url: "/privado" + token
  };
  // server.inject lets us similate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "VALID Token should succeed!");
    t.end();
  });
});
