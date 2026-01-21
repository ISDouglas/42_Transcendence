import { FastifyRequest, FastifyReply } from "fastify";
import { IUsers } from "../../../back/DB/users";
import { users } from '../../server';

export async function getUsersByIdsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { ids } = request.body as { ids: number[] };
    if (!Array.isArray(ids) || ids.length === 0) return reply.code(200).send({ message: "no tournament data found" });
    const usersInfo: IUsers[] = await users.getUsersByIds([...new Set(ids)]);

    return reply.code(200).send(usersInfo);
  } catch (err: any) {
    return reply.code(500).send({ error: err.message || "Internal server error" });
  }
}
