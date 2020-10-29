const express = require("express");
const _ = require("lodash");
const jsonschema = require("jsonschema");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company");
const companySchema = require("../schemas/companySchema.json");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const router = new express.Router();

/**
 * This should return the handle and name for all of the company objects. 
 * It should also allow for the following query string parameters: 
 * 
 * search: filter company names by search term
 * min_employees: filter componies by min employees
 * max_employees: filter companies by max employees
*/
router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        let companies;
        if (!_.isEmpty(req.query) && (req.query.search || req.query.min_employees || req.query.max_employees)) {
            companies = await Company.get(req.query);
        } else {
            companies = await Company.getAll();
        }
        return res.json({companies});
    } catch (e) {
        next(e);
    }
});

/**
 * This should create a new company and return the newly created company.
 * Returns JSON like {company: companyData}
 */
router.post("/", ensureAdmin, async (req, res, next) => {
    try {
        // validate json payload
        const jsonValid = jsonschema.validate(req.body, companySchema);
        if (!jsonValid.valid) {
            let errList = jsonValid.errors.map(e => e.stack);
            let err = new ExpressError(errList, 400);
            return next(err);
        }
        const company = await Company.create(req.body);
        return res.status(201).json({company})
    } catch (e) {
        if (e.code === '23505') {
            next(new ExpressError(e.detail, 400));
        }
        next(e);
    }
});

/**
 * This should return a single company found by its id.
 * Returns JSON like {company: companyData}
 */
router.get("/:handle", ensureLoggedIn, async (req, res, next) => {
    try {
        const company = await Company.getByHandle(req.params.handle);
        const jobs = await Job.get({handle: req.params.handle});
        return res.json({company: {...company, jobs}})
    } catch (e) {
        next(e);
    }
});

/**
 * This should update an existing company and return the updated company.
 * Returns JSON like {company: companyData}
 */
router.patch("/:handle", ensureAdmin, async (req, res, next) => {
    try {
        // validate json payload
        const jsonValid = jsonschema.validate(req.body, companySchema);
        if (!jsonValid.valid) {
            let errList = jsonValid.errors.map(e => e.stack);
            let err = new ExpressError(errList, 400);
            return next(err);
        }
        //after we get the company, replace the properties if found in req.body
        const company = await Company.getByHandle(req.params.handle);
        company.name = _.get(req.body, "name", company.name);
        company.num_employees = _.get(req.body, "num_employees", company.num_employees);
        company.description = _.get(req.body, "description", company.description);
        company.logo_url = _.get(req.body, "logo_url", company.logo_url);
        await company.save();
        return res.json({company})
    } catch (e) {
        next(e);
    }
});

/**
 * This should remove an existing company and return a message.
 * Returns JSON like {message: "Company deleted"}
 */
router.delete("/:handle", ensureAdmin, async (req, res, next) => {
    try {
        const company = await Company.getByHandle(req.params.handle);
        await company.remove();
        return res.json({ message: "Company deleted!" })
    } catch (e) {
        next(e);
    }
});

module.exports = router;