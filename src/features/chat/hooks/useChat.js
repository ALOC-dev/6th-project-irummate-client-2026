export function useChat() {
  // TODO: subscribe to socket events through app/socket and expose chat state here.
  return { rooms: [], messages: [], isLoading: false };
}

