let redis = require('redis'),
    log4js = require('log4js'),
    { EventEmitter } = require('events')

class SimpleRedisLogger extends EventEmitter{
    constructor (options) {
        super()
        this._logger = log4js.getLogger('SimpleRedisLogger')

        // options
        this.options = options || {}
        this.options.connectOptions = this.options.connectOptions || {}
        this.serviceName = options.serviceName || 'simple-logger'

        // create redis client instance
        if (options.redis instanceof redis.RedisClient) {
            this.client = options.redis
        } else {
            this.client = redis.createClient(this.options.connectOptions);
            this.client.on('error', function (error) {
                this._logger.error('Redis Error: ', error);
            });
        }
    }

    log (type) {
        return (content) => {
            let formattedContent = this._formatContent(content),
                packedContent = this._packContent(formattedContent)

            this.client.lpush(`${this.serviceName}:${type}`, packedContent, (err, result) => {
                if (err) {
                    this._logger.error(err)
                    if (this.options.throwErrors) {
                        throw err
                    }
                    this.emit('error', err)
                }
                if (this.options.limitAmount && result > this.options.limitAmount) {
                    this.client.ltrim(`${this.serviceName}:${type}`, 0, this.options.limitAmount - 1, (error, result) => {
                        if (error) {
                            this._logger.error(err)
                            if (this.options.throwErrors) {
                                throw err
                            }
                            this.emit('error', err)
                        }
                    })
                }
            })
        }
    }

    getLogs (type, from = 0, end = -1) {
        return new Promise((resolve, reject) => {
            this.client.lrange(`${this.serviceName}:${type}`, from, end, (error, result) => {
                if (error) {
                    this._logger.error(error)
                    return reject(error)
                }
                return resolve(result.map((item) => {
                    try {
                        let content = JSON.parse(item)
                        content.time = new Date(content.timestamp * 1000)
                        return content
                    } catch (e) {
                        return item
                    }
                }))
            })
        });
    }

    _formatContent (content) {
        if (content instanceof Error) {
            return content.message
        }
        if (typeof content === 'object') {
            return JSON.stringify(content)
        }
        return content
    }

    _packContent (content) {
        return JSON.stringify({
            content: content,
            timestamp: Math.round(Date.now() / 1000)
        })
    }
}

module.exports = SimpleRedisLogger