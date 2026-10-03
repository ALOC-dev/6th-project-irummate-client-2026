import { httpClient } from '../../../shared/api';

export const chatApi = {
  getRooms: () => httpClient.get('/chat/rooms'),
  sendMessage: (roomId, payload) => httpClient.post(`/chat/rooms/${roomId}/messages`, payload),
};

