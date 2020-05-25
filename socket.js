let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer)
        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error('Connection Not Initialized')
        }
        return io
    }
}