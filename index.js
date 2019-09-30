var express = require('express');
var Game = require('./Game');
var app = express();
const HERTZ = 30; //Game updates per second
const port = process.env.PORT || 1337;
var server = require('http')
	.createServer(app)
	.listen(port, '192.168.0.29');
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
		this.game = { id: null, playing: false };
	}
}

//Stores all connected users
let users = {};
let matchmaking = [];
let games = {};

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
		socket.broadcast.emit('player-broadcast', Object.keys(users).length);
		if (matchmaking.length != 0 && matchmaking[0] == socket.id) {
			matchmaking = [];
		}
		for (key in games) {
			let game = games[key];
			if (game.player1 == socket.id) {
				users[game.player2].socket.emit('player-left');
				delete games[key];
			} else if (game.player2 == socket.id) {
				users[game.player1].socket.emit('player-left');
				delete games[key];
			}
		}
	});
});

function matchMaker(new_player) {
	if (matchmaking.length != 0) {
		var game = new Game(
			matchmaking[0],
			users[matchmaking[0]].username,
			new_player,
			users[new_player].username
		);
		games[game.id] = game;
		users[matchmaking[0]].game.id = game.id;
		users[new_player].game.id = game.id;
		users[matchmaking[0]].game.playing = true;
		users[new_player].game.playing = true;
		users[matchmaking[0]].socket.emit('game-started', {
			username: users[matchmaking[0]].username,
			player: 1,
			opp_username: users[new_player].username,
			ball: game.ball
		});
		users[new_player].socket.emit('game-started', {
			username: users[new_player].username,
			player: 2,
			opp_username: users[matchmaking[0]].username
		});
		console.log(`Game ${game.id} has started.`);
		matchmaking = [];
	} else {
		matchmaking.push(new_player);
	}
}

setInterval(() => {
	for (key in games) {
		let game = games[key];
		game.update();
		data = {
			1: {
				score: game.players[game.player1].score,
				pos: game.players[game.player1].pos
			},
			2: {
				score: game.players[game.player2].score,
				pos: game.players[game.player2].pos
			},
			ball: game.ball
		};
		users[game.player2].socket.emit(
			'game-data',
			{
				score: data[2].score,
				opp_score: data[1].score,
				opp_pos: data[1].pos,
				ball: data.ball
			},
			callback => {
				game.players[game.player2].pos = callback;
			}
		);
		users[game.player1].socket.emit(
			'game-data',
			{
				score: data[1].score,
				opp_score: data[2].score,
				opp_pos: data[2].pos,
				ball: data.ball
			},
			callback => {
				game.players[game.player1].pos = callback;
			}
		);
	}
}, (1 / HERTZ) * 1000);
