import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
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
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });
    });

    describe("Fields are missing", () => {});
});
