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

import {Equals, Objects} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import {Look} from "../look/Look";
import {AnyLookVector, LookVector} from "../look/LookVector";
import {Feel} from "../feel/Feel";
import {AnyFeelVector, FeelVector} from "../feel/FeelVector";
import {MoodVector} from "../mood/MoodVector";
import {MoodMatrix} from "../mood/MoodMatrix";

export class ThemeMatrix implements Equals, Debug {
  /** @hidden */
  readonly _rowArray: ReadonlyArray<[Look<unknown>, LookVector<unknown>]>;
  /** @hidden */
  readonly _rowIndex: {readonly [name: string]: number | undefined};
  /** @hidden */
  readonly _colArray: ReadonlyArray<[Feel, FeelVector]>;
  /** @hidden */
  readonly _colIndex: {readonly [name: string]: number | undefined};

  constructor(rowArray: ReadonlyArray<[Look<unknown>, LookVector<unknown>]>,
              rowIndex: {readonly [name: string]: number | undefined},
              colArray: ReadonlyArray<[Feel, FeelVector]>,
              colIndex: {readonly [name: string]: number | undefined}) {
    this._rowArray = rowArray;
    this._rowIndex = rowIndex;
    this._colArray = colArray;
    this._colIndex = colIndex;
  }

  get rowCount(): number {
    return this._rowArray.length;
  }

  get colCount(): number {
    return this._colArray.length;
  }

  hasRow(look: Look<any>): boolean;
  hasRow(name: string): boolean;
  hasRow(look: Look<any> | string): boolean {
    if (typeof look === "object" && look !== null || typeof look === "function") {
      look = look.name;
    }
    return this._rowIndex[look] !== void 0;
  }

  hasCol(feel: Feel): boolean;
  hasCol(name: string): boolean;
  hasCol(feel: Feel | string): boolean {
    if (typeof feel === "object" && feel !== null || typeof feel === "function") {
      feel = feel.name;
    }
    return this._colIndex[feel] !== void 0;
  }

  getRow<T>(look: Look<T, any>): LookVector<T> | undefined;
  getRow(name: string): LookVector<unknown> | undefined;
  getRow(index: number): LookVector<unknown> | undefined;
  getRow<T>(look: Look<T, any> | string | number | undefined): LookVector<unknown> | undefined {
    if (typeof look === "object" && look !== null || typeof look === "function") {
      look = look.name;
    }
    if (typeof look === "string") {
      look = this._rowIndex[look];
    }
    const entry = typeof look === "number" ? this._rowArray[look] : void 0;
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
      feel = this._colIndex[feel];
    }
    const entry = typeof feel === "number" ? this._colArray[feel] : void 0;
    return entry !== void 0 ? entry[1] : void 0;
  }

  plus(that: ThemeMatrix): ThemeMatrix {
    const thisColArray = this._colArray;
    const thatColArray = that._colArray;
    const newColArray = new Array<[Feel, FeelVector]>();
    const newColIndex: {[name: string]: number | undefined} = {};
    for (let j = 0, n = thisColArray.length; j < n; j += 1) {
      const entry = thisColArray[j];
      const feel = entry[0];
      const b = that.getCol(feel);
      newColIndex[feel.name] = newColArray.length;
      newColArray.push(b === void 0 ? entry : [feel, entry[1].plus(b)]);
    }
    for (let j = 0, n = thatColArray.length; j < n; j += 1) {
      const entry = thatColArray[j];
      const feel = entry[0];
      if (newColIndex[feel.name] === void 0) {
        newColIndex[feel.name] = newColArray.length;
        newColArray.push(entry);
      }
    }
    return ThemeMatrix.fromColArray(newColArray, newColIndex);
  }

  opposite(): ThemeMatrix {
    const oldColArray = this._colArray;
    const n = oldColArray.length;
    const newColArray = new Array<[Feel, FeelVector]>(n);
    for (let j = 0; j < n; j += 1) {
      const [feel, a] = oldColArray[j];
      newColArray[j] = [feel, a.opposite()];
    }
    return ThemeMatrix.fromColArray(newColArray, this._colIndex);
  }

  minus(that: ThemeMatrix): ThemeMatrix {
    const thisColArray = this._colArray;
    const thatColArray = that._colArray;
    const newColArray = new Array<[Feel, FeelVector]>();
    const newColIndex: {[name: string]: number | undefined} = {};
    for (let j = 0, n = thisColArray.length; j < n; j += 1) {
      const entry = thisColArray[j];
      const feel = entry[0];
      const b = that.getCol(feel);
      newColIndex[feel.name] = newColArray.length;
      newColArray.push(b === void 0 ? entry : [feel, entry[1].minus(b)]);
    }
    for (let j = 0, n = thatColArray.length; j < n; j += 1) {
      const [feel, b] = thatColArray[j];
      if (newColIndex[feel.name] === void 0) {
        newColIndex[feel.name] = newColArray.length;
        newColArray.push([feel, b.opposite()]);
      }
    }
    return ThemeMatrix.fromColArray(newColArray, newColIndex);
  }

  times(scalar: number): ThemeMatrix {
    const oldColArray = this._colArray;
    const n = oldColArray.length;
    const newColArray = new Array<[Feel, FeelVector]>(n);
    for (let j = 0; j < n; j += 1) {
      const [feel, a] = oldColArray[j];
      newColArray[j] = [feel, a.times(scalar)];
    }
    return ThemeMatrix.fromColArray(newColArray, this._colIndex);
  }

  inner<T>(that: MoodVector, look: Look<T, any>): T | undefined;
  inner(that: MoodVector, look: string): unknown | undefined;
  inner(that: MoodVector, look: number): unknown | undefined;
  inner(that: MoodVector, look: Look<unknown, any> | string | number | undefined): unknown | undefined {
    if (typeof look === "object" && look !== null || typeof look === "function") {
      look = look.name;
    }
    if (typeof look === "string") {
      look = this._rowIndex[look];
    }
    const entry = typeof look === "number" ? this._rowArray[look] : void 0;
    if (entry !== void 0) {
      look = entry[0];
      const row = entry[1];
      return look.dot(row, that);
    }
    return void 0;
  }

  transform(that: MoodVector): FeelVector;
  transform(that: MoodMatrix, implicitIdentity?: boolean): ThemeMatrix;
  transform(that: MoodVector | MoodMatrix,
            implicitIdentity?: boolean): FeelVector | ThemeMatrix {
    if (that instanceof MoodVector) {
      return this.transformVector(that);
    } else if (that instanceof MoodMatrix) {
      return this.transformMatrix(that, implicitIdentity);
    } else {
      throw new TypeError("" + that);
    }
  }

  /** @hidden */
  transformVector(that: MoodVector): FeelVector {
    const rowArray = this._rowArray;
    const newArray = new Array<[Look<unknown>, unknown]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0, m = rowArray.length; i < m; i += 1) {
      const [look, row] = rowArray[i];
      const value = look.dot(row, that);
      if (value !== void 0) {
        newIndex[look.name] = newArray.length;
        newArray.push([look, value]);
      }
    }
    return FeelVector.fromArray(newArray, newIndex);
  }

  /** @hidden */
  transformMatrix(that: MoodMatrix, implicitIdentity: boolean = true): ThemeMatrix {
    const thisRowArray = this._rowArray;
    const thisColArray = this._colArray;
    const newRowArray = new Array<[Look<unknown>, LookVector<unknown>]>();
    const newRowIndex: {[name: string]: number | undefined} = {};
    const newColArray = new Array<[Feel, FeelVector]>();
    const newColIndex: {[name: string]: number | undefined} = {};
    for (let j = 0, n = thisColArray.length; j < n; j += 1) {
      const feel = thisColArray[j][0];
      let col = that.getCol(feel);
      if (col === void 0 && implicitIdentity) {
        col = MoodVector.of([feel, 1]);
      }
      if (col !== void 0) {
        for (let i = 0, m = thisRowArray.length; i < m; i += 1) {
          const [look, row] = thisRowArray[i];
          const value = look.dot(row, col);
          if (value !== void 0) {
            const i2 = newRowIndex[look.name];
            if (i2 !== void 0) {
              const newRow = newRowArray[i2][1];
              (newRow._index as {[name: string]: number | undefined})[look.name] = newRow._array.length;
              (newRow._array as [Feel, unknown][]).push([feel, value]);
            } else {
              newRowIndex[look.name] = newRowArray.length;
              newRowArray.push([look, LookVector.of([feel, value])]);
            }
            const j2 = newColIndex[feel.name];
            if (j2 !== void 0) {
              const newCol = newColArray[j2][1];
              (newCol._index as {[name: string]: number | undefined})[feel.name] = newCol._array.length;
              (newCol._array as [Look<unknown>, unknown][]).push([look, value]);
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

  row<T, U = T>(look: Look<T, U>, row: AnyLookVector<T> | undefined): ThemeMatrix {
    if (row !== void 0) {
      row = LookVector.fromAny(row);
    }
    const oldRowArray = this._rowArray;
    const oldRowIndex = this._rowIndex;
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
        const entry = oldRowArray[j];
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
    const oldColArray = this._colArray;
    const oldColIndex = this._colIndex;
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
        const entry = oldColArray[j];
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

  updatedRow<T, U = T>(look: Look<T, U>, defaultRow: AnyLookVector<T> | undefined,
                       ...entries: [Feel, T | U | undefined][]): ThemeMatrix {
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
    for (let j = 0, n = entries.length; j < n; j += 1) {
      const [feel, value] = entries[j];
      newRow = newRow.updated(feel, value !== void 0 ? look.coerce(value) : void 0);
    }
    if (!newRow.equals(oldRow)) {
      return this.row(look, newRow);
    } else {
      return this;
    }
  }

  updatedCol(feel: Feel, defaultCol: AnyFeelVector | undefined,
             ...entries: [Look<unknown>, unknown | undefined][]): ThemeMatrix {
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
    for (let i = 0, m = entries.length; i < m; i += 1) {
      const [look, value] = entries[i];
      newCol = newCol.updated(look, value);
    }
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
      return Objects.equal(this._colArray, that._colArray);
    }
    return false;
  }

  debug(output: Output): void {
    const cols = this._colArray;
    const n = cols.length;
    output = output.write("ThemeMatrix").write(46/*'.'*/)
        .write(n !== 0 ? "forCols" : "empty").write(40/*'('*/);
    for (let j = 0; j < n; j += 1) {
      const [feel, col] = cols[j];
      if (j !== 0) {
        output = output.write(", ");
      }
      output = output.write(91/*'['*/).debug(feel).write(", ").debug(col).write(93/*']'*/);
    }
    output = output.write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _empty?: ThemeMatrix;
  static empty(): ThemeMatrix {
    if (ThemeMatrix._empty === void 0) {
      ThemeMatrix._empty = new ThemeMatrix([], {}, [], {});
    }
    return ThemeMatrix._empty;
  }

  static forRows(...rows: [Look<unknown>, AnyLookVector<unknown>][]): ThemeMatrix {
    const m = rows.length;
    const rowArray = new Array<[Look<unknown>, LookVector<unknown>]>(m);
    for (let i = 0; i < m; i += 1) {
      const [look, row] = rows[i];
      rowArray[i] = [look, LookVector.fromAny(row)];
    }
    return this.fromRowArray(rowArray);
  }

  static forCols(...cols: [Feel, AnyFeelVector][]): ThemeMatrix {
    const m = cols.length;
    const colArray = new Array<[Feel, FeelVector]>(m);
    for (let j = 0; j < m; j += 1) {
      const [feel, col] = cols[j];
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
      const row = rowArray[i][1];
      row.forEach(function (value: unknown, feel: Feel): void {
        if (colIndex[feel.name] === void 0) {
          colIndex[feel.name] = colArray.length;
          colArray.push([feel, void 0 as unknown as FeelVector]);
        }
      }, this);
    }
    for (let j = 0, n = colArray.length; j < n; j += 1) {
      const entry = colArray[j];
      const feel = entry[0];
      const array = new Array<[Look<unknown>, unknown]>();
      const index: {[name: string]: number | undefined} = {};
      for (let i = 0, m = rowArray.length; i < m; i += 1) {
        const [look, row] = rowArray[i];
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
      const col = colArray[i][1];
      col.forEach(function <T>(value: T, look: Look<T>): void {
        if (rowIndex[look.name] === void 0) {
          rowIndex[look.name] = rowArray.length;
          rowArray.push([look, void 0 as unknown as LookVector<T>]);
        }
      }, this);
    }
    for (let i = 0, m = rowArray.length; i < m; i += 1) {
      const entry = rowArray[i];
      const look = entry[0];
      const array = new Array<[Feel, unknown]>();
      const index: {[name: string]: number | undefined} = {};
      for (let j = 0, n = colArray.length; j < n; j += 1) {
        const [feel, col] = colArray[j];
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
