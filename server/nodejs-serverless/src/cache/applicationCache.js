import cache from '../config/cache';

class ApplicationCache {
  async getById(id) {
    return await cache.get(`merchant_sample_backend:${id}`);
  }

  async setById(id, data) {
    return await cache.set(`merchant_sample_backend:${id}`, data);
  }

}

export default ApplicationCache
