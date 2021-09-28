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

import {Lazy, Mutable, Random, Murmur3, Numbers, Constructors, Interpolator} from "@swim/util";
import {Input, OutputSettings, Output, Writer, Unicode, Base16, Base64} from "@swim/codec";
import {Item} from "./Item";
import {Value} from "./Value";
import {DataOutput} from "./"; // forward import

export type AnyData = Data | Uint8Array;

export class Data extends Value {
  constructor(array: Uint8Array | null, size: number, flags: number) {
    super();
    this.array = array;
    this.size = size;
    this.flags = flags;
  }

  /** @hidden */
  readonly array: Uint8Array | null;

  override isConstant(): boolean {
    return true;
  }

  readonly size: number;

  /** @hidden */
  readonly flags: number;

  getByte(index: number): number {
    if (index < 0 || index >= this.size) {
      throw new RangeError("" + index);
    }
    return this.array![index]!;
  }

  setByte(index: number, value: number): Data {
    const flags = this.flags;
    if ((flags & Data.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    } else if (index < 0 || index >= this.size) {
      throw new RangeError("" + index);
    }
    if ((flags & Data.AliasedFlag) !== 0) {
      return this.setByteAliased(index, value);
    } else {
      return this.setByteMutable(index, value);
    }
  }

  /** @hidden */
  setByteAliased(index: number, value: number): Data {
    const n = this.size;
    const oldArray = this.array!;
    const newArray = new Uint8Array(Data.expand(n));
    newArray.set(oldArray, 0);
    newArray[index] = value;
    (this as Mutable<this>).array = newArray;
    (this as Mutable<this>).flags &= ~Data.AliasedFlag;
    return this;
  }

  /** @hidden */
  setByteMutable(index: number, value: number): Data {
    this.array![index] = value;
    return this;
  }

  addByte(value: number): Data {
    const flags = this.flags;
    if ((flags & Data.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    if ((flags & Data.AliasedFlag) !== 0) {
      return this.addByteAliased(value);
    } else {
      return this.addByteMutable(value);
    }
  }

  /** @hidden */
  addByteAliased(value: number): Data {
    const n = this.size;
    const oldArray = this.array;
    const newArray = new Uint8Array(Data.expand(n + 1));
    if (oldArray !== null) {
      newArray.set(oldArray, 0);
    }
    newArray[n] = value;
    (this as Mutable<this>).array = newArray;
    (this as Mutable<this>).size = n + 1;
    (this as Mutable<this>).flags &= ~Data.AliasedFlag;
    return this;
  }

  /** @hidden */
  addByteMutable(value: number): Data {
    const n = this.size;
    const oldArray = this.array;
    let newArray;
    if (oldArray === null || n + 1 > oldArray.length) {
      newArray = new Uint8Array(Data.expand(n + 1));
      if (oldArray !== null) {
        newArray.set(oldArray, 0);
      }
      (this as Mutable<this>).array = newArray;
    } else {
      newArray = oldArray;
    }
    newArray[n] = value;
    (this as Mutable<this>).size = n + 1;
    return this;
  }

  addData(data: Data): Data {
    let array = data.array;
    if (array !== null) {
      const size = data.size;
      if (array.length > size) {
        array = array.slice(0, size);
      }
      return this.addUint8Array(array);
    } else {
      return this;
    }
  }

  addUint8Array(array: Uint8Array): Data {
    const flags = this.flags;
    if ((flags & Data.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    if ((flags & Data.AliasedFlag) !== 0) {
      return this.addUint8ArrayAliased(array);
    } else {
      return this.addUint8ArrayMutable(array);
    }
  }

  /** @hidden */
  addUint8ArrayAliased(array: Uint8Array): Data {
    const size = array.length;
    if (size === 0) {
      return this;
    }
    const n = this.size;
    const oldArray = this.array;
    const newArray = new Uint8Array(Data.expand(n + size));
    if (oldArray !== null) {
      newArray.set(oldArray, 0);
    }
    newArray.set(array, n);
    (this as Mutable<this>).array = newArray;
    (this as Mutable<this>).size = n + size;
    (this as Mutable<this>).flags &= ~Data.AliasedFlag;
    return this;
  }

  /** @hidden */
  addUint8ArrayMutable(array: Uint8Array): Data {
    const size = array.length;
    if (size === 0) {
      return this;
    }
    const n = this.size;
    const oldArray = this.array;
    let newArray;
    if (oldArray === null || n + size > oldArray.length) {
      newArray = new Uint8Array(Data.expand(n + size));
      if (oldArray !== null) {
        newArray.set(oldArray, 0);
      }
      (this as Mutable<this>).array = newArray;
    } else {
      newArray = oldArray;
    }
    newArray.set(array, n);
    (this as Mutable<this>).size = n + size;
    return this;
  }

  clear(): void {
    if ((this.flags & Data.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    (this as Mutable<this>).array = null;
    (this as Mutable<this>).size = 0;
    (this as Mutable<this>).flags = Data.AliasedFlag;
  }

  toUint8Array(): Uint8Array {
    const oldArray = this.array;
    const flags = this.flags;
    if ((flags & Data.ImmutableFlag) !== 0) {
      return oldArray !== null ? oldArray.slice(0) : new Uint8Array(0);
    } else if ((flags & Data.AliasedFlag) !== 0 || this.size !== oldArray!.length) {
      const newArray = oldArray !== null ? oldArray.slice(0) : new Uint8Array(0);
      (this as Mutable<this>).array = newArray;
      (this as Mutable<this>).flags &= ~Data.AliasedFlag;
      return newArray;
    } else {
      return oldArray!;
    }
  }

  asUint8Array(): Uint8Array | undefined {
    let array: Uint8Array | undefined;
    if (this.array !== null && this.size > 0) {
      array = this.array;
      if (array.length !== this.size) {
        array = new Uint8Array(array.buffer, array.byteOffset, this.size);
      }
    } else {
      array = void 0;
    }
    return array;
  }

  override toAny(): AnyData {
    return this.toUint8Array();
  }

  override isAliased(): boolean {
    return (this.flags & Data.AliasedFlag) !== 0;
  }

  override isMutable(): boolean {
    return (this.flags & Data.ImmutableFlag) === 0;
  }

  override branch(): Data {
    (this as Mutable<this>).flags |= Data.AliasedFlag;
    return new Data(this.array, this.size, Data.AliasedFlag);
  }

  override clone(): Data {
    return this.branch();
  }

  override commit(): this {
    (this as Mutable<this>).flags |= Data.ImmutableFlag;
    return this;
  }

  writeBase16(output: Output, base16: Base16 = Base16.uppercase): Writer<unknown, unknown> {
    let array = this.array;
    const size = this.size;
    if (array !== null && size !== 0) {
      if (array.length !== size) {
        array = array.slice(0, size);
      }
      return base16.writeUint8Array(output, array);
    } else {
      return Writer.end();
    }
  }

  toBase16(base16: Base16 = Base16.uppercase): string {
    const output = Unicode.stringOutput();
    this.writeBase16(output, base16).bind();
    return output.bind();
  }

  writeBase64(output: Output, base64: Base64 = Base64.standard()): Writer<unknown, unknown> {
    let array = this.array;
    const size = this.size;
    if (array !== null && size !== 0) {
      if (array.length !== size) {
        array = array.slice(0, size);
      }
      return base64.writeUint8Array(output, array);
    } else {
      return Writer.end();
    }
  }

  toBase64(base64: Base64 = Base64.standard()): string {
    const output = Unicode.stringOutput();
    this.writeBase64(output, base64);
    return output.bind();
  }

  override interpolateTo(that: Data): Interpolator<Data>;
  override interpolateTo(that: Item): Interpolator<Item>;
  override interpolateTo(that: unknown): Interpolator<Item> | null;
  override interpolateTo(that: unknown): Interpolator<Item> | null {
    return super.interpolateTo(that);
  }

  override get typeOrder(): number {
    return 4;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Data) {
      const xs = this.array!;
      const ys = that.array!;
      const xn = this.size;
      const yn = that.size;
      let order = 0;
      let i = 0;
      do {
        if (i < xn && i < yn) {
          order = xs[i]! - ys[i]!;
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
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: Item): boolean {
    return this.equals(that);
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Data) {
      const xs = this.array!;
      const ys = that.array!;
      const xn = this.size;
      if (xn !== that.size) {
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

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mixUint8Array(Constructors.hash(Data),
        this.array !== null ? this.array : new Uint8Array(0)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Data").write(46/*'.'*/);
    if (this.size === 0) {
      output = output.write("empty").write(40/*'('*/).write(41/*')'*/);
    } else {
      output = output.write("base16").write(40/*'('*/).write(34/*'"'*/);
      const writer = this.writeBase16(output);
      if (!writer.isDone()) {
        return Output.error(writer.trap());
      }
      output = output.write(34/*'"'*/).write(41/*')'*/);
    }
    return output;
  }

  /** @hidden */
  static readonly AliasedFlag: number = 1 << 0;
  /** @hidden */
  static readonly ImmutableFlag: number = 1 << 1;

  @Lazy
  static override empty(): Data {
    return new Data(null, 0, Data.AliasedFlag | Data.ImmutableFlag);
  }

  static create(initialCapacity?: number): Data {
    if (initialCapacity === void 0) {
      return new Data(null, 0, Data.AliasedFlag);
    } else {
      return new Data(new Uint8Array(initialCapacity), 0, 0);
    }
  }

  static wrap(value: Uint8Array): Data {
    return new Data(value, value.length, Data.AliasedFlag);
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

  static override fromAny(value: AnyData): Data {
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

  static output(): Output<Data>;
  static output(initialCapacity: number): Output<Data>;
  static output(data: Data): Output<Data>;
  static output(data?: number | Data): Output<Data> {
    if (!(data instanceof Data)) {
      data = Data.create(data);
    }
    return new DataOutput(data, OutputSettings.standard());
  }

  /** @hidden */
  static expand(n: number): number {
    n = Math.max(32, n) - 1;
    n |= n >> 1; n |= n >> 2; n |= n >> 4; n |= n >> 8; n |= n >> 16;
    return n + 1;
  }
}
