// Copyright 2015-2021 Swim inc.
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

import type {Cursor} from "@swim/util";
import {BTree} from "@swim/collections";
import {AnyItem, Item, Field, Slot, AnyValue, Value, Record, AnyText, Text, AnyNum, MathModule} from "@swim/structure";
import {KeyEffect, MapOutlet} from "@swim/streamlet";
import {RecordStreamlet} from "./RecordStreamlet";
import {AbstractRecordOutlet} from "./AbstractRecordOutlet";
import {RecordFieldUpdater} from "./RecordFieldUpdater";
import {RecordScope} from "./"; // forward import
import {Reifier} from "./"; // forward import
import {Dataflow} from "./"; // forward import

export class RecordModel extends AbstractRecordOutlet {
  constructor(state?: Record) {
    super();
    if (state === void 0) {
      state = Record.create();
    }
    Object.defineProperty(this, "state", {
      value: state,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "fieldUpdaters", {
      value: new BTree(),
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  readonly state!: Record;

  /** @hidden */
  readonly fieldUpdaters!: BTree<Value, RecordFieldUpdater>;

  override isEmpty(): boolean {
    return this.state.isEmpty();
  }

  override isArray(): boolean {
    return this.state.isArray();
  }

  override isObject(): boolean {
    return this.state.isObject();
  }

  override get length(): number {
    return this.state.length;
  }

  declare readonly fieldCount: number; // getter defined below to work around useDefineForClassFields lunacy

  override get valueCount(): number {
    return this.state.valueCount;
  }

  override has(key: AnyValue): boolean {
    if (this.state.has(key)) {
      return true;
    } else {
      const scope = this.streamletScope;
      return scope instanceof Record ? scope.has(key) : false;
    }
  }

  override hasOwn(key: AnyValue): boolean {
    return this.state.has(key);
  }

  override indexOf(item: AnyItem, index?: number): number {
    return this.state.indexOf(item, index);
  }

  override lastIndexOf(item: AnyItem, index: number = 0): number {
    return this.state.lastIndexOf(item, index);
  }

  override get(): Record;
  override get(key: AnyValue): Value;
  override get(key?: AnyValue): Record | Value {
    if (key === void 0) {
      return this;
    } else {
      key = Value.fromAny(key);
      let value = this.state.get(key);
      if (!value.isDefined()) {
        const scope = this.streamletScope;
        if (scope instanceof Record) {
          value = scope.get(key);
        }
      }
      return value;
    }
  }

  override getAttr(key: AnyText): Value {
    key = Text.fromAny(key);
    let value = this.state.getAttr(key);
    if (!value.isDefined()) {
      const scope = this.streamletScope;
      if (scope instanceof Record) {
        value = scope.getAttr(key);
      }
    }
    return value;
  }

  override getSlot(key: AnyValue): Value {
    key = Value.fromAny(key);
    let value = this.state.getSlot(key);
    if (!value.isDefined()) {
      const scope = this.streamletScope;
      if (scope instanceof Record) {
        value = scope.getSlot(key);
      }
    }
    return value;
  }

  override getField(key: AnyValue): Field | undefined {
    key = Value.fromAny(key);
    let field = this.state.getField(key);
    if (field === void 0) {
      const scope = this.streamletScope;
      if (scope instanceof Record) {
        field = scope.getField(key);
      }
    }
    return field;
  }

  override getItem(index: AnyNum): Item {
    return this.state.getItem(index);
  }

  bindValue(key: Value, expr: Value): void {
    const fieldUpdater = new RecordFieldUpdater(this, key);
    const valueInput = Dataflow.compile(expr, this);
    fieldUpdater.bindInput(valueInput);
    // TODO: clean up existing field updater
    Object.defineProperty(this, "fieldUpdaters", {
      value: this.fieldUpdaters.updated(key, fieldUpdater),
      enumerable: true,
      configurable: true,
    });
  }

  override set(key: AnyValue, newValue: AnyValue): this {
    key = Value.fromAny(key);
    if (!this.state.has(key)) {
      const scope = this.streamletScope;
      if (scope instanceof Record && scope.has(key)) {
        scope.set(key, newValue);
      } else {
        this.state.set(key, newValue);
      }
    } else {
      this.state.set(key, newValue);
    }
    this.decohereInputKey(key, KeyEffect.Update);
    return this;
  }

  override setAttr(key: AnyText, newValue: AnyValue): this {
    key = Text.fromAny(key);
    if (!this.state.has(key)) {
      const scope = this.streamletScope;
      if (scope instanceof Record && scope.has(key)) {
        scope.setAttr(key, newValue);
      } else {
        this.state.setAttr(key, newValue);
      }
    } else {
      this.state.setAttr(key, newValue);
    }
    this.decohereInputKey(key, KeyEffect.Update);
    return this;
  }

  override setSlot(key: AnyValue, newValue: AnyValue): this {
    key = Value.fromAny(key);
    if (!this.state.has(key)) {
      const scope = this.streamletScope;
      if (scope instanceof Record && scope.has(key)) {
        scope.setSlot(key, newValue);
      } else {
        this.state.setSlot(key, newValue);
      }
    } else {
      this.state.setSlot(key, newValue);
    }
    this.decohereInputKey(key, KeyEffect.Update);
    return this;
  }

  override setItem(index: number, newItem: AnyItem): this {
    const oldItem = this.state.getItem(index);
    newItem = Item.fromAny(newItem);
    this.state.setItem(index, newItem);
    if (oldItem instanceof Field && newItem instanceof Field) {
      if (oldItem.key.equals(newItem.key)) {
        this.decohereInputKey(oldItem.key, KeyEffect.Update);
      } else {
        this.decohereInputKey(oldItem.key, KeyEffect.Remove);
        this.decohereInputKey(newItem.key, KeyEffect.Update);
      }
    } else if (oldItem instanceof Field) {
      this.decohereInputKey(oldItem.key, KeyEffect.Remove);
    } else if (newItem instanceof Field) {
      this.decohereInputKey(newItem.key, KeyEffect.Update);
    } else {
      this.decohereInput();
    }
    return this;
  }

  override push(...newItems: AnyItem[]): number {
    let i = this.state.length;
    const n = this.state.push(...newItems);
    while (i < n) {
      const newItem = this.state.get(i);
      if (newItem instanceof Field) {
        this.decohereInputKey(newItem.key, KeyEffect.Update);
      }
      i += 1;
    }
    return n;
  }

  override splice(start: number, deleteCount: number = 0, ...newItems: AnyItem[]): Item[] {
    const n = this.state.length;
    if (start < 0) {
      start = n + start;
    }
    start = Math.max(0, start);
    deleteCount = Math.max(0, deleteCount);
    const deleted = this.state.splice(start, deleteCount, ...newItems);
    for (let i = 0; i < deleted.length; i += 1) {
      const oldItem = deleted[i];
      if (oldItem instanceof Field) {
        this.decohereInputKey(oldItem.key, KeyEffect.Remove);
      }
    }
    for (let i = start; i < start + newItems.length; i += 1) {
      const newItem = this.state.get(i);
      if (newItem instanceof Field) {
        this.decohereInputKey(newItem.key, KeyEffect.Update);
      }
    }
    return deleted;
  }

  override delete(key: AnyValue): Item {
    const oldItem = this.state.delete(key);
    if (oldItem instanceof Field) {
      this.decohereInputKey(oldItem.key, KeyEffect.Remove);
    }
    return oldItem;
  }

  override clear(): void {
    const oldState = this.state.branch();
    this.state.clear();
    oldState.forEach(function (oldItem: Item): void {
      if (oldItem instanceof Field) {
        this.decohereInputKey(oldItem.key, KeyEffect.Remove);
      }
    }, this);
  }

  override forEach<T>(callback: (item: Item, index: number) => T | void): T | undefined;
  override forEach<T, S>(callback: (this: S, item: Item, index: number) => T | void,
                         thisArg: S): T | undefined;
  override forEach<T, S>(callback: (this: S | undefined, item: Item, index: number) => T | void,
                         thisArg?: S): T | undefined {
    return this.state.forEach(callback, thisArg);
  }

  override keyIterator(): Cursor<Value> {
    throw new Error(); // TODO
  }

  override disconnectInputs(): void {
    const oldFieldUpdaters = this.fieldUpdaters;
    if (!oldFieldUpdaters.isEmpty()) {
      Object.defineProperty(this, "fieldUpdaters", {
        value: new BTree(),
        enumerable: true,
        configurable: true,
      });
      oldFieldUpdaters.forEach(function (key: Value, inlet: RecordFieldUpdater): void {
        inlet.disconnectInputs();
      }, this);
    }
  }

  override memoize(): MapOutlet<Value, Value, Record> {
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
      this.state.push(field);
    } else if (value instanceof Record) {
      // Add recursively materialized nested scope.
      const child = new RecordScope(this);
      child.materialize(value);
      this.state.push(field.updatedValue(child));
    } else {
      this.state.push(field);
    }
  }

  materializeValue(value: Value): void {
    if (value instanceof RecordStreamlet) {
      value.setStreamletScope(this);
      this.state.push(value);
    } else if (value instanceof Record) {
      // Add recursively materialized nested scope.
      const child = new RecordScope(this);
      child.materialize(value);
      this.state.push(child);
    } else {
      this.state.push(value);
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
        // Decohere nested scope key.
        this.decohereInputKey(key, KeyEffect.Update);
      } else if (value instanceof Record) {
        // Recursively compile nested scope.
        (this.state.getItem(index).toValue() as RecordModel).compile(value);
        // Decohere nested scope key.
        this.decohereInputKey(key, KeyEffect.Update);
      } else {
        // Set placeholder value.
        field.setValue(Value.extant());
        // Bind dynamic value updater.
        this.bindValue(key, value);
      }
    } else {
      // Decohere constant key.
      this.decohereInputKey(key, KeyEffect.Update);
    }
  }

  compileValue(value: Value, index: number): void {
    if (value instanceof RecordStreamlet) {
      value.compile();
    } else if (value instanceof Record) {
      // Recursively compile nested scope.
      (this.state.getItem(index) as RecordModel).compile(value);
    } else if (!value.isConstant()) {
      // TODO: Bind dynamic item updater.
    } else {
      // TODO: Fold constant expressions.
    }
  }

  reify(reifier: Reifier | null = Reifier.system()): void {
    this.forEach(function (oldItem: Item, index: number): void {
      const newItem = this.reifyItem(oldItem, reifier);
      if (oldItem !== newItem) {
        this.setItem(index, newItem);
      }
    }, this);
  }

  reifyItem(item: Item, reifier: Reifier | null): Item {
    if (reifier !== null) {
      item = reifier.reify(item);
    }
    const scope = this.streamletScope;
    if (scope instanceof RecordModel) {
      return scope.reifyItem(item, reifier);
    } else {
      return item;
    }
  }

  static from(record: Record): RecordModel {
    const model = new RecordModel();
    model.materialize(record);
    model.compile(record);
    return model;
  }

  static override of(...items: AnyItem[]): RecordModel {
    return RecordModel.from(Record.of(...items));
  }

  static override globalScope(): RecordModel {
    const model = new RecordModel();
    model.materializeField(Slot.of("math", MathModule.scope.branch()));
    return model;
  }
}
Object.defineProperty(RecordModel.prototype, "fieldCount", {
  get(this: RecordModel): number {
    return this.state.fieldCount;
  },
  enumerable: true,
  configurable: true,
});
