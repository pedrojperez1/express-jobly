const request = require("supertest");
const Company = require("../../models/company");
const db = require("../../db");

process.env.NODE_ENV = "test";

const testCo = {
    handle: "test",
    name: "Test Co.",
    num_employees: 100,
    description: "The Test Company",
    logo_url: "www.google.com"
};

const testCo2 = { 
    handle: "test2",
    name: "Test Co. 2",
    num_employees: 50,
    description: "The Test Company 2",
    logo_url: "www.google.com"
};
let testCompanies = [testCo, testCo2];

beforeEach(async () => {
    await db.query(`DELETE FROM companies`);
    const queryString = `
        INSERT INTO companies (handle, name, num_employees, description, logo_url)
        VALUES ($1, $2, $3, $4, $5)
    `;
    for (let c of testCompanies) {
        const {handle, name, num_employees, description, logo_url} = c;
        const queryParams = [handle, name, num_employees, description, logo_url];
        await db.query(queryString, queryParams);
    }

});

afterAll(async () => {
    await db.end();
});

describe("Tests methods of Company class", () => {
    test("getAll() static method", async () => {
        const results = await Company.getAll();
        expect(results.length).toBe(2);
        expect(results).toEqual([new Company(testCo), new Company(testCo2)]);
    });

    test("get() static method", async () => {
        const query = {name: 'co', min_employees: '70'};
        const results = await Company.get(query);
        expect(results.length).toBe(1);
        expect(results).toEqual([new Company(testCo)]);
    });

    test("getByHandle() static method", async () => {
        const results = await Company.getByHandle("test");
        expect(results).toEqual(new Company(testCo));
    });

    test("create() static method", async () => {
        const newCo = {
            handle: "test3",
            name: "Test Co. 3",
            num_employees: 2,
            description: "The Test Company 3",
            logo_url: "www.google.com"
        };
        const results = await Company.create(newCo);
        expect(results).toEqual(new Company(newCo));
        const allTestCo = await Company.getAll();
        expect(allTestCo.length).toBe(3);
    });

    test("save() method", async () => {
        const newCo = {
            handle: "test3",
            name: "Test Co. 3",
            num_employees: 2,
            description: "The Test Company 3",
            logo_url: "www.google.com"
        };
        const results = await Company.create(newCo);
        results.name = "New Name";
        await results.save();
        const queryNewCo = await Company.getByHandle("test3");
        expect(queryNewCo.name).toBe("New Name");
    });

    test("delete() method", async () => {
        const company = await Company.getByHandle("test");
        company.remove();
        const results = await Company.getAll();
        expect(results.length).toBe(1);
    })
})