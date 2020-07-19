let SimpleRedisLogger = require('../simple-redis-logger'),
    log4js = require('log4js')

log4js.configure({
    appenders: {
        console: { type: 'console' },
        file: {
            type: 'file',
            filename: `${__dirname}/logs/test.log`,
            maxLogSize: 209715200, // 200M
            backups: 100,
            category: 'normal'
        }
    },
    categories: {
        default: {
            appenders: ['console', 'file'], level: 'all'
        }
    },
    replaceConsole: true
});

let logger = new SimpleRedisLogger({
    serviceName: 'test_logger',
    limitAmount: 3
})

for (let i = 0; i <= 5; i++) {
    logger.log('info')(`test log #${i}`)
}

setTimeout(async () => {
    console.log(await logger.getLogs('info'))
}, 1000)