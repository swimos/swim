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

import type {Mutable} from "@swim/util";
import {AnyOutputSettings, OutputSettings} from "../output/OutputSettings";
import {Output} from "../output/Output";

/** @hidden */
export abstract class ByteOutput<T> extends Output<T> {
  constructor(array: Uint8Array | null, size: number, settings: OutputSettings) {
    super();
    this.array = array;
    this.size = size;
    this.settings = settings;
  }

  /** @hidden */
  readonly array: Uint8Array | null;

  /** @hidden */
  readonly size: number;

  override isCont(): boolean {
    return true;
  }

  override isFull(): boolean {
    return false;
  }

  override isDone(): boolean {
    return false;
  }

  override isError(): boolean {
    return false;
  }

  override isPart(): boolean {
    return false;
  }

  override asPart(part: boolean): Output<T> {
    return this;
  }

  override write(b: number | string): Output<T> {
    if (typeof b === "number") {
      const n = this.size;
      const oldArray = this.array;
      let newArray;
      if (oldArray === null || n + 1 > oldArray.length) {
        newArray = new Uint8Array(ByteOutput.expand(n + 1));
        if (oldArray !== null) {
          newArray.set(oldArray, 0);
        }
        (this as Mutable<this>).array = newArray;
      } else {
        newArray = oldArray;
      }
      newArray[n] = b;
      (this as Mutable<this>).size = n + 1;
      return this;
    } else {
      throw new TypeError("" + b);
    }
  }

  override writeln(string?: string): Output<T> {
    throw new TypeError("" + string);
  }

  toUint8Array(): Uint8Array {
    const n = this.size;
    const oldArray = this.array;
    if (oldArray !== null && n === oldArray.length) {
      return oldArray;
    } else {
      const newArray = new Uint8Array(n);
      if (oldArray !== null) {
        newArray.set(oldArray.slice(0, n), 0);
      }
      (this as Mutable<this>).array = newArray;
      return newArray;
    }
  }

  cloneArray(): Uint8Array | null {
    const oldArray = this.array;
    if (oldArray !== null) {
      return oldArray.slice(0, this.size);
    } else {
      return null;
    }
  }

  override readonly settings: OutputSettings;

  override withSettings(settings: AnyOutputSettings): Output<T> {
    settings = OutputSettings.fromAny(settings);
    (this as Mutable<this>).settings = settings;
    return this;
  }

  /** @hidden */
  static expand(n: number): number {
    n = Math.max(32, n) - 1;
    n |= n >> 1; n |= n >> 2; n |= n >> 4; n |= n >> 8; n |= n >> 16;
    return n + 1;
  }
}
