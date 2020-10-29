const request = require("supertest");
const User = require("../../models/user");
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

beforeEach(async () => {
    await db.query(`DELETE FROM users`);
    await request(app).post("/users").send(testUser);
});

afterAll(async () => {
    await db.end();
});

describe("Tests methods of User class", () => {
    test("getAll() static method", async () => {
        const results = await User.getAll();
        expect(results.length).toBe(1);
        expect(results[0].username).toEqual(testUser.username);
    });

    test("getByUsername() static method", async () => {
        const results = await User.getByUsername("testuser");
        expect(results.username).toEqual(testUser.username);
    });

    test("create() static method", async () => {
        const newUser = {
            username: "newuser",
            password: "newpass",
            firstName: "New",
            lastName: "User",
            email: "new@user.com",
            photoUrl: "www.testuser.com",
            isAdmin: false
        };
        const results = await User.create(newUser);
        expect(results.username).toEqual(newUser.username);
        const allTestUsers = await User.getAll();
        expect(allTestUsers.length).toBe(2);
    });

    test("save() method", async () => {
        const user = await User.getByUsername("testuser");
        user.firstName = "Rey";
        await user.save();
        const queryNewJob = await User.getByUsername("testuser");
        expect(queryNewJob.firstName).toBe("Rey");
    });

    test("delete() method", async () => {
        const user = await User.getByUsername("testuser");
        user.remove();
        const results = await User.getAll();
        expect(results.length).toBe(0);
    });
})