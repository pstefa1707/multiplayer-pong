const uuid = require('uuid');

class Game {
	constructor(player1, player2) {
		this.id = uuid.v4();
		this.player1 = { id: player1, pos: 50, score: 0 };
		this.player2 = { id: player2, pos: 50, score: 0 };
		this.ball = [50, 50];
		this.ball_velocity = [2.5, 2.5];
	}

	update() {
		this.ball[0] += this.ball_velocity[0];
		this.ball[1] += this.ball_velocity[1];
		if (this.ball[0] >= 100) {
			this.player1.score++;
			this.reset();
		} else if (this.ball[0] <= 0) {
			this.player2.score++;
			this.reset();
		}

		if (this.ball[1] >= 100) {
			this.ball_velocity[1] *= -1;
			this.ball[1] = 99;
		} else if (this.ball[1] <= 0) {
			this.ball_velocity[1] *= -1;
			this.ball[1] = 1;
		}

		if (
			this.ball[1] < this.player2.pos + 10 &&
			this.ball[1] > this.player2.pos - 10 &&
			this.ball[0] > 90 &&
			this.ball[0] < 95
		) {
			this.ball_velocity[0] *= -1.1;
			this.ball_velocity[1] *= -1.1;
		} else if (
			this.ball[1] < this.player1.pos + 10 &&
			this.ball[1] > this.player1.pos - 10 &&
			this.ball[0] > 5 &&
			this.ball[0] < 10
		) {
			this.ball_velocity[0] *= -1.1;
			this.ball_velocity[1] *= -1.1;
		}
	}

	reset() {
		this.ball = [50, 50];
		this.ball_velocity = [Math.random() * 5, Math.random() * 5];
	}
}

module.exports = Game;
