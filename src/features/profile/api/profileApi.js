import { httpClient } from '../../../shared/api';

export const profileApi = {
  getMyProfile: () => httpClient.get('/profile/me'),
  updateMyProfile: (payload) => httpClient.patch('/profile/me', payload),
};

