const client = require('redis')

const redis_client = client.createClient({
    username: 'default',
    password: 'RJdJAQuUOWSCCvWVMdrC0UwxnBENkkqu',
    socket: {
        host: 'redis-19512.c57.us-east-1-4.ec2.cloud.redislabs.com',
        port: 19512
    }
});

redis_client.on('error', err => console.log('Redis Client Error', err));

async function connectRedis() {
  try {
    await redis_client.connect();

    await redis_client.set('foo', 'bar');
    const result = await redis_client.get('foo');
    console.log(result)  // >>> bar
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
}

connectRedis();

module.exports = { redis_client }

