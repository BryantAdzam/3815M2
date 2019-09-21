var gameEle = document.getElementsByClassName('game')[0],
    returnEle = document.getElementsByClassName('return')[0],
    endEle = document.getElementsByClassName('end')[0],
    resultEle = document.getElementsByClassName('result')[0],
    newGameEle = document.getElementsByClassName('newGame')[0],
    restartGameEle = document.getElementsByClassName('restart')[0];
var chooseEle = document.getElementsByClassName('choose')[0],
    levelEle = chooseEle.getElementsByTagName('li'),
    len = levelEle.length;  //Get difficulty selection button DOM element
var levels = { //Difficulty level template
    0: { row: 9, col: 9, mines: 10 },
    1: { row: 16, col: 16, mines: 40 },
    2: { row: 22, col: 22, mines: 99 }
}
var mineMapper = [], //Game data
    EleState = [],
    level = 0;
row = 0,
    col = 0,
    cells = 0, //Total number of grids
    mines = 0,
    minesLeft = 0,
    isTimer = false,
    timerHandle = null;
var colors = [, '#00deff', '#00ffa8', '#00ff2a', '#ffea00', '#ff8a00', '#ff00b4', '#ae00ff', '#ff0000']
//Game initialization
function init(l) {
    level = l;
    var le = levels[l]; //Get difficulty level
    //Coordinate random number
    function random(num) {
        return Math.floor(Math.random() * num)
    }
    //Calculate the total number of mines around the grid
    function mineCount() {
        var len = arguments.length,
            count = 0;
        for (var i = 0; i < len; i++) {
            if (arguments[i] == '*') {
                count++;
            }
        }
        return count;
    }

    row = le.row;
    col = le.col;
    mines = le.mines;
    minesLeft = mines;
    cells = row * col;
    for (var i = -1; i <= row; i++) { //Create a two-dimensional array; add one circle to the boundary, no error is reported when counting the super-boundary
        mineMapper[i] = [];
        for (var j = -1; j <= col; j++)
            mineMapper[i][j] = 0;
    }
    for (var i = 0; i < mines; i++) { //Randomly placed in mines
        var x = random(row),
            y = random(col);
        mineMapper[x][y] == '*' ? i-- : mineMapper[x][y] = '*';
    }
    for (var i = 0; i < row; i++) { //Traverse a two-dimensional array and insert numbers around the mine
        for (var j = 0; j < col; j++) {
            if (mineMapper[i][j] != '*') {
                var lt = mineMapper[i - 1][j - 1],
                    t = mineMapper[i - 1][j],
                    rt = mineMapper[i - 1][j + 1],
                    l = mineMapper[i][j - 1],
                    r = mineMapper[i][j + 1],
                    lb = mineMapper[i + 1][j - 1],
                    b = mineMapper[i + 1][j],
                    rb = mineMapper[i + 1][j + 1];
                mineMapper[i][j] = mineCount(lt, t, rt, l, r, lb, b, rb)
            }
        }
    }
    gameStart();
}
//Games start
function gameStart() {
    var timeArea = document.getElementsByClassName('time')[0];
    timeArea.innerText = '00:00';
    isTimer = false;
    function open(x, y) {//Open the grid
        if (x >= 0 && x < row && y >= 0 && y < col && EleState[x][y].className == 'cell') {
            EleState[x][y].className = 'cell o';
            cells--;
            if (mineMapper[x][y] == 0) {
                open(x - 1, y - 1);
                open(x - 1, y);
                open(x - 1, y + 1);
                open(x, y - 1);
                open(x, y + 1);
                open(x + 1, y - 1);
                open(x + 1, y);
                open(x + 1, y + 1);
            } else {
                EleState[x][y].innerText = mineMapper[x][y];
                if (mineMapper[x][y] == '*') {
                    EleState[x][y].className = 'cell gg';
                    EleState[x][y].innerText = '';
                    gameEnd(false);
                } else {
                    EleState[x][y].style.color = colors[mineMapper[x][y]];
                }
            }
        }
        if (cells == mines) {
            gameEnd(true);
        }
    }
    function mark(x, y) { //Marker grid
        switch (EleState[x][y].className) {
            case 'cell':
                EleState[x][y].className = 'cell m1';
                minesLeft--;
                showMinesLeft();
                break;
            case 'cell m1':
                EleState[x][y].className = 'cell m2';
                minesLeft++;
                showMinesLeft();
                break;
            case 'cell m2':
                EleState[x][y].className = 'cell';
                break;
            default: ;
        }
    }
    function showMinesLeft() {
        document.getElementsByClassName('mineLeft')[0].innerText = minesLeft;
    }
    function timer() { //Timer accurate correction
        var firstTime = new Date().getTime();
        var t = setInterval(function () {
            var lastTime = new Date().getTime(),
                count = Math.round((lastTime - firstTime) / 1000),
                seconds = count % 60,
                minutes = Math.floor(count / 60),
                str = '';
            seconds = seconds < 10 ? '0' + seconds : seconds;
            str = minutes < 10 ? '0' + minutes + ':' + seconds : minutes + ':' + seconds;
            timeArea.innerText = str;
        }, 1000)
        return t;
    }

    createEle();
    showMinesLeft();
    var boadEle = document.getElementsByClassName('boad')[0];
    addEvent(boadEle, 'touchstart', function (e) { //Click on the grid mobile
        var ele = e.target;
        if (ele != this && e.touches.length == 1) {
            var order = JSON.parse(ele.getAttribute('order')),
                optEle = document.createElement('div');
            optEle.className = 'options';
            ele.appendChild(optEle);
            optEle.style.top = getStyle(ele, 'height');
            if (order.y <= col / 2) {
                optEle.style.left = 0;
            } else {
                optEle.style.right = 0;
            }
        }
    });
    addEvent(boadEle, 'touchend', function (e) { //Click on the grid mobile
        var ele = e.target;
        var optEle = document.getElementsByClassName('options')[0],
            order = JSON.parse(ele.getAttribute('order')),
            xx = order.x,
            yy = order.y;
        var x = e.changedTouches[0].pageX;
        var y = e.changedTouches[0].pageY;
        var p = optEle.getBoundingClientRect();

        if (y > p.top && y < p.bottom && EleState[xx][yy].className != 'cell o') {
            if (EleState[xx][yy].className == 'cell m1') {
                minesLeft++;
                showMinesLeft();
            }
            if (x > p.left && x < p.left + 50) {
                if (EleState[xx][yy].className != 'cell') {
                    EleState[xx][yy].className = 'cell';
                }
                open(xx, yy);
            } else if (x > p.left + 50 && x < p.left + 100) {
                EleState[xx][yy].className = 'cell m1';
                minesLeft--;
                showMinesLeft();
            } else if (x > p.left + 100 && x < p.right) {
                EleState[xx][yy].className = 'cell m2';
            }
            if (!isTimer) {
                timerHandle = timer();//First effective click to start the timer
                isTimer = true;
            }
        }
        optEle.remove();
        cancelHandler(e);
    });
    addEvent(boadEle, 'mousedown', function (e) { //Click on the grid PC side
        var ele = e.target,
            type = e.which;
        if (ele != this) {
            if (!isTimer) {
                timerHandle = timer();//First effective click to start the timer
                isTimer = true;
            }
            var order = JSON.parse(ele.getAttribute('order')),
                x = order.x,
                y = order.y;
            if (type == 1) {
                open(x, y)
            } else if (type == 3) {
                mark(x, y)
            }

        }
    });
}
//New element added to page 
function createEle() {
    var boadEle = document.createElement('div'),
        cellEle = document.createElement('div');
    var cellSize = (getScollSize().w - 30) / row;

    cellSize = cellSize > 40 ? 40 : cellSize;
    chooseEle.style.display = 'none';
    gameEle.style.display = 'block';
    boadEle.className = 'boad';
    gameEle.appendChild(boadEle);
    boadEle.style.width = cellSize * col + 'px';
    boadEle.style.height = cellSize * row + 'px';
    var margin = (getScollSize().h - 70 - parseInt(getStyle(boadEle, 'height'))) / 2 + 'px';
    boadEle.style.marginTop = gameEle.style.paddingBottom = margin;
    cellEle.className = 'cell';
    cellEle.style.width = cellEle.style.height = cellSize + 'px';
    cellEle.style.lineHeight = cellSize + 2 + 'px';
    for (var i = 0; i < row; i++) { //Create a DOM two-dimensional array 
        EleState[i] = [];
        for (var j = 0; j < col; j++) {
            EleState[i][j] = cellEle.cloneNode(true);
            EleState[i][j].setAttribute('order', '{"x":' + i + ', "y":' + j + '}');
            boadEle.appendChild(EleState[i][j]);
        }
    }
}
//Clean up the game
function clearGame() {
    mineMapper = [];
    EleState = [];
    cells = 0;
    row = 0;
    col = 0;
    mines = 0;
    minesLeft = 0;
    isTimer = false;
    clearInterval(timerHandle);
    document.getElementsByClassName('boad')[0].remove();
}
//Home
function returnIndex() {
    clearGame();
    gameEle.style.display = 'none';
    chooseEle.style.display = 'block';
    endEle.style.display = 'none';
}

//Show all mines when the game fails
function showAllMine() {
    for (var i = 0; i < row; i++) {
        for (var j = 0; j < col; j++) {
            if (mineMapper[i][j] == '*') {
                EleState[i][j].className = 'cell gg';
            }
        }
    }
}
//game over
function gameEnd(iswin) {
    showAllMine();
    clearInterval(timerHandle);
    minesLeft = mines;
    cells = row * col;
    endEle.style.display = 'block';
    if (iswin) {
        resultEle.innerText = 'Victory';
    } else {
        resultEle.innerText = 'game over';
    }

}

// ------------------------------Main program--------------------------//
document.addEventListener('touchmove', function (e) { //Block mobile default events
    cancelHandler(e);
}, { passive: false });
document.addEventListener('touchstart', function (e) {
    cancelHandler(e);
}, { passive: false });
addEvent(document, 'contextmenu', function (e) { //Block right click menu events
    cancelHandler(e);
    return false;
});
for (var i = 0; i < len; i++) { //Start game button binding event 
    (function (i) {
        addEvent(levelEle[i], 'touchstart', function () {
            init(i);
        });
        addEvent(levelEle[i], 'click', function () {
            init(i);
        });
    }(i))
};
addEvent(returnEle, 'click', function () {
    returnIndex()
});
addEvent(newGameEle, 'click', function () {
    returnIndex()
});
addEvent(restartGameEle, 'click', function () {
    document.getElementsByClassName('boad')[0].remove();
    endEle.style.display = 'none';
    gameStart();
});
//Mobile binding event
addEvent(returnEle, 'touchstart', function () {
    returnIndex()
});
addEvent(newGameEle, 'touchstart', function () {
    returnIndex()
});
addEvent(restartGameEle, 'touchstart', function () {
    document.getElementsByClassName('boad')[0].remove();
    endEle.style.display = 'none';
    gameStart();
});
