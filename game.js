'use strict';

/*
  Let's Code BP! - Minesweeper Workshop

  You will need to code in this file, test results are displayed in the console.

  Board: 2d Array containing cells
  Example:
  [
  [{"nearbyMines":0},{"nearbyMines":1},{"nearbyMines":1}],
  [{"nearbyMines":0},{"nearbyMines":2},{"mine":true}],
  [{"nearbyMines":0},{"nearbyMines":2},{"mine":true}]
  ]

  Cell: object
  Properties:
    nearbyMines: Integer (0-8)
    mine: Boolean
    flag: Boolean
    shouldShow: Boolean
    reveal: Boolean
 */


//Before you go, in the order of the functions in JS does not matter, (I can call a function that I define later in the code) bcs of hoisting. Its a good practice to order your functions from the biggest to the smallest, deepen your knowledge about the code as you read further
//If you use a competent IDE (sorry not you Notepad++) you can Ctrl + click to a function name to jump on its implementation

function generateNewBoard(rowCount, columnCount, mineCountToGenerate) {
  /*
    IN: rowCount (integer), columnCount (integer), mineCountToGenerate (integer)
    OUT: board (2d array), contains cells (object) {mine: Boolean, Integer}
    DESC: Crerates a board, fills it with mines, and calculates nearby mine counts for cells
  */

  function calculateNearbyMinesForCell(cell, board) {
    return Object.assign(cell, calculateNearbyMines(cell.x, cell.y, board));
  }

  function calculateNearbyMinesForRow(row, board) {
    for (let cell of row) { // "let" binding is like "var" its just a little better... from ES5 using var is bad practice ("let" scope differs from "var")
      if (!isMine(cell)) {
        cell = calculateNearbyMinesForCell(cell, board);
      }
    }
  }

  function addMine(x, y) {
    return board[x][y] = { mine: true, x: x, y: y };
  }

  function createEmptyArray(rowCount, columnCount) {
    let board = [];
    for (let i = 0; i < rowCount; i++) {
      board.push([]);
      for (let j = 0; j < columnCount; j++) {
        board[i].push({ x: i, y: j });
      }
    }

    return board;
  }

  // create empty board
  let board = createEmptyArray(rowCount, columnCount);

  // add mines to the board
  let mineCoordinates = generateMineCoordinates(columnCount, rowCount, mineCountToGenerate);
  mineCoordinates.map(([x, y]) => addMine(x, y)); //"map" is like a "for" where I can get each element of a collection and do something with it, for every calculated mine, I add a new mine to the board

  // calculate nearby mine counts
  for (let row of board) {
    calculateNearbyMinesForRow(row, board);
  }

  return board;
}

function generateMineCoordinates(columns, rows, mineCountToGenerate) {
  /*
    IN: rowCount (integer), columnCount (integer), mineCountToGenerate (integer)
    OUT: mineCoordinates (array), contains coordinate of mines: [[3,4],[4,6]]
    DESC: Crerates an array, that contains the coordinates of all the mines. All mine have to be unique coordinate.
  */

  function calculateRandomCoordinate(columns, rows) { //Just generating a random coordinate
    return [Math.floor(Math.random() * rows), Math.floor(Math.random() * columns)]
  }

  function deepInclude(haystack, needle) { //Array includes wiht real equal not by reference... ([[1,2],[3,4]].includes([1,2]) === false bcs of reference, this will return true in the given case)
    for (let element of haystack) {
      if (element[0] === needle[0] && element[1] === needle[1]) {
        return true;
      }
    }
    return false;
  }

  let mineCoordinates = [];
  let possibleMineCoordinate;
  for (let i = 0; i < mineCountToGenerate; i++) {   // generate random coordinates until reach the necessary number of mines.
    do {
      possibleMineCoordinate = calculateRandomCoordinate(columns, rows);
    } while (deepInclude(mineCoordinates, possibleMineCoordinate));   // check if the new generated coordinate is unique
    mineCoordinates.push(possibleMineCoordinate);
  }

  return mineCoordinates;
}

function calculateNearbyMines(rowIndex, columnIndex, board) {
  /*
    IN: rowCount (integer), columnCount (integer), board (2d array)
    OUT: cell (object) posible value {"nearbyMines":0..8} or {"mine":true}
    DESC: Creates an object, that contains the information regarding one cell
  */

  let nearbyMinesCount = 0;
  for (let cell of getNearbyCells(rowIndex, columnIndex, board)) {   // Use getNearbyCells helper function to get all the nearby cells
    if (isMine(cell)) { // count the ones that have mines
      nearbyMinesCount++;
    }
  }

  return { nearbyMines: nearbyMinesCount };
}

function getNearbyCells(rowIndex, columnIndex, board) {
  /*
    IN: rowIndex (integer), columnIndex (integer), board (2d array)
    OUT: list of cells
    DESC: return cells that share an edge or a corner with the input cell
  */

  let nearbyCells = [];
  if (board[rowIndex + 1]) {
    nearbyCells.push(board[rowIndex + 1][columnIndex + 1]);
    nearbyCells.push(board[rowIndex + 1][columnIndex - 1]);
    nearbyCells.push(board[rowIndex + 1][columnIndex]);
  }

  if (board[rowIndex - 1]) {
    nearbyCells.push(board[rowIndex - 1][columnIndex + 1]);
    nearbyCells.push(board[rowIndex - 1][columnIndex]);
    nearbyCells.push(board[rowIndex - 1][columnIndex - 1]);
  }

  nearbyCells.push(board[rowIndex][columnIndex + 1]);
  nearbyCells.push(board[rowIndex][columnIndex - 1]);

  //Get every cell, even if its not exists (in the top row there is no top neighbour, but dont care)

  return nearbyCells.filter(cell => cell !== undefined); //Filter out the not existing cells, so only real neighbours remaining
}


function getNearbyHiddenEmptyCells(rowIndex, columnIndex, board) { //Get neighbours, but only those that is turned down and empty
  return getNearbyCells(rowIndex, columnIndex, board).filter(isHidden).filter(isEmptyCell);
}

function handleClick(event) {
  /*
    IN: event left click
    OUT: void
    DESC: based on mouse click's place recalculate table and render it
    SIDEEFFECT: re-renders the board
  */

  // use pixelToCoordinates helper to get the coordinate
  let [x, y] = pixelToCoordinates(event.offsetY, event.offsetX, config);

  //use the move function to evaluate the action
  move(x, y, board);

  //render the board
  render(board, config);
}

function handleRightClick(event) {
  /*
    IN: event right click
    OUT: void
    DESC: based on the mouse click's place toggle cell.flag if necessary
    SIDEEFFECT: re-renders the board
  */

  // hint event.preventDefault() could be useful

  function toggleFlag(x, y, board) {  //If the given cell is flagged as a bomb it will de-flag it. Else it will add a flag for the given cell
    board[x][y].flag = !board[x][y].flag;
  }

  event.preventDefault();

  let [x, y] = pixelToCoordinates(event.offsetY, event.offsetX, config);

  toggleFlag(x, y, board);
  render(board, config);
}

function move(x, y, board) {
  /*
    IN: x (integer), y (integer), board (2d array)
    OUT: board (2d array), contains cells (object) {mine: Boolean, Integer}
    DESC: apply changes to the game state based on the clicked cells content
  */

  board[x][y].shouldShow = true; //If we click on a given cell its 100% we want to show it
  if (isMine(board[x][y])) { //If its a mine then its bad for you
    showEverything();
    window.alert("Vesztettél! :(");
  } else {
    showNearbyCells(x, y, board);
  }
  render(board, config);
}

function turnCell(board, x, y) { //Turn up the cell. Reveal is needed for the recursion.
  board[x][y].shouldShow = true;
  board[x][y].reveal = true;
}


function isMine(cell) { //Mine means mine not mine.
  return cell.mine === true;
}

function isEmptyCell(cell) { // If there are no nearby mines then this cell is just a filler nobody cares about its existence :(
  return cell.nearbyMines === 0;
}

function isHidden(cell) { // We dont declare properties as default, so "shouldShow" property is undefined until its set for true
  return cell.shouldShow === undefined;
}

function showNearbyCells(x, y, board) { //Trick starts from here
  /*
    IN: x (integer), y (integer), board (2d array)
    OUT: board or void
    DESC: recrusivley check nearby cells and show them if empty
  */

  for (let cell of getNearbyHiddenEmptyCells(x, y, board)) { //Get every hidden cell that is empty and reveal it.. and then its empty hidden neighbours too
    if (!isMine(cell)) {
      turnCell(board, cell.x, cell.y);
      showNearbyCells(cell.x, cell.y, board);
    }
  }

  showReveledCellsBorder(board); //So much empty cells, but we actually need to reveal their non-empty neighbours bcs still nobody cares about empty cells. (If you comment out this line, you will see what I meant as "border")
}

function showReveledCellsBorder(board) { //Build a border and Mexico will pay for it
  for (let row of board) {
    for (let cell of row) {
      revealNeighbours(cell, board);
    }
  }
}

function revealNeighbours(cell, board) {
  if (cell.reveal) { //If this is a freshly revealed empty cell
    cell.reveal = false; //Becomes outdated, bcs we already dealt with it
    getNearbyCells(cell.x, cell.y, board).filter(cell => !isMine(cell)).map(cell => cell.shouldShow = true); //Reveal every not bomb neighbour. These cells are NOT emnpty, thats the difference.
  }
}


function showEverything() { //You lost anyway, at least have something
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      turnCell(board, i, j);
    }
  }
  render(board, config);
}

/*
 * Fished?
 * Congratulations!
 * If you have some time left, you can still improve it further! Some tips:
 *  - give a possibility to choose from game types at the beginning (ex.: easy, medium, hard)
 *  - show mines left
 *  - show time spent in game
 *  - give a possibility to start a new game
 *
 *  ... write a solver algorithm for it
 *  http://web.mat.bham.ac.uk/R.W.Kaye/minesw/ordmsw.htm
 *
 * Hope you've enjoyed the meetup!
 * We would appreciate your feedback.
 *
 *  _          _   _        _____          _        ____  _____  _
 * | |        | | ( )      / ____|        | |      |  _ \|  __ \| |
 * | |     ___| |_|/ ___  | |     ___   __| | ___  | |_) | |__) | |
 * | |    / _ \ __| / __| | |    / _ \ / _` |/ _ \ |  _ <|  ___/| |
 * | |___|  __/ |_  \__ \ | |___| (_) | (_| |  __/ | |_) | |    |_|
 * |______\___|\__| |___/  \_____\___/ \__,_|\___| |____/|_|    (_)
 */
