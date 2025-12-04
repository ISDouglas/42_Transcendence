import { db, friends, users } from '../../server';
import { IFriends, IMyFriend } from '../../DB/friend';
import { FastifyReply, FastifyRequest } from 'fastify';
import path from "path";
import fs from "fs";
import mime from "mime-types";
import { isJsxFragment } from 'typescript';

export async function displayFriendPage(request: FastifyRequest, reply: FastifyReply): Promise< IMyFriend[] | undefined> 
{
	const infoFriends: IFriends[]= await friends.getMyFriends(request.user!.user_id);
	if (infoFriends.length === 0)
		return (reply.send(infoFriends), undefined);
	const allFriendID = friendsID(infoFriends, request.user!.user_id);
	const allMyFriends = await allMyFriendsInfo(allFriendID);
	// console.log("myfreind", allMyFriends);
	reply.send(allMyFriends);
	return  allMyFriends;
}


function friendsID(infoFriends: IFriends[], id: number): Partial<IMyFriend>[] {
	return infoFriends.map((findFriend) => { 
		const userID: number = findFriend.user_id1 === id ? findFriend.user_id2 : findFriend.user_id1;
		return {
			id: userID,
			friendship_date: findFriend.friendship_date,
			friendship_status: findFriend.status
		}
	});
}


async function allMyFriendsInfo(allMyFrd: Partial<IMyFriend>[]): Promise<IMyFriend[]> {
	const myFriendsinfo: IMyFriend[] = await Promise.all(
		allMyFrd.map(async (myfriend) => {
			const friend = await users.getIDUser(myfriend.id!);
			return ({
				id: myfriend.id!,
				avatar: `/api/private/avatar/${myfriend.id!}`,
				pseudo: friend.pseudo,
				webStatus: friend.status,
				friendship_date: myfriend.friendship_date!,
				friendship_status: myfriend.friendship_status!
			})
		})
	);
	return myFriendsinfo;
}

export async function displayFriendAvatar( request: FastifyRequest, reply: FastifyReply) {
	const friendID = Number((request.params as any).id)
	const allFriend: IFriends[]= await friends.getMyFriends(request.user!.user_id);
	const isFriend: boolean = allFriend.some((findThisFriend) => { 
		return findThisFriend.user_id1 === friendID || findThisFriend.user_id2 == friendID;
	});
	if (!isFriend)
		return reply.code(404).send({message: "Not your friend"});
	try {
		const avatar: string = (await users.getIDUser(friendID)).avatar;
		if (!avatar)
			return reply.code(404).send({message: "AVatar not found"});
		const avatarPath = path.join(__dirname, "../../uploads", avatar);
		const type = mime.lookup(avatarPath);
		if (type !== "image/png" && type !== "image/jpeg")
			return reply.code(404).send({message: "Extension file should be PNG or JPEG"});
		const stream = fs.createReadStream(avatarPath);
		// const etag = Date.now().toString();
		return reply.type(type).send(stream);
	}
	catch (err) {
		console.log(err);
	}
}