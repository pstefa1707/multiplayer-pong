var express = require('express');
var Game = require('./Game');
var app = express();
var server = require('http')
	.createServer(app)
	.listen(80);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res, next) {
	res.sendFile(__dirname + '/public/index.html');
});

//User class
class User {
	constructor(socket) {
		this.socket = socket;
		this.username = socket.id;
		this.game = { 'game-id': null, 'in-game': false };
	}
}

//Stores all connected users
let users = {};
let matchmaking = [];
let games = [];

//Manages sockets
io.on('connection', socket => {
	console.log(`New client connected: ${socket.id}`);
	users[socket.id] = new User(socket);
	socket.broadcast.emit('player-broadcast', Object.keys(users).length);
	socket.emit('player-broadcast', Object.keys(users).length);
	//Checks for duplicate usernames
	socket.on('set-username', (username, callback) => {
		let same_username = false;
		for (var key in users) {
			var user = users[key];
			if (user.username == username) {
				callback(false);
				same_username = true;
			}
		}
		if (!same_username && users[socket.id].username == socket.id) {
			console.log(
				`${users[socket.id].username} set their username to ${username}`
			);
			users[socket.id].username = username;
			callback(true);
			socket.emit('matchmaking-begin');
			matchMaker(socket.id);
		} else {
			console.log(
				`${users[socket.id].username} tried to set their username to ${username}, however username is already in use.`
			);
		}
	});

	//Disconnects user
	socket.on('disconnect', () => {
		console.log(`Client Disconnected: ${users[socket.id].username}`);
		delete users[socket.id];
		if (matchmaking.length != 0 && matchmaking[0] == socket.id) {
			matchmaking = [];
		}
		games.forEach(game => {
			if (game.player1.id == socket.id || game.player2.id == socket.id) {
				games.splice(games.indexOf(game), 1);
			}
		});
	});
});

function matchMaker(new_player) {
	if (matchmaking.length != 0) {
		var game = new Game(matchmaking[0], new_player);
		games.push(game);
		users[matchmaking[0]].game['game-id'] = game.id;
		users[new_player].game['game-id'] = game.id;
		users[matchmaking[0]].game['in-game'] = true;
		users[new_player].game['in-game'] = true;
		users[matchmaking[0]].socket.emit('game-started');
		users[new_player].socket.emit('game-started');
		console.log(`Game ${game.id} has started.`);
		matchmaking = [];
	} else {
		matchmaking.push(new_player);
	}
}

setInterval(() => {
	games.forEach(game => {
		game.update();
		users[game.player2.id].socket.emit('game-data', game, callback => {
			game.player2Move(callback);
		});
		users[game.player1.id].socket.emit('game-data', game, callback => {
			game.player1Move(callback);
		});
	});
}, (1 / 30) * 1000);
