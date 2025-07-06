import { createGameOfLife } from "./life.js";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const clearBtn = document.getElementById("clearBtn");
  const randomBtn = document.getElementById("randomBtn");

  const cellSize = 10;
  const game = createGameOfLife(canvas.width, canvas.height, cellSize);

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellSize = game.getCellSize();

    for (let i = 0; i < game.getRows(); i++) {
      for (let j = 0; j < game.getCols(); j++) {
        if (game.getGrid()[i][j] === 1) {
          ctx.fillStyle = "black";
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }

        ctx.strokeStyle = "#ddd";
        ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }

    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(`Generation: ${game.getGeneration()}`, 10, 20);
  }

  function animate() {
    game.nextGeneration();
    drawGrid();
    game.setAnimationId(requestAnimationFrame(animate));
  }

  canvas.addEventListener("click", (e) => {
    if (game.isRunning()) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellSize = game.getCellSize();
    const grid = game.getGrid();

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    grid[row][col] = !grid[row][col];
    drawGrid();
  });

  startBtn.addEventListener("click", () => {
    if (!game.isRunning()) {
      game.setRunning(true);
      animate();
    }
  });

  stopBtn.addEventListener("click", () => {
    if (game.isRunning()) {
      cancelAnimationFrame(game.getAnimationId());
      game.setRunning(false);
    }
  });

  clearBtn.addEventListener("click", () => {
    if (game.isRunning()) {
      cancelAnimationFrame(game.getAnimationId());
      game.setRunning(false);
    }
    game.clearGrid();
    drawGrid();
  });

  randomBtn.addEventListener("click", () => {
    if (game.isRunning()) {
      cancelAnimationFrame(game.getAnimationId());
      game.setRunning(false);
    }
    game.randomizeGrid();
    drawGrid();
  });

  drawGrid();
});
