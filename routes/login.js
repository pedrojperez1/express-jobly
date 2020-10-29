const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");


const router = new express.Router();

router.post("/", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.getByUsername(username);
        if (user) {
            if (await bcrypt.compare(password, user.password) === true) {
                let token = jwt.sign(
                    { "username": username, isAdmin: user.isAdmin}, 
                    SECRET_KEY
                );
                return res.json({ token });
            }
        }
        throw new ExpressError("Invalid user/password", 400);
    } catch (e) {
        next(e);
    }
});

module.exports = router;