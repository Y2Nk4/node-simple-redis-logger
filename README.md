# Node-Simple-Redis-Logger

### About
A simple Node.JS module to store logs into Redis List, based on [node-redis](https://www.npmjs.com/package/redis)

### Install
Install via NPM
`npm install simple-redis-logger`

Then, import it in your project.
```javascript
let SimpleRedisLogger = require('simple-redis-logger')
```

### Methods

##### constructor([options])
- `options` - Optional. An object containing any or all of the following options
    - `redis` - Optional, a [node-redis](https://www.npmjs.com/package/redis) client instance
    - `connectOptions` - Optional, a [node-redis](https://www.npmjs.com/package/redis) connection option object, check more details [here](https://github.com/NodeRedis/node-redis#rediscreateclient)
    - `throwErrors` - Optional, default is `false`. If `throwErrors` is set to `false`, 
    the module will not throw errors if an error occurs while communicating with Redis server.
    But it will still throw Errors if an error occurs in `getLogs` method. 
    And `error` event will always emit while an error occurs.
    - `limitAmount` - Optional, the amount of log messages in every list(or called `types` in this case).
    Default is `null`, which means there is no limit on the amount of messages.
    - `serviceName` - Optional, the prefix of the list. Default is `simple-logger`.
    
    To connect to the Redis server, either `redis` or `connectOptions` is **Required**.
    
##### log(type)(content)
- `type` - type of the message.
- `content` - Can be string, Object, or Error Object.
    - String: The module will store the original string to the Redis List
    - Object: Using `JSON.stringify` to convert the Object into String, then store to Redis List
    - Error Object: Module will store `myError.message` to the Redis List
    
##### [async] getLogs(type[, from[, end]])
- `type` - type of the messages
- `from` - Optional, the beginning index of the messages you want to get. Default is `0`
- `end` - Optional, the ending index of the messages you want to get. Default is `-1`

Returns
- `logs` - An array of the logs
    - `log` - A log Object
        - `content` - The log contents
        - `timestamp` - The timestamp of the time when the log is committed.
        - `time` - A Date Object of the time when the log is committed.

### Example

##### To create a logger
```javascript
let logger = new SimpleRedisLogger({
    serviceName: 'test_logger',
    limitAmount: 3
})
logger.log('info')(new Error('This is an Error'))
logger.log('info')('This is an example of String message')
logger.log('info')({
    message: 'This is an example of Object'
})
``` 

##### To get logs
```javascript
logger.getLogs('info')
    .then((infos) => {
        ...
    })
``` 
    