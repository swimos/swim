// Copyright 2015-2024 Nstream, inc.
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
import type {InputSettingsLike} from "./InputSettings";
import {InputSettings} from "./InputSettings";
import {Input} from "./Input";

/** @internal */
export class InputError extends Input {
  /** @internal */
  readonly error!: Error;

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

  override isCont(): boolean {
    return false;
  }

  override isEmpty(): boolean {
    return false;
  }

  override isDone(): boolean {
    return false;
  }

  override isError(): boolean {
    return true;
  }

  override isPart(): boolean {
    return false;
  }

  override asPart(part: boolean): Input {
    return this;
  }

  override head(): number {
    throw new InputException();
  }

  override step(): Input {
    const error = new InputException("error step");
    return new InputError(error, this.id, this.mark, this.settings);
  }

  override trap(): Error {
    return this.error;
  }

  override seek(mark?: Mark): Input {
    const error = new InputException("error seek");
    return new InputError(error, this.id, this.mark, this.settings);
  }

  override readonly id!: string | undefined;

  override withId(id: string | undefined): Input {
    return new InputError(this.error, id, this.mark, this.settings);
  }

  override readonly mark!: Mark;

  override withMark(mark: Mark): Input {
    return new InputError(this.error, this.id, mark, this.settings);
  }

  override get offset(): number {
    return this.mark.offset;
  }

  override get line(): number {
    return this.mark.line;
  }

  override get column(): number {
    return this.mark.column;
  }

  override readonly settings!: InputSettings;

  override withSettings(settings: InputSettingsLike): Input {
    settings = InputSettings.fromLike(settings);
    return new InputError(this.error, this.id, this.mark, settings);
  }

  override clone(): Input {
    return this;
  }
}
