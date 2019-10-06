var cells = [];
var cellSize = 15;
var cellOffset = cellSize * 2;
var qBasis, rBasis;
var w = 10, h = 10, numMines = 10;
var qMin, qMax, rMin, rMax;

var imageSize = 10;
var assets = {}

var timer, time, flagsLeft = numMines;

function preload() {
	assets[1] = loadImage("assets/1.png");
	assets[2] = loadImage("assets/2.png");
	assets[3] = loadImage("assets/3.png");
	assets[4] = loadImage("assets/4.png");
	assets[5] = loadImage("assets/5.png");
	assets[6] = loadImage("assets/6.png");
	assets[8] = loadImage("assets/flag.png");
	assets[9] = loadImage("assets/mine.png");
}

function setup() {
	qBasis = createVector(cellSize * sqrt(3), 0);
	rBasis = createVector(cellSize * sqrt(3)/2, cellSize * 3/2);

	var cnv = createCanvas(600, 600);
	cnv.parent("hexsweeper");

	generateField();
	time = Date.now();
	timer = 0;
}

function draw() {
	//Update timer
	var deltaTime = Date.now() - time;
	time = Date.now();
	timer += deltaTime;
	var curTime = new Date(timer);
	var str = String("00" + curTime.getUTCHours()).slice(-2);
	str += ":" + String("00" + curTime.getUTCMinutes()).slice(-2);
	str += ":" + String("00" + curTime.getUTCSeconds()).slice(-2);
	document.getElementById("timer").textContent = str;

	// Update flags
	document.getElementById("flags").textContent = "Flags: " + flagsLeft;


	background(51);
	var axial = screenToAxial(mouseX, mouseY);
	var notRevealed = 0;
	for(var i = 0; i < cells.length; i++) {
		// Highlight cells on mouse hover if they aren't already revealed
		if(!cells[i].revealed) {
			notRevealed++;
			if(cells[i].r === axial.r && cells[i].q === axial.q) {
				cells[i].c = 200;
			} else {
				cells[i].c = 127;
			}
		}

		cells[i].draw();
	}

	if(notRevealed === numMines) { // Win *************
		onWin();
	}
}

function onWin() {
	for(var i = 0; i < cells.length; i++) {
		cells[i].flagged = false;
		cells[i].reveal();
	}
	alert("You Won");
}

function onLose() {
	for(var i = 0; i < cells.length; i++) {
		cells[i].flagged = false;
		cells[i].reveal();
	}
	alert("Game Over");
}

function generateField() {
	// Populate list
	cells = [];
	for(var r = 0; r < h; r++) {
		for(var q = qRange(r).min; q <= qRange(r).max; q++) {
			cells.push(new Cell(q, r));
		}
	}

	var randList = []
	for(var i = 0; i < cells.length; i++) {
		randList[i] = i;
	}
	for(var i = 0; i < randList.length; i++) {
		var randNum = floor(random(1) * cells.length);
		var temp = randList[i];
		randList[i] = randList[randNum];
		randList[randNum] = temp;
	}

	for(var i = 0; i < numMines; i++) {
		cells[randList[i]].type = 9; // Mine
	}

	for(var i = 0; i < cells.length; i++) {
		for(var j = 0; j < 6; j++) {
			var neighbor = cells[i].neighbor(j);
			if(neighbor !== undefined && neighbor.type === 9 && cells[i].type !== 9) {
				cells[i].type++;
			}
		}
	}
}

function mouseReleased() {
	var index = axialToIndex(screenToAxial(mouseX, mouseY));
	// console.log(index);
	if(index === undefined) return;

	if(mouseButton === LEFT) {
		if(keyIsPressed && keyCode === SHIFT) {
			if(!cells[index].revealed){
				cells[index].flagged = !cells[index].flagged;
				if(cells[index].flagged) {
					flagsLeft--;
				} else {
					flagsLeft++;
				}
			}
			return;
		}

		if(!cells[index].revealed) {
			if(!cells[index].flagged) {
				cells[index].reveal();
				if(cells[index].type === 9) { // Lose ****************
					onLose();
				}
			}
		}
	}
}

function screenToAxial(mx, my) {
	var x = mx - cellOffset;
	var y = my - cellOffset;
	var q = (x * sqrt(3)/3 - y / 3) / cellSize;
	var r = y * 2/3 / cellSize;

	return axialRound({q:q, r:r});
}

function axialRound(axial) {
	var q = axial.q;
	var r = axial.r;
	var s = -axial.r-axial.q;

	var rq = round(q);
	var rr = round(r);
	var rs = round(s);

	var qDiff = abs(rq - q)
	var rDiff = abs(rr - r)
	var sDiff = abs(rs - s)

	if(qDiff > rDiff && qDiff > sDiff) {
		rq = -rr-rs
	} else if(rDiff > sDiff) {
		rr = -rq-rs
	} else {
		rs = -rq-rr;
	}

	return {q:rq, r:rr};
}

function axialToIndex(axial) {
	var col = axial.q + floor(axial.r / 2);
	var row = axial.r;
	if(axial.r < 0 || axial.r >= h ||
	 axial.q < qRange(axial.r).min || axial.q > qRange(axial.r).max) {
		return undefined;
	} else {
		return row * w + col;
	}
}

// Returns the max & min 'q' for a given row
function qRange(r) {
	return {min: -floor(r / 2), max: w - floor(r / 2) - 1};
}

function resetGame() {
	// Reset the game
	console.log("Resetting...");
	switch(document.getElementById("difficulty").value) {
		case "easy":
			w = 10;
			h = 10;
			numMines = 10;
			break;
		case "medium":
			w = 20;
			h = 10;
			numMines = 35;
			break;
		case "hard":
			w = 21;
			h = 25;
			numMines = 120;
			break;
	}
	timer = 0;
	flagsLeft = numMines;
	generateField();
}
