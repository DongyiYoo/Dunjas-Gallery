const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const morgan = require('morgan');

const app = express();
const db = new sqlite3.Database('gallery.db');

app.use(helmet());
app.use(morgan('combined'));

// set ejs for view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'front'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); 

// session setting
// set httpOnly to prevent XSS attacks from stealing cookies, complicated secret key
app.use(session({
    secret: 'd32kj&f5bjW#vgkd2', resave: true, saveUninitialized: true,
    cookie: {
        httpOnly: true, 
        secure: false
    }
}));

// CSRF 
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// pass CSRF token 
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.user = req.session.user;
    next();
});

    // DB 
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS artworks (id INTEGER PRIMARY KEY, title TEXT, description TEXT, image_url TEXT)");

    db.get("SELECT count(*) as count FROM users WHERE username='admin'", (err, row) => {
        if (row && row.count == 0) {
            // password hashing
            const hashedPassword = bcrypt.hashSync('password123', 10);
            const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
            stmt.run('admin', hashedPassword);
            stmt.finalize();
        }
    });
});

// index page
app.get('/', (req, res) => {

    const search = req.query.search;
    let query = "SELECT * FROM artworks";
    let params = [];

// prevent SQL injection 
    if (search) {
        query += " WHERE title LIKE ? OR description LIKE ?";
        params.push(`%${search}%`, `%${search}%`);
    }
    db.all(query, params, (err, rows) => {
        res.render('index', { artworks: rows || [], search: search });
    });
});

// add artwork

app.post('/add', (req, res) => {
    const { title, description, image_url } = req.body;

// prepared statement
    const stmt = db.prepare("INSERT INTO artworks (title, description, image_url) VALUES (?, ?, ?)");
    stmt.run(title, description, image_url, (err) => {
        if (err) console.error(err);
        res.redirect('/');
    });
    stmt.finalize();
});

// delete 
// with access control
app.post('/delete', (req, res) => {

    // only admin can delete
    if (!req.session.user || req.session.user.username !== 'admin') {
        return res.status(403).send("Access Denied");
    }
    const id = req.body.id;
    const stmt = db.prepare("DELETE FROM artworks WHERE id = ?");
    stmt.run(id, (err) => {
        res.redirect('/');
    });
});

//register page
app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    
    // hash the password before saving
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");

    stmt.run(username, hashedPassword, (err) => {
        if (err) return res.render('login', { error: "Signup Failed" });
        res.render('login', { error: "Account is created successfully, Please login." });
    });
});

// login page
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

 // prevent SQL injection
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {

        // general error message
        if (err || !user) {
            return res.render('login', { error: "Login Failed!" });
        }
        // compare hash
        if (bcrypt.compareSync(password, user.password)) {
            req.session.user = user;
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

// server 
app.listen(6789, () => {
    console.log('Server is starting on http://localhost:6789');
});