const DbUser = require('../models/user');
const router = require('express').Router();
const LocalStrategy = require("passport-local/lib").Strategy;
const logger = require('../../config/winston');
const passport = require('passport/lib');

router.use(passport.initialize({}));
router.use(passport.session({}));

const local_authenticate_helper = (req, res, next) => {
    passport.authenticate('local', (error, user, info) => {
        if (error) {
            res.status(401).send(error);
        } else if (!user) {
            res.status(401).send(info);
        } else {
            req.login(user, {}, (err) => {
                if (err) {
                    res.status(401).json({message: 'Unable to log in'});
                }
                else {
                    logger.info("User '%s' logged in", user.email);
                    req.session.user = user;
                    res.status(200).json(user);
                }
            });
        }
    })(req, res);
};

router.post('/login', local_authenticate_helper);

router.post("/register", async (request, response) => {
    try {
        const {email, first_name, last_name, password} = request.body;
        logger.debug('Attempting to register user: %s', email);

        const user = await DbUser.createUser(email, password, {first_name: first_name, last_name: last_name});
        request.login(user, {}, (err) => {
            if (err) {
                response.status(401).json({message: 'Unable to log in'});
            }
            else {
                logger.info("User '%s' registered", email);
                response.status(200).json(user);
            }
        });
    }
    catch(error) {
        logger.error(error);
        if (error.name === "ValidationError") {
            response.status(409).json({message: 'That username is already taken.'});
        }
        else {
            response.status(500).json({message: error});
        }
    }
});

router.all("/logout", (request, response) => {
    request.logout();
    request.session.user = null;
    response.redirect('/');
});

passport.serializeUser((user, cb) => {
    cb(null, user._id);
});

passport.deserializeUser(async (id, cb) => {
    console.log('@@@@@ deserializeUser: ', id);
    try {
        const user = await DbUser.findByDbId(id)
        cb(null, user);
    }
    catch(error) {
        cb(error, null);
    }
});

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
    try {
        logger.debug('Attempting to authenticate user: %s', email);
        const user = await DbUser.findByUsername(email);

        user.validatePassword(password);
        logger.info("User '%s' authenticated", email);

        return done(null, user);
    }
    catch(error) {
        logger.error(error);
        return done(error, false);
    }
}, null));

module.exports = router;
