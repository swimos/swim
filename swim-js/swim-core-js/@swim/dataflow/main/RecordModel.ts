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

import {Cursor} from "@swim/util";
import {BTree} from "@swim/collections";
import {AnyItem, Item, Field, Slot, AnyValue, Value, Record, AnyText, Text, AnyNum, MathModule} from "@swim/structure";
import {KeyEffect, MapOutlet} from "@swim/streamlet";
import {RecordOutlet} from "./RecordOutlet";
import {RecordStreamlet} from "./RecordStreamlet";
import {AbstractRecordOutlet} from "./AbstractRecordOutlet";
import {RecordFieldUpdater} from "./RecordFieldUpdater";
import {Transmuter} from "./Transmuter";

export class RecordModel extends AbstractRecordOutlet {
  /** @hidden */
  protected _state: Record;
  /** @hidden */
  protected _fieldUpdaters: BTree<Value, RecordFieldUpdater>;

  constructor(state: Record = Record.create()) {
    super();
    this._state = state;
    this._fieldUpdaters = new BTree();
  }

  isEmpty(): boolean {
    return this._state.isEmpty();
  }

  isArray(): boolean {
    return this._state.isArray();
  }

  isObject(): boolean {
    return this._state.isObject();
  }

  get length(): number {
    return this._state.length;
  }

  fieldCount(): number {
    return this._state.fieldCount();
  }

  valueCount(): number {
    return this._state.valueCount();
  }

  has(key: AnyValue): boolean {
    if (this._state.has(key)) {
      return true;
    } else {
      const scope = this.streamletScope();
      return scope instanceof Record ? scope.has(key) : false;
    }
  }

  hasOwn(key: AnyValue): boolean {
    return this._state.has(key);
  }

  indexOf(item: AnyItem, index?: number): number {
    return this._state.indexOf(item, index);
  }

  lastIndexOf(item: AnyItem, index: number = 0): number {
    return this._state.lastIndexOf(item, index);
  }

  get(): Record;
  get(key: AnyValue): Value;
  get(key?: AnyValue): Record | Value {
    if (key === void 0) {
      return this;
    } else {
      key = Value.fromAny(key);
      let value = this._state.get(key);
      if (!value.isDefined()) {
        const scope = this.streamletScope();
        if (scope instanceof Record) {
          value = scope.get(key);
        }
      }
      return value;
    }
  }

  getAttr(key: AnyText): Value {
    key = Text.fromAny(key);
    let value = this._state.getAttr(key);
    if (!value.isDefined()) {
      const scope = this.streamletScope();
      if (scope instanceof Record) {
        value = scope.getAttr(key);
      }
    }
    return value;
  }

  getSlot(key: AnyValue): Value {
    key = Value.fromAny(key);
    let value = this._state.getSlot(key);
    if (!value.isDefined()) {
      const scope = this.streamletScope();
      if (scope instanceof Record) {
        value = scope.getSlot(key);
      }
    }
    return value;
  }

  getField(key: AnyValue): Field | undefined {
    key = Value.fromAny(key);
    let field = this._state.getField(key);
    if (field === void 0) {
      const scope = this.streamletScope();
      if (scope instanceof Record) {
        field = scope.getField(key);
      }
    }
    return field;
  }

  getItem(index: AnyNum): Item {
    return this._state.getItem(index);
  }

  bindValue(key: Value, expr: Value): void {
    const fieldUpdater = new RecordFieldUpdater(this, key);
    const valueInput = RecordOutlet.Dataflow.compile(expr, this);
    fieldUpdater.bindInput(valueInput);
    // TODO: clean up existing field updater
    this._fieldUpdaters = this._fieldUpdaters.updated(key, fieldUpdater);
  }

  set(key: AnyValue, newValue: AnyValue): this {
    key = Value.fromAny(key);
    if (!this._state.has(key)) {
      const scope = this.streamletScope();
      if (scope instanceof Record && scope.has(key)) {
        scope.set(key, newValue);
      } else {
        this._state.set(key, newValue);
      }
    } else {
      this._state.set(key, newValue);
    }
    this.invalidateInputKey(key, KeyEffect.Update);
    return this;
  }

  setAttr(key: AnyText, newValue: AnyValue): this {
    key = Text.fromAny(key);
    if (!this._state.has(key)) {
      const scope = this.streamletScope();
      if (scope instanceof Record && scope.has(key)) {
        scope.setAttr(key, newValue);
      } else {
        this._state.setAttr(key, newValue);
      }
    } else {
      this._state.setAttr(key, newValue);
    }
    this.invalidateInputKey(key, KeyEffect.Update);
    return this;
  }

  setSlot(key: AnyValue, newValue: AnyValue): this {
    key = Value.fromAny(key);
    if (!this._state.has(key)) {
      const scope = this.streamletScope();
      if (scope instanceof Record && scope.has(key)) {
        scope.setSlot(key, newValue);
      } else {
        this._state.setSlot(key, newValue);
      }
    } else {
      this._state.setSlot(key, newValue);
    }
    this.invalidateInputKey(key, KeyEffect.Update);
    return this;
  }

  setItem(index: number, newItem: AnyItem): this {
    const oldItem = this._state.getItem(index);
    newItem = Item.fromAny(newItem);
    this._state.setItem(index, newItem);
    if (oldItem instanceof Field && newItem instanceof Field) {
      if (oldItem.key.equals(newItem.key)) {
        this.invalidateInputKey(oldItem.key, KeyEffect.Update);
      } else {
        this.invalidateInputKey(oldItem.key, KeyEffect.Remove);
        this.invalidateInputKey(newItem.key, KeyEffect.Update);
      }
    } else if (oldItem instanceof Field) {
      this.invalidateInputKey(oldItem.key, KeyEffect.Remove);
    } else if (newItem instanceof Field) {
      this.invalidateInputKey(newItem.key, KeyEffect.Update);
    } else {
      this.invalidateInput();
    }
    return this;
  }

  push(...newItems: AnyItem[]): number {
    let i = this._state.length;
    const n = this._state.push.apply(this._state, arguments);
    while (i < n) {
      const newItem = this._state.get(i);
      if (newItem instanceof Field) {
        this.invalidateInputKey(newItem.key, KeyEffect.Update);
      }
      i += 1;
    }
    return n;
  }

  splice(start: number, deleteCount: number = 0, ...newItems: AnyItem[]): Item[] {
    const n = this._state.length;
    if (start < 0) {
      start = n + start;
    }
    start = Math.max(0, start);
    deleteCount = Math.max(0, deleteCount);
    const deleted = this._state.splice.apply(this._state, arguments);
    for (let i = 0; i < deleted.length; i += 1) {
      const oldItem = deleted[i];
      if (oldItem instanceof Field) {
        this.invalidateInputKey(oldItem.key, KeyEffect.Remove);
      }
    }
    for (let i = start; i < start + newItems.length; i += 1) {
      const newItem = this._state.get(i);
      if (newItem instanceof Field) {
        this.invalidateInputKey(newItem.key, KeyEffect.Update);
      }
    }
    return deleted;
  }

  delete(key: AnyValue): Item {
    const oldItem = this._state.delete(key);
    if (oldItem instanceof Field) {
      this.invalidateInputKey(oldItem.key, KeyEffect.Remove);
    }
    return oldItem;
  }

  clear(): void {
    const oldState = this._state.branch();
    this._state.clear();
    oldState.forEach(function (oldItem: Item): void {
      if (oldItem instanceof Field) {
        this.invalidateInputKey(oldItem.key, KeyEffect.Remove);
      }
    }, this);
  }

  forEach<T, S = unknown>(callback: (this: S, item: Item, index: number) => T | void,
                          thisArg?: S): T | undefined {
    return this._state.forEach(callback, thisArg);
  }

  keyIterator(): Cursor<Value> {
    throw new Error(); // TODO
  }

  disconnectInputs(): void {
    const fieldUpdaters = this._fieldUpdaters;
    if (!fieldUpdaters.isEmpty()) {
      this._fieldUpdaters = new BTree();
      fieldUpdaters.forEach(function (key: Value, inlet: RecordFieldUpdater): void {
        inlet.disconnectInputs();
      }, this);
    }
  }

  memoize(): MapOutlet<Value, Value, Record> {
    return this;
  }

  materialize(record: Record): void {
    record.forEach(function (item: Item): void {
      this.materializeItem(item);
    }, this);
  }

  materializeItem(item: Item): void {
    if (item instanceof Field) {
      this.materializeField(item);
    } else {
      this.materializeValue(item);
    }
  }

  materializeField(field: Field): void {
    const value = field.value;
    if (value instanceof RecordStreamlet) {
      value.setStreamletScope(this);
      this._state.push(field);
    } else if (value instanceof Record) {
      // Add recursively materialized nested scope.
      const child = new RecordOutlet.Scope(this);
      child.materialize(value);
      this._state.push(field.updatedValue(child));
    } else {
      this._state.push(field);
    }
  }

  materializeValue(value: Value): void {
    if (value instanceof RecordStreamlet) {
      value.setStreamletScope(this);
      this._state.push(value);
    } else if (value instanceof Record) {
      // Add recursively materialized nested scope.
      const child = new RecordOutlet.Scope(this);
      child.materialize(value);
      this._state.push(child);
    } else {
      this._state.push(value);
    }
  }

  compile(record: Record): void {
    record.forEach(function (item: Item, index: number): void {
      this.compileItem(item, index);
    }, this);
  }

  compileItem(item: Item, index: number): void {
    if (item instanceof Field) {
      this.compileField(item, index);
    } else {
      this.compileValue(item, index);
    }
  }

  compileField(field: Field, index: number): void {
    const key = field.key;
    const value = field.value;
    if (!key.isConstant()) {
      // TODO: Add dynamic key updater.
    } else if (!value.isConstant()) {
      if (value instanceof RecordStreamlet) {
        // Lexically bind nested streamlet.
        value.compile();
        // Invalidate nested scope key.
        this.invalidateInputKey(key, KeyEffect.Update);
      } else if (value instanceof Record) {
        // Recursively compile nested scope.
        (this._state.getItem(index).toValue() as RecordModel).compile(value);
        // Invalidate nested scope key.
        this.invalidateInputKey(key, KeyEffect.Update);
      } else {
        // Set placeholder value.
        field.setValue(Value.extant());
        // Bind dynamic value updater.
        this.bindValue(key, value);
      }
    } else {
      // Invalidate constant key.
      this.invalidateInputKey(key, KeyEffect.Update);
    }
  }

  compileValue(value: Value, index: number): void {
    if (value instanceof RecordStreamlet) {
      value.compile();
    } else if (value instanceof Record) {
      // Recursively compile nested scope.
      (this._state.getItem(index) as RecordModel).compile(value);
    } else if (!value.isConstant()) {
      // TODO: Bind dynamic item updater.
    } else {
      // TODO: Fold constant expressions.
    }
  }

  transmute(transmuter: Transmuter | null = Transmuter.system()): void {
    this.forEach(function (oldItem: Item, index: number): void {
      const newItem = this.transmuteItem(oldItem, transmuter);
      if (oldItem !== newItem) {
        this.setItem(index, newItem);
      }
    }, this);
  }

  transmuteItem(item: Item, transmuter: Transmuter | null): Item {
    if (item instanceof Field) {
      return this.transmuteField(item, transmuter);
    } else {
      return this.transmuteValue(item, transmuter);
    }
  }

  transmuteField(field: Field, transmuter: Transmuter | null): Field {
    const oldValue = field.value;
    const newValue = this.transmuteValue(oldValue, transmuter);
    if (oldValue !== newValue) {
      return field.updatedValue(newValue);
    } else {
      return field;
    }
  }

  transmuteValue(oldValue: Value, transmuter: Transmuter | null): Value {
    if (oldValue instanceof RecordModel) {
      let newValue = this.transmuteModel(oldValue);
      if (oldValue === newValue && transmuter) {
        newValue = transmuter.transmute(oldValue);
      }
      return newValue;
    } else {
      return oldValue;
    }
  }

  transmuteModel(model: RecordModel): Record {
    const scope = this.streamletScope();
    if (scope instanceof RecordModel) {
      return scope.transmuteModel(model);
    } else {
      return model;
    }
  }

  static from(record: Record): RecordModel {
    const model = new RecordModel();
    model.materialize(record);
    model.compile(record);
    return model;
  }

  static of(...items: AnyItem[]): RecordModel {
    return RecordModel.from(Record.of.apply(void 0, arguments));
  }

  static globalScope(): RecordModel {
    const model = new RecordModel();
    model.materializeField(Slot.of("math", MathModule.scope().branch()));
    return model;
  }
}
RecordOutlet.Model = RecordModel;
