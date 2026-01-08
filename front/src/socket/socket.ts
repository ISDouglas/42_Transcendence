import { io, Socket } from "socket.io-client";

export let globalSocket: Socket | null = null;

export function initSocket() {
    const token = localStorage.getItem("token");
    if (!token)
        return;
    console.log(new Date().toISOString(), "dans init socket, token socket=", token,"URL socket =", window.location.origin);
    globalSocket = io(window.location.origin, {
        transports: ["websocket"],
        query: { token }
    });
    console.log(new Date().toISOString(), "globalsocket s ocket=", globalSocket);
}
