/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

/** Auth JWT token, add auth'd user (if any) to req. */

function authenticateJWT(req, res, next) {
    try {
        const tokenFromBody = req.body._token;
        const payload = jwt.verify(tokenFromBody, SECRET_KEY);
        req.user = payload;
        return next();
    } catch (err) {
        // error in this middleware isn't error -- continue on

        return next();
    }
}
// end

/** Require user or raise 401 */

function ensureLoggedIn(req, res, next) {
    if (!req.user) {
        const err = new ExpressError("Must be logged in", 401);
        return next(err);
    } else {
        return next();
    }
}
// end

/** Require admin user or raise 401 */

function ensureAdmin(req, res, next) {
    if (!req.user || !req.user.isAdmin) {
        const err = new ExpressError("Must be an admin", 401);
        return next(err);
    } else {
        return next();
    }
}
// end

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
    if (!req.user || (req.user.username !== req.params.username)) {
        const err = new ExpressError("Unauthorized", 401);
        return next(err);
    } else {
        return next();
    }
  }
  // end

module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureAdmin,
    ensureCorrectUser
};
