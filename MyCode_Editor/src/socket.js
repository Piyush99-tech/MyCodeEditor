// Import the `io` function from the socket.io-client package
// This function is used to create a socket connection from the client (browser) to the server
import { io } from "socket.io-client";

// Export an asynchronous function that initializes and returns the socket connection
export const initSocket = async () => {
  // Define connection options to configure the socket behavior
  const options = {
    'force new connection': true,           // Always create a new connection instead of reusing an existing one
    reconnectionAttempts: Infinity,         // Retry reconnecting forever if the connection fails
    timeout: 10000,                         // Wait up to 10 seconds for the server to respond before timing out
    transports: ['websocket'],              // Use only WebSocket transport (skip HTTP long-polling fallback)
  };

  // Create and return the socket connection using the backend URL from the environment variable
  // `import.meta.env.VITE_BACKEND_URL` is how you access Vite environment variables
  return io(import.meta.env.VITE_BACKEND_URL, options);
};
