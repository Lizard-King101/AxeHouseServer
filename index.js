const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const cors = require('cors');
const http = require('http').createServer(app);

const io = require('socket.io')(http);

global.database = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'axehouse'
};

// handler modules
const post = require('./modules/post');
const socketIo = require('./modules/socket');

var port = process.env.PORT || 3030;

//app.use(express.static('./images'));
app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(bodyParser.json());

// enable CORS
var whitelist = ['http://localhost:8100', 'http://127.0.0.1:8100', 'http://localhost']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}
app.use(cors(corsOptions));

io.on('connection', (socket) => {
    socketIo.process(socket, io);
});

app.post('*', (req, res) => { 
    post.process(req, res);
});

http.listen(port, function(){
    setTimeout(() => {
        io.emit('server-reset');
        // change this to client side catch socket connect_error
        console.log('send reset to connected')
    },1000);

    console.log('Listening on Port: ' + port);
});
