const express = require("express");
const _ = require("lodash");
const jsonschema = require("jsonschema");
const jwt = require("jsonwebtoken");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const userSchema = require("../schemas/userSchema.json");
const { ensureCorrectUser } = require("../middleware/auth");
const { SECRET_KEY } = require("../config");

const router = new express.Router();

router.get("/", async (req, res, next) => {
    try {
        const results = await User.getAll();
        const users = results.map(u => {
            return {
                "username": u.username,
                "firstName": u.firstName,
                "lastName": u.lastName,
                "email": u.email
            }
        });
        return res.json({users});
    } catch (e) {
        next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        // validate json payload
        const jsonValid = jsonschema.validate(req.body, userSchema);
        if (!jsonValid.valid) {
            let errList = jsonValid.errors.map(e => e.stack);
            let err = new ExpressError(errList, 400);
            return next(err);
        }
        const user = await User.create(req.body);
        let token = jwt.sign(
            { "username": user.username, isAdmin: user.isAdmin}, 
            SECRET_KEY
        );
        return res.status(201).json({user, token});
    } catch (e) {
        if (e.code === '23505') {
            next(new ExpressError(e.detail, 400));
        }
        next(e);
    }
});

router.get("/:username", async (req, res, next) => {
    try {
        const result = await User.getByUsername(req.params.username);
        const user = {
            "username": result.username,
            "firstName": result.firstName,
            "lastName": result.lastName,
            "email": result.email
        };
        return res.json({user})
    } catch (e) {
        next(e);
    }
});

router.patch("/:username", ensureCorrectUser, async (req, res, next) => {
    try {
        // validate json payload
        const jsonValid = jsonschema.validate(req.body, userSchema);
        if (!jsonValid.valid) {
            let errList = jsonValid.errors.map(e => e.stack);
            let err = new ExpressError(errList, 400);
            return next(err);
        }
        const user = await User.getByUsername(req.params.username);
        user.firstName = _.get(req.body, "firstName", user.firstName);
        user.lastName = _.get(req.body, "lastName", user.lastName);
        user.email = _.get(req.body, "email", user.email);
        user.photoUrl = _.get(req.body, "photoUrl", user.photoUrl);
        await user.save();
        return res.json({user})
    } catch (e) {
        next(e);
    }
});

router.delete("/:username", ensureCorrectUser, async (req, res, next) => {
    try {
        const user = await User.getByUsername(req.params.username);
        await user.remove();
        return res.json({message: "User deleted!"});
    } catch (e) {
        next(e);
    }
})

module.exports = router;