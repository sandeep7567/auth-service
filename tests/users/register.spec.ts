import { AppDataSource } from "./../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { truncateTable } from "../utils";
import { User } from "../../src/entity/User";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate;
        await truncateTable(connection);
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
    });

    describe("Fields are missing", () => {});
});
