const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const path = require('path');

const app = express();
const db = new sqlite3.Database('gallery.db');

// ejs front engine, mildleware
app.set('front engine', 'ejs');
app.set('front', path.join(__dirname, 'front'));
app.use(bodyParser.urlencoded({ extended: true }));

// settniing cookie, session for login
// plain text secret key & no HttpOnly for the insecure ver 
app.use(session({
    secret: 'weak_secret_key', // vulnerability
    resave: true,
    saveUninitialized: true
}));

    // DB 
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS artworks (id INTEGER PRIMARY KEY, title TEXT, comment TEXT)");

    // passwords are not hashed -> sensitive data exposure
    db.run("INSERT INTO users (username, password) VALUES ('admin', 'password123')");
    db.run("INSERT INTO artworks (title, comment) VALUES ('chen chen yi', 'She is my dog')");
});