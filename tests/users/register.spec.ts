import { AppDataSource } from "./../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate;
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should return the 201 satus code", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "test@example.com",
                password: "test@123",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            //  Assert
            expect(response.statusCode).toBe(201);
        });

        it("should return valid JSON response", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "test@example.com",
                password: "test@123",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            //  Assert
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("should persist user in database data", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "test@example.com",
                password: "test@123",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            //  Assert
            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });

        it.todo("should return an id of the created user");
        it("should return an role of customer when user is created", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "test@example.com",
                password: "test@123",
                role: "customer",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            //  Assert
            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it("should store hashed password in db", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "test@example.com",
                password: "test@123",
                role: "customer",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //  Assert
            const userRepository = connection.getRepository(User);

            const users = await userRepository.find();

            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it("should return in email is already exist db", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "test@example.com",
                password: "test@123",
                role: "customer",
            };

            const userRepository = connection.getRepository(User);

            await userRepository.save(userData);

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const users = await userRepository.find();

            //  Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
    });

    describe("Fields are missing", () => {});
});
