import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";

describe("POST /tenants", () => {
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
        it("should return a 201 satusCode", async () => {
            const tenantData = {
                name: "Tenanat 1",
                address: "Tenant Address 1",
            };
            const response = await request(app)
                .post("/tenants")
                .send(tenantData);

            expect(response.statusCode).toBe(201);
        });

        it("should create a tenat in db", async () => {
            const tenantData = {
                name: "Tenanat 1",
                address: "Tenant Address 1",
            };
            await request(app).post("/tenants").send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);

            const tenants = await tenantRepository.find();

            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });
    });
});
