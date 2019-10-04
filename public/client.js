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
	document.getElementById('gameplay').style.display = 'flex';
	fit_canvas();
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

//Fit canvas to screen on resize
window.addEventListener('resize', fit_canvas);
function fit_canvas() {
	let canvas = document.getElementById('drawing-canvas');
	let parent = document.getElementById('gameplay');
	canvas.height = parent.offsetHeight - 10;
	canvas.width = parent.offsetWidth - 10;
}

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
				window.alert(
					'Username invalid, must be more than 3 characters in length, no spaces and unique. (^[a-zA-Z0-9_.-]{3,}$)'
				);
			}
		}
	);
}

//Handles opponent leaving game
socket.on('player-left', () => {
	socket.disconnect();
	document.location.reload();
});

//Controls
//Keyboard
document.addEventListener('keydown', function(event) {
	if (game_state != null) {
		if (event.keyCode == 38 || event.keyCode == 87) {
			game_state.up();
		} else if (event.keyCode == 40 || event.keyCode == 83) {
			game_state.down();
		}
	}
});

//Mouse
$('#drawing-canvas').mousemove(function(e) {
	let mouse_pos = getMousePos(e);
	game_state.game.self.pos =
		(mouse_pos.y / document.getElementById('drawing-canvas').height) * 100;
});

function getMousePos(evt) {
	let canvas = document.getElementById('drawing-canvas');
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

//Mobile
document.addEventListener('touchstart', touchHandler);
document.addEventListener('touchmove', touchHandler);

function touchHandler(e) {
	if (e.touches) {
		let playerY =
			e.touches[0].pageY -
			document.getElementById('drawing-canvas').offsetTop;
		game_state.game.self.pos =
			(playerY / document.getElementById('drawing-canvas').height) * 100;
		e.preventDefault();
	}
}
