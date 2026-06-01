import redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const client = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('✅ Redis Client Connected'));

await client.connect();

export default client;
