export class Tile {
  constructor(wrap, row, column, value, handleTileClick) {
    this.row = row;
    this.column = column;
    this.value = value;
    this.handleTileClick = handleTileClick;

    this.tileElement = document.createElement("div");
    this.tileElement.classList.add("tile");

    this.tileElement.style.backgroundImage = `url(./assets/img/tile${value}.png)`;
    this.tileElement.style.backgroundSize = "cover";
    this.tileElement.style.backgroundRepeat = "no-repeat";
    this.tileElement.style.backgroundPosition = "center";

    this.setPositionBy(row, column);
    wrap.append(this.tileElement);

    this.tileElement.addEventListener("click", this.clickHandler);
    this.tileElement.addEventListener("mousedown", this.handleMouseDown);
    this.tileElement.addEventListener("mouseup", this.handleMouseUp);
    this.tileElement.addEventListener("mouseover", this.handleMouseOver);

    this.tileElement.addEventListener("touchstart", this.handleTouchStart, { passive: false });
    this.tileElement.addEventListener("touchmove", this.handleTouchMove, { passive: false });
    this.tileElement.addEventListener("touchend", this.handleTouchEnd);
  }

  setPositionBy(row, column) {
    this.row = row;
    this.column = column;
    this.tileElement.style.setProperty("--row", row);
    this.tileElement.style.setProperty("--column", column);
  }

  handleTouchStart = (e) => {
    this.handleTileClick(this.row, this.column, "down");
  };

  handleTouchMove = (e) => {
    // Получаем координаты касания
    const touch = e.touches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

    // Если палец двигается над другим тайлом, вызываем "over"
    if (targetElement && targetElement.classList.contains("tile")) {
      const row = parseInt(targetElement.style.getPropertyValue("--row"));
      const column = parseInt(targetElement.style.getPropertyValue("--column"));
      if (!isNaN(row) && !isNaN(column)) {
        this.handleTileClick(row, column, "over");
      }
    }
  };

  handleTouchEnd = (e) => {
    this.handleTileClick(this.row, this.column, "up");
  };

  clickHandler = () => this.handleTileClick(this.row, this.column, "click");

  handleMouseDown = () => this.handleTileClick(this.row, this.column, "down");

  handleMouseUp = () => this.handleTileClick(this.row, this.column, "up");

  handleMouseOver = (e) => {
    if (e.buttons === 1) {
      this.handleTileClick(this.row, this.column, "over");
    }
  };

  select(targetValue = 1) {
    this.tileElement.classList.add("selected");

    if (this.value === targetValue) {
      this.tileElement.classList.add("target");
    } else {
      this.tileElement.classList.remove("target");
    }
  }

  unselect() {
    this.tileElement.classList.remove("selected", "target");
  }

  async remove() {
    this.tileElement.removeEventListener("click", this.clickHandler);
    this.tileElement.classList.add("hide");
    await this.waitForAnimationEnd();
    this.tileElement.remove();
  }

  waitForAnimationEnd() {
    return new Promise(resolve => {
      this.tileElement.addEventListener("animationend", resolve, { once: true });
    });
  }

  waitForTransitionEnd() {
    return new Promise(resolve => {
      this.tileElement.addEventListener("transitionend", resolve, { once: true });
    });
  }
}
