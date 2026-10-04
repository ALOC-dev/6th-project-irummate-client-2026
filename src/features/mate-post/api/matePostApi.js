import { httpClient } from '../../../shared/api';

export const matePostApi = {
  getPosts: () => httpClient.get('/mate-posts'),
};

