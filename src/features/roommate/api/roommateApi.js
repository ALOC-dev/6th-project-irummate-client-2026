import { httpClient } from '../../../shared/api';

export const roommateApi = {
  getRecommendations: () => httpClient.get('/roommates/recommendations'),
};

