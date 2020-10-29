const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

process.env.NODE_ENV = "test";

const testJob = {
    title: "Tester",
    salary: 100000,
    equity: 0.1,
    companyHandle: "test"
}

const testJob2 = {
    title: "Senior Tester",
    salary: 200000,
    equity: 0.5,
    companyHandle: "test"
}

let testJobs = [testJob, testJob2];

beforeEach(async () => {
    const testCo = {handle: "test", name: "Test Co."};
    await request(app).post("/companies").send(testCo);
    await db.query(`DELETE FROM jobs`);
    for (let j of testJobs) {
        await request(app).post("/jobs").send(j);
    }
});

afterAll(async () => {
    await db.end();
});

describe("Tests for GET /jobs route", () => {
    test("should return all job when no query string provided", async () => {
        const res = await request(app).get("/jobs");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
            {
                jobs: [
                    {
                        id: expect.any(Number),
                        title: "Tester",
                        salary: 100000,
                        equity: 0.1,
                        companyHandle: "test",
                        datePosted: expect.any(String)
                    },
                    {
                        id: expect.any(Number),
                        title: "Senior Tester",
                        salary: 200000,
                        equity: 0.5,
                        companyHandle: "test",
                        datePosted: expect.any(String)
                    },
                ]
            }
        );
    });

    test("should recognize 'search', 'min_salary', and 'min_equity' q strings", async () => {
        const searchRes = await request(app).get("/jobs?search=tester");
        expect(searchRes.statusCode).toBe(200);
        expect(searchRes.body).toEqual(
            {
                jobs: [
                    {
                        id: expect.any(Number),
                        title: "Tester",
                        salary: 100000,
                        equity: 0.1,
                        companyHandle: "test",
                        datePosted: expect.any(String)
                    },
                    {
                        id: expect.any(Number),
                        title: "Senior Tester",
                        salary: 200000,
                        equity: 0.5,
                        companyHandle: "test",
                        datePosted: expect.any(String)
                    },
                ]
            }
        );
        const minSalRes = await request(app).get("/jobs?min_salary=150000");
        expect(minSalRes.statusCode).toBe(200);
        expect(minSalRes.body).toEqual(
            {
                jobs: [
                    {
                        id: expect.any(Number),
                        title: "Senior Tester",
                        salary: 200000,
                        equity: 0.5,
                        companyHandle: "test",
                        datePosted: expect.any(String)
                    },
                ]
            }
        );
    });

    test("should ignore query strings that are not search or min/max employees", async () => {
        const res = await request(app).get("/jobs?what=isthis");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
            {
                jobs: [
                    {
                        id: expect.any(Number),
                        title: "Tester",
                        salary: 100000,
                        equity: 0.1,
                        companyHandle: "test",
                        datePosted: expect.any(String)
                    },
                    {
                        id: expect.any(Number),
                        title: "Senior Tester",
                        salary: 200000,
                        equity: 0.5,
                        companyHandle: "test",
                        datePosted: expect.any(String)
                    },
                ]
            }
        );
    });
});

describe("Tests for POST /jobs route", () => {
    test("should create new Job when valid data is provided", async () => {
        const data = { 
            title: "Job searcher",
            salary: 100000,
            equity: 0.2,
            companyHandle: "test"
        };
        const res = await request(app).post("/jobs").send(data);
        expect(res.statusCode).toBe(201);

        // check that it was indeed created by requesting the GET /companies route
        const allJobs = await request(app).get("/jobs");
        expect(allJobs.body.jobs.length).toBe(3);
    });

    test("should return bad request 400 if title is missing", async () => {
        const noTitleData = {
            // title: "Job searcher",
            salary: 100000,
            equity: 0.2,
            companyHandle: "test"
        };
        const noTitleDataRes = await request(app).post("/jobs").send(noTitleData);
        expect(noTitleDataRes.statusCode).toBe(400);
    });

    test("should return bad request 400 if wrong data type is sent", async () => {
        const badData = {
            title: 100,
            salary: "Tester",
            equity: 0.2,
            companyHandle: "test"
        };
        const badDataRes = await request(app).post("/jobs").send(badData);
        expect(badDataRes.statusCode).toBe(400);
    });
});

describe("Tests for GET /jobs/:id route", () => {
    test("should return data for a specific job when id is provided", async () => {
        const data = {
            title: "Dog Walker",
            salary: 100,
            equity: 0.3,
            companyHandle: "test"
        };
        const res = await request(app).post("/jobs").send(data);
        console.log(res.body);
        const id = res.body.job.id;
        const res2 = await request(app).get(`/jobs/${id}`);
        expect(res2.statusCode).toBe(200);
        expect(res2.body.job).toEqual({
            id: expect.any(Number),
            title: "Dog Walker",
            salary: 100,
            equity: 0.3,
            companyHandle: "test",
            datePosted: expect.any(String)
        });
    });

    test("should return 400 status when id is invalid", async () => {
        const res = await request(app).get("/jobs/0");
        expect(res.statusCode).toBe(400);
    });
});

describe("Tests for PATCH /jobs/:id route", () => {
    test("should update job data and return job when data is valid", async () => {
        const getId = await request(app).get("/jobs?search=senior");
        const id = getId.body.jobs[0].id;
        const data = {
            title: "Junior Tester",
            salary: 100000,
            equity: 0.5,
            companyHandle: "test"
        };
        const res = await request(app).patch(`/jobs/${id}`).send(data);
        expect(res.statusCode).toBe(200);
        expect(res.body.job.title).toBe("Junior Tester");
    });
    
    test("should return bad request 400 if id is invalid", async () => {
        const data = {
            title: "Junior Tester",
            salary: 100000,
            equity: 0.5,
            companyHandle: "test"
        };
        const res = await request(app).patch(`/jobs/0`).send(data);
        expect(res.statusCode).toBe(400);
    });
});

describe("Tests for DELETE /jobs/:id route", () => {
    test("should delete company and return success message", async () => {
        const getId = await request(app).get("/jobs?search=senior");
        const id = getId.body.jobs[0].id;
        const res = await request(app).delete(`/jobs/${id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({message: "Job deleted!"});
        const allJobs = await request(app).get("/jobs");
        expect(allJobs.body.jobs.length).toBe(1);
    });
    test("should return bad request 400 if handle is invalid", async () => {
        const res = await request(app).delete("/jobs/0"); 
        expect(res.statusCode).toBe(400);
    });
});

