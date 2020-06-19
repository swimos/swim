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
export class Uint8ArrayOutput extends OutputBuffer<Uint8Array> {
  /** @hidden */
  _array: Uint8Array;
  /** @hidden */
  _index: number;
  /** @hidden */
  _limit: number;
  /** @hidden */
  _settings: OutputSettings;
  /** @hidden */
  _isPart: boolean;

  constructor(array: Uint8Array, index: number, limit: number,
              settings: OutputSettings = OutputSettings.standard(), isPart: boolean = false) {
    super();
    this._array = array;
    this._index = index;
    this._limit = limit;
    this._settings = settings;
    this._isPart = isPart;
  }

  isCont(): boolean {
    return this._index < this._limit;
  }

  isFull(): boolean {
    return this._isPart && this._index >= this._limit;
  }

  isDone(): boolean {
    return !this._isPart && this._index >= this._limit;
  }

  isError(): boolean {
    return false;
  }

  isPart(): boolean;
  isPart(isPart: boolean): OutputBuffer<Uint8Array>;
  isPart(isPart?: boolean): boolean | OutputBuffer<Uint8Array> {
    if (isPart === void 0) {
      return this._isPart;
    } else {
      this._isPart = isPart;
      return this;
    }
  }

  index(): number;
  index(index: number): OutputBuffer<Uint8Array>;
  index(index?: number): number | OutputBuffer<Uint8Array> {
    if (index === void 0) {
      return this._index;
    } else if (0 <= index && index <= this._limit) {
      this._index = index;
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid index"), this._settings);
    }
  }

  limit(): number;
  limit(limit: number): OutputBuffer<Uint8Array>;
  limit(limit?: number): number | OutputBuffer<Uint8Array> {
    if (limit === void 0) {
      return this._limit;
    } else if (0 <= limit && limit <= this._array.length) {
      this._limit = limit;
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid limit"), this._settings);
    }
  }

  capacity(): number {
    return this._array.length;
  }

  remaining(): number {
    return this._limit - this._index;
  }

  has(index: number): boolean {
    return 0 <= index && index < this._limit;
  }

  get(index: number): number {
    if (0 <= index && index < this._limit) {
      return this._array[index];
    } else {
      throw new OutputException();
    }
  }

  set(index: number, token: number): void {
    if (0 <= index && index < this._limit) {
      this._array[index] = token;
    } else {
      throw new OutputException();
    }
  }

  write(token: number | string): OutputBuffer<Uint8Array> {
    if (typeof token === "number") {
      const index = this._index;
      if (index < this._limit) {
        this._array[index] = token;
        this._index = index + 1;
        return this;
      } else {
        return OutputBuffer.error(new OutputException("full"), this._settings);
      }
    } else {
      return OutputBuffer.error(new OutputException("binary output"), this._settings);
    }
  }

  writeln(string?: string): OutputBuffer<Uint8Array> {
    return OutputBuffer.error(new OutputException("binary output"), this._settings);
  }

  step(offset: number): OutputBuffer<Uint8Array> {
    const index = this._index + offset;
    if (0 <= index && index <= this._limit) {
      this._index = index;
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid step"), this._settings);
    }
  }

  bind(): Uint8Array {
    return new Uint8Array(this._array.buffer, 0, this._index);
  }

  settings(): OutputSettings;
  settings(settings: AnyOutputSettings): OutputBuffer<Uint8Array>;
  settings(settings?: AnyOutputSettings): OutputSettings | OutputBuffer<Uint8Array> {
    if (settings === void 0) {
      return this._settings;
    } else {
      this._settings = OutputSettings.fromAny(settings);
      return this;
    }
  }

  clone(): OutputBuffer<Uint8Array> {
    return new Uint8ArrayOutput(this._array, this._index, this._limit, this._settings, this._isPart);
  }
}
