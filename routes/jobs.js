const express = require("express");
const _ = require("lodash");
const jsonschema = require("jsonschema");
const ExpressError = require("../helpers/expressError");
const Job = require("../models/job");
const jobSchema = require("../schemas/jobSchema.json");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");

const router = new express.Router();

router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        let jobs;
        if (!_.isEmpty(req.query) && (req.query.search || req.query.min_salary || req.query.max_equity)) {
            jobs = await Job.get(req.query);
        } else {
            jobs = await Job.getAll();
        }
        return res.json({jobs});
    } catch (e) {
        next(e);
    }
});

router.post("/", ensureAdmin, async (req, res, next) => {
    try {
        // validate json payload
        const jsonValid = jsonschema.validate(req.body, jobSchema);
        if (!jsonValid.valid) {
            let errList = jsonValid.errors.map(e => e.stack);
            let err = new ExpressError(errList, 400);
            return next(err);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({job})
    } catch (e) {
        next(e);
    }
});

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        const job = await Job.getById(req.params.id);
        return res.json({job})
    } catch (e) {
        next(e);
    }
});

router.patch("/:id", ensureAdmin, async (req, res, next) => {
    try {
        // validate json payload
        const jsonValid = jsonschema.validate(req.body, jobSchema);
        if (!jsonValid.valid) {
            let errList = jsonValid.errors.map(e => e.stack);
            let err = new ExpressError(errList, 400);
            return next(err);
        }
        //after we get the company, replace the properties if found in req.body
        const job = await Job.getById(req.params.id);
        job.title = _.get(req.body, "title", job.title);
        job.salary = _.get(req.body, "salary", job.salary);
        job.equity = _.get(req.body, "equity", job.equity);
        job.companyHandle = _.get(req.body, "companyHandle", job.companyHandle);
        await job.save();
        return res.json({job})
    } catch (e) {
        next(e);
    }
});

router.delete("/:id", ensureAdmin, async (req, res, next) => {
    try {
        const job = await Job.getById(req.params.id);
        await job.remove();
        return res.json({ message: "Job deleted!" })
    } catch (e) {
        next(e);
    }
});

module.exports = router;