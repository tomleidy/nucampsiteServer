const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const { verifyUser, verifyAdmin } = authenticate;

const router = express.Router();

/* GET users listing. */
router.get('/', verifyUser, verifyAdmin, async (req, res, next) => {
    try {
        const users = await User.find({})
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
    }
    catch (err) { return next(err) }

});

router.post('/signup', (req, res) => {
    User.register(
        new User({ username: req.body.username }),
        req.body.password,
        (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({ err: err });
            } else {
                if (req.body.firstname) {
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) {
                    user.lastname = req.body.lastname;
                }
                user.save(err => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({ err: err });
                        return;
                    }
                    passport.authenticate('local')(req, res, () => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({ success: true, status: 'Registration Successful!' });
                    })
                })
            }
        }
    )
})


const authenticationError = (req, res, next) => {
    const err = new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err);
}


router.post('/login', passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are succssfully logged in!' });
});


router.get('/logout', verifyUser, (req, res, next) => {
    if (req.user) {
        req.logout();
        res.redirect('/');
    } else {
        const err = new Error('You are not logged in!');
        err.status = 401;
        return next(err);
    }
})

module.exports = router;

        // This is throwing up session-files-store errors.
        // I'd prefer to fix it. Errors are in the form of:
        // [session-file-store] will retry, error on last attempt: Error: ENOENT: no such file or directory, open 'path/sessions/session.json'
