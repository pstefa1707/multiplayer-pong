var express = require('express');
var Game = require('./Game');
var app = express();
const HERTZ = 30; //Game updates per second
const port = process.env.PORT || 80;
var server = require('http')
	.createServer(app)
	.listen(port);
var io = require('socket.io')(server);
const uNRegex = new RegExp('^[a-zA-Z0-9_.-]{3,}$');

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
		console.log(uNRegex.test(username));
		if (!uNRegex.test(username)) {
			callback(false);
			same_username = true;
		}
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
				`${users[socket.id].username} tried to set their username to ${username}, however username is in use or invalid.`
			);
		}
	});

	socket.on('get-ping', callback => {
		callback(true);
	});

	//Disconnects user
	socket.on('disconnect', () => {
		console.log(`Client Disconnected: ${users[socket.id].username}`);
		delete users[socket.id];
		socket.broadcast.emit('player-broadcast', Object.keys(users).length);
		if (matchmaking.length != 0 && matchmaking[0] == socket.id) {
			matchmaking = [];
		}
		//Removes user from current game and notifices other player - could use the game-id from player object but cbs
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

//Very simple matchmaking, as soon as theres two people in queue it matches them together
//theoretically there should never be more than two people in the queue at any one time.
function matchMaker(new_player) {
	if (matchmaking.length != 0) {
		var game = new Game(
			matchmaking[0],
			users[matchmaking[0]].username,
			new_player,
			users[new_player].username
		);
		games[game.id] = game;

		//This is all completely un-needed but may be useful for future additions to the game
		users[matchmaking[0]].game.id = game.id;
		users[new_player].game.id = game.id;
		users[matchmaking[0]].game.playing = true;
		users[new_player].game.playing = true;

		//Tells players that a game has started - allows client to initialise view
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

//Sends new game data to each of the respective players in each game, every x milliseconds
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
