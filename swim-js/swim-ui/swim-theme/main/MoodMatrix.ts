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

import {Lazy} from "@swim/util";
import type {Equals} from "@swim/util";
import {Arrays} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {MoodVectorLike} from "./MoodVector";
import type {MoodVectorUpdates} from "./MoodVector";
import {MoodVector} from "./MoodVector";
import type {Feel} from "./Feel";
import type {Mood} from "./Mood";

/** @public */
export class MoodMatrix<M extends Mood = Feel, N extends Mood = Feel> implements Equals, Debug {
  constructor(rowArray: readonly [M, MoodVector<N>][],
              rowIndex: {readonly [name: string]: number | undefined},
              colArray: readonly [N, MoodVector<M>][],
              colIndex: {readonly [name: string]: number | undefined}) {
    this.rowArray = rowArray;
    this.rowIndex = rowIndex;
    this.colArray = colArray;
    this.colIndex = colIndex;
  }

  /** @internal */
  readonly rowArray: readonly [M, MoodVector<N>][];

  /** @internal */
  readonly rowIndex: {readonly [name: string]: number | undefined};

  /** @internal */
  readonly colArray: readonly [N, MoodVector<M>][];

  /** @internal */
  readonly colIndex: {readonly [name: string]: number | undefined};

  get rowCount(): number {
    return this.rowArray.length;
  }

  get colCount(): number {
    return this.colArray.length;
  }

  hasRow(rowKey: M): boolean;
  hasRow(rowKey: string): boolean;
  hasRow(rowKey: M | string): boolean {
    if (typeof rowKey === "object" && rowKey !== null || typeof rowKey === "function") {
      rowKey = rowKey.name;
    }
    return this.rowIndex[rowKey] !== void 0;
  }

  hasCol(colKey: N): boolean;
  hasCol(colKey: string): boolean;
  hasCol(colKey: N | string): boolean {
    if (typeof colKey === "object" && colKey !== null || typeof colKey === "function") {
      colKey = colKey.name;
    }
    return this.colIndex[colKey] !== void 0;
  }

  getRow(rowKey: M): MoodVector<N> | undefined;
  getRow(rowKey: string): MoodVector<N> | undefined;
  getRow(rowIndex: number): MoodVector<N> | undefined;
  getRow(rowKey: M | string | number | undefined): MoodVector<N> | undefined {
    if (typeof rowKey === "object" && rowKey !== null || typeof rowKey === "function") {
      rowKey = rowKey.name;
    }
    if (typeof rowKey === "string") {
      rowKey = this.rowIndex[rowKey];
    }
    const entry = typeof rowKey === "number" ? this.rowArray[rowKey] : void 0;
    return entry !== void 0 ? entry[1] : void 0;
  }

  getCol(colKey: N): MoodVector<M> | undefined;
  getCol(colKey: string): MoodVector<M> | undefined;
  getCol(colIndex: number): MoodVector<M> | undefined;
  getCol(colKey: N | string | number | undefined): MoodVector<M> | undefined {
    if (typeof colKey === "object" && colKey !== null || typeof colKey === "function") {
      colKey = colKey.name;
    }
    if (typeof colKey === "string") {
      colKey = this.colIndex[colKey];
    }
    const entry = typeof colKey === "number" ? this.colArray[colKey] : void 0;
    return entry !== void 0 ? entry[1] : void 0;
  }

  plus(that: MoodMatrix<M, N>): MoodMatrix<M, N> {
    const thisColArray = this.colArray;
    const thatColArray = that.colArray;
    const newColArray = new Array<[N, MoodVector<M>]>();
    const newColIndex: {[name: string]: number | undefined} = {};
    for (let j = 0; j < thisColArray.length; j += 1) {
      const entry = thisColArray[j]!;
      const colKey = entry[0];
      const b = that.getCol(colKey);
      newColIndex[colKey.name] = newColArray.length;
      newColArray.push(b === void 0 ? entry : [colKey, entry[1].plus(b)]);
    }
    for (let j = 0; j < thatColArray.length; j += 1) {
      const entry = thatColArray[j]!;
      const colKey = entry[0];
      if (newColIndex[colKey.name] === void 0) {
        newColIndex[colKey.name] = newColArray.length;
        newColArray.push(entry);
      }
    }
    return MoodMatrix.fromColArray(newColArray, newColIndex);
  }

  negative(): MoodMatrix<M, N> {
    const oldColArray = this.colArray;
    const n = oldColArray.length;
    const newColArray = new Array<[N, MoodVector<M>]>(n);
    for (let j = 0; j < n; j += 1) {
      const [colKey, a] = oldColArray[j]!;
      newColArray[j] = [colKey, a.negative()];
    }
    return MoodMatrix.fromColArray(newColArray, this.colIndex);
  }

  minus(that: MoodMatrix<M, N>): MoodMatrix<M, N> {
    const thisColArray = this.colArray;
    const thatColArray = that.colArray;
    const newColArray = new Array<[N, MoodVector<M>]>();
    const newColIndex: {[name: string]: number | undefined} = {};
    for (let j = 0; j < thisColArray.length; j += 1) {
      const entry = thisColArray[j]!;
      const colKey = entry[0];
      const b = that.getCol(colKey);
      newColIndex[colKey.name] = newColArray.length;
      newColArray.push(b === void 0 ? entry : [colKey, entry[1].minus(b)]);
    }
    for (let j = 0; j < thatColArray.length; j += 1) {
      const [colKey, b] = thatColArray[j]!;
      if (newColIndex[colKey.name] === void 0) {
        newColIndex[colKey.name] = newColArray.length;
        newColArray.push([colKey, b.negative()]);
      }
    }
    return MoodMatrix.fromColArray(newColArray, newColIndex);
  }

  times(scalar: number): MoodMatrix<M, N> {
    const oldColArray = this.colArray;
    const n = oldColArray.length;
    const newColArray = new Array<[N, MoodVector<M>]>(n);
    for (let j = 0; j < n; j += 1) {
      const [colKey, a] = oldColArray[j]!;
      newColArray[j] = [colKey, a.times(scalar)];
    }
    return MoodMatrix.fromColArray(newColArray, this.colIndex);
  }

  dot(rowKey: M | string | number, col: MoodVector<N>): number | undefined;
  dot(rowKey: M | string | number | undefined, col: MoodVector<N>): number | undefined {
    if (typeof rowKey === "object" && rowKey !== null || typeof rowKey === "function") {
      rowKey = rowKey.name;
    }
    if (typeof rowKey === "string") {
      rowKey = this.rowIndex[rowKey];
    }
    const entry = typeof rowKey === "number" ? this.rowArray[rowKey] : void 0;
    if (entry === void 0) {
      return void 0;
    }
    rowKey = entry[0];
    const row = entry[1];
    return row.dot(col);
  }

  timesCol(col: MoodVector<N>): MoodVector<M>;
  timesCol(col: MoodVector<M & N>, implicitIdentity?: boolean): MoodVector<M | M>;
  timesCol(col: MoodVector<M & N>, implicitIdentity: boolean = false): MoodVector<M | N> {
    const rowArray = this.rowArray;
    const newArray = new Array<[M, number]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0; i < rowArray.length; i += 1) {
      const [rowKey, row] = rowArray[i]!;
      const value = row.dot(col);
      if (value !== void 0) {
        newIndex[rowKey.name] = newArray.length;
        newArray.push([rowKey, value]);
      }
    }
    if (implicitIdentity) {
      const thatArray = col.array;
      for (let i = 0; i < thatArray.length; i += 1) {
        const rowKey = thatArray[i]![0];
        if (!this.hasRow(rowKey)) {
          newIndex[rowKey.name] = newArray.length;
          newArray.push(thatArray[i]!);
        }
      }
    }
    return MoodVector.fromArray(newArray, newIndex);
  }

  timesRow(row: MoodVector<M>): MoodVector<N>;
  timesRow(row: MoodVector<M & N>, implicitIdentity?: boolean): MoodVector<M | M>;
  timesRow(row: MoodVector<M & N>, implicitIdentity: boolean = false): MoodVector<M | N> {
    const colArray = this.colArray;
    const newArray = new Array<[N, number]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0; i < colArray.length; i += 1) {
      const [colKey, col] = colArray[i]!;
      const value = row.dot(col as MoodVector<M & N>);
      if (value !== void 0) {
        newIndex[colKey.name] = newArray.length;
        newArray.push([colKey, value]);
      }
    }
    if (implicitIdentity) {
      const thatArray = row.array;
      for (let i = 0; i < thatArray.length; i += 1) {
        const colKey = thatArray[i]![0];
        if (!this.hasCol(colKey)) {
          newIndex[colKey.name] = newArray.length;
          newArray.push(thatArray[i]!);
        }
      }
    }
    return MoodVector.fromArray(newArray, newIndex);
  }

  transform(that: MoodMatrix<N, N>, implicitIdentity: boolean = true): MoodMatrix<M, N> {
    const thisRowArray = this.rowArray;
    const thisColArray = this.colArray;
    const newRowArray = new Array<[M, MoodVector<N>]>();
    const newRowIndex: {[name: string]: number | undefined} = {};
    const newColArray = new Array<[N, MoodVector<M>]>();
    const newColIndex: {[name: string]: number | undefined} = {};
    for (let j = 0; j < thisColArray.length; j += 1) {
      const colKey = thisColArray[j]![0];
      let col = that.getCol(colKey);
      if (col === void 0 && implicitIdentity) {
        col = MoodVector.of([colKey, 1]);
      }
      if (col === void 0) {
        continue;
      }
      for (let i = 0; i < thisRowArray.length; i += 1) {
        const [rowKey, row] = thisRowArray[i]!;
        const value = row.dot(col);
        if (value === void 0) {
          continue;
        }
        const i2 = newRowIndex[rowKey.name];
        if (i2 === void 0) {
          newRowIndex[rowKey.name] = newRowArray.length;
          newRowArray.push([rowKey, MoodVector.of([colKey, value])]);
        } else {
          const newRow = newRowArray[i2]![1];
          (newRow.index as {[name: string]: number | undefined})[rowKey.name] = newRow.array.length;
          (newRow.array as [N, number][]).push([colKey, value]);
        }
        const j2 = newColIndex[colKey.name];
        if (j2 === void 0) {
          newColIndex[colKey.name] = newColArray.length;
          newColArray.push([colKey, MoodVector.of([rowKey, value])]);
        } else {
          const newCol = newColArray[j2]![1];
          (newCol.index as {[name: string]: number | undefined})[colKey.name] = newCol.array.length;
          (newCol.array as [M, number][]).push([rowKey, value]);
        }
      }
    }
    return new MoodMatrix(newRowArray, newRowIndex, newColArray, newColIndex);
  }

  /** @internal */
  identityFor(that: MoodMatrix<N, M & N>): MoodMatrix<M, N> {
    const thisRowArray = this.rowArray;
    const thatColArray = that.colArray;
    let newRowArray: Array<[M, MoodVector<N>]> | undefined;
    let newRowIndex: {[name: string]: number | undefined} | undefined;
    for (let j = 0; j < thatColArray.length; j += 1) {
      const colKey = thatColArray[j]![0];
      if (this.hasRow(colKey)) {
        continue;
      } else if (newRowArray === void 0) {
        newRowArray = thisRowArray.slice(0);
      }
      if (newRowIndex === void 0) {
        newRowIndex = {};
        for (const name in this.rowIndex) {
          newRowIndex[name] = this.rowIndex[name];
        }
      }
      newRowIndex[colKey.name] = newRowArray.length;
      newRowArray.push([colKey, MoodVector.of([colKey, 1])]);
    }
    if (newRowArray === void 0 || newRowIndex === void 0) {
      return this;
    }
    return MoodMatrix.fromRowArray(newRowArray, newRowIndex);
  }

  row(rowKey: M, row: MoodVectorLike<N> | undefined): MoodMatrix<M, N> {
    if (row !== void 0) {
      row = MoodVector.fromLike(row);
    }
    const oldRowArray = this.rowArray;
    const oldRowIndex = this.rowIndex;
    const i = oldRowIndex[rowKey.name];
    if (row !== void 0 && i !== void 0) { // update
      const newRowArray = oldRowArray.slice(0);
      newRowArray[i] = [rowKey, row];
      return MoodMatrix.fromRowArray(newRowArray, oldRowIndex);
    } else if (row !== void 0) { // insert
      const newRowArray = oldRowArray.slice(0);
      const newRowIndex: {[name: string]: number | undefined} = {};
      for (const name in oldRowIndex) {
        newRowIndex[name] = oldRowIndex[name];
      }
      newRowIndex[rowKey.name] = newRowArray.length;
      newRowArray.push([rowKey, row]);
      return MoodMatrix.fromRowArray(newRowArray, newRowIndex);
    } else if (i !== void 0) { // remove
      const newRowArray = new Array<[M, MoodVector<N>]>();
      const newRowIndex: {[name: string]: number | undefined} = {};
      let k = 0;
      for (let j = 0; j < oldRowArray.length; j += 1) {
        const entry = oldRowArray[j]!;
        if (entry[0] !== rowKey) {
          newRowArray[k] = entry;
          newRowIndex[entry[0].name] = k;
          k += 1;
        }
      }
      return MoodMatrix.fromRowArray(newRowArray, newRowIndex);
    }
    return this; // nop
  }

  col(colKey: N, col: MoodVectorLike<M> | undefined): MoodMatrix<M, N> {
    if (col !== void 0) {
      col = MoodVector.fromLike(col);
    }
    const oldColArray = this.colArray;
    const oldColIndex = this.colIndex;
    const i = oldColIndex[colKey.name];
    if (col !== void 0 && i !== void 0) { // update
      const newColArray = oldColArray.slice(0);
      newColArray[i] = [colKey, col];
      return MoodMatrix.fromColArray(newColArray, oldColIndex);
    } else if (col !== void 0) { // insert
      const newColArray = oldColArray.slice(0);
      const newColIndex: {[name: string]: number | undefined} = {};
      for (const name in oldColIndex) {
        newColIndex[name] = oldColIndex[name];
      }
      newColIndex[colKey.name] = newColArray.length;
      newColArray.push([colKey, col]);
      return MoodMatrix.fromColArray(newColArray, newColIndex);
    } else if (i !== void 0) { // remove
      const newColArray = new Array<[N, MoodVector<M>]>();
      const newColIndex: {[name: string]: number | undefined} = {};
      let k = 0;
      for (let j = 0; j < oldColArray.length; j += 1) {
        const entry = oldColArray[j]!;
        if (entry[0] !== colKey) {
          newColArray[k] = entry;
          newColIndex[entry[0].name] = k;
          k += 1;
        }
      }
      return MoodMatrix.fromColArray(newColArray, newColIndex);
    } else
    return this; // nop
  }

  updatedRow(rowKey: M, updates: MoodVectorUpdates<N>,
             defaultRow?: MoodVectorLike<N>): MoodMatrix<M, N>;
  updatedRow(rowKey: M & N, updates: MoodVectorUpdates<M & N>,
             defaultRow?: MoodVectorLike<N> | boolean): MoodMatrix<M | N, N>
  updatedRow(rowKey: M & N, updates: MoodVectorUpdates<M & N>,
             defaultRow?: MoodVectorLike<N> | boolean): MoodMatrix<M | N, N> {
    const oldRow = this.getRow(rowKey);
    let newRow = oldRow;
    if (newRow === void 0) {
      if (defaultRow === true) {
        defaultRow = MoodVector.of([rowKey, 1]);
      } else if (defaultRow === false) {
        defaultRow = void 0;
      }
      if (defaultRow === void 0) {
        defaultRow = MoodVector.empty();
      } else {
        defaultRow = MoodVector.fromLike(defaultRow);
      }
      newRow = defaultRow;
    }
    newRow = newRow.updated(updates);
    if (newRow.equals(oldRow)) {
      return this;
    }
    return this.row(rowKey, newRow);
  }

  updatedCol(colKey: N, updates: MoodVectorUpdates<M>,
             defaultCol?: MoodVectorLike<M>): MoodMatrix<M, N>;
  updatedCol(colKey: M & N, updates: MoodVectorUpdates<M & N>,
             defaultCol?: MoodVectorLike<M> | boolean): MoodMatrix<M | N, N>;
  updatedCol(colKey: M & N, updates: MoodVectorUpdates<M & N>,
             defaultCol?: MoodVectorLike<M> | boolean): MoodMatrix<M | N, N> {
    const oldCol = this.getCol(colKey);
    let newCol = oldCol;
    if (newCol === void 0) {
      if (defaultCol === true) {
        defaultCol = MoodVector.of([colKey, 1]);
      } else if (defaultCol === false) {
        defaultCol = void 0;
      }
      if (defaultCol === void 0) {
        defaultCol = MoodVector.empty();
      } else {
        defaultCol = MoodVector.fromLike(defaultCol);
      }
      newCol = defaultCol;
    }
    newCol = newCol.updated(updates);
    if (newCol.equals(oldCol)) {
      return this;
    }
    return this.col(colKey, newCol);
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof MoodMatrix) {
      const equal = Arrays.equal(this.colArray, that.colArray);
      return equal;
    }
    return false;
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    const cols = this.colArray;
    const n = cols.length;
    output = output.write("MoodMatrix").write(46/*'.'*/)
                   .write(n !== 0 ? "forCols" : "empty").write(40/*'('*/);
    for (let j = 0; j < n; j += 1) {
      const [colKey, col] = cols[j]!;
      if (j !== 0) {
        output = output.write(", ");
      }
      output = output.write(91/*'['*/).debug(colKey).write(", ").debug(col).write(93/*']'*/);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  /** @override */
  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static empty<M extends Mood = Feel, N extends Mood = Feel>(): MoodMatrix<M, N> {
    return new MoodMatrix(Arrays.empty(), {}, Arrays.empty(), {});
  }

  static forRows<M extends Mood, N extends Mood>(...rows: [M, MoodVectorLike<N>][]): MoodMatrix<M, N> {
    const m = rows.length;
    const rowArray = new Array<[M, MoodVector<N>]>(m);
    for (let i = 0; i < m; i += 1) {
      const [rowKey, row] = rows[i]!;
      rowArray[i] = [rowKey, MoodVector.fromLike(row)];
    }
    return this.fromRowArray(rowArray);
  }

  static forCols<M extends Mood, N extends Mood>(...cols: [N, MoodVectorLike<M>][]): MoodMatrix<M, N> {
    const m = cols.length;
    const colArray = new Array<[N, MoodVector<M>]>(m);
    for (let j = 0; j < m; j += 1) {
      const [colKey, col] = cols[j]!;
      colArray[j] = [colKey, MoodVector.fromLike(col)];
    }
    return this.fromColArray(colArray);
  }

  static fromRowArray<M extends Mood, N extends Mood>(
      rowArray: readonly [M, MoodVector<N>][],
      rowIndex?: {readonly [name: string]: number | undefined}): MoodMatrix<M, N> {
    if (rowIndex === void 0) {
      rowIndex = MoodVector.index(rowArray);
    }
    const colArray = new Array<[N, MoodVector<M>]>();
    const colIndex: {[name: string]: number | undefined} = {};
    for (let i = 0; i < rowArray.length; i += 1) {
      const row = rowArray[i]![1];
      row.forEach(function (value: number, colKey: N): void {
        if (colIndex[colKey.name] === void 0) {
          colIndex[colKey.name] = colArray.length;
          colArray.push([colKey, void 0 as unknown as MoodVector<M>]);
        }
      }, this);
    }
    for (let j = 0; j < colArray.length; j += 1) {
      const entry = colArray[j]!;
      const colKey = entry[0];
      const array = new Array<[M, number]>();
      const index: {[name: string]: number | undefined} = {};
      for (let i = 0; i < rowArray.length; i += 1) {
        const [rowKey, row] = rowArray[i]!;
        const value = row.get(colKey);
        if (value !== void 0) {
          index[rowKey.name] = array.length;
          array.push([rowKey, value]);
        }
      }
      const col = MoodVector.fromArray(array, index);
      entry[1] = col;
    }
    return new MoodMatrix(rowArray, rowIndex, colArray, colIndex);
  }

  static fromColArray<M extends Mood, N extends Mood>(
      colArray: readonly [N, MoodVector<M>][],
      colIndex?: {readonly [name: string]: number | undefined}): MoodMatrix<M, N> {
    if (colIndex === void 0) {
      colIndex = MoodVector.index(colArray);
    }
    const rowArray = new Array<[M, MoodVector<N>]>();
    const rowIndex: {[name: string]: number | undefined} = {};
    for (let i = 0; i < colArray.length; i += 1) {
      const col = colArray[i]![1];
      col.forEach(function (value: number, rowKey: M): void {
        if (rowIndex[rowKey.name] === void 0) {
          rowIndex[rowKey.name] = rowArray.length;
          rowArray.push([rowKey, void 0 as unknown as MoodVector<N>]);
        }
      }, this);
    }
    for (let i = 0; i < rowArray.length; i += 1) {
      const entry = rowArray[i]!;
      const rowKey = entry[0];
      const array = new Array<[N, number]>();
      const index: {[name: string]: number | undefined} = {};
      for (let j = 0; j < colArray.length; j += 1) {
        const [colKey, col] = colArray[j]!;
        const value = col.get(rowKey);
        if (value !== void 0) {
          index[colKey.name] = array.length;
          array.push([colKey, value]);
        }
      }
      const row = MoodVector.fromArray(array, index);
      entry[1] = row;
    }
    return new MoodMatrix(rowArray, rowIndex, colArray, colIndex);
  }
}
