//Minesweeper Main Javascript

//game size and amount of mines
var MINES = 20;
var BOARD_HEIGHT = 10;
var BOARD_WIDTH = 10;

//Game Variables for play squares
var BLANK_UP = 0;
var BLANK_DOWN = 1;
var MINE = 2;
var FLAG = 3;
var QUESTION = 4;

var flagsPlaced = 0;

var SIZE = 32;
var SPACE = 0;

//mine Array that stores positions of mines and the amount of mines next to every non-mine
var mineArray = [];

//Board state array that stores whether each square is clicked, a flag, a question mark, or blank
var gameStateArray = [];

//Array to store the amount of mines next to open mines
var nearMineArray = [];

//Stage Elements
var stage = document.querySelector("#field");
var main = document.querySelector('main');
var info = document.querySelector('#info');
var cellDiv = document.querySelector('.cell');
var timer = document.querySelector('#right');
var minesLeft = document.querySelector('#left');
var stageWrap = document.querySelector('#fieldWrap');

var heightForm = document.querySelector('#heightInput');
var widthForm = document.querySelector('#widthInput');
var minesForm = document.querySelector('#minesInput');
var startButton = document.querySelector('#startButton');


//Set height of stage
stage.style.height = BOARD_HEIGHT * SIZE + "px";
stage.style.width = BOARD_WIDTH * SIZE + "px";
main.style.width = BOARD_WIDTH * SIZE + 30 + "px";
info.style.width = BOARD_WIDTH * SIZE + 30 + "px";

// <--- Game Timer ---> //
var gameTimer = 
{
	time: 0,
	interval: undefined,

	start: function()
	{
		var self = this;
		this.interval = setInterval(function(){self.tick();}, 1000);
	},

	tick: function()
	{
		this.time++;
		timer.innerHTML = this.time;
	},
	stop: function()
	{
		clearInterval(this.interval)
	},
	reset: function()
	{
		this.time = 0;
	}
}


// <--- Start Functions ---> //

loadHandler();

function startGame()
{
	if( isNaN(heightForm.value) &&
		isNaN(widthForm.value) &&
		isNaN(minesForm.value))
	{
		alert("Please make sure all forms only contain numbers!");
		return false;
	}
	if(minesForm.value > (heightForm.value * widthForm.value))
	{
		alert("You can't have more mines than there is cells!");
		return false;
	}
	if(minesForm.value === "" && heightForm.value === "" && widthForm.value === "")
	{
		alert("Please enter a numeric value in each field!");
		return false;
	}

	MINES = minesForm.value;
	BOARD_WIDTH = widthForm.value;
	BOARD_HEIGHT = heightForm.value;

	stage.style.height = BOARD_HEIGHT * SIZE + "px";
	stage.style.width = BOARD_WIDTH * SIZE + "px";
	main.style.width = BOARD_WIDTH * SIZE + 30 + "px";
	main.style.height = BOARD_HEIGHT * SIZE + 32 + 30 + "px";
	info.style.width = BOARD_WIDTH * SIZE + 30 + "px";

	gameTimer.stop();
	gameTimer.reset();

	loadHandler();
}

function restartGame()
{
	gameTimer.stop();
	gameTimer.reset();

	loadHandler();
}

function cleanBoard()
{
	//mine Array that stores positions of mines and the amount of mines next to every non-mine
	mineArray = [];

	//Board state array that stores whether each square is clicked, a flag, a question mark, or blank
	gameStateArray = [];

	//Array to store the amount of mines next to open mines
	nearMineArray = [];

	render();
}

function loadHandler()
{
	cleanBoard();

	//Construct the arrays
	buildBoard();

	//start game Timer
	gameTimer.start();

	//render the playfield
	render();
}

function rightClickHandler(event)
{
	var WinAmt = 0;
	var overFlag = 0;
	var position = this.id;
	var arrayPos = position.split(",");
	var tempFlagsPlaced = 0;
	row = arrayPos[0];
	col = arrayPos[1];

	if(gameStateArray[row][col] === BLANK_UP)
	{
		gameStateArray[row][col] = FLAG;
	}
	else if(gameStateArray[row][col] === FLAG)
	{
		gameStateArray[row][col] = QUESTION;
	}
	else if(gameStateArray[row][col] === QUESTION)
	{
		gameStateArray[row][col] = BLANK_UP
	}

	for(var row = 0; row < gameStateArray.length; row++)
	{
		for(var col = 0; col < gameStateArray[row].length; col++)
		{
			if(gameStateArray[row][col] === FLAG && mineArray[row][col] === MINE)
			{
				WinAmt++;
			}
			if(	(gameStateArray[row][col] === FLAG && mineArray[row][col] !== MINE) || 
				(gameStateArray[row][col] === QUESTION && mineArray[row][col] !== MINE))
			{
				overFlag++;
			}

			if(gameStateArray[row][col] === FLAG)
			{
				tempFlagsPlaced++;
			}
		}
	}

	flagsPlaced = tempFlagsPlaced;
	tempFlagsPlaced = 0;

	render();

	if((WinAmt - overFlag) === parseInt(MINES))
	{
		winGame();
	}

	WinAmt = 0;
	overFlag = 0;
	tempFlagsPlaced = 0;
}

function clickHandler()
{
	var position = this.id;
	var arrayPos = position.split(",");
	row = arrayPos[0];
	col = arrayPos[1];

	center.src = "imgs/SuprisedSmily.svg";
	var happy = window.setTimeout( function(){center.src = "imgs/HappySmily.svg"}, 200);



	if(mineArray[row][col] === BLANK_UP && gameStateArray[row][col] === BLANK_UP)
	{
		gameStateArray[row][col] = BLANK_DOWN;

		if(nearMineArray[row][col] === 0)
		{
			zeroFind(row, col);
		}
	}
	else if(mineArray[row][col] === MINE && gameStateArray[row][col] === BLANK_UP)
	{
		gameStateArray[row][col] = MINE;
		clearTimeout(happy);
		endGame();
	}

	render();
}

//Function that finds all zeros next to each other and automaticly presses them
function zeroFind(row, col)
{
	var queueRow = [];
	var queueCol =[];

	var finRow = [];
	var finCol = [];

	var addToQueue = true;

	queueRow[0] = row;
	queueCol[0] = col;

	while(queueRow.length > 0)
	{

		//for each row starting 1 above row
		for(var rowAdd = -1; rowAdd <= 1; rowAdd++)
		{
			if(nearMineArray[(parseInt(rowAdd) + parseInt(queueRow[0]))] !== undefined)
			{
				for(var colAdd = -1; colAdd <= 1; colAdd++)
				{
					if(nearMineArray[parseInt(queueRow[0]) + parseInt(rowAdd)][parseInt(queueCol[0]) + parseInt(colAdd)] !== undefined)
					{

						gameStateArray[parseInt(queueRow[0]) + parseInt(rowAdd)][parseInt(queueCol[0]) + parseInt(colAdd)] = BLANK_DOWN;

						if(nearMineArray[parseInt(queueRow[0]) + parseInt(rowAdd)][parseInt(queueCol[0]) + parseInt(colAdd)] === 0)
						{
							for(var i = 0; i < finRow.length; i++)
							{
								if((parseInt(finRow[i]) === (parseInt(queueRow[0]) + parseInt(rowAdd))) && (parseInt(finCol[i]) === (parseInt(queueCol[0]) + parseInt(colAdd))))
								{
									addToQueue = false;
								}
							}
							for(var i = 0; i < queueRow.length; i++)
							{
								if((parseInt(queueRow[i]) === (parseInt(queueRow[0]) + parseInt(rowAdd))) && (parseInt(queueCol[i]) === (parseInt(queueCol[0]) + parseInt(colAdd))))
								{
									addToQueue = false;
								}
							}

							if(addToQueue)
							{
								queueRow.push(parseInt(queueRow[0]) + parseInt(rowAdd));
								queueCol.push(parseInt(queueCol[0]) + parseInt(colAdd));
							}
							addToQueue = true;
						}
					}
				}
			}
		}

		finRow.unshift(queueRow[0]);
		finCol.unshift(queueCol[0]);

		queueRow.splice(0,1);
		queueCol.splice(0,1);
	}
}

function winGame()
{
	for(var row = 0; row < BOARD_HEIGHT; row++)
	{
		for(var col = 0; col < BOARD_WIDTH; col++)
		{
			switch(mineArray[row][col])
			{
			case BLANK_UP:
				gameStateArray[row][col] = BLANK_DOWN;
				break;

			case MINE:
				if(gameStateArray[row][col] === FLAG && mineArray[row][col] === MINE)
				{
					gameStateArray[row][col] = FLAG;
				}
				else
				{
					gameStateArray[row][col] = MINE;
				}
				break;
			}
		}
	}

	gameTimer.stop();

	render();

	alert("You Win");
}

function endGame()
{
	for(var row = 0; row < BOARD_HEIGHT; row++)
	{
		for(var col = 0; col < BOARD_WIDTH; col++)
		{
			switch(mineArray[row][col])
			{
			case BLANK_UP:
				gameStateArray[row][col] = BLANK_DOWN;
				break;

			case MINE:
				if(gameStateArray[row][col] === FLAG && mineArray[row][col] === MINE)
				{
					gameStateArray[row][col] = FLAG;
				}
				else
				{
					gameStateArray[row][col] = MINE;
				}
				break;
			}
		}
	}

	center.src = "imgs/DeadSmily.svg";

	gameTimer.stop();
}

//Render the playing field

function render()
{

	//render number of mines - flags
	minesLeft.innerHTML = (parseInt(MINES) - parseInt(flagsPlaced));

	if(stage.hasChildNodes())
	{
		while (stage.hasChildNodes()) {
		   stage.removeChild(stage.lastChild);
		} 
	}

	//Construct the board with <img> tags
	for(var row = 0; row < gameStateArray.length; row++)
	{
		for(var col = 0; col < gameStateArray[row].length; col++)
		{
			//Crate an img tag for each square
			var cell = document.createElement("img");

			//Set class and ID for cell
			cell.setAttribute("ID", row + ',' + col);
			cell.setAttribute("class", "cell");

			//append the cell img tag to the stage
			stage.appendChild(cell);

			//Set image source

			switch(gameStateArray[row][col])
			{
				case BLANK_UP:
					cell.src = "imgs/Minesweeper_Blank_UP.png";
					break;

				case BLANK_DOWN:
					switch(nearMineArray[row][col])
					{
						case 0:
							cell.src = "imgs/Minesweeper_Zero.png";
							break;
						case 1:
							cell.src = "imgs/Minesweeper_One.png";
							break;
						case 2:
							cell.src = "imgs/Minesweeper_Two.png";
							break;
						case 3:
							cell.src = "imgs/Minesweeper_Three.png";
							break;
						case 4:
							cell.src = "imgs/Minesweeper_Four.png";
							break;
						case 5:
							cell.src = "imgs/Minesweeper_Five.png";
							break;
						case 6:
							cell.src = "imgs/Minesweeper_Six.png";
							break;
						case 7:
							cell.src = "imgs/Minesweeper_Seven.png";
							break;
						case 8:
							cell.src = "imgs/Minesweeper_Eight.png";
							break;
					};
					break;
					

				case MINE:
					cell.src = "imgs/Minesweeper_Mine.png";
					break;

				case FLAG:
					cell.src = "imgs/Minesweeper_Flag.png";
					break;

				case QUESTION:
					cell.src = "imgs/Minesweeper_Question.png";
					break;
			}

			//position img tag
			cell.style.top = row * SIZE + 32 + 15 + "px";
			cell.style.left = col * SIZE + 15 + "px";

			cell.addEventListener('contextmenu', rightClickHandler, false);
			cell.addEventListener('click', clickHandler, false);

			cell.oncontextmenu = function() {
				return false;
			}
		}
	}
}

function buildBoard()
{
	//Construct three boards the exact same height and width
	for(var row = 0; row < BOARD_HEIGHT; row++)
	{
		gameStateArray[row] = [];
		mineArray[row] = [];
		nearMineArray[row] = [];
		for(var col = 0; col < BOARD_WIDTH; col++)
		{
			gameStateArray[row][col] = 0;
			mineArray[row][col] = 0;
			nearMineArray[row][col] = 0;
		}
	}

	MINEStemp = MINES;
	// Place randomly the number of mines into the mineArray
	while(MINEStemp > 0)
	{
		var randomRow = undefined;
		var randomCol = undefined;

		randomRow = Math.floor(Math.random() * BOARD_HEIGHT);
		randomCol = Math.floor(Math.random() * BOARD_WIDTH);

		if(mineArray[randomRow][randomCol] === 0)
		{
			mineArray[randomRow][randomCol] = MINE;
			MINEStemp--;
		}
	}

	//Check the mineArray to create the nearMineArray
	for(var row = 0; row < mineArray.length; row++)
	{
		for(var col = 0; col < mineArray[row].length; col++)
		{
			if(mineArray[row][col] === MINE)
			{
				nearMineArray[row][col] = 9;
			}

			if(mineArray[row][col] === 0)
			{
			for(var rowAdd = -1; rowAdd <= 1; rowAdd++)
				{
					if(mineArray[(parseInt(rowAdd) + parseInt(row))] !== undefined)
					{
						for(var colAdd = -1; colAdd <= 1; colAdd++)
						{
							if(mineArray[parseInt(row) + parseInt(rowAdd)][parseInt(col) + parseInt(colAdd)] !== undefined)
							{
								if(mineArray[parseInt(row) + parseInt(rowAdd)][parseInt(col) + parseInt(colAdd)] === MINE)
								{
									nearMineArray[row][col]++;
								}
							}
						}
					}
				}
			}
		}
	}
}