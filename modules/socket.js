let stations = {};

function id() {
    let id = (new Date().getTime().toString(16).substr(8) + (Math.floor(Math.random() * 100)).toString(16).substr(0, 1)).toUpperCase();
    if(stations[id]){
        return id();
    }else{
        return id;
    }
}

module.exports.process = (socket, io) => {

    socket.on('station', () => {
        // user send to station
        
    });

    socket.on('users', () => {
        // station send to users

    })

    socket.on('station-join', () => {
        console.log('joining station');
        let stationId = id();
        socket.join(stationId, (err) => {
            socket.station = stationId;
            stations[stationId] = {users: {}};
            socket.emit('station-joined', stationId);
        });
    });

    socket.on('user-join', (data) => {
        const stationId = data['station'];
        const user = data['user'];
        if(stations[stationId]){
            if(Object.keys(stations[stationId].users).length < 4){
                socket.join(stationId, (err) => {
                    socket.stationId = stationId;
                    stations[stationId].users[socket.id] = {
                        id: socket.id
                    };
                    io.to(stationId).emit('user-update', {
                        action: 'join',
                        station: stationId,
                        id: socket.id,
                        user: user,
                        player: Object.keys(stations[stationId].users).length
                    }); 
                }) 
            } else {
                socket.emit('app-error', {header: 'Station Full', subHeader: 'This Room already has four players'})
            }
        } else {
            socket.emit('app-error', {header: 'No Station '+stationId, subHeader: 'These digits are not the station ID you are looking for.'})
        }
    });
 
    socket.on('user-leave', ()=>{
        socket.stationId
        io.to(socket.stationId).emit('user-update', {
            action: 'leave',
            station: socket.stationId,
            id: socket.id
        }); 
    });
  
    socket.on('disconnect', () => { 
        if(socket.station) {
            io.in(socket.station).emit('server-reset');
            delete stations[socket.station];
        }

        if(socket.user) {
            io.in(socket.stationId).emit('user-update', {
                action: 'leave',
                id: socket.id
            });
        }
    });
}