const db = require("../db");
const ExpressError = require("../helpers/expressError");

class Job {
    constructor(obj) {
        this.id = obj.id;
        this.title = obj.title;
        this.salary = obj.salary;
        this.equity = obj.equity;
        this.companyHandle = obj.company_handle;
        this.datePosted = obj.date_posted;
    }
    static async getAll() {
        const results = await db.query(`
            SELECT id, title, salary, equity, company_handle, date_posted
            FROM jobs
            ORDER BY date_posted DESC
        `);
        return results.rows.map(r => new Job(r));
    }

    static async get(query) {
        let filtersArray = [];
        if (query.search) { filtersArray.push(`LOWER(title) LIKE '%${query.search.toLowerCase()}%'`) }
        if (query.min_salary) { filtersArray.push(`salary >= ${query.min_salary}`) }
        if (query.min_equity) { filtersArray.push(`equity >= ${query.min_equity}`) }
        if (query.handle) { filtersArray.push(`company_handle = '${query.handle}'`) }
        const queryString = `
            SELECT id, title, salary, equity, company_handle, date_posted
            FROM jobs
            WHERE ${filtersArray.join(" AND ")}
        `;
        const results = await db.query(queryString);
        return results.rows.map(r => new Job(r));
    }

    /**
     * Gets single record from jobs table  
     * @param {Number} id
     * @return {Job}
     */
    static async getById(id) {
        const results = await db.query(`
            SELECT id, title, salary, equity, company_handle, date_posted
            FROM jobs
            WHERE id=$1
        `, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`No such job: ${id}`, 400);
        }
        return new Job(results.rows[0]);
    }

    /**
     * Inserts new record into jobs table
     * @param {Object} obj
     * @return {Job} newly created Job object 
     */
    static async create(obj) {
        if (!obj.title || !obj.salary || !obj.equity || !obj.companyHandle) {
            throw new ExpressError("Must provide title, salary, equity, and comp handle", 400);
        }

        const queryString = `
            INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle, date_posted`;
        const queryParams = [obj.title, obj.salary, obj.equity, obj.companyHandle];
        const results = await db.query(queryString, queryParams);
        return new Job(results.rows[0]);
    }

    /**
     * updates this Job object in database
     * @return null
     */
    async save() {
        await db.query(`
            UPDATE jobs 
            SET title=$1, salary=$2, equity=$3, company_handle=$4 
            WHERE id = $5`,
            [this.title, this.salary, this.equity, this.companyHandle, this.id]
        );
    }

    /**
     * removes record for this Job object from the jobs table
     * @return null
     */
    async remove() {
        await db.query(
            `DELETE FROM jobs WHERE id = $1 RETURNING id`,
            [this.id]
        );
    }
}

module.exports = Job;