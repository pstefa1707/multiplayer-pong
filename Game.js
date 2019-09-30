const uuid = require('uuid');

class Game {
	constructor(id, username, id2, username2) {
		this.ball_vel = 0.5;
		this.id = uuid.v4();
		this.player1 = id;
		this.player2 = id2;
		this.players = {};
		this.players[id] = { name: username.toString(), pos: 50, score: 0 };
		this.players[id2] = { name: username.toString(), pos: 50, score: 0 };
		this.ball = [50, 50];
		this.ball_velocity = [2.5, 2.5];
	}

	update() {
		this.ball[0] += this.ball_velocity[0];
		this.ball[1] += this.ball_velocity[1];
		if (this.ball[0] >= 100) {
			this.players[this.player1].score++;
			this.reset(1);
		} else if (this.ball[0] <= 0) {
			this.players[this.player2].score++;
			this.reset(2);
		}

		if (this.ball[1] >= 100) {
			this.ball_velocity[1] *= -1;
			this.ball[1] = 99;
		} else if (this.ball[1] <= 0) {
			this.ball_velocity[1] *= -1;
			this.ball[1] = 1;
		}

		if (
			this.ball[1] < this.players[this.player2].pos + 10 &&
			this.ball[1] + 2 > this.players[this.player2].pos - 10 &&
			this.ball[0] > 94 &&
			this.ball[0] < 96.5
		) {
			this.ball[0] = 94;
			var relativeIntersectY =
				this.players[this.player2].pos - this.ball[1] - 1;
			var normalizedRelativeIntersectionY = relativeIntersectY / 10;
			this.ball_velocity[0] = -(
				(1 - Math.abs(normalizedRelativeIntersectionY)) * (2.5 - 1.25) +
				1.25
			);
			this.ball_velocity[1] = -normalizedRelativeIntersectionY;
		} else if (
			this.ball[1] < this.players[this.player1].pos + 10 &&
			this.ball[1] + 2 > this.players[this.player1].pos - 10 &&
			this.ball[0] < 6 &&
			this.ball[0] > 3.5
		) {
			this.ball[0] = 6;
			var relativeIntersectY =
				this.players[this.player1].pos - this.ball[1] - 1;
			var normalizedRelativeIntersectionY = relativeIntersectY / 10;
			var normalizedRelativeIntersectionY = relativeIntersectY / 10;
			this.ball_velocity[0] =
				(1 - Math.abs(normalizedRelativeIntersectionY)) * (2.5 - 1.25) +
				1.25;
			this.ball_velocity[1] = -normalizedRelativeIntersectionY;
		}
	}

	reset(player) {
		this.ball = [50, 50];
		if (player == 1) {
			this.ball_velocity = [-0.7, 0];
		} else {
			this.ball_velocity = [0.7, 0];
		}
	}
}

module.exports = Game;
