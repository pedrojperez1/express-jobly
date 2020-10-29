const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

process.env.NODE_ENV = "test";

const testUser = {
    username: "testuser",
    password: "testpass",
    firstName: "Test",
    lastName: "User",
    email: "test@user.com",
    photoUrl: "www.testuser.com",
    isAdmin: false
}

const testUserShort = {
    username: "testuser",
    firstName: "Test",
    lastName: "User",
    email: "test@user.com"
}

beforeEach(async () => {
    await db.query(`DELETE FROM users`);
    await request(app).post("/users").send(testUser);
});

afterAll(async () => {
    await db.end();
});

describe("Tests for GET /users route", () => {
    test("should return all users", async () => {
        const res = await request(app).get("/users");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({users: [testUserShort]});
    });
});

describe("Tests for PUT /users route", () => {
    test("should create new User when valid data is provided", async () => {
        const data = { 
            username: "newuser",
            password: "newpass",
            firstName: "New",
            lastName: "User",
            email: "new@user.com",
            photoUrl: "www.newuser.com",
            isAdmin: false
        };
        const res = await request(app).post("/users").send(data);
        expect(res.statusCode).toBe(201);

        // check that it was indeed created by requesting the GET /companies route
        const allUsers = await request(app).get("/users");
        expect(allUsers.body.users.length).toBe(2);
    });

    test("should return bad request 400 if required data is missing", async () => {
        const noUsername = {
            //username: "newuser",
            password: "newpass",
            firstName: "New",
            lastName: "User",
            email: "new@user.com",
            photoUrl: "www.newuser.com",
            isAdmin: false
        };
        const res = await request(app).post("/jobs").send(noUsername);
        expect(res.statusCode).toBe(400);
    });

    test("should return bad request 400 if wrong data type is sent", async () => {
        const badData = {
            username: false,
            password: "newpass",
            firstName: 100,
            lastName: "User",
            email: "new@user.com",
            photoUrl: "www.newuser.com",
            isAdmin: false
        };
        const badDataRes = await request(app).post("/users").send(badData);
        expect(badDataRes.statusCode).toBe(400);
    });
});

describe("Tests for GET /users/:username route", () => {
    test("should return single user when handle is valid", async () => {
        const res = await request(app).get("/users/testuser");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({user: testUserShort});
    });

    test("should bad request 400 when handle is not found", async () => {
        const res = await request(app).get("/users/whattheheck");
        expect(res.statusCode).toBe(400);
    });
});

describe("Tests for PATCH /users/:username route", () => {
    test("should update user data and return user when data is valid", async () => {
        const data = {
            username: "new",
            password: "new",
            firstName: "New",
            lastName: "User",
            email: "test@user.com",
            photoUrl: "www.testuser.com",
            isAdmin: false
        };
        const res = await request(app).patch(`/users/${testUser.username}`).send(data);
        expect(res.statusCode).toBe(200);
        expect(res.body.user.firstName).toBe("New");
    });
    
    test("should return bad request 400 if id is invalid", async () => {
        const data = {
            username: "new",
            password: "new",
            firstName: "New",
            lastName: "User",
            email: "test@user.com",
            photoUrl: "www.testuser.com",
            isAdmin: false
        };
        const res = await request(app).patch(`/users/0`).send(data);
        expect(res.statusCode).toBe(400);
    });
});

describe("Tests for DELETE /users/:username route", () => {
    test("should delete user and return success message", async () => {
        const res = await request(app).delete("/users/testuser");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({message: "User deleted!"});
        const allUsers = await request(app).get("/users");
        expect(allUsers.body.users.length).toBe(0);
    });
    test("should return bad request 400 if username is invalid", async () => {
        const res = await request(app).delete("/users/wut"); 
        expect(res.statusCode).toBe(400);
    });
});