import { AppDataSource } from "./../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { isJwt } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";
import createJWKSMock from "mock-jwks";

describe("GET /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");

        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should return the 200 status code", async () => {
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });

        it("should return user data", async () => {
            // Register user
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "test@example.com",
                password: "test@123",
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // Generate token;
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            //  Assert

            expect((response.body as Record<string, string>).id).toBe(data.id);
        });

        it("should not return the password field", async () => {
            // Register user
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "test@example.com",
                password: "test@123",
            };

            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // Generate token;
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();

            //  Assert
            expect(response.body as Record<string, string>).not.toHaveProperty(
                "password",
            );
        });
        it("should return 401 statusCode if token was not send", async () => {
            // Register user
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "test@example.com",
                password: "test@123",
            };

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            const response = await request(app).get("/auth/self").send();

            //  Assert
            expect(response.statusCode).toBe(401);
        });
    });

    describe("Fields are missing", () => {});

    describe("Fields are not in proper format", () => {});
});
