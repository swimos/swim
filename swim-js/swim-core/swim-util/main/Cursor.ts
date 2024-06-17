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

import {Lazy} from "./Lazy";

/** @public */
export abstract class Cursor<T> implements IterableIterator<T> {
  abstract isEmpty(): boolean;

  abstract head(): T;

  abstract step(): void;

  abstract skip(count: number): void;

  abstract hasNext(): boolean;

  abstract nextIndex(): number;

  abstract next(): IteratorResult<T>;

  abstract hasPrevious(): boolean;

  abstract previousIndex(): number;

  abstract previous(): IteratorResult<T>;

  set(newValue: T): void {
    throw new Error("immutable");
  }

  delete(): void {
    throw new Error("immutable");
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this;
  }

  @Lazy
  static empty<T>(): Cursor<T> {
    return new EmptyCursor();
  }

  static unary<T>(value: T): Cursor<T> {
    return new UnaryCursor<T>(value);
  }

  static array<T>(array: readonly T[], index?: number, limit?: number): Cursor<T> {
    if (index === void 0) {
      index = 0;
    }
    if (limit === void 0) {
      limit = array.length;
    }
    return new ArrayCursor<T>(array, index, limit);
  }

  static keys<K, V>(cursor: Cursor<[K, V]>): Cursor<K> {
    return new KeysCursor<K, V>(cursor);
  }

  static values<K, V>(cursor: Cursor<[K, V]>): Cursor<V> {
    return new ValuesCursor<K, V>(cursor);
  }
}

/** @internal */
export class EmptyCursor<T> extends Cursor<T> {
  override isEmpty(): boolean {
    return true;
  }

  override head(): T {
    throw new Error("empty");
  }

  override step(): void {
    throw new Error("empty");
  }

  override skip(count: number): void {
    // nop
  }

  override hasNext(): boolean {
    return false;
  }

  override nextIndex(): number {
    return 0;
  }

  override next(): IteratorResult<T> {
    return {done: true, value: void 0};
  }

  override hasPrevious(): boolean {
    return false;
  }

  override previousIndex(): number {
    return -1;
  }

  override previous(): IteratorResult<T> {
    return {done: true, value: void 0};
  }
}

/** @internal */
export class UnaryCursor<T> extends Cursor<T> {
  constructor(value: T) {
    super();
    this.value = value;
    this.index = 0;
  }

  /** @internal */
  readonly value: T;

  /** @internal */
  index: number;

  override isEmpty(): boolean {
    return this.index !== 0;
  }

  override head(): T {
    if (this.index !== 0) {
      throw new Error("empty");
    }
    return this.value;
  }

  override step(): void {
    if (this.index !== 0) {
      throw new Error("empty");
    }
    this.index = 1;
  }

  override skip(count: number): void {
    this.index = Math.min(Math.max(0, this.index + count), 1);
  }

  override hasNext(): boolean {
    return this.index === 0;
  }

  override nextIndex(): number {
    return this.index;
  }

  override next(): IteratorResult<T> {
    if (this.index !== 0) {
      return {done: true, value: void 0};
    }
    this.index = 1;
    return {done: true, value: this.value};
  }

  override hasPrevious(): boolean {
    return this.index === 1;
  }

  override previousIndex(): number {
    return this.index - 1;
  }

  override previous(): IteratorResult<T> {
    if (this.index !== 1) {
      return {done: true, value: void 0};
    }
    this.index = 0;
    return {done: true, value: this.value};
  }
}

/** @internal */
export class ArrayCursor<T> extends Cursor<T> {
  constructor(array: readonly T[], index: number, limit: number) {
    super();
    this.array = array;
    this.index = index;
    this.limit = limit;
  }

  /** @internal */
  readonly array: readonly T[];

  /** @internal */
  index: number;

  /** @internal */
  readonly limit: number;

  override isEmpty(): boolean {
    return this.index >= this.limit;
  }

  override head(): T {
    if (this.index >= this.limit) {
      throw new Error("empty");
    }
    return this.array[this.index]!;
  }

  override step(): void {
    const index = this.index;
    if (index >= this.limit) {
      throw new Error("empty");
    }
    this.index += 1;
  }

  override skip(count: number): void {
    this.index = Math.min(this.index + count, this.limit);
  }

  override hasNext(): boolean {
    return this.index < this.limit;
  }

  override nextIndex(): number {
    return this.index;
  }

  override next(): IteratorResult<T> {
    const index = this.index;
    if (index >= this.limit) {
      this.index = this.limit;
      return {done: true, value: void 0};
    }
    this.index += 1;
    return {done: this.index === this.limit, value: this.array[index]!};
  }

  override hasPrevious(): boolean {
    return this.index > 0;
  }

  override previousIndex(): number {
    return this.index - 1;
  }

  override previous(): IteratorResult<T> {
    const index = this.index - 1;
    if (index < 0) {
      this.index = 0;
      return {done: true, value: void 0};
    }
    this.index = index;
    return {done: index === 0, value: this.array[index]!};
  }
}

/** @internal */
export class KeysCursor<K, V> extends Cursor<K> {
  constructor(cursor: Cursor<[K, V]>) {
    super();
    this.cursor = cursor;
  }

  /** @internal */
  readonly cursor: Cursor<[K, V]>;

  override isEmpty(): boolean {
    return this.cursor.isEmpty();
  }

  override head(): K {
    return this.cursor.head()[0];
  }

  override step(): void {
    this.cursor.step();
  }

  override skip(count: number): void {
    this.cursor.skip(count);
  }

  override hasNext(): boolean {
    return this.cursor.hasNext();
  }

  override nextIndex(): number {
    return this.cursor.nextIndex();
  }

  override next(): IteratorResult<K> {
    const next = this.cursor.next();
    return {done: next.done, value: next.value !== void 0 ? next.value[0] : void 0};
  }

  override hasPrevious(): boolean {
    return this.cursor.hasPrevious();
  }

  override previousIndex(): number {
    return this.cursor.previousIndex();
  }

  override previous(): IteratorResult<K> {
    const previous = this.cursor.previous();
    return {done: previous.done, value: previous.value !== void 0 ? previous.value[0] : void 0};
  }

  override delete(): void {
    this.cursor.delete();
  }
}

/** @internal */
export class ValuesCursor<K, V> extends Cursor<V> {
  constructor(cursor: Cursor<[K, V]>) {
    super();
    this.cursor = cursor;
  }

  /** @internal */
  readonly cursor: Cursor<[K, V]>;

  override isEmpty(): boolean {
    return this.cursor.isEmpty();
  }

  override head(): V {
    return this.cursor.head()[1];
  }

  override step(): void {
    this.cursor.step();
  }

  override skip(count: number): void {
    this.cursor.skip(count);
  }

  override hasNext(): boolean {
    return this.cursor.hasNext();
  }

  override nextIndex(): number {
    return this.cursor.nextIndex();
  }

  override next(): IteratorResult<V> {
    const next = this.cursor.next();
    return {done: next.done, value: next.value !== void 0 ? next.value[1] : void 0};
  }

  override hasPrevious(): boolean {
    return this.cursor.hasPrevious();
  }

  override previousIndex(): number {
    return this.cursor.previousIndex();
  }

  override previous(): IteratorResult<V> {
    const previous = this.cursor.previous();
    return {done: previous.done, value: previous.value !== void 0 ? previous.value[1] : void 0};
  }

  override delete(): void {
    this.cursor.delete();
  }
}
