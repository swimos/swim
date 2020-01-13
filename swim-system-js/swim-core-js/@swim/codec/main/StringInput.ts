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

import {Mark} from "./Mark";
import {InputException} from "./InputException";
import {AnyInputSettings, InputSettings} from "./InputSettings";
import {Input} from "./Input";

/** @hidden */
export class StringInput extends Input {
  /** @hidden */
  readonly _string: string;
  /** @hidden */
  _id: unknown | null;
  /** @hidden */
  _offset: number;
  /** @hidden */
  _line: number;
  /** @hidden */
  _column: number;
  /** @hidden */
  _settings: InputSettings;
  /** @hidden */
  _index: number;
  /** @hidden */
  _isPart: boolean;

  constructor(string: string, id: unknown | null = null, offset: number = 0,
              line: number = 1, column: number = 1, settings: InputSettings = InputSettings.standard(),
              index: number = 0, isPart: boolean = false) {
    super();
    this._string = string;
    this._id = id;
    this._offset = offset;
    this._line = line;
    this._column = column;
    this._settings = settings;
    this._index = index;
    this._isPart = isPart;
  }

  isCont(): boolean {
    return this._index < this._string.length;
  }

  isEmpty(): boolean {
    return this._isPart && this._index >= this._string.length;
  }

  isDone(): boolean {
    return !this._isPart && this._index >= this._string.length;
  }

  isError(): boolean {
    return false;
  }

  isPart(): boolean;
  isPart(isPart: boolean): Input;
  isPart(isPart?: boolean): boolean | Input {
    if (isPart === void 0) {
      return this._isPart;
    } else {
      this._isPart = isPart;
      return this;
    }
  }

  head(): number {
    if (this._index < this._string.length) {
      const c = this._string.codePointAt(this._index);
      if (c !== void 0) {
        return c;
      } else {
        return this._string.charCodeAt(this._index);
      }
    }
    throw new InputException();
  }

  step(): Input {
    const index = this._index;
    if (index < this._string.length) {
      const c = this._string.codePointAt(index);
      this._index = this._string.offsetByCodePoints(index, 1);
      this._offset += this._index - index;
      if (c === 10/*'\n'*/) {
        this._line += 1;
        this._column = 1;
      } else {
        this._column += 1;
      }
      return this;
    } else {
      const error = new InputException("invalid step");
      return Input.error(error, this._id, this.mark(), this._settings);
    }
  }

  seek(mark?: Mark): Input {
    if (mark !== void 0) {
      const index = this._index + (mark._offset - this._offset);
      if (0 <= index && index <= this._string.length) {
        this._offset = mark._offset;
        this._line = mark._line;
        this._column = mark._column;
        this._index = index;
        return this;
      } else {
        const error = new InputException("invalid seek to " + mark);
        return Input.error(error, this._id, this.mark(), this._settings);
      }
    } else {
      this._offset = 0;
      this._line = 1;
      this._column = 1;
      this._index = 0;
      return this;
    }
  }

  id(): unknown | null;
  id(id: unknown | null): Input;
  id(id?: unknown | null): unknown | null | Input {
    if (id === void 0) {
      return this._id;
    } else {
      this._id = id;
      return this;
    }
  }

  mark(): Mark;
  mark(mark: Mark): Input;
  mark(mark?: Mark): Mark | Input {
    if (mark === void 0) {
      return Mark.at(this._offset, this._line, this._column);
    } else {
      this._offset = mark._offset;
      this._line = mark._line;
      this._column = mark._column;
      return this;
    }
  }

  offset(): number {
    return this._offset;
  }

  line(): number {
    return this._line;
  }

  column(): number {
    return this._column;
  }

  settings(): InputSettings;
  settings(settings: AnyInputSettings): Input;
  settings(settings?: AnyInputSettings): InputSettings | Input {
    if (settings === void 0) {
      return this._settings;
    } else {
      this._settings = InputSettings.fromAny(settings);
      return this;
    }
  }

  clone(): Input {
    return new StringInput(this._string, this._id, this._offset, this._line,
                           this._column, this._settings, this._index, this._isPart);
  }
}
