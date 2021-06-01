// Copyright 2015-2021 Swim inc.
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

import {Mark} from "../source/Mark";
import {InputException} from "../input/InputException";
import {AnyInputSettings, InputSettings} from "../input/InputSettings";
import {Input} from "../input/Input";
import {InputError} from "../input/InputError";

/** @hidden */
export class StringInput extends Input {
  /** @hidden */
  readonly string!: string;
  /** @hidden */
  readonly index!: number;
  /** @hidden */
  readonly part!: boolean;

  constructor(string: string, id: string | undefined, offset: number,
              line: number, column: number, settings: InputSettings,
              index: number, part: boolean) {
    super();
    Object.defineProperty(this, "string", {
      value: string,
      enumerable: true,
    });
    Object.defineProperty(this, "index", {
      value: index,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "part", {
      value: part,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "id", {
      value: id,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "offset", {
      value: offset,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "line", {
      value: line,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "column", {
      value: column,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "settings", {
      value: settings,
      enumerable: true,
      configurable: true,
    });
  }

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
    Object.defineProperty(this, "part", {
      value: part,
      enumerable: true,
      configurable: true,
    });
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
      Object.defineProperty(this, "index", {
        value: string.offsetByCodePoints(index, 1),
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(this, "offset", {
        value: this.offset + (this.index - index),
        enumerable: true,
        configurable: true,
      });
      if (c === 10/*'\n'*/) {
        Object.defineProperty(this, "line", {
          value: this.line + 1,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(this, "column", {
          value: 1,
          enumerable: true,
          configurable: true,
        });
      } else {
        Object.defineProperty(this, "column", {
          value: this.column + 1,
          enumerable: true,
          configurable: true,
        });
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
        Object.defineProperty(this, "index", {
          value: index,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(this, "offset", {
          value: mark.offset,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(this, "line", {
          value: mark.line,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(this, "column", {
          value: mark.column,
          enumerable: true,
          configurable: true,
        });
        return this;
      } else {
        const error = new InputException("invalid seek to " + mark);
        return new InputError(error, this.id, this.mark, this.settings);
      }
    } else {
      Object.defineProperty(this, "index", {
        value: 0,
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(this, "offset", {
        value: 0,
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(this, "line", {
        value: 1,
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(this, "column", {
        value: 1,
        enumerable: true,
        configurable: true,
      });
      return this;
    }
  }

  readonly id!: string | undefined;

  override withId(id: string | undefined): Input {
    Object.defineProperty(this, "id", {
      value: id,
      enumerable: true,
      configurable: true,
    });
    return this;
  }

  override get mark(): Mark {
    return Mark.at(this.offset, this.line, this.column);
  }

  override withMark(mark: Mark): Input {
    Object.defineProperty(this, "offset", {
      value: mark.offset,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "line", {
      value: mark.line,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "column", {
      value: mark.column,
      enumerable: true,
      configurable: true,
    });
    return this;
  }

  override readonly offset!: number;

  override readonly line!: number;

  override readonly column!: number;

  override readonly settings!: InputSettings;

  override withSettings(settings: AnyInputSettings): Input {
    settings = InputSettings.fromAny(settings);
    Object.defineProperty(this, "settings", {
      value: settings,
      enumerable: true,
      configurable: true,
    });
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
