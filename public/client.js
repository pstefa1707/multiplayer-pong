var host = window.location.href;
console.log(host);
var socket = io.connect(host);

let game_state;

//Changes text on searching for match page
let i = '';
let interval = setInterval(() => {
	document.getElementById('searching-for-match').innerHTML =
		'Searching for Match' + i;
	i += '.';
	if (i == '.....') i = '';
}, 500);

//Gets number of online players
socket.on('player-broadcast', players => {
	document.getElementById('online-players').innerHTML = `Online: ${players}`;
});

//Game has begun
socket.on('game-started', data => {
	clearInterval(interval);
	game_state = new Pong(
		data.username,
		data.player,
		data.opp_username,
		data.ball
	);
	interval = setInterval(() => {
		game_state.update();
	}, (1 / 60) * 1000);
	document.getElementById('match-making').remove();
	document.getElementById('gameplay').style.display = 'block';
});

//Gets new game data and mutates gamestate
socket.on('game-data', (data, callback) => {
	game_state.game.self.score = data.score;
	game_state.game.opp.score = data.opp_score;
	game_state.game.ball = data.ball;
	game_state.game.opp.pos = data.opp_pos;
	callback(game_state.game.self.pos);
});

//Makes matchmaking div visible
socket.on('matchmaking-begin', () => {
	document.getElementById('match-making').style.display = 'block';
});

//Sends username to server
function setUsername() {
	socket.emit(
		'set-username',
		document.getElementById('input-username').value,
		callback => {
			if (callback) {
				document.getElementById('start-screen').remove();
				console.log('username changed successfully');
			} else {
				console.log('error with username!');
			}
		}
	);
}

//Controls
document.addEventListener('keydown', function(event) {
	if (game_state != null) {
		if (event.keyCode == 38 || event.keyCode == 87) {
			console.log('uP!');
			game_state.up();
		} else if (event.keyCode == 40 || event.keyCode == 83) {
			game_state.down();
		}
	}
});
