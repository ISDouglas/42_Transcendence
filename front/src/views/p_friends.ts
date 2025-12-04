import { IMyFriend } from "../../../back/DB/friend";
import { friends } from "../../../back/server";
import { genericFetch, loadHeader } from "../router";

export function FriendsView(): string {
	loadHeader();
	return (document.getElementById("friendshtml") as HTMLTemplateElement).innerHTML;
}



export async function initFriends() {
	try {
		const myfriends = await genericFetch("/api/private/friend", {
			method: "POST",
		});

		const divNoFriend = document.getElementById("no-friend") as HTMLElement;
		const divFriend = document.getElementById("friends") as HTMLElement;

    	if (myfriends.length === 0) {
			divNoFriend.textContent = "No friends yet";
			divFriend.classList.add("hidden");
			divNoFriend.classList.remove("hidden");
		}
    	else {
			divFriend.classList.remove("hidden");
			divNoFriend.classList.add("hidden");
			const ul = divFriend.querySelector("ul");
    		myfriends.forEach((friend: IMyFriend) => {
      			const li = document.createElement("li");
      			li.textContent = "Pseudo: " + friend.pseudo + ", status: " + friend.webStatus + ", invitation: " + friend.friendship_status + ", friend since: " + friend.friendship_date;
				const img = document.createElement("img");
  				img.src = friend.avatar; // ✅ appelle ta route back
  				img.alt = `${friend.pseudo}'s avatar`;
  				img.width = 64; // optionnel, pour la taille

  				li.appendChild(img)
				ul?.appendChild(li);
    });
  }
	}
	catch (err) {
		console.log(err);
	}
}
