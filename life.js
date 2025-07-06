// @ts-check
// <reference path="./types.d.ts" />

/** Creates a game of life object.
 * @param {Config} config The configuration object.
 * @returns {GameOfLife} Game of life instance
 */
export function createGameOfLife(config) {
  const rows = Math.floor(config.height / config.cellSize);
  const cols = Math.floor(config.width / config.cellSize);

  /** @type {number[][]} */
  let grid = createEmptyGrid();
  let isRunning = false;
  /** @type {number | null} */
  let animationId = null;
  let generation = 0;
  let population = 0;

  /** @returns {number[][]} */
  function createEmptyGrid() {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 0),
    );
  }

  /** Randomizes the grid with the given density.
   * @param {number} [density] Probability of a cell being alive (0;1).
   */
  function randomizeGrid(density = config.initialDensity) {
    grid = grid.map((row) => row.map(() => (Math.random() < density ? 1 : 0)));
    generation = 0;
    population = countLiveCells();
  }

  function clearGrid() {
    grid = createEmptyGrid();
    generation = 0;
    population = 0;
  }

  /**
   * Adds a pattern to the grid.
   *
   * @param {string} pattern Pattern name from config
   * @param {number} x The x-coordinate of the pattern's center.
   * @param {number} y The y-coordinate of the pattern's center.
   * @returns {boolean} Whether the pattern was added successfully.
   */
  function addPattern(pattern, x = 0, y = 0) {
    if (!config.patterns[pattern]) return false;

    const patternCells = config.patterns[pattern].cells;
    patternCells.forEach(([px, py]) => {
      const nx = x + px;
      const ny = y + py;
      if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
        grid[ny][nx] = 1;
      }
    });

    return true;
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

  
   /** @returns {number[][]} */
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
    population = countLiveCells();
    return grid;
  }

  function countLiveCells() {
    return grid.reduce(
      (acc, row) => acc + row.reduce((acc, cell) => acc + cell, 0),
      0,
    );
  }

  return {
    getConfig: () => ({ ...config }),
    getGrid: () => grid,
    getGeneration: () => generation,
    getPopulation: () => population,
    randomizeGrid,
    clearGrid,
    addPattern,
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
  };
}
