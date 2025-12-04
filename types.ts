import fastify from "fastify"
import { IUsers } from "./back/DB/users"
import { IMyFriend } from "./back/DB/friend"

declare module "fastify" {
    interface FastifyRequest {
        user?: IUsers;
        // myfriends?: IMyFriend[];
    }
}