import { httpClient } from '../../../shared/api';

export const authApi = {
  getCurrentUser: () => httpClient.get('/auth/me'),
};

