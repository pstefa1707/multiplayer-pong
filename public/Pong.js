class Pong {
	//Initialises canvas
	constructor(username, player, opp_username, ball, status) {
		//$('body').css({ overflow: 'hidden', position: 'fixed' });
		this.canvas = document.getElementById('drawing-canvas');
		this.ctx = document.getElementById('drawing-canvas').getContext('2d');
		this.game = {
			player: player,
			self: { username: username, score: 0, pos: 50 },
			opp: { username: opp_username, score: 0, pos: 50 },
			ball: ball
		};
		this.player_velocity = 3;
	}

	//Clears the canvas - ready for new frame
	clear() {
		this.ctx.fillStyle = 'black';
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	//Renders next frame onto canvas
	update() {
		this.clear();
		this.ctx.font = '32px monospace';
		this.ctx.textAlign = 'center';
		if (this.game.player == 1) {
			this.ctx.fillStyle = '#0000ff';
			this.ctx.fillText(
				`${this.game.self.username}: ${this.game.self.score}`,
				this.canvas.width / 4,
				50
			);
			this.ctx.fillRect(
				0.05 * this.canvas.width,
				((this.game.self.pos - 10) / 100) * this.canvas.height,
				0.01 * this.canvas.width,
				0.2 * this.canvas.height
			);
			this.ctx.fillStyle = '#ff0000';
			this.ctx.fillText(
				`${this.game.opp.username}: ${this.game.opp.score}`,
				3 * (this.canvas.width / 4),
				50
			);
			this.ctx.fillRect(
				0.95 * this.canvas.width,
				((this.game.opp.pos - 10) / 100) * this.canvas.height,
				0.01 * this.canvas.width,
				0.2 * this.canvas.height
			);
		} else {
			this.ctx.fillStyle = '#ff0000';
			this.ctx.fillText(
				`${this.game.opp.username}: ${this.game.opp.score}`,
				this.canvas.width / 4,
				50
			);
			this.ctx.fillRect(
				0.05 * this.canvas.width,
				((this.game.opp.pos - 10) / 100) * this.canvas.height,
				0.01 * this.canvas.width,
				0.2 * this.canvas.height
			);

			this.ctx.fillStyle = '#0000ff';
			this.ctx.fillText(
				`${this.game.self.username}: ${this.game.self.score}`,
				3 * (this.canvas.width / 4),
				50
			);
			this.ctx.fillRect(
				0.95 * this.canvas.width,
				((this.game.self.pos - 10) / 100) * this.canvas.height,
				0.01 * this.canvas.width,
				0.2 * this.canvas.height
			);
		}
		this.ctx.fillStyle = '#ffffff';
		this.ctx.fillRect(
			(this.game.ball[0] / 100) * this.canvas.width,
			(this.game.ball[1] / 100) * this.canvas.height,
			0.02 * this.canvas.height,
			0.02 * this.canvas.height
		);
	}

	//Keyboard Controls
	upSelf() {
		if (this.game.self.pos > 10) this.game.self.pos -= 3;
	}

	downSelf() {
		if (this.game.self.pos < 90) this.game.self.pos += 3;
	}

	upOpp() {
		if (this.game.opp.pos > 10) this.game.opp.pos -= 3;
	}

	downOpp() {
		if (this.game.opp.pos < 90) this.game.opp.pos += 3;
	}
}
