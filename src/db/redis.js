const {createClient} = require("redis");

const redisClient = createClient({

    socket:{
        host: process.env.REDIS_HOST,
        port:process.env.REDIS_PORT,
    }
    
})

redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect().then(()=>{console.log("redis connected");})

module.exports = redisClient