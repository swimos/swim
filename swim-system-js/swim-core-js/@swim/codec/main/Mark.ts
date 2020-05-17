// Copyright 2015-2020 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Murmur3} from "@swim/util";
import {Tag} from "./Tag";
import {Output} from "./Output";

/**
 * Description of a source position, identified by byte offset, line, and
 * column number, with an optional note.
 */
export class Mark extends Tag {
  /** @hidden */
  readonly _offset: number;
  /** @hidden */
  readonly _line: number;
  /** @hidden */
  readonly _column: number;
  /** @hidden */
  readonly _note: string | null;

  /** @hidden */
  constructor(offset: number, line: number, column: number, note: string | null) {
    super();
    this._offset = offset;
    this._line = line;
    this._column = column;
    this._note = note;
  }

  /**
   * Returns the zero-based byte offset of this position.
   */
  offset(): number {
    return this._offset;
  }

  /**
   * Returns the one-based line number of this position.
   */
  line(): number {
    return this._line;
  }

  /**
   * Returns the one-based column number of this position.
   */
  column(): number {
    return this._column;
  }

  /**
   * Returns the note attached to the marked position, or `null` if this
   * position has no attached note.
   */
  note(): string | null {
    return this._note;
  }

  /**
   * Returns `this` position, if its byte offset is less than or equal to
   * `that` position; otherwise returns `that` position.
   */
  min(that: Mark): Mark {
    if (this._offset <= that._offset) {
      return this;
    } else {
      return that;
    }
  }

  /**
   * Returns `this` position, if its byte offset is greater than or equal to
   * `that` position; otherwise returns `that` position.
   */
  max(that: Mark): Mark {
    if (this._offset >= that._offset) {
      return this;
    } else {
      return that;
    }
  }

  start(): Mark {
    return this;
  }

  end(): Mark {
    return this;
  }

  union(that: Tag): Tag {
    if (that instanceof Mark) {
      if (this._offset === that._offset && this._line === that._line
          && this._column === that._column) {
        return this;
      } else {
        return Tag.Span.from(this, that);
      }
    } else if (that instanceof Tag.Span) {
      const start = this.min(that._start);
      const end = this.max(that._end);
      if (start === that._start && end === that._end) {
        return that;
      } else {
        return Tag.Span.from(start, end);
      }
    }
    throw new Error(that.toString());
  }

  shift(mark: Mark): Mark {
    const offset = this._offset + (this._offset - mark._offset);
    const line = this._line + (this._line - mark._line);
    let column = this._column;
    if (line === 1) {
      column += (this._column - mark._column);
    }
    if (offset === this._offset && line === this._line && column === this._column) {
      return this;
    } else {
      return Mark.at(offset, line, column, this._note);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Mark) {
      return this._offset === that._offset && this._line === that._line
          && this._column === that._column && this._note === that._note;
    }
    return false;
  }

  hashCode(): number {
    if (Mark._hashSeed === void 0) {
      Mark._hashSeed = Murmur3.seed(Mark);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Mark._hashSeed,
        this._offset), this._line), this._column), Murmur3.hash(this._note)));
  }

  display(output: Output): void {
    Tag.Format.displayNumber(this._line, output);
    output = output.write(58/*':'*/);
    Tag.Format.displayNumber(this._column, output);
    if (this._note !== null) {
      output = output.write(58/*':'*/).write(32/*' '*/).write(this._note);
    }
  }

  debug(output: Output): void {
    output = output.write("Mark").write(".").write("at").write("(");
    Tag.Format.debugNumber(this._offset, output);
    output = output.write(", ");
    Tag.Format.debugNumber(this._line, output);
    output = output.write(", ");
    Tag.Format.debugNumber(this._column, output);
    if (this._note !== null) {
      output = output.write(", ");
      Tag.Format.debugString(this._note, output);
    }
    output = output.write(")");
  }

  toString(): string {
    return Tag.Format.display(this);
  }

  private static _hashSeed?: number;
  private static _zero?: Mark;

  /**
   * Returns a `Mark` at byte offset `0`, line `1`, and column `1`, with no
   * attached note.
   */
  static zero(): Mark {
    if (Mark._zero === void 0) {
      Mark._zero = new Mark(0, 1, 1, null);
    }
    return Mark._zero;
  }

  /**
   * Returns a new `Mark` at the given zero-based byte `offset`, one-based
   * `line` number, and one-based `column` number, with an optionally attached
   * `note`.
   */
  static at(offset: number, line: number, column: number, note: string | null = null): Mark {
    return new Mark(offset, line, column, note);
  }
}
Tag.Mark = Mark;
