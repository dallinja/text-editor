const LINE_HEIGHT = 20;
const LINE_NUMBERS_WIDTH = 64;
const NON_INPUT_KEYS = [
  "ArrowRight",
  "ArrowLeft",
  "ArrowUp",
  "ArrowDown",
  "Backspace",
  "Delete",
  "Enter",
  "Tab",
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "Escape",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "Insert",
  "PrintScreen",
  "ScrollLock",
  "Pause",
  "ContextMenu",
  "BrowserBack",
  "BrowserForward",
  "BrowserRefresh",
  "BrowserStop",
  "BrowserSearch",
  "BrowserFavorites",
  "BrowserHome",
];

class Editor {
  constructor(text) {
    this.cursorPosition = { col: 0, row: 0 };
    this.cursorOffset = 0;
    this.lineCounts = [];
    this.pieceTable = new PieceTable(text);
    this.textarea = this.createTextArea();
    this.content = document.getElementById("content");
    this.editor = this.createEditorHTML();
    this.cursor = new Cursor(
      this.content,
      this.lineCounts,
      this.onColRowChange
    );
    // this.currentPiece = null;
  }

  createEditorHTML() {
    const editor = document.getElementById("editor");
    editor.addEventListener("click", () => {
      console.log("Editor was clicked");
      this.textarea.focus();
    });
    this.draw();
    return editor;
  }

  createTextArea() {
    const textarea = document.getElementById("textarea");
    textarea.addEventListener("beforeinput", (event) => {
      if (event.data) {
        this.type(this.cursor.offset, event.data);
        this.cursor.updateColRow(
          this.cursor.col + event.data.length,
          this.cursor.row
        );
      }
      // console.log("event.data: ", event.data);
      // console.log("event.key: ", event.key);
      // event.preventDefault();
      // if (event.key === "Enter") {
      //   this.enter();
      // } else if (!NON_INPUT_KEYS.includes(event.key)) {
      //   this.type(event.data);
      // }
    });
    return textarea;
  }

  draw() {
    this.content.innerHTML = "";
    const sequence = this.pieceTable.getSequence();
    console.log("sequence: ", sequence);
    sequence.split("\n").forEach((line) => {
      this.lineCounts.push(line.length);
      console.log("line: ", line);
      const textNode = document.createTextNode(line || "");
      const lineEl = document.createElement("div");
      lineEl.classList.add("line");
      const spanEl = document.createElement("span");
      spanEl.appendChild(textNode);
      lineEl.appendChild(spanEl);
      this.content.appendChild(lineEl);
    });
  }

  type(offset, value) {
    this.pieceTable.insert(offset, value);
    // const value = event.target.value || "";
    // console.log("value: ", value);
    // console.log("key: ", event.key);
    // if (this.currentPiece === null) {
    //   this.currentPiece = this.pieceTable.insert(0, event.value);
    // }
    // this.currentPiece;
    // if (this.commitPiece(event)) {
    //   this.pieceTable.insert(0, value, { forceInsert: true });
    // } else {
    //   this.pieceTable.insert(0, value);
    // }
    // this.pieceTable.insert(10, "Dallin is cool ");
    this.draw();
  }

  commitPiece(event) {
    const keys = [
      "Enter",
      "Backspace",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Delete",
      "Space",
      "Tab",
    ];
    return keys.includes(event.key);
  }

  enter() {
    this.pieceTable.insert(21, "\n");
    this.draw();
  }

  onColRowChange(col, row) {
    const lineDisplayEl = document.getElementById("line");
    const columnDisplayEl = document.getElementById("column");
    lineDisplayEl.innerHTML = row + 1;
    columnDisplayEl.innerHTML = col + 1;
    document.querySelectorAll(".line").forEach((lineEl) => {
      lineEl.classList.remove("selected");
    });
    document.querySelectorAll(".line-number").forEach((lineEl) => {
      lineEl.classList.remove("selected");
    });
    document.getElementsByClassName("line")[row].classList.add("selected");
    document
      .getElementsByClassName("line-number")
      [row].classList.add("selected");
  }
}
