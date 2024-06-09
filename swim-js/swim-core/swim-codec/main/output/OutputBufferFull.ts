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

import {OutputException} from "./OutputException";
import type {OutputSettingsLike} from "./OutputSettings";
import {OutputSettings} from "./OutputSettings";
import {OutputBuffer} from "./OutputBuffer";
import {OutputBufferDone} from "../"; // forward import
import {OutputBufferError} from "../"; // forward import

/** @internal */
export class OutputBufferFull extends OutputBuffer<never> {
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

  override asPart(part: boolean): OutputBuffer<never> {
    return part ? this : new OutputBufferDone(this.settings);
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
    return new OutputBufferError(new OutputException("full"), this.settings);
  }

  override writeln(string?: string): OutputBuffer<never> {
    return new OutputBufferError(new OutputException("full"), this.settings);
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

  override withSettings(settings: OutputSettingsLike): OutputBuffer<never> {
    settings = OutputSettings.fromLike(settings);
    return new OutputBufferFull(settings);
  }

  override clone(): OutputBuffer<never> {
    return this;
  }
}
