import { AppDataSource } from "./../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { isJwt } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

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

        it("should return a access and refresh token inside a cookie", async () => {
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

            interface Headers {
                ["set-cookie"]: string[];
            }

            //  Assert
            let accessToken: string | null = null;
            let refreshToken: string | null = null;
            const cookies = (response.headers as Headers)["set-cookie"] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it("should store refreshToken in database", async () => {
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
            const refreshTokenRepo = connection.getRepository(RefreshToken);

            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);
        });
    });

    describe("Fields are missing", () => {
        it("should return 400 status code if email is missing", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: "",
                password: "test@123",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //  Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it.todo("should return 400 status code if firstName is missing");
        it.todo("should return 400 status code if lastName is missing");
        it.todo("should return 400 status code if password is missing");
    });

    describe("Fields are not in proper format", () => {
        it("should trim the email field", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Smith",
                email: " test@123.com ",
                password: "test@123",
            };

            // Act
            await request(app).post("/auth/register").send(userData);

            //  Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe("test@123.com");
        });
        it.todo("should return 400 status code if email is not valid email");
        it.todo(
            "should return 400 status code if password length is less than 8 characters",
        );
    });
});
