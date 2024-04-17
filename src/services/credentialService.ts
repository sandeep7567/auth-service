import bcrypt from "bcrypt";

export class CredentialService {
    constructor() {}

    async comparePassword(
        userPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return await bcrypt.compare(userPassword, hashedPassword);
    }
}
