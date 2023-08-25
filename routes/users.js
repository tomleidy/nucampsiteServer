const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
    User.findOne({ username: req.body.username })
        .then(user => {
            if (user) {
                const err = new Error(`User ${req.body.username} already exists!`)
                err.status = 403;
                return next(err);
            } else {
                // I don't know why this needs to be in an else block due to the return.
                User.create({
                    username: req.body.username,
                    password: req.body.password
                }).then(user => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ status: 'Registration Successful!', user: user });
                })
                    .catch(err => next(err));
            }
        })
        .catch(err => next(err));
})


const authenticationError = (req, res, next) => {
    const err = new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err);
}


router.post('/login', (req, res, next) => {
    if (!req.session.user) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return authenticationError(req, res, next);
        }
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const username = auth[0];
        const password = auth[1];
        User.findOne({ username: username })
            .then(user => {
                if (!user) {
                    const err = new Error(`User ${username} does not exist!`);
                    err.status = 401;
                    return next(err);
                } else if (user.password !== password) {
                    const err = new Error(`Your password is incorrect!`);
                    err.status = 401;
                    return next(err);
                    // Minae talks about telling the user that the password is correct, rather than the login.
                    // I think this is fine when dealing with usernames, but is questionable for email addresses.
                    // Letting people verify that an email address is real/valid has security implications, beyond spam prevention.
                } else if (user.username === username && user.password === password) {
                    req.session.user = 'authenticated';
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end(`You are authenticated!`);
                }
            })
            .catch(err => next(err));

    } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are already authenticated!');

    }
});


router.get('/logout', (req, res, next) => {
    if (req.session) {
        res.clearCookie('session-id');
        req.session.destroy();
        res.redirect('/');

        // This is throwing up session-files-store errors.
        // I'd prefer to fix it. Errors are in the form of:
        // [session-file-store] will retry, error on last attempt: Error: ENOENT: no such file or directory, open 'path/sessions/session.json'

    } else {
        const err = new Error('You are not logged in!');
        err.status = 401;
        return next(err);
    }
})

module.exports = router;
