"use strict";
/**========================================================================
 *!                                  INTERFACES
 *========================================================================**/
/**========================================================================
 *!                                  VARIABLES
 *========================================================================**/
//Canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;
//Paddles
const paddleHeight = 100;
const paddleWidth = 5;
//game
const game = {
    player1: {
        y: canvasHeight / 2 - paddleHeight / 2,
        movingUp: false,
        movingDown: false,
        speed: 5
    },
    player2: {
        y: canvasHeight / 2 - paddleHeight / 2,
        movingUp: false,
        movingDown: false,
        speed: 5
    },
    ball: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: 5,
        speed: {
            x: 2,
            y: 2
        }
    }
};
//score
let player1Score = 0;
let player2Score = 0;
/**========================================================================
 *!                                  FUNCTIONS
 *========================================================================**/
function draw() {
    //field
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    //middle line
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    //players
    ctx.fillStyle = 'white';
    ctx.fillRect(0, game.player1.y, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth, game.player2.y, paddleWidth, paddleHeight);
    //ball
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.arc(game.ball.x, game.ball.y, game.ball.r, 0, Math.PI * 2, false);
    ctx.fill();
}
function movePlayer(player) {
    if (player.movingUp && player.y > 0)
        player.y -= player.speed;
    if (player.movingDown && player.y + paddleHeight < canvasHeight)
        player.y += player.speed;
}
function moveBall() {
    //rebounds on top and bottom
    if (game.ball.y > canvas.height || game.ball.y < 0)
        game.ball.speed.y *= -1;
    if (game.ball.x > canvas.width - paddleWidth)
        collide(game.player2);
    else if (game.ball.x < paddleWidth)
        collide(game.player1);
    game.ball.x += game.ball.speed.x;
    game.ball.y += game.ball.speed.y;
}
function collide(player) {
    //player missed the ball
    if (game.ball.y < player.y || game.ball.y > player.y + paddleHeight) {
        game.ball.x = canvas.width / 2;
        game.ball.y = canvas.height / 2;
        game.player1.y = canvas.height / 2 - paddleHeight / 2;
        game.player2.y = canvas.height / 2 - paddleHeight / 2;
        game.ball.speed.x = 2;
    }
    else
        game.ball.speed.x *= -1.2;
}
function play() {
    //players
    movePlayer(game.player1);
    movePlayer(game.player2);
    //ball
    moveBall();
}
function gameLoop() {
    play();
    draw();
    requestAnimationFrame(gameLoop);
}
document.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key === "W")
        game.player1.movingUp = true;
    if (e.key === "s" || e.key === "S")
        game.player1.movingDown = true;
    if (e.key === "o" || e.key === "O")
        game.player2.movingUp = true;
    if (e.key === "l" || e.key === "L")
        game.player2.movingDown = true;
});
document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "W")
        game.player1.movingUp = false;
    if (e.key === "s" || e.key === "S")
        game.player1.movingDown = false;
    if (e.key === "o" || e.key === "O")
        game.player2.movingUp = false;
    if (e.key === "l" || e.key === "L")
        game.player2.movingDown = false;
});
gameLoop();
