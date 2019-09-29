var host = window.location.href;
console.log(host);
var socket = io.connect(host);

let i = '';
const interval = setInterval(() => {
	document.getElementById('searching-for-match').innerHTML =
		'Searching for Match' + i;
	i += '.';
	if (i == '.....') i = '';
}, 500);

socket.on('player-broadcast', players => {
	document.getElementById('online-players').innerHTML = `Online: ${players}`;
});

socket.on('game-started', () => {
	clearInterval(interval);
	document.getElementById('match-making').remove();
});

socket.on('game-data', data => {
	console.log(data);
	let height = 5;
	let width = 6;
	document.getElementById('gameplay').style.display = 'block';
	var canvas = document.getElementById('drawing-canvas');
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, 0, 600, 500);
	ctx.fillStyle = '#000000';
	ctx.fillRect(data.ball[0] * width, data.ball[1] * height, 10, 10);
	ctx.fillRect(
		5 * width,
		(data.player1.pos - 10) * height,
		2 * width,
		20 * height
	);
	ctx.fillRect(
		90 * width,
		(data.player2.pos - 10) * height,
		2 * width,
		20 * height
	);
});

socket.on('matchmaking-begin', () => {
	document.getElementById('match-making').style.display = 'block';
});

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
