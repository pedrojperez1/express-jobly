const db = require("../db");
const ExpressError = require("../helpers/expressError");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

class User {
    constructor(obj) {
        this.username = obj.username;
        this.password = obj.password;
        this.firstName = obj.first_name;
        this.lastName = obj.last_name;
        this.email = obj.email;
        this.photoUrl = obj.photoUrl;
        this.isAdmin = obj.is_admin
    }

    /**
     * Gets all records from users table
     * @return {Array} User objects
     */
    static async getAll() {
        const results = await db.query(`
            SELECT username, password, first_name, last_name, email, photo_url, is_admin
            FROM users
        `);
        return results.rows.map(r => new User(r));
    }

    /**
     * Gets single record from users table  
     * @param {String} username
     * @return {User}
     */
    static async getByUsername(username) {
        const results = await db.query(`
            SELECT username, password, first_name, last_name, email, photo_url, is_admin
            FROM users
            WHERE username = $1
        `, [username]);
        if (results.rows.length === 0) {
            throw new ExpressError(`No such user: ${username}`, 400);
        }
        return new User(results.rows[0]);
    }

    /**
     * Inserts new record into users table
     * @param {Object} obj
     * @return {User} newly created User object 
     */
    static async create(obj) {
        const {username, password, firstName, lastName, email, photoUrl, isAdmin} = obj;
        const hashedPw = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        const queryString = `
            INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`;
        const queryParams = [username, hashedPw, firstName, lastName, email, photoUrl, isAdmin];
        const results = await db.query(queryString, queryParams);
        return new User(results.rows[0]);
    }

    /**
     * updates this User object in database
     * @return null
     */
    async save() {
        await db.query(`
        UPDATE users 
        SET password=$1, first_name=$2, last_name=$3, email=$4, photo_url=$5, is_admin=$6
        WHERE username = $7`,
        [this.password, this.firstName, this.lastName, this.email, this.photoUrl, this.isAdmin, this.username]
    );
    }

    /**
     * removes record for this User object from the users table
     * @return null
     */
    async remove() {
        await db.query(
            `DELETE FROM users WHERE username = $1`, 
            [this.username]
        );
    }
}

module.exports = User;