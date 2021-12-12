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

import {Equals, Lazy, Arrays} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import type {Look} from "../look/Look";
import {AnyLookVector, LookVectorUpdates, LookVector} from "../look/LookVector";
import type {Feel} from "../feel/Feel";
import {AnyFeelVector, FeelVectorUpdates, FeelVector} from "../feel/FeelVector";
import {MoodVector} from "../mood/MoodVector";
import type {MoodMatrix} from "../mood/MoodMatrix";

/** @public */
export class ThemeMatrix implements Equals, Debug {
  constructor(rowArray: ReadonlyArray<[Look<unknown>, LookVector<unknown>]>,
              rowIndex: {readonly [name: string]: number | undefined},
              colArray: ReadonlyArray<[Feel, FeelVector]>,
              colIndex: {readonly [name: string]: number | undefined}) {
    this.rowArray = rowArray;
    this.rowIndex = rowIndex;
    this.colArray = colArray;
    this.colIndex = colIndex;
  }

  /** @internal */
  readonly rowArray: ReadonlyArray<[Look<unknown>, LookVector<unknown>]>;

  /** @internal */
  readonly rowIndex: {readonly [name: string]: number | undefined};

  /** @internal */
  readonly colArray: ReadonlyArray<[Feel, FeelVector]>;

  /** @internal */
  readonly colIndex: {readonly [name: string]: number | undefined};

  get rowCount(): number {
    return this.rowArray.length;
  }

  get colCount(): number {
    return this.colArray.length;
  }

  hasRow(look: Look<unknown>): boolean;
  hasRow(name: string): boolean;
  hasRow(look: Look<unknown> | string): boolean {
    if (typeof look === "object" && look !== null || typeof look === "function") {
      look = look.name;
    }
    return this.rowIndex[look] !== void 0;
  }

  hasCol(feel: Feel): boolean;
  hasCol(name: string): boolean;
  hasCol(feel: Feel | string): boolean {
    if (typeof feel === "object" && feel !== null || typeof feel === "function") {
      feel = feel.name;
    }
    return this.colIndex[feel] !== void 0;
  }

  getRow<T>(look: Look<T>): LookVector<T> | undefined;
  getRow(name: string): LookVector<unknown> | undefined;
  getRow(index: number): LookVector<unknown> | undefined;
  getRow<T>(look: Look<T> | string | number | undefined): LookVector<unknown> | undefined {
    if (typeof look === "object" && look !== null || typeof look === "function") {
      look = look.name;
    }
    if (typeof look === "string") {
      look = this.rowIndex[look];
    }
    const entry = typeof look === "number" ? this.rowArray[look] : void 0;
    return entry !== void 0 ? entry[1] : void 0;
  }

  getCol(feel: Feel): FeelVector | undefined;
  getCol(name: string): FeelVector | undefined;
  getCol(index: number): FeelVector | undefined;
  getCol(feel: Feel | string | number | undefined): FeelVector | undefined {
    if (typeof feel === "object" && feel !== null || typeof feel === "function") {
      feel = feel.name;
    }
    if (typeof feel === "string") {
      feel = this.colIndex[feel];
    }
    const entry = typeof feel === "number" ? this.colArray[feel] : void 0;
    return entry !== void 0 ? entry[1] : void 0;
  }

  get<T>(look: Look<T>, mood: MoodVector): T | undefined {
    return this.dot(look, mood);
  }

  getOr<T, E>(look: Look<T>, mood: MoodVector, elseValue: E): T | E {
    return this.dotOr(look, mood, elseValue);
  }

  plus(that: ThemeMatrix): ThemeMatrix {
    const thisColArray = this.colArray;
    const thatColArray = that.colArray;
    const newColArray = new Array<[Feel, FeelVector]>();
    const newColIndex: {[name: string]: number | undefined} = {};
    for (let j = 0, n = thisColArray.length; j < n; j += 1) {
      const entry = thisColArray[j]!;
      const feel = entry[0];
      const b = that.getCol(feel);
      newColIndex[feel.name] = newColArray.length;
      newColArray.push(b === void 0 ? entry : [feel, entry[1].plus(b)]);
    }
    for (let j = 0, n = thatColArray.length; j < n; j += 1) {
      const entry = thatColArray[j]!;
      const feel = entry[0];
      if (newColIndex[feel.name] === void 0) {
        newColIndex[feel.name] = newColArray.length;
        newColArray.push(entry);
      }
    }
    return ThemeMatrix.fromColArray(newColArray, newColIndex);
  }

  negative(): ThemeMatrix {
    const oldColArray = this.colArray;
    const n = oldColArray.length;
    const newColArray = new Array<[Feel, FeelVector]>(n);
    for (let j = 0; j < n; j += 1) {
      const [feel, a] = oldColArray[j]!;
      newColArray[j] = [feel, a.negative()];
    }
    return ThemeMatrix.fromColArray(newColArray, this.colIndex);
  }

  minus(that: ThemeMatrix): ThemeMatrix {
    const thisColArray = this.colArray;
    const thatColArray = that.colArray;
    const newColArray = new Array<[Feel, FeelVector]>();
    const newColIndex: {[name: string]: number | undefined} = {};
    for (let j = 0, n = thisColArray.length; j < n; j += 1) {
      const entry = thisColArray[j]!;
      const feel = entry[0];
      const b = that.getCol(feel);
      newColIndex[feel.name] = newColArray.length;
      newColArray.push(b === void 0 ? entry : [feel, entry[1].minus(b)]);
    }
    for (let j = 0, n = thatColArray.length; j < n; j += 1) {
      const [feel, b] = thatColArray[j]!;
      if (newColIndex[feel.name] === void 0) {
        newColIndex[feel.name] = newColArray.length;
        newColArray.push([feel, b.negative()]);
      }
    }
    return ThemeMatrix.fromColArray(newColArray, newColIndex);
  }

  times(scalar: number): ThemeMatrix {
    const oldColArray = this.colArray;
    const n = oldColArray.length;
    const newColArray = new Array<[Feel, FeelVector]>(n);
    for (let j = 0; j < n; j += 1) {
      const [feel, a] = oldColArray[j]!;
      newColArray[j] = [feel, a.times(scalar)];
    }
    return ThemeMatrix.fromColArray(newColArray, this.colIndex);
  }

  dot<T>(look: Look<T>, col: MoodVector): T | undefined;
  dot(look: string | number, col: MoodVector): unknown | undefined;
  dot(look: Look<unknown> | string | number | undefined, col: MoodVector): unknown | undefined {
    if (typeof look === "object" && look !== null || typeof look === "function") {
      look = look.name;
    }
    if (typeof look === "string") {
      look = this.rowIndex[look];
    }
    const entry = typeof look === "number" ? this.rowArray[look] : void 0;
    if (entry !== void 0) {
      look = entry[0];
      const row = entry[1];
      return look.dot(row, col);
    }
    return void 0;
  }

  dotOr<T, E>(look: Look<T>, col: MoodVector, elseValue: E): T | E;
  dotOr(look: string | number, col: MoodVector, elseValue: unknown): unknown;
  dotOr(look: Look<unknown> | string | number | undefined, col: MoodVector, elseValue: unknown): unknown {
    if (typeof look === "object" && look !== null || typeof look === "function") {
      look = look.name;
    }
    if (typeof look === "string") {
      look = this.rowIndex[look];
    }
    const entry = typeof look === "number" ? this.rowArray[look] : void 0;
    if (entry !== void 0) {
      look = entry[0];
      const row = entry[1];
      return look.dotOr(row, col, elseValue);
    }
    return elseValue;
  }

  timesCol(col: MoodVector): FeelVector {
    const rowArray = this.rowArray;
    const newArray = new Array<[Look<unknown>, unknown]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0, m = rowArray.length; i < m; i += 1) {
      const [look, row] = rowArray[i]!;
      const value = look.dot(row, col);
      if (value !== void 0) {
        newIndex[look.name] = newArray.length;
        newArray.push([look, value]);
      }
    }
    return FeelVector.fromArray(newArray, newIndex);
  }

  transform(that: MoodMatrix, implicitIdentity: boolean = true): ThemeMatrix {
    const thisRowArray = this.rowArray;
    const thisColArray = this.colArray;
    const newRowArray = new Array<[Look<unknown>, LookVector<unknown>]>();
    const newRowIndex: {[name: string]: number | undefined} = {};
    const newColArray = new Array<[Feel, FeelVector]>();
    const newColIndex: {[name: string]: number | undefined} = {};
    for (let j = 0, n = thisColArray.length; j < n; j += 1) {
      const feel = thisColArray[j]![0];
      let col = that.getCol(feel);
      if (col === void 0 && implicitIdentity) {
        col = MoodVector.of([feel, 1]);
      }
      if (col !== void 0) {
        for (let i = 0, m = thisRowArray.length; i < m; i += 1) {
          const [look, row] = thisRowArray[i]!;
          const value = look.dot(row, col);
          if (value !== void 0) {
            const i2 = newRowIndex[look.name];
            if (i2 !== void 0) {
              const newRow = newRowArray[i2]![1];
              (newRow.index as {[name: string]: number | undefined})[look.name] = newRow.array.length;
              (newRow.array as [Feel, unknown][]).push([feel, value]);
            } else {
              newRowIndex[look.name] = newRowArray.length;
              newRowArray.push([look, LookVector.of([feel, value])]);
            }
            const j2 = newColIndex[feel.name];
            if (j2 !== void 0) {
              const newCol = newColArray[j2]![1];
              (newCol.index as {[name: string]: number | undefined})[feel.name] = newCol.array.length;
              (newCol.array as [Look<unknown>, unknown][]).push([look, value]);
            } else {
              newColIndex[feel.name] = newColArray.length;
              newColArray.push([feel, FeelVector.of([look, value])]);
            }
          }
        }
      }
    }
    return new ThemeMatrix(newRowArray, newRowIndex, newColArray, newColIndex);
  }

  row<T, U = never>(look: Look<T, U>, row: AnyLookVector<T> | undefined): ThemeMatrix {
    if (row !== void 0) {
      row = LookVector.fromAny(row);
    }
    const oldRowArray = this.rowArray;
    const oldRowIndex = this.rowIndex;
    const i = oldRowIndex[look.name];
    if (row !== void 0 && i !== void 0) { // update
      const newRowArray = oldRowArray.slice(0);
      newRowArray[i] = [look, row];
      return ThemeMatrix.fromRowArray(newRowArray, oldRowIndex);
    } else if (row !== void 0) { // insert
      const newRowArray = oldRowArray.slice(0);
      const newRowIndex: {[name: string]: number | undefined} = {};
      for (const name in oldRowIndex) {
        newRowIndex[name] = oldRowIndex[name];
      }
      newRowIndex[look.name] = newRowArray.length;
      newRowArray.push([look, row]);
      return ThemeMatrix.fromRowArray(newRowArray, newRowIndex);
    } else if (i !== void 0) { // remove
      const newRowArray = new Array<[Look<unknown>, LookVector<unknown>]>();
      const newRowIndex: {[name: string]: number | undefined} = {};
      let k = 0;
      for (let j = 0, n = oldRowArray.length; j < n; j += 1) {
        const entry = oldRowArray[j]!;
        if (entry[0] !== look) {
          newRowArray[k] = entry;
          newRowIndex[entry[0].name] = k;
          k += 1;
        }
      }
      return ThemeMatrix.fromRowArray(newRowArray, newRowIndex);
    } else { // nop
      return this;
    }
  }

  col(feel: Feel, col: AnyFeelVector | undefined): ThemeMatrix {
    if (col !== void 0) {
      col = FeelVector.fromAny(col);
    }
    const oldColArray = this.colArray;
    const oldColIndex = this.colIndex;
    const i = oldColIndex[feel.name];
    if (col !== void 0 && i !== void 0) { // update
      const newColArray = oldColArray.slice(0);
      newColArray[i] = [feel, col];
      return ThemeMatrix.fromColArray(newColArray, oldColIndex);
    } else if (col !== void 0) { // insert
      const newColArray = oldColArray.slice(0);
      const newColIndex: {[name: string]: number | undefined} = {};
      for (const name in oldColIndex) {
        newColIndex[name] = oldColIndex[name];
      }
      newColIndex[feel.name] = newColArray.length;
      newColArray.push([feel, col]);
      return ThemeMatrix.fromColArray(newColArray, newColIndex);
    } else if (i !== void 0) { // remove
      const newColArray = new Array<[Feel, FeelVector]>();
      const newColIndex: {[name: string]: number | undefined} = {};
      let k = 0;
      for (let j = 0, n = oldColArray.length; j < n; j += 1) {
        const entry = oldColArray[j]!;
        if (entry[0] !== feel) {
          newColArray[k] = entry;
          newColIndex[entry[0].name] = k;
          k += 1;
        }
      }
      return ThemeMatrix.fromColArray(newColArray, newColIndex);
    } else { // nop
      return this;
    }
  }

  updatedRow<T, U = never>(look: Look<T, U>, updates: LookVectorUpdates<T>,
                           defaultRow?: AnyLookVector<T>): ThemeMatrix {
    const oldRow = this.getRow(look);
    let newRow = oldRow;
    if (newRow === void 0) {
      if (defaultRow !== void 0) {
        defaultRow = LookVector.fromAny(defaultRow);
      } else {
        defaultRow = LookVector.empty();
      }
      newRow = defaultRow;
    }
    newRow = newRow.updated(updates);
    if (!newRow.equals(oldRow)) {
      return this.row(look, newRow);
    } else {
      return this;
    }
  }

  updatedCol(feel: Feel, updates: FeelVectorUpdates,
             defaultCol?: AnyFeelVector): ThemeMatrix {
    const oldCol = this.getCol(feel);
    let newCol = oldCol;
    if (newCol === void 0) {
      if (defaultCol !== void 0) {
        defaultCol = FeelVector.fromAny(defaultCol);
      } else {
        defaultCol = FeelVector.empty();
      }
      newCol = defaultCol;
    }
    newCol = newCol.updated(updates);
    if (!newCol.equals(oldCol)) {
      return this.col(feel, newCol);
    } else {
      return this;
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ThemeMatrix) {
      return Arrays.equal(this.colArray, that.colArray);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    const cols = this.colArray;
    const n = cols.length;
    output = output.write("ThemeMatrix").write(46/*'.'*/)
                   .write(n !== 0 ? "forCols" : "empty").write(40/*'('*/);
    for (let j = 0; j < n; j += 1) {
      const [feel, col] = cols[j]!;
      if (j !== 0) {
        output = output.write(", ");
      }
      output = output.write(91/*'['*/).debug(feel).write(", ").debug(col).write(93/*']'*/);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static empty(): ThemeMatrix {
    return new ThemeMatrix([], {}, [], {});
  }

  static forRows(...rows: [Look<unknown>, AnyLookVector<unknown>][]): ThemeMatrix {
    const m = rows.length;
    const rowArray = new Array<[Look<unknown>, LookVector<unknown>]>(m);
    for (let i = 0; i < m; i += 1) {
      const [look, row] = rows[i]!;
      rowArray[i] = [look, LookVector.fromAny(row)];
    }
    return this.fromRowArray(rowArray);
  }

  static forCols(...cols: [Feel, AnyFeelVector][]): ThemeMatrix {
    const m = cols.length;
    const colArray = new Array<[Feel, FeelVector]>(m);
    for (let j = 0; j < m; j += 1) {
      const [feel, col] = cols[j]!;
      colArray[j] = [feel, FeelVector.fromAny(col)];
    }
    return this.fromColArray(colArray);
  }

  static fromRowArray(rowArray: ReadonlyArray<[Look<unknown>, LookVector<unknown>]>,
                      rowIndex?: {readonly [name: string]: number | undefined}): ThemeMatrix {
    if (rowIndex === void 0) {
      rowIndex = FeelVector.index(rowArray);
    }
    const colArray = new Array<[Feel, FeelVector]>();
    const colIndex: {[name: string]: number | undefined} = {};
    for (let i = 0, m = rowArray.length; i < m; i += 1) {
      const row = rowArray[i]![1];
      row.forEach(function (value: unknown, feel: Feel): void {
        if (colIndex[feel.name] === void 0) {
          colIndex[feel.name] = colArray.length;
          colArray.push([feel, void 0 as unknown as FeelVector]);
        }
      }, this);
    }
    for (let j = 0, n = colArray.length; j < n; j += 1) {
      const entry = colArray[j]!;
      const feel = entry[0];
      const array = new Array<[Look<unknown>, unknown]>();
      const index: {[name: string]: number | undefined} = {};
      for (let i = 0, m = rowArray.length; i < m; i += 1) {
        const [look, row] = rowArray[i]!;
        const value = row.get(feel);
        if (value !== void 0) {
          index[look.name] = array.length;
          array.push([look, value]);
        }
      }
      const col = FeelVector.fromArray(array, index);
      entry[1] = col;
    }
    return new ThemeMatrix(rowArray, rowIndex, colArray, colIndex);
  }

  static fromColArray(colArray: ReadonlyArray<[Feel, FeelVector]>,
                      colIndex?: {readonly [name: string]: number | undefined}): ThemeMatrix {
    if (colIndex === void 0) {
      colIndex = LookVector.index(colArray);
    }
    const rowArray = new Array<[Look<unknown>, LookVector<unknown>]>();
    const rowIndex: {[name: string]: number | undefined} = {};
    for (let i = 0, n = colArray.length; i < n; i += 1) {
      const col = colArray[i]![1];
      col.forEach(function <T>(value: T, look: Look<T>): void {
        if (rowIndex[look.name] === void 0) {
          rowIndex[look.name] = rowArray.length;
          rowArray.push([look, void 0 as unknown as LookVector<T>]);
        }
      }, this);
    }
    for (let i = 0, m = rowArray.length; i < m; i += 1) {
      const entry = rowArray[i]!;
      const look = entry[0];
      const array = new Array<[Feel, unknown]>();
      const index: {[name: string]: number | undefined} = {};
      for (let j = 0, n = colArray.length; j < n; j += 1) {
        const [feel, col] = colArray[j]!;
        const value = col.get(look);
        if (value !== void 0) {
          index[feel.name] = array.length;
          array.push([feel, value]);
        }
      }
      const row = LookVector.fromArray(array, index);
      entry[1] = row;
    }
    return new ThemeMatrix(rowArray, rowIndex, colArray, colIndex);
  }
}
