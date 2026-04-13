import { io } from 'socket.io-client';

// Determine server URL:
// - Codespaces: replace port 5173 → 3001 in the forwarded URL
// - Local dev: Vite proxy handles /socket.io → localhost:3001
// - Production: same origin (Express serves both)
function getServerUrl(): string {
  const { hostname, protocol } = window.location;

  // GitHub Codespaces forwarded URL pattern: <name>-5173.app.github.dev
  if (hostname.includes('.app.github.dev')) {
    return `${protocol}//${hostname.replace('-5173.', '-3001.')}`;
  }

  // Default: same origin (works for local dev via Vite proxy, and production)
  return '';
}

const socket = io(getServerUrl(), {
  autoConnect: false,
  // Codespaces uses HTTPS/WSS, so no need to force transports
});

export default socket;
