import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { users } from '../../server';
import bcrypt from "bcryptjs";
import path from "path"
import { pipeline } from "stream/promises"
import fs from "fs";

export async function getUpdateInfo(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const id = request.user?.user_id as any;
		const profil = await users.getIDUser(id);
		if (!profil)
      		return reply.code(404).send({message: "User not found"});
    	return profil;
  	} catch (error) {
    	fastify.log.error(error)
    	return reply.code(500).send({message: "Internal Server Error"});
  	}
}

export async function getUpdateUsername(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const { newUsername, password } = request.body as any;
		const id = request.user?.user_id as any;

		const user = await users.getIDUser(id);
		if (!user)
			return reply.code(404).send({message: "User not found"});

		const duplicate = await users.getPseudoUser(newUsername);
		if (duplicate?.pseudo === newUsername) {
			return reply.code(409).send({message: "Username already taken!"});
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return reply.code(401).send({ message: "Wrong password" });
		}

		const updatedUser = await users.updateUsername(id, newUsername);
		return reply.code(200).send({ message: "Username updated", pseudo: updatedUser.pseudo });

	} catch (error) {
		fastify.log.error(error);
		return reply.code(500).send({ message: "Internal Server Error" });
	}
}

export async function getUploadAvatar(request: FastifyRequest, reply: FastifyReply) {
	const avatar = await request.file();
		console.log("avatar = ", avatar);
		if (!avatar?.filename) {
			return reply.status(400).send({ error: "Nothing uploaded"});
		}
		const avatar_name = request.user?.user_id + ".png";
		const avatar_path = path.join(__dirname, "../../uploads", avatar_name);
		await pipeline(avatar.file, fs.createWriteStream(avatar_path));
		return reply.status(200).send({ message: "Upload succes", filename: avatar_name})
}