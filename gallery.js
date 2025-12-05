const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const path = require('path');

const app = express();
const db = new sqlite3.Database('gallery.db');

// ejs view engine, mildleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'front'));
app.use(bodyParser.urlencoded({ extended: true }));

// settniing cookie, session for login
// plain text secret key & no HttpOnly for the insecure ver
app.use(session({ secret: '12345', resave: true, saveUninitialized: true

}));

    // DB 
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS artworks (id INTEGER PRIMARY KEY, title TEXT, description TEXT, image_url TEXT)");

    // passwords are not hashed -> sensitive data exposure
    db.get("SELECT count(*) as count FROM users WHERE username='admin'", (err, row) => {
        if (row && row.count == 0) {
            db.run("INSERT INTO users (username, password) VALUES ('admin', 'password123')");
        }
    });
});

// index page
app.get('/', (req, res) => {

    const search = req.query.search;
    let query = "SELECT * FROM artworks";

    // search artworks
    if (search) {
        query += ` WHERE title LIKE '%${search}%' OR description LIKE '%${search}%'`;
    }

    db.all(query, (err, rows) => {
        res.render('index', {
            artworks: rows || [], search: search, user: req.session.user // send user info
        });
    });
});

// add artwork

app.post('/add', (req, res) => {
    const { title, description, image_url } = req.body;
        // save all the info to the DB
    const sql = `INSERT INTO artworks (title, description, image_url) VALUES ('${title}', '${description}', '${image_url}')`;
    db.run(sql, (err) => {
        res.redirect('/');
    });
});

// delete without checking permission
app.post('/delete', (req, res) => {
    const id = req.body.id;
    db.run(`DELETE FROM artworks WHERE id = ${id}`, (err) => {
        res.redirect('/');
    });
});

//register page
app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    
    // save in plaintext password and without checking 
    const sql = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;
    
    db.run(sql, (err) => {
        if (err) {
            // show the error
            return res.render('login', { error: "Sign up Error: " + err.message });
        }
        // redirect to login page when success
        res.render('login', { error: "Account is created successfully, Please login." });
    });
});

// login page
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

// saving user input directly to the query
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    db.get(query, (err, user) => {
        if (err) {
            // show DB error directly
            res.render('login', { error: "DB Error: " + err.message });
        } else if (user) {
            req.session.user = user; //save user in session
            res.redirect('/');
        } else {
            res.render('login', { error: "Login Failed!" });
        }
    });
});

// logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(6789, () => {
    console.log('Server is starting on http://localhost:6789');
});