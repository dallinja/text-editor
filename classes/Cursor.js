class Cursor {
  constructor(container, lineCounts, onColRowChange) {
    this.row = 0;
    this.col = 0;
    this.colGoal = 0;
    this.offset = 0;
    this.container = container;
    this.lineCounts = lineCounts;
    this.cursor = document.createElement("div");
    this.onColRowChange = onColRowChange;
    this.charWidth = 0;
    this.init();
  }

  init() {
    // get width of single char
    const char = document.createElement("span");
    char.textContent = "A";
    this.container.appendChild(char);
    this.charWidth = char.getBoundingClientRect().width;
    char.remove();

    this.cursor.classList.add("cursor", "flash");
    document.body.appendChild(this.cursor);
    this.updateColRow(this.col, this.row);
    document.addEventListener("keydown", (event) => {
      // event.preventDefault();
      const atFileStart = this.col === 0 && this.row === 0;
      const isLastRow = this.row === this.lineCounts.length - 1;
      const isLastCol = this.col === this.lineCounts[this.row];
      const atFileEnd = isLastRow && isLastCol;
      if (event.key === "ArrowRight") {
        if (atFileEnd) {
          // reset colGoal
          this.colGoal = this.lineCounts[this.row];
          return;
        }
        const endOfLine = this.col === this.lineCounts[this.row];
        if (endOfLine) {
          this.colGoal = 0;
          this.updateColRow(0, this.row + 1);
        } else {
          this.colGoal = this.col + 1;
          this.updateColRow(this.col + 1, this.row);
        }
      } else if (event.key === "ArrowLeft") {
        if (atFileStart) {
          // reset colGoal
          this.colGoal = 0;
          return;
        }
        const beginningOfLine = this.col === 0;
        if (beginningOfLine) {
          this.colGoal = this.lineCounts[this.row - 1];
          this.updateColRow(this.lineCounts[this.row - 1], this.row - 1);
        } else {
          this.colGoal = this.col - 1;
          this.updateColRow(this.col - 1, this.row);
        }
      } else if (event.key === "ArrowUp") {
        const firstRow = this.row === 0;
        if (firstRow) {
          if (atFileStart) {
            // reset colGoal
            this.colGoal = 0;
            return;
          }
          this.updateColRow(0, 0);
        } else {
          const lineCount = this.lineCounts[this.row - 1];
          const col = Math.min(this.colGoal, lineCount);
          this.updateColRow(col, this.row - 1);
        }
      } else if (event.key === "ArrowDown") {
        const lastRow = this.row === this.lineCounts.length - 1;
        if (lastRow) {
          if (atFileEnd) {
            // reset colGoal
            this.colGoal = this.lineCounts[this.row];
            return;
          }
          this.updateColRow(this.lineCounts[this.row], this.row);
        } else {
          const lineCount = this.lineCounts[this.row + 1];
          const col = Math.min(this.colGoal, lineCount);
          this.updateColRow(col, this.row + 1);
        }
      }
    });
    this.container.addEventListener("click", (event) => {
      const bounds = content.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const row = Math.floor(y / LINE_HEIGHT);
      const col = Math.round(x / this.charWidth);
      if (row > this.lineCounts.length - 1) {
        this.row = this.lineCounts.length - 1;
        this.col = this.lineCounts[this.lineCounts.length - 1];
      } else {
        this.col = Math.min(col, this.lineCounts[row] || 0);
        this.row = Math.min(row, this.lineCounts.length - 1);
      }
      this.updateColRow(this.col, this.row);
    });
  }

  updateStylePosition(left, top) {
    const bounds = content.getBoundingClientRect();
    this.cursor.style.top = `${top + bounds.top}px`;
    this.cursor.style.left = `${left + bounds.left}px`;
  }

  updateColRow(col, row, offset) {
    this.col = col;
    this.row = row;
    this.updateStylePosition(col * this.charWidth, row * LINE_HEIGHT);
    this.onColRowChange(this.col, this.row);
    if (this.lineCounts.length <= row) {
      return;
    }
    let sequenceOffset = 0;
    for (let i = 0; i < this.lineCounts.length; i++) {
      if (i === row) {
        sequenceOffset += col;
        break;
      } else {
        // add one for line break
        sequenceOffset += this.lineCounts[i] + 1;
      }
    }
    this.offset = sequenceOffset;
  }
}
