import { io } from 'socket.io-client';

// Always connect to same origin.
// Express server (port 3001) handles both Socket.io and static file serving.
// No URL detection needed — one port rules all.
const socket = io({ autoConnect: false });

export default socket;
