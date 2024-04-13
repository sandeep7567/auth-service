import { DataSource } from "typeorm";

export const truncateTable = async (connection: DataSource) => {
    const entities = await connection.entityMetadatas;
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};
