// Copyright 2015-2019 SWIM.AI inc.
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

import {Murmur3, Objects, Random} from "@swim/util";
import {Input, OutputSettings, Output, Writer, Unicode, Base16, Base64} from "@swim/codec";
import {Item} from "./Item";
import {Value} from "./Value";
import {DataOutput} from "./DataOutput";

export type AnyData = Data | Uint8Array;

export class Data extends Value {
  /** @hidden */
  _array: Uint8Array | null;
  /** @hidden */
  _size: number;
  /** @hidden */
  _flags: number;

  constructor(array: Uint8Array | null, size: number, flags: number) {
    super();
    this._array = array;
    this._size = size;
    this._flags = flags;
  }

  isConstant(): boolean {
    return true;
  }

  get size(): number {
    return this._size;
  }

  getByte(index: number): number {
    if (index < 0 || index >= this.size) {
      throw new RangeError("" + index);
    }
    return this._array![index];
  }

  setByte(index: number, value: number): Data {
    const flags = this._flags;
    if ((flags & Data.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    } else if (index < 0 || index >= this._size) {
      throw new RangeError("" + index);
    }
    if ((flags & Data.ALIASED) !== 0) {
      return this.setByteAliased(index, value);
    } else {
      return this.setByteMutable(index, value);
    }
  }

  private setByteAliased(index: number, value: number): Data {
    const n = this.size;
    const oldArray = this._array!;
    const newArray = new Uint8Array(Data.expand(n));
    newArray.set(oldArray, 0);
    newArray[index] = value;
    this._array = newArray;
    this._flags &= ~Data.ALIASED;
    return this;
  }

  private setByteMutable(index: number, value: number): Data {
    this._array![index] = value;
    return this;
  }

  public addByte(value: number): Data {
    const flags = this._flags;
    if ((flags & Data.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    if ((flags & Data.ALIASED) !== 0) {
      return this.addByteAliased(value);
    } else {
      return this.addByteMutable(value);
    }
  }

  private addByteAliased(value: number): Data {
    const n = this.size;
    const oldArray = this._array;
    const newArray = new Uint8Array(Data.expand(n + 1));
    if (oldArray != null) {
      newArray.set(oldArray, 0);
    }
    newArray[n] = value;
    this._array = newArray;
    this._size = n + 1;
    this._flags &= ~Data.ALIASED;
    return this;
  }

  private addByteMutable(value: number): Data {
    const n = this.size;
    const oldArray = this._array;
    let newArray;
    if (oldArray === null || n + 1 > oldArray.length) {
      newArray = new Uint8Array(Data.expand(n + 1));
      if (oldArray !== null) {
        newArray.set(oldArray, 0);
      }
      this._array = newArray;
    } else {
      newArray = oldArray;
    }
    newArray[n] = value;
    this._size = n + 1;
    return this;
  }

  addData(data: Data): Data {
    let array = data._array;
    if (array !== null) {
      const size = data._size;
      if (array.length > size) {
        array = array.slice(0, size);
      }
      return this.addUint8Array(array);
    } else {
      return this;
    }
  }

  addUint8Array(array: Uint8Array): Data {
    const flags = this._flags;
    if ((flags & Data.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    if ((flags & Data.ALIASED) !== 0) {
      return this.addUint8ArrayAliased(array);
    } else {
      return this.addUint8ArrayMutable(array);
    }
  }

  private addUint8ArrayAliased(array: Uint8Array): Data {
    const size = array.length;
    if (size === 0) {
      return this;
    }
    const n = this.size;
    const oldArray = this._array;
    const newArray = new Uint8Array(Data.expand(n + size));
    if (oldArray !== null) {
      newArray.set(oldArray, 0);
    }
    newArray.set(array, n);
    this._array = newArray;
    this._size = n + size;
    this._flags &= ~Data.ALIASED;
    return this;
  }

  private addUint8ArrayMutable(array: Uint8Array): Data {
    const size = array.length;
    if (size === 0) {
      return this;
    }
    const n = this.size;
    const oldArray = this._array;
    let newArray;
    if (oldArray === null || n + size > oldArray.length) {
      newArray = new Uint8Array(Data.expand(n + size));
      if (oldArray !== null) {
        newArray.set(oldArray, 0);
      }
      this._array = newArray;
    } else {
      newArray = oldArray;
    }
    newArray.set(array, n);
    this._size = n + size;
    return this;
  }

  clear(): void {
    if ((this._flags & Data.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    this._array = null;
    this._size = 0;
    this._flags = Data.ALIASED;
  }

  toUint8Array(): Uint8Array {
    const oldArray = this._array;
    const flags = this._flags;
    if ((flags & Data.IMMUTABLE) !== 0) {
      return oldArray !== null ? oldArray.slice(0) : new Uint8Array(0);
    } else if ((flags & Data.ALIASED) !== 0 || this._size !== oldArray!.length) {
      const newArray = oldArray !== null ? oldArray.slice(0) : new Uint8Array(0);
      this._array = newArray;
      this._flags &= ~Data.ALIASED;
      return newArray;
    } else {
      return oldArray!;
    }
  }

  asUint8Array(): Uint8Array | undefined {
    let array: Uint8Array | undefined;
    if (this._array && this._size > 0) {
      array = this._array;
      if (array.length !== this._size) {
        array = new Uint8Array(array.buffer, array.byteOffset, this._size);
      }
    } else {
      array = void 0;
    }
    return array;
  }

  toAny(): AnyData {
    return this.toUint8Array();
  }

  isAliased(): boolean {
    return (this._flags & Data.ALIASED) !== 0;
  }

  isMutable(): boolean {
    return (this._flags & Data.IMMUTABLE) === 0;
  }

  branch(): Data {
    this._flags |= Data.ALIASED;
    return new Data(this._array, this._size, Data.ALIASED);
  }

  clone(): Data {
    return this.branch();
  }

  commit(): this {
    this._flags |= Data.IMMUTABLE;
    return this;
  }

  writeBase16(output: Output, base16: Base16 = Base16.uppercase()): Writer<unknown, unknown> {
    let array = this._array;
    const size = this._size;
    if (array !== null && size !== 0) {
      if (array.length !== size) {
        array = array.slice(0, size);
      }
      return base16.writeUint8Array(array, output);
    } else {
      return Writer.done();
    }
  }

  toBase16(base16: Base16 = Base16.uppercase()): string {
    const output = Unicode.stringOutput();
    this.writeBase16(output, base16);
    return output.bind();
  }

  writeBase64(output: Output, base64: Base64 = Base64.standard()): Writer<unknown, unknown> {
    let array = this._array;
    const size = this._size;
    if (array !== null && size !== 0) {
      if (array.length !== size) {
        array = array.slice(0, size);
      }
      return base64.writeUint8Array(array, output);
    } else {
      return Writer.done();
    }
  }

  toBase64(base64: Base64 = Base64.standard()): string {
    const output = Unicode.stringOutput();
    this.writeBase64(output, base64);
    return output.bind();
  }

  typeOrder(): number {
    return 4;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof Data) {
      const xs = this._array!;
      const ys = that._array!;
      const xn = this._size;
      const yn = that._size;
      let order = 0;
      let i = 0;
      do {
        if (i < xn && i < yn) {
          order = xs[i] - ys[i];
          i += 1;
        } else {
          break;
        }
      } while (order === 0);
      if (order > 0) {
        return 1;
      } else if (order < 0) {
        return -1;
      } else if (xn > yn) {
        return 1;
      } else if (xn < yn) {
        return -1;
      } else {
        return 0;
      }
    }
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Data) {
      const xs = this._array!;
      const ys = that._array!;
      const xn = this._size;
      if (xn !== that._size) {
        return false;
      }
      for (let i = 0; i < xn; i += 1) {
        if (xs[i] !== ys[i]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  hashCode(): number {
    if (Data._hashSeed === void 0) {
      Data._hashSeed = Murmur3.seed(Data);
    }
    return Murmur3.mash(Murmur3.mix(Data._hashSeed, this._array || new Uint8Array(0)));
  }

  debug(output: Output): void {
    output = output.write("Data").write(46/*'.'*/);
    if (this._size === 0) {
      output = output.write("empty").write(40/*'('*/).write(41/*')'*/);
    } else {
      output = output.write("base16").write(40/*'('*/).write(34/*'"'*/);
      this.writeBase16(output);
      output = output.write(34/*'"'*/).write(41/*')'*/);
    }
  }

  display(output: Output): void {
    this.debug(output);
  }

  /** @hidden */
  static readonly ALIASED: number = 1 << 0;
  /** @hidden */
  static readonly IMMUTABLE: number = 1 << 1;

  private static _hashSeed?: number;

  private static _empty?: Data;

  static output(): Output<Data>;
  static output(initialCapacity: number): Output<Data>;
  static output(data: Data): Output<Data>;
  static output(data?: number | Data): Output<Data> {
    if (!(data instanceof Data)) {
      data = Data.create(data);
    }
    return new DataOutput(data, OutputSettings.standard());
  }

  static empty(): Data {
    if (Data._empty == null) {
      Data._empty = new Data(null, 0, Data.ALIASED | Data.IMMUTABLE);
    }
    return Data._empty;
  }

  static create(initialCapacity?: number): Data {
    if (initialCapacity === void 0) {
      return new Data(null, 0, Data.ALIASED);
    } else {
      return new Data(new Uint8Array(initialCapacity), 0, 0);
    }
  }

  static wrap(value: Uint8Array): Data {
    return new Data(value, value.length, Data.ALIASED);
  }

  static fromBase16(input: Input | string): Data {
    if (typeof input === "string") {
      input = Unicode.stringInput(input);
    }
    return Base16.parse(input, Data.output()).bind();
  }

  static fromBase64(input: Input | string, base64: Base64 = Base64.standard()): Data {
    if (typeof input === "string") {
      input = Unicode.stringInput(input);
    }
    return base64.parse(input, Data.output()).bind();
  }

  static fromAny(value: AnyData): Data {
    if (value instanceof Data) {
      return value;
    } else if (value instanceof Uint8Array) {
      return Data.wrap(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static random(size: number): Data {
    const array = new Uint8Array(size);
    Random.fillBytes(array);
    return Data.wrap(array);
  }

  /** @hidden */
  static expand(n: number): number {
    n = Math.max(32, n) - 1;
    n |= n >> 1; n |= n >> 2; n |= n >> 4; n |= n >> 8; n |= n >> 16;
    return n + 1;
  }
}
Item.Data = Data;
