const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Pool } = require('pg'); // Require the 'pg' library

const app = express();
const port = process.env.PORT || 3000;

// Configure your PostgreSQL database connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '1234',
    port: 5432, // Default PostgreSQL port
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
    })
);

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            const user = result.rows[0];

            if (!user) {
                return done(null, false, { message: 'Invalid username' });
            }

            if (user.password !== password) {
                return done(null, false, { message: 'Incorrect password' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = result.rows[0];
        done(null, user);
    } catch (error) {
        done(error);
    }
});

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).send('Unauthorized');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.status(200).send('Login successful');
            
        });
    })(req, res, next);
});

app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.send('Welcome to the dashboard');
    } else {
        res.redirect('/');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
