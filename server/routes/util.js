
module.exports.restrictToLoggedInUsers = (request, response, next) => {
    // console.log('_passport: ', request._passport);
    // console.log('_passport.instance: ', request._passport.instance);
    // console.log('user property: ', request._passport.instance._userProperty);
    // console.log('request[user property]: ', request['user']);
    console.log('session: ', request.session);
    console.log('user: ', request.user);

    if (request.isAuthenticated()) {
        next();
    }
    else {
        response.status(401).json({message: 'Not authorized'});
    }
};

module.exports.restrictToGuests = (request, response, next) => {
    if (request.isUnauthenticated()) {
        next();
    }
    else {
        response.status(401).json({message: 'Not authorized'});
    }
};
