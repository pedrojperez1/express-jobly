const request = require("supertest");
const Job = require("../../models/job");
const app = require("../../app");
const db = require("../../db");

process.env.NODE_ENV = "test";

const testCo = {
    handle: "test",
    name: "Test Co.",
    num_employees: 100,
    description: "The Test Company",
    logo_url: "www.google.com"
};

const testJob = {
    title: "Tester",
    salary: 100000,
    equity: 0.1,
    companyHandle: "test"
};
let testJobId;

beforeEach(async () => {
    await db.query(`DELETE FROM jobs`);
    await db.query(`DELETE FROM companies`);
    await request(app).post("/companies").send(testCo);
    const job = await request(app).post("/jobs").send(testJob);
    testJobId = job.body.job.id;
});

afterAll(async () => {
    await db.end();
});

describe("Tests methods of Job class", () => {
    test("getAll() static method", async () => {
        const results = await Job.getAll();
        expect(results.length).toBe(1);
        expect(results).toEqual([
            {
                ...testJob, 
                id: expect.any(Number), 
                datePosted: expect.any(Date)
            }
        ]);
    });

    test("get() static method", async () => {
        const query = {min_salary: '200000'};
        const results = await Job.get(query);
        expect(results.length).toBe(0);
        const query2 = {search: 'tester'};
        const results2 = await Job.get(query2);
        expect(results2).toEqual([
            {
                ...testJob, 
                id: expect.any(Number), 
                datePosted: expect.any(Date)
            }
        ]);
    });

    test("getById() static method", async () => {
        const results = await Job.getById(testJobId);
        expect(results).toEqual(
            {
                ...testJob, 
                id: expect.any(Number), 
                datePosted: expect.any(Date)
            }
        );
    });

    test("create() static method", async () => {
        const newJob = {
            title: "New guy",
            salary: 5000,
            equity: 0.1,
            companyHandle: "test"
        };
        const results = await Job.create(newJob);
        expect(results).toEqual(
            {
                ...newJob, 
                id: expect.any(Number), 
                datePosted: expect.any(Date)
            }
        );
        const allTestJobs = await Job.getAll();
        expect(allTestJobs.length).toBe(2);
    });

    test("save() method", async () => {
        const results = await Job.get({search: 'tester'});
        const job = results[0];
        job.title = "New Tester";
        await job.save();
        const queryNewJob = await Job.get({search: 'tester'});
        expect(queryNewJob[0].title).toBe("New Tester");
    });

    test("delete() method", async () => {
        const job = await Job.getById(testJobId);
        job.remove();
        const results = await Job.getAll();
        expect(results.length).toBe(0);
    });
})