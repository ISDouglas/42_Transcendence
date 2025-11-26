import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { users } from '../../server';
import path from "path";
import fs from "fs";
import { REPL_MODE_SLOPPY } from "repl";

export async function getProfile(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const id = request.user?.user_id as number;
		const profile = await users.getIDUser(id);
		if (!profile)
		{
		return reply.code(404).send({message: "User not found"})
		}
    	return profile;  
	} catch (error) {
		fastify.log.error(error)
		return reply.code(500).send({message: "Internal Server Error"});
 	}
}

export async function displayAvatar( request: FastifyRequest, reply: FastifyReply) {
	const avatar = request.user.avatar;
	const avatarPath = path.join(__dirname, "../../uploads", avatar);
	if (fs.existsSync(avatarPath))
		return reply.sendFile(path.resolve(__dirname, "../../uploads", "0.png"));
}