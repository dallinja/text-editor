class Cursor {
  constructor(container, lineCounts, onColRowChange) {
    this.row = 0;
    this.col = 0;
    this.offset = 0;
    this.container = container;
    this.lineCounts = lineCounts;
    this.cursor = document.createElement("div");
    this.onColRowChange = onColRowChange;
    this.init();
  }

  init() {
    this.cursor.classList.add("cursor", "flash");
    document.body.appendChild(this.cursor);
    this.updateColRow(this.col, this.row);
    document.addEventListener("keydown", (event) => {
      // event.preventDefault();
      if (event.key === "ArrowRight") {
        this.updateColRow(this.col + 1, this.row);
      } else if (event.key === "ArrowLeft") {
        this.updateColRow(this.col - 1, this.row);
      } else if (event.key === "ArrowUp") {
        this.updateColRow(this.col, this.row - 1);
      } else if (event.key === "ArrowDown") {
        this.updateColRow(this.col, this.row + 1);
      }
    });
    this.container.addEventListener("click", (event) => {
      const bounds = content.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const row = Math.floor(y / LINE_HEIGHT);
      const col = Math.round(x / 8.5);
      console.log("col: ", col);
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
    this.updateStylePosition(col * 8.5, row * LINE_HEIGHT);
    this.onColRowChange(this.col, this.row);
    if (this.lineCounts.length <= row) {
      return;
    }
    console.log("this.lineCounts cursor: ", this.lineCounts);
    let sequenceOffset = 0;
    for (let i = 0; i < this.lineCounts.length; i++) {
      if (i === row) {
        const isLastCol = col === this.lineCounts[i];
        const isLastRow = i === this.lineCounts.length - 1;
        sequenceOffset += col + (isLastCol && !isLastRow ? 1 : 0);
        break;
      } else {
        sequenceOffset += this.lineCounts[i];
      }
    }
    this.offset = sequenceOffset;
    console.log("this.offset: ", this.offset);
  }
}
