/**
 * A Piece describes a window into the file or the add buffer
 * @typedef {Object} Piece
 * @property {boolean} addBuffer - true if the Piece points to the add buffer, false if it points to the file buffer
 * @property {number} offset - the index in the buffer where the Piece starts
 * @property {number} length - the length of the Piece
 * @private
 */

/**
 * The PieceTable class describes the sequence as a series of Pieces
 * @param {string} fileText - the initial text of the piece table
 * @constructor
 */
class PieceTable {
  constructor(originalText = "") {
    this._original = originalText;
    this._add = "";
    /**
     * The piece table describes the sequence as a series of Pieces
     * @type {Piece[]}
     * @private
     */
    this._pieces = [new Piece(false, 0, originalText.length)];
    this._size = originalText.length;
    this.undoStack = [];
    this.redoStack = [];
    this.tempInit();
  }

  tempInit() {
    const originalBufferEl = document.getElementById("original-buffer");
    originalBufferEl.textContent = this._original;
  }

  get size() {
    return this._size;
  }

  /**
   *
   * @param {number} index
   * @returns
   */
  get(index) {
    const { piece, offset } = this._findPieceAndOffset(index);
    return piece.get(offset);
  }

  insert(offset, value, options = { forceInsert: false }) {
    if (value.length === 0) return undefined;

    const addLength = this._add.length;
    this._add += value;

    // temp start
    const addBufferEl = document.getElementById("add-buffer");
    addBufferEl.textContent = this._add;
    // temp end

    const {
      piece,
      offset: pieceSeqOffset,
      pieceIndex,
    } = this._findPieceAndOffset(offset);

    // If the piece points to the end of the add buffer, and we are inserting at its end, simply increase its length
    if (
      !options.forceInsert &&
      piece.addBuffer &&
      // peice points to end of add buffer
      piece.offset + piece.length === addLength &&
      // we are inserting at the end of the add buffer
      pieceSeqOffset + piece.length === offset
    ) {
      piece.length += str.length;
      const lastUndo = this.undoStack[this.undoStack.length - 1];
      lastUndo.length += str.length;
      return piece;
    }

    const newPiece = new Piece(true, addLength, value.length);
    this.undoStack.push({
      type: "delete",
      offset,
      length: value.length,
    });

    if (offset === 0) {
      this._pieces.unshift(newPiece);
      this._size += value.length;
      return newPiece;
    }

    if (offset === this._size) {
      this._pieces.push(newPiece);
      this._size += value.length;
      return newPiece;
    }

    const remainingPiece = piece.insert(offset - pieceSeqOffset);
    this._pieces.splice(pieceIndex + 1, 0, newPiece, remainingPiece);

    this._size += value.length;
    return newPiece;
  }

  delete(index) {
    const { piece, offset } = this._findPieceAndOffset(index);
    piece.delete(offset);
    this._size--;
  }

  /**
   * Returns the piece, offset, and piece index for the given offset
   * @param {number} seqOffset - an index into the sequence (not into the piece table)
   * @returns {{piece: Piece, offset: number, pieceIndex: number}} - the piece, offset, and piece index for the given offset
   */
  _findPieceAndOffset(seqOffset) {
    let currentSeqOffset = 0;
    let pieceIndex = 0;
    for (const piece of this._pieces) {
      if (seqOffset < currentSeqOffset + piece.length) {
        return { piece, offset: currentSeqOffset, pieceIndex };
      }
      currentSeqOffset += piece.length;
      pieceIndex++;
    }
    throw new Error("Index out of bounds");
  }

  getSequence() {
    let result = "";
    for (const piece of this._pieces) {
      const buffer = piece.addBuffer ? this._add : this._original;
      result += buffer.substring(piece.offset, piece.offset + piece.length);
    }
    return result;
  }
}

class Piece {
  constructor(addBuffer, offset, length) {
    this.addBuffer = addBuffer;
    this.offset = offset;
    this.length = length;
  }

  get(index) {
    if (index >= this.length) {
      throw new Error("Index out of bounds");
    }
    return this.addBuffer
      ? this._addBuffer[index + this.offset]
      : this._original[index + this.offset];
  }

  insert(newLength) {
    const oldLength = this.length;
    this.length = newLength;
    if (oldLength === newLength) {
      return undefined;
    }
    return new Piece(
      this.addBuffer,
      this.offset + newLength,
      oldLength - newLength
    );
  }

  delete(index) {
    this._addBuffer =
      this._addBuffer.substring(0, index) +
      this._addBuffer.substring(index + 1);
    this.length--;
  }
}
