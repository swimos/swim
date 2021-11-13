// Copyright 2015-2021 Swim Inc.
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

import {Lazy, Murmur3, Numbers, Strings, Constructors} from "@swim/util";
import {Tag} from "./Tag";
import {Span} from "../"; // forward import
import type {Output} from "../output/Output";
import {Format} from "../"; // forward import

/**
 * Description of a source position, identified by byte offset, line, and
 * column number, with an optional note.
 */
export class Mark extends Tag {
  /** @internal */
  constructor(offset: number, line: number, column: number, note: string | undefined) {
    super();
    this.offset = offset;
    this.line = line;
    this.column = column;
    this.note = note;
  }

  /**
   * The zero-based byte offset of this position.
   */
  readonly offset: number;

  /**
   * The one-based line number of this position.
   */
  readonly line: number;

  /**
   * The one-based column number of this position.
   */
  readonly column: number;

  /**
   * The note attached to the marked position, or `null` if this position has
   * no attached note.
   */
  readonly note: string | undefined;

  withNote(note: string | undefined): Mark {
    if (this.note !== note) {
      return Mark.at(this.offset, this.line, this.column, note);
    } else {
      return this;
    }
  }

  /**
   * Returns this position, if its byte offset is less than or equal to
   * `that` position; otherwise returns `that` position.
   */
  min(that: Mark): Mark {
    return this.offset <= that.offset ? this : that;
  }

  /**
   * Returns this position, if its byte offset is greater than or equal to
   * `that` position; otherwise returns `that` position.
   */
  max(that: Mark): Mark {
    return this.offset >= that.offset ? this : that;
  }

  override get start(): Mark {
    return this;
  }

  override get end(): Mark {
    return this;
  }

  override union(that: Tag): Tag {
    if (that instanceof Mark) {
      if (this.offset === that.offset && this.line === that.line
          && this.column === that.column) {
        return this;
      } else {
        return Span.from(this, that);
      }
    } else if (that instanceof Span) {
      const start = this.min(that.start);
      const end = this.max(that.end);
      if (start === that.start && end === that.end) {
        return that;
      } else {
        return Span.from(start, end);
      }
    }
    throw new Error(that.toString());
  }

  override shift(mark: Mark): Mark {
    const offset = this.offset + (this.offset - mark.offset);
    const line = this.line + (this.line - mark.line);
    let column = this.column;
    if (line === 1) {
      column += (this.column - mark.column);
    }
    if (offset === this.offset && line === this.line && column === this.column) {
      return this;
    } else {
      return Mark.at(offset, line, column, this.note);
    }
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Mark) {
      return this.offset === that.offset && this.line === that.line
          && this.column === that.column && this.note === that.note;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Constructors.hash(Mark),
        Numbers.hash(this.offset)), Numbers.hash(this.line)), Numbers.hash(this.column)),
        Strings.hash(this.note)));
  }

  override display<T>(output: Output<T>): Output<T> {
    output = Format.displayNumber(output, this.line);
    output = output.write(58/*':'*/);
    output = Format.displayNumber(output, this.column);
    if (this.note !== void 0) {
      output = output.write(58/*':'*/).write(32/*' '*/).write(this.note);
    }
    return output;
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Mark").write(".").write("at").write("(");
    output = Format.debugNumber(output, this.offset);
    output = output.write(", ");
    output = Format.debugNumber(output, this.line);
    output = output.write(", ");
    output = Format.debugNumber(output, this.column);
    if (this.note !== void 0) {
      output = output.write(", ");
      output = Format.debugString(output, this.note);
    }
    output = output.write(")");
    return output;
  }

  override toString(): string {
    return Format.display(this);
  }

  /**
   * Returns a `Mark` at byte offset `0`, line `1`, and column `1`, with no
   * attached note.
   */
  @Lazy
  static get zero(): Mark {
    return new Mark(0, 1, 1, void 0);
  }

  /**
   * Returns a new `Mark` at the given zero-based byte `offset`, one-based
   * `line` number, and one-based `column` number, with an optionally attached
   * `note`.
   */
  static at(offset: number, line: number, column: number, note?: string | undefined): Mark {
    return new Mark(offset, line, column, note);
  }
}
