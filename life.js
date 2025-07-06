/**
 * Creates a game of life object.
 * @param {number} width The width of the grid.
 * @param {number} height The height of the grid.
 * @param {number} cellSize The size of each cell.
 * @returns {object} An object with the following properties:
 *   - getGrid(): Returns the current grid.
 *   - getGeneration(): Returns the current generation.
 *   - randomizeGrid(): Randomizes the grid.
 *   - clearGrid(): Clears the grid.
 *   - nextGeneration(): Returns the next generation of the grid.
 *   - setRunning(running): Sets whether the game is running.
 *   - isRunning(): Returns whether the game is running.
 *   - setAnimationId(id): Sets the animation ID.
 *   - getAnimationId(): Returns the animation ID.
 *   - getRows(): Returns the number of rows in the grid.
 *   - getCols(): Returns the number of columns in the grid.
 *   - getCellSize(): Returns the size of each cell.
 */
export function createGameOfLife(width, height, cellSize) {
  const rows = Math.floor(height / cellSize);
  const cols = Math.floor(width / cellSize);
  const threshold = 0.7;

  let grid = createEmptyGrid();
  let generation = 0;
  let isRunning = false;
  let animationId = null;

  function createEmptyGrid() {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 0),
    );
  }

  function randomizeGrid() {
    grid = grid.map((row) =>
      row.map(() => (Math.random() > threshold ? 1 : 0)),
    );
    generation = 0;
  }

  function clearGrid() {
    grid = createEmptyGrid();
    generation = 0;
  }

  /**
   * Returns the next generation of the grid.
   *
   * @param {number} row The row of the cell to check.
   * @param {number} col The column of the cell to check.
   * @returns {number} The number of live neighbors.
   * */
  function countNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const neighborRow = row + i;
        const neighborCol = col + j;
        if (
          neighborRow >= 0 &&
          neighborRow < rows &&
          neighborCol >= 0 &&
          neighborCol < cols
        ) {
          count += grid[neighborRow][neighborCol];
        }
      }
    }
    return count;
  }

  function nextGeneration() {
    const newGrid = createEmptyGrid();

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < rows; j++) {
        const cell = grid[i][j];
        const neighbors = countNeighbors(i, j);

        if (cell === 1 && (neighbors < 2 || neighbors > 3)) {
          newGrid[i][j] = 0;
        } else if (cell === 0 && neighbors === 3) {
          newGrid[i][j] = 1;
        } else {
          newGrid[i][j] = cell;
        }
      }
    }

    grid = newGrid;
    generation++;
    return grid;
  }

  return {
    getGrid: () => grid,
    getGeneration: () => generation,
    randomizeGrid,
    clearGrid,
    nextGeneration,
    setRunning: (running) => {
      isRunning = running;
    },
    isRunning: () => isRunning,
    setAnimationId: (id) => {
      animationId = id;
    },
    getAnimationId: () => animationId,
    getRows: () => rows,
    getCols: () => cols,
    getCellSize: () => cellSize,
  };
}

