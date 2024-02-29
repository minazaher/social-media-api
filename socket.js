let io

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer,{
            cors: {
                origin: '*',
            }
        });
        return io
    },
    getIo: () => {
        if (!io) {
            throw new Error('IO is not initialized yet')
        }
        return io
    }
}