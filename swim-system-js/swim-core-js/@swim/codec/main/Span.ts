// Copyright 2015-2020 Swim inc.
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
import {Mark} from "./Mark";
import {Output} from "./Output";

/**
 * Description of a source range, identified by a closed interval between start
 * and end [[Mark marks]].
 */
export class Span extends Tag {
  /** @hidden */
  readonly _start: Mark;
  /** @hidden */
  readonly _end: Mark;

  /** @hidden */
  constructor(start: Mark, end: Mark) {
    super();
    this._start = start;
    this._end = end;
  }

  start(): Mark {
    return this._start;
  }

  end(): Mark {
    return this._end;
  }

  union(that: Tag): Tag {
    if (that instanceof Tag.Mark) {
      const start = this._start.min(that);
      const end = this._end.max(that);
      if (start === this._start && end === this._end) {
        return this;
      } else {
        return Span.from(start, end);
      }
    } else if (that instanceof Span) {
      const start = this._start.min(that._start);
      const end = this._end.max(that._end);
      if (start === this._start && end === this._end) {
        return this;
      } else {
        return Span.from(start, end);
      }
    }
    throw new Error(that.toString());
  }

  shift(mark: Mark): Span {
    const start = this._start.shift(mark);
    const end = this._end.shift(mark);
    if (start === this._start && end === this._end) {
      return this;
    } else {
      return Span.from(start, end);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Span) {
      return this._start.equals(that._start) && this._end.equals(that._end);
    }
    return false;
  }

  hashCode(): number {
    if (Span._hashSeed === void 0) {
      Span._hashSeed = Murmur3.seed(Span);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Span._hashSeed,
        this._start.hashCode()), this._end.hashCode()));
  }

  display(output: Output): void {
    if (this._start._note !== null) {
      output = output.write(this._start._note).write(58/*':'*/).write(32/*' '*/);
    }
    Tag.Format.displayNumber(this._start._line, output);
    output = output.write(58/*':'*/);
    Tag.Format.displayNumber(this._start._column, output);
    output = output.write(45/*'-'*/);
    Tag.Format.displayNumber(this._end._line, output);
    output = output.write(58/*':'*/);
    Tag.Format.displayNumber(this._end._column, output);
    if (this._end._note !== null) {
      output = output.write(58/*':'*/).write(32/*' '*/).write(this._end._note);
    }
  }

  debug(output: Output): void {
    output = output.write("Span").write(".").write("from").write("(");
    this._start.debug(output);
    output = output.write(", ");
    this._end.debug(output);
    output = output.write(")");
  }

  toString(): string {
    return Tag.Format.display(this);
  }

  private static _hashSeed?: number;

  /**
   * Returns a new `Span` representing the closed interval between the given
   * `start` and `end` marks.
   */
  static from(start: Mark, end: Mark): Span {
    if (start._offset > end._offset) {
      const tmp = start;
      start = end;
      end = tmp;
    }
    return new Span(start, end);
  }
}
Tag.Span = Span;
