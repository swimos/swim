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

import {OutputException} from "./OutputException";
import {AnyOutputSettings, OutputSettings} from "./OutputSettings";
import {OutputBuffer} from "./OutputBuffer";
import {OutputBufferFull} from "../"; // forward import
import {OutputBufferError} from "../"; // forward import

/** @internal */
export class OutputBufferDone extends OutputBuffer<never> {
  constructor(settings: OutputSettings) {
    super();
    Object.defineProperty(this, "settings", {
      value: settings,
      enumerable: true,
    });
  }

  override isCont(): boolean {
    return false;
  }

  override isFull(): boolean {
    return false;
  }

  override isDone(): boolean {
    return true;
  }

  override isError(): boolean {
    return false;
  }

  override isPart(): boolean {
    return false;
  }

  override asPart(part: boolean): OutputBuffer<never> {
    return part ? new OutputBufferFull(this.settings) : this;
  }

  override get index(): number {
    return 0;
  }

  override withIndex(index: number): OutputBuffer<never> {
    if (index === 0) {
      return this;
    } else {
      return new OutputBufferError(new OutputException("invalid index"), this.settings);
    }
  }

  override get limit(): number {
    return 0;
  }

  override withLimit(limit: number): OutputBuffer<never> {
    if (limit === 0) {
      return this;
    } else {
      return new OutputBufferError(new OutputException("invalid limit"), this.settings);
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
    throw new OutputException();
  }

  override set(index: number, token: number): void {
    throw new OutputException();
  }

  override write(token: number): OutputBuffer<never>;
  override write(string: string): OutputBuffer<never>;
  override write(tokenOrString: number | string): OutputBuffer<never> {
    return new OutputBufferError(new OutputException("done"), this.settings);
  }

  override writeln(string?: string): OutputBuffer<never> {
    return new OutputBufferError(new OutputException("done"), this.settings);
  }

  override step(offset: number = 1): OutputBuffer<never> {
    if (offset === 0) {
      return this;
    } else {
      return new OutputBufferError(new OutputException("invalid step"), this.settings);
    }
  }

  override bind(): never {
    throw new OutputException();
  }

  override readonly settings!: OutputSettings;

  override withSettings(settings: AnyOutputSettings): OutputBuffer<never> {
    settings = OutputSettings.fromAny(settings);
    return new OutputBufferDone(settings);
  }

  override clone(): OutputBuffer<never> {
    return this;
  }
}
