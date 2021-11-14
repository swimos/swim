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

import {Mutable, Strings} from "@swim/util";
import {Mark} from "../source/Mark";
import {InputException} from "../input/InputException";
import {AnyInputSettings, InputSettings} from "../input/InputSettings";
import {Input} from "../input/Input";
import {InputError} from "../input/InputError";

/** @internal */
export class StringInput extends Input {
  constructor(string: string, id: string | undefined, offset: number,
              line: number, column: number, settings: InputSettings,
              index: number, part: boolean) {
    super();
    this.string = string;
    this.index = index;
    this.part = part;
    this.id = id;
    this.offset = offset;
    this.line = line;
    this.column = column;
    this.settings = settings;
  }

  /** @internal */
  readonly string: string;

  /** @internal */
  readonly index: number;

  /** @internal */
  readonly part: boolean;

  override isCont(): boolean {
    return this.index < this.string.length;
  }

  override isEmpty(): boolean {
    return this.part && this.index >= this.string.length;
  }

  override isDone(): boolean {
    return !this.part && this.index >= this.string.length;
  }

  override isError(): boolean {
    return false;
  }

  override isPart(): boolean {
    return this.part;
  }

  override asPart(part: boolean): Input {
    (this as Mutable<this>).part = part;
    return this;
  }

  override head(): number {
    const string = this.string;
    const index = this.index;
    if (index < string.length) {
      const c = string.codePointAt(index);
      if (c !== void 0) {
        return c;
      } else {
        return string.charCodeAt(index);
      }
    }
    throw new InputException();
  }

  override step(): Input {
    const string = this.string;
    const index = this.index;
    if (index < string.length) {
      const c = string.codePointAt(index);
      (this as Mutable<this>).index = Strings.offsetByCodePoints(string, index, 1);
      (this as Mutable<this>).offset += this.index - index;
      if (c === 10/*'\n'*/) {
        (this as Mutable<this>).line += 1;
        (this as Mutable<this>).column = 1;
      } else {
        (this as Mutable<this>).column += 1;
      }
      return this;
    } else {
      const error = new InputException("invalid step");
      return new InputError(error, this.id, this.mark, this.settings);
    }
  }

  override seek(mark?: Mark): Input {
    if (mark !== void 0) {
      const index = this.index + (mark.offset - this.offset);
      if (0 <= index && index <= this.string.length) {
        (this as Mutable<this>).index = index;
        (this as Mutable<this>).offset = mark.offset;
        (this as Mutable<this>).line = mark.line;
        (this as Mutable<this>).column = mark.column;
        return this;
      } else {
        const error = new InputException("invalid seek to " + mark);
        return new InputError(error, this.id, this.mark, this.settings);
      }
    } else {
      (this as Mutable<this>).index = 0;
      (this as Mutable<this>).offset = 0;
      (this as Mutable<this>).line = 1;
      (this as Mutable<this>).column = 1;
      return this;
    }
  }

  readonly id: string | undefined;

  override withId(id: string | undefined): Input {
    (this as Mutable<this>).id = id;
    return this;
  }

  override get mark(): Mark {
    return Mark.at(this.offset, this.line, this.column);
  }

  override withMark(mark: Mark): Input {
    (this as Mutable<this>).offset = mark.offset;
    (this as Mutable<this>).line = mark.line;
    (this as Mutable<this>).column = mark.column;
    return this;
  }

  override readonly offset: number;

  override readonly line: number;

  override readonly column: number;

  override readonly settings: InputSettings;

  override withSettings(settings: AnyInputSettings): Input {
    settings = InputSettings.fromAny(settings);
    (this as Mutable<this>).settings = settings;
    return this;
  }

  override clone(): Input {
    return new StringInput(this.string, this.id, this.offset, this.line,
                           this.column, this.settings, this.index, this.part);
  }

  static create(string: string): Input {
    return new StringInput(string, void 0, 0, 1, 1, InputSettings.standard(), 0, false);
  }
}
