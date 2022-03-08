// Copyright 2015-2022 Swim.inc
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

import {Murmur3, Constructors} from "@swim/util";
import {Tag} from "./Tag";
import {Mark} from "./Mark";
import type {Output} from "../output/Output";
import {Format} from "../"; // forward import

/**
 * Description of a source range, identified by a closed interval between start
 * and end [[Mark marks]].
 * @public
 */
export class Span extends Tag {
  /** @internal */
  constructor(start: Mark, end: Mark) {
    super();
    this.start = start;
    this.end = end;
  }

  override readonly start: Mark;

  override readonly end: Mark;

  override union(that: Tag): Tag {
    if (that instanceof Mark) {
      const start = this.start.min(that);
      const end = this.end.max(that);
      if (start === this.start && end === this.end) {
        return this;
      } else {
        return Span.from(start, end);
      }
    } else if (that instanceof Span) {
      const start = this.start.min(that.start);
      const end = this.end.max(that.end);
      if (start === this.start && end === this.end) {
        return this;
      } else {
        return Span.from(start, end);
      }
    }
    throw new Error(that.toString());
  }

  override shift(mark: Mark): Span {
    const start = this.start.shift(mark);
    const end = this.end.shift(mark);
    if (start === this.start && end === this.end) {
      return this;
    } else {
      return Span.from(start, end);
    }
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Span) {
      return this.start.equals(that.start) && this.end.equals(that.end);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(Span),
        this.start.hashCode()), this.end.hashCode()));
  }

  override display<T>(output: Output<T>): Output<T> {
    if (this.start.note !== void 0) {
      output = output.write(this.start.note).write(58/*':'*/).write(32/*' '*/);
    }
    output = Format.displayNumber(output, this.start.line);
    output = output.write(58/*':'*/);
    output = Format.displayNumber(output, this.start.column);
    output = output.write(45/*'-'*/);
    output = Format.displayNumber(output, this.end.line);
    output = output.write(58/*':'*/);
    output = Format.displayNumber(output, this.end.column);
    if (this.end.note !== void 0) {
      output = output.write(58/*':'*/).write(32/*' '*/).write(this.end.note);
    }
    return output;
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Span").write(".").write("from").write("(");
    output = this.start.debug(output);
    output = output.write(", ");
    output = this.end.debug(output);
    output = output.write(")");
    return output;
  }

  override toString(): string {
    return Format.display(this);
  }

  /**
   * Returns a new `Span` representing the closed interval between the given
   * `start` and `end` marks.
   */
  static from(start: Mark, end: Mark): Span {
    if (start.offset > end.offset) {
      const tmp = start;
      start = end;
      end = tmp;
    }
    return new Span(start, end);
  }
}
