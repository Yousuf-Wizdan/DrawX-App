import { WebSocket, WebSocketServer } from 'ws'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET } from '@repo/backend-common/config';
import {db} from '@repo/db/db'

interface TokenPayload extends JwtPayload {
    userId: string
}

const wss = new WebSocketServer({ port: 8080 });

interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = []

const checkUser = (token: string): string | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

        if (typeof decoded == 'string') {
            return null;
        }

        if (!decoded || !decoded.userId) {
            return null;
        }

        return decoded.userId;

    } catch (err) {
        console.error("Error verifying token:", err);
        return null
    }

}

wss.on('connection', function connection(ws, request) {
    const url = request.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') ?? "";

    const userId = checkUser(token)

    if (!userId) {
        ws.close();
        return
    }

    users.push({
        userId,
        rooms: [],
        ws
    })

    ws.on('message', async function message(data) {
        const parsedData = JSON.parse(data as unknown as string);

        if (parsedData.type === "join_room") {
            const user = users.find((user) => user.ws === ws);
            user?.rooms.push(parsedData.roomId);
        }

        if (parsedData.type == "leave_room") {
            const user = users.find((user) => user.ws === ws);
            if (!user) {
                return;
            }
            user.rooms = user.rooms.filter((room) => room === parsedData.room);
        }

        if (parsedData.type == "chat") {
            const { roomId, message } = parsedData;


            await db.chat.create({
                data: {
                    roomId,
                    message,
                    userId
                }
            })

            users.forEach((user) => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message,
                        roomId
                    }))
                }
            })
        }


    })

})  