import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import { Roles } from "../constants";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        return await this.userRepository.save({
            firstName,
            lastName,
            email,
            password,
            role: Roles.CUSTOMER,
        });
    }
}
