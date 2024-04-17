import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import { Roles } from "../constants";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        const user = await this.userRepository.findOne({ where: { email } });

        if (user) {
            const err = createHttpError(400, "email is already exist");
            throw err;
        }

        // hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return await this.userRepository.save({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: Roles.CUSTOMER,
        });
    }
    async findByEmail(email: string) {
        return await this.userRepository.findOne({ where: { email } });
    }
}
