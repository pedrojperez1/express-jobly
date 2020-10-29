const db = require("../db");
const ExpressError = require("../helpers/expressError");

class Company {

    constructor(obj) {
        this.handle = obj.handle;
        this.name = obj.name;
        this.num_employees = obj.num_employees;
        this.description = obj.description;
        this.logo_url = obj.logo_url;
    }

    /**
     * Gets all records from companies table
     * @return {Array} Company objects
     */
    static async getAll() {
        const results = await db.query(`
            SELECT handle, name, num_employees, description, logo_url
            FROM companies
        `);
        return results.rows.map(r => new Company(r))
    }

    /**
     * Applies filter when getting all records from companies
     * @param {Object} query 
     */
    static async get(query) {
        let filtersArray = [];
        if (query.search) {filtersArray.push(`LOWER(name) LIKE '%${query.search.toLowerCase()}%'`)}
        if (query.min_employees) {filtersArray.push(`num_employees > ${query.min_employees}`)}
        if (query.max_employees) {filtersArray.push(`num_employees < ${query.max_employees}`)}

        if (Number(query.max_employees) < Number(query.min_employees)) {
            throw new ExpressError("Min employee param cannot be larger than max employee param.", 400);
        }

        const queryString = `
            SELECT handle, name, num_employees, description, logo_url
            FROM companies
            WHERE ${filtersArray.join(" AND ")}
        `;
        const results = await db.query(queryString);
        return results.rows.map(r => new Company(r))
    }

    /**
     * Gets single record from company table  
     * @param {String} handle
     * @return {Company}
     */
    static async getByHandle(handle) {
        const results = await db.query(`
            SELECT handle, name, num_employees, description, logo_url
            FROM companies
            WHERE handle=$1
        `, [handle]);
        if (results.rows.length === 0) {
            throw new ExpressError(`No such company: ${handle}`, 400);
        }
        return new Company(results.rows[0]);
    }

    /**
     * Inserts new record into companies table
     * @param {Object} obj
     * @return {Company} newly created Company object 
     */
    static async create(obj) {
        if (!obj.handle || !obj.name) {
            throw new ExpressError("Handle and name are required values for new Company", 400);
        }
        const queryString = `
            INSERT INTO companies
            VALUES ($1, $2, $3, $4, $5)
            RETURNING handle, name, num_employees, description, logo_url`;
        const queryParams = [obj.handle, obj.name, obj.num_employees, obj.description, obj.logo_url];
        const results = await db.query(queryString, queryParams);
        return new Company(results.rows[0]);
    }

    /**
     * updates this Company object in database
     * @return null
     */
    async save() {
        await db.query(`
            UPDATE companies 
            SET name=$1, num_employees=$2, description=$3, logo_url=$4 
            WHERE handle = $5`,
            [this.name, this.num_employees, this.description, this.logo_url, this.handle]
        );
    }

    /**
     * removes record for this Company object from the companies table
     * @return null
     */
    async remove() {
        await db.query(
            `DELETE FROM companies WHERE handle = $1 RETURNING handle`,
            [this.handle]
        );
    }

}

module.exports = Company;