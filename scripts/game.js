import { deepClone } from "./utils.js";

export class Game {
  constructor(rowsCount, columnsCount, elementsCount) {
    this.rowsCount = rowsCount;
    this.columnsCount = columnsCount;
    this.elementsCount = elementsCount;

    this.targetTile = 1; // 🔁 Теперь отслеживается tile1
    this.totalRemovedTargetTile = 0;
    this.targetTilePairsCount = 0;

    this.init();
  }

  init() {
    this.score = 0;
    this.matrix = Array(this.rowsCount).fill().map(() => new Array(this.columnsCount).fill(null));

    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        do {
          this.matrix[row][column] = this.getRandomValue();
        } while (this.isRow(row, column));
      }
    }
  }

  getRandomValue() {
    return Math.floor(Math.random() * this.elementsCount) + 1;
  }

  isRow(row, column) {
    return this.isVerticalRow(row, column) || this.isHorizontalRow(row, column);
  }

  isVerticalRow(row, column) {
    const absValue = Math.abs(this.matrix[row][column]);
    let elementsInRow = 1;

    let currentRow = row - 1;
    while (currentRow >= 0 && Math.abs(this.matrix[currentRow][column]) === absValue) {
      elementsInRow++;
      currentRow--;
    }

    currentRow = row + 1;
    while (currentRow <= this.rowsCount - 1 && Math.abs(this.matrix[currentRow][column]) === absValue) {
      elementsInRow++;
      currentRow++;
    }

    return elementsInRow >= 3;
  }

  isHorizontalRow(row, column) {
    const absValue = Math.abs(this.matrix[row][column]);
    let elementsInRow = 1;

    let currentColumn = column - 1;
    while (currentColumn >= 0 && Math.abs(this.matrix[row][currentColumn]) === absValue) {
      elementsInRow++;
      currentColumn--;
    }

    currentColumn = column + 1;
    while (currentColumn <= this.columnsCount - 1 && Math.abs(this.matrix[row][currentColumn]) === absValue) {
      elementsInRow++;
      currentColumn++;
    }

    return elementsInRow >= 3;
  }

  swap(firstElement, secondElement) {
    this.swap2Elements(firstElement, secondElement);
    const isRowWithFisrtElement = this.isRow(firstElement.row, firstElement.column);
    const isRowWithSecondElement = this.isRow(secondElement.row, secondElement.column);
    if (!isRowWithFisrtElement && !isRowWithSecondElement) {
      this.swap2Elements(firstElement, secondElement);
      return null;
    }

    const swapStates = [];
    let removedElements = 0;

    do {
      removedElements = this.removeAllRows();

      if (removedElements > 0) {
        this.score += removedElements;
        swapStates.push(deepClone(this.matrix));
        this.dropElements();
        this.fillBlanks();
        swapStates.push(deepClone(this.matrix));
      }
    } while (removedElements > 0);

    return swapStates;
  }

  swap2Elements(firstElement, secondElement) {
    const temp = this.matrix[firstElement.row][firstElement.column];
    this.matrix[firstElement.row][firstElement.column] = this.matrix[secondElement.row][secondElement.column];
    this.matrix[secondElement.row][secondElement.column] = temp;
  }

  removeAllRows() {
    const toRemove = new Set();
    const targetTileCountedPositions = new Set();
    const groupsCounted = new Set();

    for (let row = 0; row < this.rowsCount; row++) {
      for (let col = 0; col < this.columnsCount; col++) {
        const vertical = this.getRowTiles(row, col, true);
        if (vertical.length >= 3) {
          vertical.forEach(pos => toRemove.add(`${pos.row},${pos.col}`));
          if (vertical.some(p => this.matrix[p.row][p.col] === this.targetTile)) {
            const groupKey = vertical.map(p => `${p.row},${p.col}`).sort().join("-");
            if (!groupsCounted.has(groupKey)) {
              this.targetTilePairsCount++;
              groupsCounted.add(groupKey);
            }
          }
        }

        const horizontal = this.getRowTiles(row, col, false);
        if (horizontal.length >= 3) {
          horizontal.forEach(pos => toRemove.add(`${pos.row},${pos.col}`));
          if (horizontal.some(p => this.matrix[p.row][p.col] === this.targetTile)) {
            const groupKey = horizontal.map(p => `${p.row},${p.col}`).sort().join("-");
            if (!groupsCounted.has(groupKey)) {
              this.targetTilePairsCount++;
              groupsCounted.add(groupKey);
            }
          }
        }
      }
    }

    for (const key of toRemove) {
      const [row, col] = key.split(",").map(Number);
      if (this.matrix[row][col] === this.targetTile) {
        targetTileCountedPositions.add(key);
      }
      this.matrix[row][col] = -Math.abs(this.matrix[row][col]);
    }

    this.removeMarkedElements();
    return this.calculateRemovedElements();
  }

  markElementToRemoveFor(row, column) {
    if (this.isRow(row, column)) {
      const value = Math.abs(this.matrix[row][column]);

      let vertical = this.getRowTiles(row, column, true).filter(pos => Math.abs(this.matrix[pos.row][pos.col]) === this.targetTile);
      let horizontal = this.getRowTiles(row, column, false).filter(pos => Math.abs(this.matrix[pos.row][pos.col]) === this.targetTile);
      const allMatches = [...new Set([...vertical, ...horizontal].map(p => `${p.row},${p.col}`))];

      if (value === this.targetTile && allMatches.length >= 3) {
        this.targetTilePairsCount++;
      }

      this.matrix[row][column] = -value;
    }
  }

  removeMarkedElements() {
    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        const val = this.matrix[row][column];
        if (val < 0) {
          if (Math.abs(val) === this.targetTile) {
            this.totalRemovedTargetTile++;
          }
          this.matrix[row][column] = null;
        }
      }
    }
  }

  calculateRemovedElements() {
    let count = 0;
    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        if (this.matrix[row][column] === null) count++;
      }
    }
    return count;
  }

  dropElements() {
    for (let column = 0; column < this.columnsCount; column++) {
      this.dropElementsInColumn(column);
    }
  }

  dropElementsInColumn(column) {
    let emptyIndex;

    for (let row = this.rowsCount - 1; row >= 0; row--) {
      if (this.matrix[row][column] === null) {
        emptyIndex = row;
        break;
      }
    }

    if (emptyIndex === undefined) return;

    for (let row = emptyIndex - 1; row >= 0; row--) {
      if (this.matrix[row][column] !== null) {
        this.matrix[emptyIndex][column] = this.matrix[row][column];
        this.matrix[row][column] = null;
        emptyIndex--;
      }
    }
  }

  fillBlanks() {
    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        if (this.matrix[row][column] === null) this.matrix[row][column] = this.getRandomValue();
      }
    }
  }

  getRowTiles(row, col, vertical = true) {
    const positions = [{ row, col }];
    const val = Math.abs(this.matrix[row][col]);

    if (vertical) {
      let r = row - 1;
      while (r >= 0 && Math.abs(this.matrix[r][col]) === val) {
        positions.push({ row: r, col });
        r--;
      }

      r = row + 1;
      while (r < this.rowsCount && Math.abs(this.matrix[r][col]) === val) {
        positions.push({ row: r, col });
        r++;
      }
    } else {
      let c = col - 1;
      while (c >= 0 && Math.abs(this.matrix[row][c]) === val) {
        positions.push({ row, col: c });
        c--;
      }

      c = col + 1;
      while (c < this.columnsCount && Math.abs(this.matrix[row][c]) === val) {
        positions.push({ row, col: c });
        c++;
      }
    }

    return positions;
  }
}
