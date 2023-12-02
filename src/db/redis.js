const {createClient} = require("redis");

const redisClient = createClient({
    legacyMode:true,
    pingInterval:1000,
    socket:{
        host: process.env.REDIS_HOST,
        port:process.env.REDIS_PORT,
        connectTimeout:50000
    }
})

redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect().then(()=>{console.log("redis connected");})

module.exports = redisClient