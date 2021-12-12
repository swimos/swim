// Copyright 2015-2021 Swim.inc
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
import {InputBuffer} from "./InputBuffer";
import {InputBufferDone} from "../"; // forward import
import {InputBufferError} from "../"; // forward import

/** @internal */
export class InputBufferEmpty extends InputBuffer {
  constructor(id: string | undefined, mark: Mark, settings: InputSettings) {
    super();
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
    return true;
  }

  override isDone(): boolean {
    return false;
  }

  override isError(): boolean {
    return false;
  }

  override isPart(): boolean {
    return true;
  }

  override asPart(part: boolean): InputBuffer {
    return part ? this : new InputBufferDone(this.id, this.mark, this.settings);
  }

  override get index(): number {
    return 0;
  }

  override withIndex(index: number): InputBuffer {
    if (index === 0) {
      return this;
    } else {
      const error = new InputException("invalid index");
      return new InputBufferError(error, this.id, this.mark, this.settings);
    }
  }

  override get limit(): number {
    return 0;
  }

  override withLimit(limit: number): InputBuffer {
    if (limit === 0) {
      return this;
    } else {
      const error = new InputException("invalid limit");
      return new InputBufferError(error, this.id, this.mark, this.settings);
    }
  }

  override get capacity(): number {
    return 0;
  }

  override get remaining(): number {
    return 0;
  }

  override has(index: number): boolean {
    return false;
  }

  override get(index: number): number {
    throw new InputException();
  }

  override set(index: number, token: number): void {
    throw new InputException();
  }

  override head(): number {
    throw new InputException();
  }

  override step(offset?: number): InputBuffer {
    const error = new InputException("empty step");
    return new InputBufferError(error, this.id, this.mark, this.settings);
  }

  override seek(mark: Mark): InputBuffer {
    const error = new InputException("empty seek");
    return new InputBufferError(error, this.id, this.mark, this.settings);
  }

  override readonly id!: string | undefined;

  override withId(id: string | undefined): InputBuffer {
    return new InputBufferEmpty(id, this.mark, this.settings);
  }

  override readonly mark!: Mark;

  override withMark(mark: Mark): InputBuffer {
    return new InputBufferEmpty(this.id, mark, this.settings);
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

  override withSettings(settings: AnyInputSettings): InputBuffer {
    settings = InputSettings.fromAny(settings);
    return new InputBufferEmpty(this.id, this.mark, settings);
  }

  override clone(): InputBuffer {
    return this;
  }
}
