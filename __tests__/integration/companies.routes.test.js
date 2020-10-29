const request = require("supertest");
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
    for (let c of testCompanies) {
        await request(app).post("/companies").send(c);
    }
});

afterAll(async () => {
    await db.end();
})

describe("tests for GET /companies route", () => {
    test("should return all companies when no query string provided", async () => {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies: testCompanies});
    });

    test("should recognize 'search', 'min_employees', and 'max_employees' q strings", async () => {
        const searchRes = await request(app).get("/companies?search=test");
        expect(searchRes.statusCode).toBe(200);
        expect(searchRes.body).toEqual({companies: testCompanies});
        const minRes = await request(app).get("/companies?min_employees=70");
        expect(minRes.statusCode).toBe(200);
        expect(minRes.body).toEqual({companies: [testCo]});
        const maxRes = await request(app).get("/companies?max_employees=70");
        expect(maxRes.statusCode).toBe(200);
        expect(maxRes.body).toEqual({companies: [testCo2]});
    });

    test("should ignore query strings that are not search or min/max employees", async () => {
        const res = await request(app).get("/companies?what=isthis");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies: testCompanies});
    });

});

describe("tests for POST /companies route", () => {
    test("should create new Company when valid data is provided", async () => {
        const data = { 
            handle: "newCo",
            name: "New Company",
            num_employees: 50,
            description: "The New Company",
            logo_url: "www.google.com"
        };
        const res = await request(app).post("/companies").send(data);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({company: data});

        // check that it was indeed created by requesting the GET /companies route
        const allComps = await request(app).get("/companies");
        expect(allComps.body.companies.length).toBe(3);
    });

    test("should return bad request 400 if handle is missing", async () => {
        const noHandleData = {
            name: "New Company",
            num_employees: 50,
            description: "The New Company",
            logo_url: "www.google.com"
        };
        const noHandleRes = await request(app).post("/companies").send(noHandleData);
        expect(noHandleRes.statusCode).toBe(400);
    });

    test("should return bad request 400 if name is missing", async () => {
        const noNameData = {
            handle: "newCo",
            num_employees: 50,
            description: "The New Company",
            logo_url: "www.google.com"
        };
        const noNameRes = await request(app).post("/companies").send(noNameData);
        expect(noNameRes.statusCode).toBe(400);
    });

    test("should return bad request 400 if wrong data type is sent", async () => {
        const badData = {
            handle: 100,
            name: "The Company",
            num_employees: "fifty",
            description: "The New Company",
            logo_url: "www.google.com"
        };
        const badDataRes = await request(app).post("/companies").send(badData);
        expect(badDataRes.statusCode).toBe(400);
    });

});

describe("tests for GET /companies/:handle route", () => {
    test("should return single company when handle is valid", async () => {
        const res = await request(app).get("/companies/test");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {...testCo, jobs: []}});
    });

    test("should bad request 400 when handle is not found", async () => {
        const res = await request(app).get("/companies/whattheheck");
        expect(res.statusCode).toBe(400);
    });
});

describe("tests for PATCH /companies/:handle route", () => {
    test("should update company data and return single company when data is valid", async () => {
        const data = {handle: "test", name: "doggo"}
        const res = await request(app).patch("/companies/test").send(data);
        expect(res.statusCode).toBe(200);
        expect(res.body.company.name).toBe("doggo");
    });
    
    test("should return bad request 400 if handle is invalid", async () => {
        const data = {handle: "test", name: "doggo"}
        const res = await request(app).patch("/companies/wut").send(data); 
        expect(res.statusCode).toBe(400);
    });
});

describe("tests for DELETE /companies/:handle route", () => {
    test("should delete company and return success message", async () => {
        const res = await request(app).delete("/companies/test");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({message: "Company deleted!"});
        const allComps = await request(app).get("/companies");
        expect(allComps.body.companies.length).toBe(1);
    });
    test("should return bad request 400 if handle is invalid", async () => {
        const res = await request(app).delete("/companies/wut"); 
        expect(res.statusCode).toBe(400);
    });
});