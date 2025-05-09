const client = require('redis')

const redis_client = client.createClient({
    username: 'default',
    password: '9VanuecFoIaNzobR0CaZdaBK5Sn8iajv',
    socket: {
        host: 'redis-16676.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 16676
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

