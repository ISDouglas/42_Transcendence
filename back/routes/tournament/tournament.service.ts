import { tournamentDB } from '../../server';
import * as avalancheService from "../../blockchain/avalanche.service";
import { FastifyRequest, FastifyReply } from "fastify";
import { serverTournament } from "./serverTournament";

export async function getAllTournamentsDetailed(request: FastifyRequest, reply: FastifyReply) {
  try {
    const all = await tournamentDB.getAllTournaments();
    request.log.info({ count: all.length }, "Fetched tournaments");

    const result = await Promise.all(
      all.map(async (t: any) => {
        let ranking: number[] = [];
        try {
          const results = await tournamentDB.getTournamentResults(t.id);
          ranking = results?.map(r => r.player_id ?? -1) ?? [];
        } catch (err) {
          request.log.error({ err, tournamentId: t.id }, "Failed DB ranking");
        }
        let blockchainRanking: number[] | undefined;
        const onChain = t.onchain === 1;
        if (onChain) {
          try {
            blockchainRanking = await avalancheService.getTournament(t.id);
          } catch (err) {
            request.log.error({ err, tournamentId: t.id }, "Blockchain fetch failed");
            blockchainRanking = undefined;
          }
        }
        return {
          tournamentId: t.id,
          ranking,
          onChain,
          blockchainRanking,
        };
      })
    );

    return reply.send(result);
  } catch (err) {
    request.log.error({ err }, "Fatal error in /tournament/all");
    return reply.status(500).send({ error: "Internal server error" });
  }
}

export async function finalizeTournament(
  tournament: serverTournament
) {
  const ranking = [
    tournament.idFirst,
    tournament.idSecond,
    tournament.idThird,
    tournament.idFourth,
  ];

  if (ranking.some(id => id === undefined || id === null)) {
    throw new Error("Tournament ranking not fully initialized");
  }
  const tournamentId = await tournamentDB.createTournament();
  await tournamentDB.insertTournamentResults(tournamentId, ranking);
}

export async function uploadPendingTournaments() {
  const pending = await tournamentDB.getPendingOnChain();

  for (const t of pending) {
    try {
      const results = await tournamentDB.getTournamentResults(t.id);
      const ranking = results.map(r => r.player_id);

      while (ranking.length < 8) ranking.push(0);

      const res = await avalancheService.addTournamentResult(t.id, ranking);
      if (res.status === "success" || res.status === "duplicate") {
        await tournamentDB.markOnChain(t.id);
      } else {
        console.error(`Tournament ${t.id} failed, will retry later`);
      }
    } catch (err) {
        console.error(`Unexpected error processing tournament ${t.id}`, err);
    }
  }
}