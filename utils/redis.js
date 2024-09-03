import { createClient } from 'redis';

class RedisClient {
  /**
   * Creates a new RedisClient instance.
   */
  constructor() {
    this.client = createClient();
    this.isClientConnected = false;

    // Handle Redis connection errors
    this.client.on('error', (err) => {
      console.error('Redis client error:', err.message || err.toString());
      this.isClientConnected = false;
    });

    // Handle successful connection
    this.client.on('connect', () => {
      this.isClientConnected = true;
    });

    // Connect the client explicitly
    this.client.connect().catch((err) => {
      console.error('Redis client failed to connect:', err.message || err.toString());
    });
  }

  /**
   * Checks if this client's connection to the Redis server is active.
   * @returns {boolean}
   */
  isAlive() {
    return this.isClientConnected;
  }

  /**
   * Retrieves the value of a given key.
   * @param {String} key The key of the item to retrieve.
   * @returns {Promise<String | null>}
   */
  async get(key) {
    if (!this.isAlive()) throw new Error('Redis client is not connected');
    return this.client.get(key);
  }

  /**
   * Stores a key and its value along with an expiration time.
   * @param {String} key The key of the item to store.
   * @param {String | Number | Boolean} value The item to store.
   * @param {Number} duration The expiration time of the item in seconds.
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    if (!this.isAlive()) throw new Error('Redis client is not connected');
    await this.client.setEx(key, duration, value);
  }

  /**
   * Removes the value of a given key.
   * @param {String} key The key of the item to remove.
   * @returns {Promise<void>}
   */
  async del(key) {
    if (!this.isAlive()) throw new Error('Redis client is not connected');
    await this.client.del(key);
  }
}

// Create and export an instance of RedisClient
export const redisClient = new RedisClient();
export default redisClient;
