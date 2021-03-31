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

import {OutputException} from "./OutputException";
import {AnyOutputSettings, OutputSettings} from "./OutputSettings";
import {OutputBuffer} from "./OutputBuffer";

/** @hidden */
export class OutputBufferError extends OutputBuffer<never> {
  constructor(error: Error, settings: OutputSettings) {
    super();
    Object.defineProperty(this, "error", {
      value: error,
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

  isFull(): boolean {
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

  asPart(part: boolean): OutputBuffer<never> {
    return this;
  }

  get index(): number {
    return 0;
  }

  withIndex(index: number): OutputBuffer<never> {
    if (index === 0) {
      return this;
    } else {
      return new OutputBufferError(new OutputException("invalid index"), this.settings);
    }
  }

  get limit(): number {
    return 0;
  }

  withLimit(limit: number): OutputBuffer<never> {
    if (limit === 0) {
      return this;
    } else {
      return new OutputBufferError(new OutputException("invalid limit"), this.settings);
    }
  }

  get capacity(): number {
    return 0;
  }

  get remaining(): number {
    return 0;
  }

  has(index: number): boolean {
    return false;
  }

  get(index: number): number {
    throw new OutputException();
  }

  set(index: number, token: number): void {
    throw new OutputException();
  }

  write(token: number): OutputBuffer<never>;
  write(string: string): OutputBuffer<never>;
  write(tokenOrString: number | string): OutputBuffer<never> {
    return this;
  }

  writeln(string?: string): OutputBuffer<never> {
    return this;
  }

  step(offset: number = 1): OutputBuffer<never> {
    if (offset === 0) {
      return this;
    } else {
      return new OutputBufferError(new OutputException("invalid step"), this.settings);
    }
  }

  bind(): never {
    throw new OutputException();
  }

  /** @hidden */
  declare readonly error: Error;

  trap(): Error {
    return this.error;
  }

  declare readonly settings: OutputSettings;

  withSettings(settings: AnyOutputSettings): OutputBuffer<never> {
    settings = OutputSettings.fromAny(settings);
    return new OutputBufferError(this.error, settings);
  }

  clone(): OutputBuffer<never> {
    return this;
  }
}
