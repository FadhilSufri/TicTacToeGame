// options.js
// SELECT START ELEMENT
const options = document.querySelector(".options");

// SELECT BUTTONS
const aiBtn = document.querySelector(".ai");
const humanBtn = document.querySelector(".human");
const lightBtn = document.querySelector(".yoda");
const darkBtn = document.querySelector(".vader");
const playBtn = document.querySelector(".play");

// GAME OVER ELEMENT
const gameOverElement = document.querySelector(".gameover");

const player = new Object();
let OPPONENT;

darkBtn.addEventListener("click", function () {
  player.man = "vader";
  player.ai = "yoda";
  player.human = "yoda";

  switchActive(lightBtn, darkBtn);
});

lightBtn.addEventListener("click", function () {
  player.man = "yoda";
  player.ai = "vader";
  player.human = "vader";

  switchActive(darkBtn, lightBtn);
});

aiBtn.addEventListener("click", function () {
  OPPONENT = "ai";
  switchActive(humanBtn, aiBtn);
});

humanBtn.addEventListener("click", function () {
  OPPONENT = "human";
  switchActive(aiBtn, humanBtn);
});

playBtn.addEventListener("click", function () {
  if (!OPPONENT) {
    aiBtn.style.backgroundColor = "red";
    humanBtn.style.backgroundColor = "red";
    return;
  }

  if (!player.man) {
    darkBtn.style.backgroundColor = "red";
    lightBtn.style.backgroundColor = "red";
    return;
  }

  init(player, OPPONENT);
  options.classList.add("hide");
});

function switchActive(off, on) {
  off.classList.remove("active");
  on.classList.add("active");
}

// game.js
function init(player, OPPONENT) {
  // SELECT CANVAS
  const canvas = document.getElementById("cvs");
  const ctx = canvas.getContext("2d");

  // BOARD VARIABLES
  let board = [];
  const COLUMN = 3;
  const ROW = 3;
  const SPACE_SIZE = 150;

  // STORE PLAYER'S MOVES
  let gameData = new Array(9);

  // By default the first player to play is the human
  let currentPlayer = player.man;

  // load yoda & vader images
  const yodaImage = new Image();
  yodaImage.src = "img/yoda.png";

  const vaderImage = new Image();
  vaderImage.src = "img/vader.png";

  // Win combinations
  const COMBOS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // FOR GAME OVER CHECK
  let GAME_OVER = false;

  // DRAW THE BOARD
  function drawBoard() {
    // WE give every space a unique id
    // So we know exactly where to put the player's move on the gameData Array
    let id = 0;
    for (let i = 0; i < ROW; i++) {
      board[i] = [];
      for (let j = 0; j < COLUMN; j++) {
        board[i][j] = id;
        id++;

        // draw the spaces
        ctx.strokeStyle = "#000";
        ctx.strokeRect(j * SPACE_SIZE, i * SPACE_SIZE, SPACE_SIZE, SPACE_SIZE);
      }
    }
  }
  drawBoard();

  // ON PLAYER'S CLICK
  canvas.addEventListener("click", function (event) {
    // IF IT's A GAME OVER? EXIT
    if (GAME_OVER) return;

    // X & Y position of mouse click relative to the canvas
    let X = event.clientX - canvas.getBoundingClientRect().x;
    let Y = event.clientY - canvas.getBoundingClientRect().y;

    // WE CALCULATE i & j of the clicked SPACE
    let i = Math.floor(Y / SPACE_SIZE);
    let j = Math.floor(X / SPACE_SIZE);

    // Get the id of the space the player clicked on
    let id = board[i][j];

    // Prevent the player to play the same space twice
    if (gameData[id]) return;

    // store the player's move to gameData
    gameData[id] = currentPlayer;

    // draw the move on board
    drawOnBoard(currentPlayer, i, j);

    // Check if the play wins
    if (isWinner(gameData, currentPlayer)) {
      showGameOver(currentPlayer);
      GAME_OVER = true;
      return;
    }

    // check if it's a tie game
    if (isTie(gameData)) {
      showGameOver("tie");
      GAME_OVER = true;
      return;
    }

    if (OPPONENT == "ai") {
      // get id of space using minimax algorithm
      let id = minimax(gameData, player.ai).id;

      // store the player's move to gameData
      gameData[id] = player.ai;

      // get i and j of space
      let space = getIJ(id);

      // draw the move on board
      drawOnBoard(player.ai, space.i, space.j);

      // Check if the play wins
      if (isWinner(gameData, player.ai)) {
        showGameOver(player.ai);
        GAME_OVER = true;
        return;
      }

      // check if it's a tie game
      if (isTie(gameData)) {
        showGameOver("tie");
        GAME_OVER = true;
        return;
      }
    } else {
      // GIVE TURN TO THE OTHER PLAYER
      currentPlayer = currentPlayer == player.man ? player.human : player.man;
    }
  });

  // MINIMAX
  function minimax(gameData, PLAYER) {
    // BASE
    if (isWinner(gameData, player.ai)) return { evaluation: +10 };
    if (isWinner(gameData, player.man)) return { evaluation: -10 };
    if (isTie(gameData)) return { evaluation: 0 };

    // LOOK FOR EMTY SPACES
    let EMPTY_SPACES = getEmptySpaces(gameData);

    // SAVE ALL MOVES AND THEIR EVALUATIONS
    let moves = [];

    // LOOP OVER THE EMPTY SPACES TO EVALUATE THEM
    for (let i = 0; i < EMPTY_SPACES.length; i++) {
      // GET THE ID OF THE EMPTY SPACE
      let id = EMPTY_SPACES[i];

      // BACK UP THE SPACE
      let backup = gameData[id];

      // MAKE THE MOVE FOR THE PLAYER
      gameData[id] = PLAYER;

      // SAVE THE MOVE'S ID AND EVALUATION
      let move = {};
      move.id = id;
      // THE MOVE EVALUATION
      if (PLAYER == player.ai) {
        move.evaluation = minimax(gameData, player.man).evaluation;
      } else {
        move.evaluation = minimax(gameData, player.ai).evaluation;
      }

      // RESTORE SPACE
      gameData[id] = backup;

      // SAVE MOVE TO MOVES ARRAY
      moves.push(move);
    }

    // MINIMAX ALGORITHM
    let bestMove;

    if (PLAYER == player.ai) {
      // MAXIMIZER
      let bestEvaluation = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].evaluation > bestEvaluation) {
          bestEvaluation = moves[i].evaluation;
          bestMove = moves[i];
        }
      }
    } else {
      // MINIMIZER
      let bestEvaluation = +Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].evaluation < bestEvaluation) {
          bestEvaluation = moves[i].evaluation;
          bestMove = moves[i];
        }
      }
    }

    return bestMove;
  }

  // GET EMPTY SPACES
  function getEmptySpaces(gameData) {
    let EMPTY = [];

    for (let id = 0; id < gameData.length; id++) {
      if (!gameData[id]) EMPTY.push(id);
    }

    return EMPTY;
  }

  // GET i AND j of a SPACE
  function getIJ(id) {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] == id) return { i: i, j: j };
      }
    }
  }

  // check for a winner
  function isWinner(gameData, player) {
    for (let i = 0; i < COMBOS.length; i++) {
      let won = true;

      for (let j = 0; j < COMBOS[i].length; j++) {
        let id = COMBOS[i][j];
        won = gameData[id] == player && won;
      }

      if (won) {
        return true;
      }
    }
    return false;
  }

  // Check for a tie game
  function isTie(gameData) {
    let isBoardFill = true;
    for (let i = 0; i < gameData.length; i++) {
      isBoardFill = gameData[i] && isBoardFill;
    }
    if (isBoardFill) {
      return true;
    }
    return false;
  }

  // SHOW GAME OVER
  function showGameOver(player) {
    let message = player == "tie" ? "Its a" : "The Winner is";
    let imgSrc = `img/${player}.png`;

    gameOverElement.innerHTML = `
              <h1>${message}</1>
              <img class="winner-img" src=${imgSrc} </img>
              <div class="play" onclick="location.reload()">Play Again!</div>
          `;

    gameOverElement.classList.remove("hide");
  }

  // draw on board
  function drawOnBoard(player, i, j) {
    let img = player == "yoda" ? yodaImage : vaderImage;

    // the x,y positon of the image are the x,y of the clicked space
    ctx.drawImage(img, j * SPACE_SIZE, i * SPACE_SIZE);
  }
}
