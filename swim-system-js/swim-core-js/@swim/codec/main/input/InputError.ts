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

import type {Mark} from "../source/Mark";
import {InputException} from "./InputException";
import {AnyInputSettings, InputSettings} from "./InputSettings";
import {Input} from "./Input";

/** @hidden */
export class InputError extends Input {
  /** @hidden */
  declare readonly error: Error;

  constructor(error: Error, id: string | undefined, mark: Mark, settings: InputSettings) {
    super();
    Object.defineProperty(this, "error", {
      value: error,
      enumerable: true,
    });
    Object.defineProperty(this, "id", {
      value: id,
      enumerable: true,
    });
    Object.defineProperty(this, "mark", {
      value: mark,
      enumerable: true,
    });
    Object.defineProperty(this, "settings", {
      value: settings,
      enumerable: true,
    });
  }

  isCont(): boolean {
    return false;
  }

  isEmpty(): boolean {
    return false;
  }

  isDone(): boolean {
    return false;
  }

  isError(): boolean {
    return true;
  }

  isPart(): boolean {
    return false;
  }

  asPart(part: boolean): Input {
    return this;
  }

  head(): number {
    throw new InputException();
  }

  step(): Input {
    const error = new InputException("error step");
    return new InputError(error, this.id, this.mark, this.settings);
  }

  trap(): Error {
    return this.error;
  }

  seek(mark?: Mark): Input {
    const error = new InputException("error seek");
    return new InputError(error, this.id, this.mark, this.settings);
  }

  declare readonly id: string | undefined;

  withId(id: string | undefined): Input {
    return new InputError(this.error, id, this.mark, this.settings);
  }

  declare readonly mark: Mark;

  withMark(mark: Mark): Input {
    return new InputError(this.error, this.id, mark, this.settings);
  }

  get offset(): number {
    return this.mark.offset;
  }

  get line(): number {
    return this.mark.line;
  }

  get column(): number {
    return this.mark.column;
  }

  declare readonly settings: InputSettings;

  withSettings(settings: AnyInputSettings): Input {
    settings = InputSettings.fromAny(settings);
    return new InputError(this.error, this.id, this.mark, settings);
  }

  clone(): Input {
    return this;
  }
}
