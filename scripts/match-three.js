import { Game } from "./game.js";
import { Grid } from "./grid.js";

export class MatchThree {
  wrap = document.querySelector(".wrap");

  constructor(rowsCount, columnsCount, tilesCount) {
    this.game = new Game(rowsCount, columnsCount, tilesCount);
    this.grid = new Grid(this.wrap, this.game.matrix, this); // передаём ссылку на себя

    // Элементы шапки
    this.timerElement = document.querySelector(".timer");
    this.progressCountElement = document.querySelector(".progress-current");

    this.progressCount = 0;
    this.maxPairs = 10;
    this.timerDuration = 40; // секунд

    this.isGameActive = true; // добавляем флаг активности игры

    this.startTimer();

    this.wrap.addEventListener("swap", (event) => {
      if (!this.isGameActive) return;  // если игра не активна — игнорируем свапы
      const firstElementPosition = event.detail.firstElementPosition;
      const secondElementPosition = event.detail.secondElementPosition;
      this.swap(firstElementPosition, secondElementPosition);
    });
  }

  async swap(firstElementPosition, secondElementPosition) {
    if (!this.isGameActive) return; // дополнительная проверка на всякий случай

    console.log("User move: swap", firstElementPosition, secondElementPosition);

    const swapStates = this.game.swap(firstElementPosition, secondElementPosition);

    if (swapStates) {
      console.log("Combination formed! Current progress:", this.game.targetTilePairsCount);
      // ✅ Увеличиваем progress по количеству пар tile6
      this.progressCount = this.game.targetTilePairsCount;
      if (this.progressCount <= this.maxPairs) {
        this.progressCountElement.textContent = this.progressCount;
      }
      if (this.progressCount >= this.maxPairs) {
        this.isGameActive = false;
        this.progressCountElement.textContent = this.maxPairs;
        clearInterval(this.timerInterval); // ⛔ Остановить таймер
        console.log({
          type: "completed",
          points: 1000,
        })
      }

      // ✅ Выводим в консоль общее количество удалённых tile6
      console.log("Total fonbet removed:", this.game.totalRemovedTargetTile);
      console.log("Total fonbet pairs removed:", this.game.targetTilePairsCount);
    }
    else {
      console.log("Unsuccessful move — no combination formed");
    }

    await this.grid.swap(firstElementPosition, secondElementPosition, swapStates);
  }

  startTimer() {
    let timeLeft = this.timerDuration;
    this.updateTimerDisplay(timeLeft);

    this.timerInterval = setInterval(() => {
      timeLeft--;
      this.updateTimerDisplay(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.isGameActive = false;
        console.log({
          type: "lose",
          points: this.game.totalRemovedTargetTile * 10,
        })
        // Здесь можно добавить логику окончания игры
      }
    }, 1000);
  }

  updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
}
