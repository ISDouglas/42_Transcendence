import { FastifyReply, FastifyRequest } from 'fastify';
import { gameInfo } from '../../server';
import { IGameInfo } from '../../DB/gameinfo';

export async function dashboardInfo(request: FastifyRequest, reply: FastifyReply)
{
    const user_id = request.user?.user_id;
    if (!user_id) {
        return reply.status(400).send({ error: "Missing userId" });
    }

    try 
    {
        const games = await gameInfo.getGamesByUser(user_id);
        reply.status(200).send(games);
    }
    catch (err)
    {
        console.error(err);
        reply.status(500).send({ error: "Impossible de récupérer le dashboard" });
    }
}   