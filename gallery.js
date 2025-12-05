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
    db.run("INSERT INTO users (username, password) VALUES ('admin', 'password123')");

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

app.listen(6789, () => {
    console.log('Server is starting on http://localhost:6789');
});