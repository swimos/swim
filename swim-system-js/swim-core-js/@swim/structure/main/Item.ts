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

import {Comparable, HashCode, Cursor} from "@swim/util";
import {Debug, Display, Format, Output} from "@swim/codec";
import {Field} from "./Field";
import {Attr} from "./Attr";
import {Slot} from "./Slot";
import {AnyValue, Value} from "./Value";
import {Record} from "./Record";
import {RecordMap} from "./RecordMap";
import {RecordMapView} from "./RecordMapView";
import {Data} from "./Data";
import {AnyText, Text} from "./Text";
import {AnyNum, Num} from "./Num";
import {Bool} from "./Bool";
import {Expression} from "./Expression";
import {Selector} from "./Selector";
import {Operator} from "./Operator";
import {Func} from "./Func";
import {Extant} from "./Extant";
import {Absent} from "./Absent";
import {Form} from "./Form";
import {AnyInterpreter} from "./Interpreter";
import {BinaryOperator} from "./operator/BinaryOperator";
import {UnaryOperator} from "./operator/UnaryOperator";
import {ConditionalOperator} from "./operator/ConditionalOperator";
import {OrOperator} from "./operator/OrOperator";
import {AndOperator} from "./operator/AndOperator";
import {BitwiseOrOperator} from "./operator/BitwiseOrOperator";
import {BitwiseXorOperator} from "./operator/BitwiseXorOperator";
import {BitwiseAndOperator} from "./operator/BitwiseAndOperator";
import {LtOperator} from "./operator/LtOperator";
import {LeOperator} from "./operator/LeOperator";
import {EqOperator} from "./operator/EqOperator";
import {NeOperator} from "./operator/NeOperator";
import {GeOperator} from "./operator/GeOperator";
import {GtOperator} from "./operator/GtOperator";
import {PlusOperator} from "./operator/PlusOperator";
import {MinusOperator} from "./operator/MinusOperator";
import {TimesOperator} from "./operator/TimesOperator";
import {DivideOperator} from "./operator/DivideOperator";
import {ModuloOperator} from "./operator/ModuloOperator";
import {NotOperator} from "./operator/NotOperator";
import {BitwiseNotOperator} from "./operator/BitwiseNotOperator";
import {NegativeOperator} from "./operator/NegativeOperator";
import {PositiveOperator} from "./operator/PositiveOperator";
import {InvokeOperator} from "./operator/InvokeOperator";
import {IdentitySelector} from "./selector/IdentitySelector";
import {GetSelector} from "./selector/GetSelector";
import {GetAttrSelector} from "./selector/GetAttrSelector";
import {GetItemSelector} from "./selector/GetItemSelector";
import {KeysSelector} from "./selector/KeysSelector";
import {ValuesSelector} from "./selector/ValuesSelector";
import {ChildrenSelector} from "./selector/ChildrenSelector";
import {DescendantsSelector} from "./selector/DescendantsSelector";
import {FilterSelector} from "./selector/FilterSelector";
import {LiteralSelector} from "./selector/LiteralSelector";
import {LambdaFunc} from "./func/LambdaFunc";
import {BridgeFunc} from "./func/BridgeFunc";
import {MathModule} from "./func/MathModule";

export type AnyItem = Item
                    | {readonly $key: AnyValue, readonly $value: AnyValue}
                    | {readonly [key: string]: AnyValue}
                    | ReadonlyArray<unknown> // ReadonlyArray<AnyItem>
                    | Uint8Array
                    | string
                    | number
                    | boolean
                    | null
                    | undefined;

export abstract class Item implements Comparable<Item>, HashCode, Debug, Display {
  /** @hidden */
  constructor() {
    // stub
  }

  /**
   * Returns `true` if this `Item` is not [[Absent]].
   */
  abstract isDefined(): boolean;

  /**
   * Returns `true` if this `Item is neither [[Extant]] nor [[Absent]].
   */
  abstract isDistinct(): boolean;

  /**
   * Returns `true` if this `Item` always [[Item.evaluate evaluates]] to the
   * same `Item`.
   */
  abstract isConstant(): boolean;

  /**
   * Returns the key component of this `Item`, if this `Item is a [[Field]];
   * otherwise returns [[Absent]] if this `Item` is a `Value`.
   */
  abstract get key(): Value;

  /**
   * Returns the value component of this `Item`, if this `Item` is a [[Field]];
   * otherwise returns `this` if this `Item is a `Value`.
   */
  abstract toValue(): Value;

  /**
   * Returns the `key` string of the first member of this `Item`, if this `Item`
   * is a [[Record]], and its first member is an [[Attr]]; otherwise returns
   * `undefined` if this `Item` is not a `Record`, or if this `Item` is a
   * `Record` whose first member is not an `Attr`.
   *
   * Used to concisely get the name of the discriminating attribute of a
   * structure.  The `tag` can be used to discern the nominal type of a
   * polymorphic structure, similar to an XML element tag.
   */
  abstract tag(): string | undefined;

  /**
   * Returns the [[Item.flattened flattened]] members of this `Item` after all
   * attributes have been removed, if this `Item` is a [[Record]]; otherwise
   * returns `this` if this `Item` is a non-`Record` `Value`, or returns
   * the value component if this `Item` is a `Field`.
   *
   * Used to concisely get the scalar value of an attributed structure.  An
   * attributed structure is a `Record` with one or more attributes that modify
   * one or more other members.
   */
  abstract target(): Value;

  /**
   * Returns the sole member of this `Item`, if this `Item` is a [[Record]]
   * with exactly one member, and its member is a `Value`; returns [[Extant]]
   * if this `Item` is an empty `Record`; returns [[Absent]] if this `Item` is
   * a `Field`; otherwise returns `this` if this `Item` is a `Record` with more
   * than one member, or if this `Item` is a non-`Record` `Value`.
   *
   * Used to convert a unary `Record` into its member `Value`.  Facilitates
   * writing code that treats a unary `Record` equivalently to a bare `Value`.
   */
  abstract flattened(): Value;

  /**
   * Returns `this` if this `Item` is a [[Record]]; returns a `Record`
   * containing just this `Item`, if this `Item` is [[Item.isDistinct
   * distinct]]; otherwise returns an empty `Record` if this `Item` is
   * [[Extant]] or [[Absent]].  Facilitates writing code that treats a bare
   * `Value` equivalently to a unary `Record`.
   */
  abstract unflattened(): Record;

  /**
   * Returns the value of the first member of this `Item`, if this `Item` is a
   * [[Record]], and its first member is an [[Attr]] whose `key` string is
   * equal to `tag`; otherwise returns [[Absent]] if this `Item` is not a
   * `Record`, or if this `Item` is a `Record` whose first member is not an
   * `Attr`, or if this `Item` is a `Record` whose first member is an `Attr`
   * whose `key` does not equal the `tag`.
   *
   * Used to conditionally get the value of the head `Attr` of a structure, if
   * and only if the key string of the head `Attr` is equal to the `tag`.  Can
   * be used to check if a structure might conform to a nominal type named
   * `tag`, while simultaneously getting the value of the `tag` attribute.
   */
  abstract header(tag: string): Value;

  /**
   * Returns the [[Item.unflattened unflattened]] [[Item.header header]] of
   * this `Item`, if this `Item` is a [[Record]], and its first member is an
   * [[Attr]] whose `key` string is equal to `tag`; otherwise returns
   * `undefined`.
   *
   * The `headers` of the `tag` attribute of a structure are like the
   * attributes of an XML element tag; through unlike an XML element, `tag`
   * attribute headers are not limited to string keys and values.
   */
  abstract headers(tag: string): Record | undefined;

  /**
   * Returns the first member of this `Item`, if this `Item` is a non-empty
   * [[Record]]; otherwise returns [[Absent]].
   */
  abstract head(): Item;

  /**
   * Returns a view of all but the first member of this `Item`, if this `Item`
   * is a non-empty [[Record]]; otherwise returns an empty `Record` if this
   * `Item` is not a `Record`, or if this `Item` is itself an empty `Record`.
   */
  abstract tail(): Record;

  /**
   * Returns the [[Record.flattened flattened]] [[Item.tail tail]] of this
   * `Item`.  Used to recursively deconstruct a structure, terminating with its
   * last `Value`, rather than a unary `Record` containing its last value, if
   * the structure ends with a `Value` member.
   */
  abstract body(): Value;

  /**
   * Returns the number of members contained in this `Item`, if this `Item` is
   * a [[Record]]; otherwise returns `0` if this `Item` is not a `Record`.
   */
  abstract get length(): number;

  /**
   * Returns `true` if this `Item` is a [[Record]] that has a [[Field]] member
   * with a key that is equal to the given `key`; otherwise returns `false` if
   * this `Item` is not a `Record`, or if this `Item` is a `Record`, but has no
   * `Field` member with a key equal to the given `key`.
   */
  abstract has(key: AnyValue): boolean;

  /**
   * Returns the value of the last [[Field]] member of this `Item` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Item` is not a
   * [[Record]], or if this `Item` is a `Record`, but has no `Field` member
   * with a key equal to the given `key`.
   */
  abstract get(key: AnyValue): Value;

  /**
   * Returns the value of the last [[Attr]] member of this `Item` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Item` is not a
   * [[Record]], or if this `Item` is a `Record`, but has no `Attr` member
   * with a key equal to the given `key`.
   */
  abstract getAttr(key: AnyText): Value;

  /**
   * Returns the value of the last [[Slot]] member of this `Item` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Item` is not a
   * [[Record]], or if this `Item` is a `Record`, but has no `Slot` member
   * with a key equal to the given `key`.
   */
  abstract getSlot(key: AnyValue): Value;

  /**
   * Returns the last [[Field]] member of this `Item` whose key is equal to the
   * given `key`; returns `undefined` if this `Item` is not a [[Record]], or if
   * this `Item` is a `Record`, but has no `Field` member with a `key` equal to
   * the given `key`.
   */
  abstract getField(key: AnyValue): Field | undefined;

  /**
   * Returns the member of this `Item` at the given `index`, if this `Item` is
   * a [[Record]], and the `index` is greater than or equal to zero, and less
   * than the [[Record.length length]] of the `Record`; otherwise returns
   * [[Absent]] if this `Item` is not a `Record`, or if this `Item` is a
   * `Record`, but the `index` is out of bounds.
   */
  abstract getItem(index: AnyNum): Item;

  updated(key: AnyValue, value: AnyValue): Record {
    const record = Item.Record.create(2);
    record.push(this);
    record.set(key, value);
    return record;
  }

  updatedAttr(key: AnyText, value: AnyValue): Record {
    const record = Item.Record.create(2);
    record.push(this);
    record.setAttr(key, value);
    return record;
  }

  updatedSlot(key: AnyValue, value: AnyValue): Record {
    const record = Item.Record.create(2);
    record.push(this);
    record.setSlot(key, value);
    return record;
  }

  appended(...items: AnyItem[]): Record {
    const record = Item.Record.create(1 + arguments.length);
    record.push(this);
    record.push.apply(record, arguments);
    return record;
  }

  prepended(...items: AnyItem[]): Record {
    const record = Item.Record.create(arguments.length + 1);
    record.push.apply(record, arguments);
    record.push(this);
    return record;
  }

  abstract deleted(key: AnyValue): Item;

  concat(...items: AnyItem[]): Record {
    const record = Item.Record.create();
    record.push(this);
    for (let i = 0, n = arguments.length; i < n; i += 1) {
      Item.fromAny(arguments[i]).forEach(function (item: Item): void {
        record.push(item);
      });
    }
    return record;
  }

  abstract conditional(thenTerm: Item, elseTerm: Item): Item;

  abstract or(that: Item): Item;

  abstract and(that: Item): Item;

  abstract bitwiseOr(that: AnyItem): Item;

  abstract bitwiseXor(that: AnyItem): Item;

  abstract bitwiseAnd(that: AnyItem): Item;

  lt(that: AnyItem): Item {
    that = Item.fromAny(that);
    return this.compareTo(that) < 0 ? Item.Bool.from(true) : Item.absent();
  }

  le(that: AnyItem): Item {
    that = Item.fromAny(that);
    return this.compareTo(that) <= 0 ? Item.Bool.from(true) : Item.absent();
  }

  eq(that: AnyItem): Item {
    that = Item.fromAny(that);
    return this.equals(that) ? Item.Bool.from(true) : Item.absent();
  }

  ne(that: AnyItem): Item {
    that = Item.fromAny(that);
    return !this.equals(that) ? Item.Bool.from(true) : Item.absent();
  }

  ge(that: AnyItem): Item {
    that = Item.fromAny(that);
    return this.compareTo(that) >= 0 ? Item.Bool.from(true) : Item.absent();
  }

  gt(that: AnyItem): Item {
    that = Item.fromAny(that);
    return this.compareTo(that) > 0 ? Item.Bool.from(true) : Item.absent();
  }

  abstract plus(that: AnyItem): Item;

  abstract minus(that: AnyItem): Item;

  abstract times(that: AnyItem): Item;

  abstract divide(that: AnyItem): Item;

  abstract modulo(that: AnyItem): Item;

  abstract not(): Item;

  abstract bitwiseNot(): Item;

  abstract negative(): Item;

  abstract positive(): Item;

  abstract inverse(): Item;

  invoke(args: Value): Item {
    return Item.absent();
  }

  abstract lambda(template: Value): Value;

  filter(predicate?: AnyItem): Selector {
    const selector = Item.Selector.literal(this);
    return selector.filter.apply(selector, arguments);
  }

  max(that: Item): Item {
    return this.compareTo(that) >= 0 ? this : that;
  }

  min(that: Item): Item {
    return this.compareTo(that) <= 0 ? this : that;
  }

  evaluate(interpreter: AnyInterpreter): Item {
    return this;
  }

  substitute(interpreter: AnyInterpreter): Item {
    return this;
  }

  /**
   * Converts this `Item` into a `string` value, if possible; otherwise returns
   * `undefined` if this `Item` can't be converted into a `string` value.
   */
  abstract stringValue(): string | undefined;

  /**
   * Converts this `Item` into a `string` value, if possible; otherwise returns
   * `orElse` if this `Item` can't be converted into a `string` value.
   */
  abstract stringValue<T>(orElse: T): string | T;

  /**
   * Converts this `Item` into a `number` value, if possible; otherwise returns
   * `undefined` if this `Item` can't be converted into a `number` value.
   */
  abstract numberValue(): number | undefined;

  /**
   * Converts this `Item` into a `number` value, if possible; otherwise returns
   * `orElse` if this `Item` can't be converted into a `number` value.
   */
  abstract numberValue<T>(orElse: T): number | T;

  /**
   * Converts this `Item` into a `boolean` value, if possible; otherwise returns
   * `undefined` if this `Item` can't be converted into a `boolean` value.
   */
  abstract booleanValue(): boolean | undefined;

  /**
   * Converts this `Item` into a `boolean` value, if possible; otherwise returns
   * `orElse` if this `Item` can't be converted into a `boolean` value.
   */
  abstract booleanValue<T>(orElse: T): boolean | T;

  cast<T>(form: Form<T, unknown>): T | undefined;

  cast<T, E = T>(form: Form<T, unknown>, orElse: E): T | E;

  cast<T, E = T>(form: Form<T, unknown>, orElse?: E): T | E | undefined {
    let object: T | E | undefined = form.cast(this);
    if (object === void 0) {
      object = orElse;
    }
    return object;
  }

  coerce<T>(form: Form<T, unknown>): T;

  coerce<T, E = T>(form: Form<T, unknown>, orElse: E): T | E;

  coerce<T, E = T>(form: Form<T, unknown>, orElse?: E): T | E {
    let object: T | E | undefined = form.cast(this);
    if (object === void 0) {
      object = form.unit();
    }
    if (object === void 0) {
      object = orElse;
    }
    return object!;
  }

  abstract toAny(): AnyItem;

  abstract isAliased(): boolean;

  abstract isMutable(): boolean;

  abstract alias(): void;

  abstract branch(): Item;

  abstract clone(): Item;

  abstract commit(): this;

  /** @hidden */
  precedence(): number {
    return 11;
  }

  forEach<T, S = unknown>(callback: (this: S, item: Item, index: number) => T | void,
                          thisArg?: S): T | undefined {
    return callback.call(thisArg, this, 0);
  }

  iterator(): Cursor<Item> {
    return Cursor.unary(this);
  }

  /**
   * Returns the heterogeneous sort order of this `Item`.  Used to impose a
   * total order on the set of all items.  When comparing two items of
   * different types, the items order according to their `typeOrder}`.
   */
  abstract typeOrder(): number;

  abstract compareTo(that: Item): 0 | 1 | -1;

  abstract keyEquals(key: unknown): boolean;

  abstract equals(that: unknown): boolean;

  abstract hashCode(): number;

  abstract debug(output: Output): void;

  display(output: Output): void {
    this.debug(output);
  }

  toString(): string {
    return Format.debug(this);
  }

  static empty(): Item {
    return Item.Record.empty();
  }

  static extant(): Item {
    return Item.Extant.extant();
  }

  static absent(): Item {
    return Item.Absent.absent();
  }

  static fromAny(item: AnyItem): Item {
    if (item instanceof Item) {
      return item;
    } else {
      return Item.Value.fromAny(item);
    }
  }

  private static _globalScope?: Item;

  static globalScope(): Item {
    if (Item._globalScope === void 0) {
      Item._globalScope = Item.Record.create(1)
          .slot("math", Item.MathModule.scope())
          .commit();
    }
    return Item._globalScope;
  }

  // Forward type declarations
  /** @hidden */
  static Field: typeof Field; // defined by Field
  /** @hidden */
  static Attr: typeof Attr; // defined by Attr
  /** @hidden */
  static Slot: typeof Slot; // defined by Slot
  /** @hidden */
  static Value: typeof Value; // defined by Value
  /** @hidden */
  static Record: typeof Record; // defined by Record
  /** @hidden */
  static RecordMap: typeof RecordMap; // defined by RecordMap
  /** @hidden */
  static RecordMapView: typeof RecordMapView; // defined by RecordMapView
  /** @hidden */
  static Data: typeof Data; // defined by Data
  /** @hidden */
  static Text: typeof Text; // defined by Text
  /** @hidden */
  static Num: typeof Num; // defined by Num
  /** @hidden */
  static Bool: typeof Bool; // defined by Bool
  /** @hidden */
  static Expression: typeof Expression; // defined by Expression
  /** @hidden */
  static Selector: typeof Selector; // defined by Selector
  /** @hidden */
  static Operator: typeof Operator; // defined by Operator
  /** @hidden */
  static Func: typeof Func; // defined by Func
  /** @hidden */
  static Extant: typeof Extant; // defined by Extant
  /** @hidden */
  static Absent: typeof Absent; // defined by Absent
  /** @hidden */
  static BinaryOperator: typeof BinaryOperator; // defined by BinaryOperator
  /** @hidden */
  static UnaryOperator: typeof UnaryOperator; // defined by UnaryOperator
  /** @hidden */
  static ConditionalOperator: typeof ConditionalOperator; // defined by ConditionalOperator
  /** @hidden */
  static OrOperator: typeof OrOperator; // defined by OrOperator
  /** @hidden */
  static AndOperator: typeof AndOperator; // defined by AndOperator
  /** @hidden */
  static BitwiseOrOperator: typeof BitwiseOrOperator; // defined by BitwiseOrOperator
  /** @hidden */
  static BitwiseXorOperator: typeof BitwiseXorOperator; // defined by BitwiseXorOperator
  /** @hidden */
  static BitwiseAndOperator: typeof BitwiseAndOperator; // defined by BitwiseAndOperator
  /** @hidden */
  static LtOperator: typeof LtOperator; // defined by LtOperator
  /** @hidden */
  static LeOperator: typeof LeOperator; // defined by LeOperator
  /** @hidden */
  static EqOperator: typeof EqOperator; // defined by EqOperator
  /** @hidden */
  static NeOperator: typeof NeOperator; // defined by NeOperator
  /** @hidden */
  static GeOperator: typeof GeOperator; // defined by GeOperator
  /** @hidden */
  static GtOperator: typeof GtOperator; // defined by GtOperator
  /** @hidden */
  static PlusOperator: typeof PlusOperator; // defined by PlusOperator
  /** @hidden */
  static MinusOperator: typeof MinusOperator; // defined by MinusOperator
  /** @hidden */
  static TimesOperator: typeof TimesOperator; // defined by TimesOperator
  /** @hidden */
  static DivideOperator: typeof DivideOperator; // defined by DivideOperator
  /** @hidden */
  static ModuloOperator: typeof ModuloOperator; // defined by ModuloOperator
  /** @hidden */
  static NotOperator: typeof NotOperator; // defined by NotOperator
  /** @hidden */
  static BitwiseNotOperator: typeof BitwiseNotOperator; // defined by BitwiseNotOperator
  /** @hidden */
  static NegativeOperator: typeof NegativeOperator; // defined by NegativeOperator
  /** @hidden */
  static PositiveOperator: typeof PositiveOperator; // defined by PositiveOperator
  /** @hidden */
  static InvokeOperator: typeof InvokeOperator; // defined by InvokeOperator
  /** @hidden */
  static IdentitySelector: typeof IdentitySelector; // defined by IdentitySelector
  /** @hidden */
  static GetSelector: typeof GetSelector; // defined by GetSelector
  /** @hidden */
  static GetAttrSelector: typeof GetAttrSelector; // defined by GetAttrSelector
  /** @hidden */
  static GetItemSelector: typeof GetItemSelector; // defined by GetItemSelector
  /** @hidden */
  static KeysSelector: typeof KeysSelector; // defined by KeysSelector
  /** @hidden */
  static ValuesSelector: typeof ValuesSelector; // defined by ValuesSelector
  /** @hidden */
  static ChildrenSelector: typeof ChildrenSelector; // defined by ChildrenSelector
  /** @hidden */
  static DescendantsSelector: typeof DescendantsSelector; // defined by DescendantsSelector
  /** @hidden */
  static FilterSelector: typeof FilterSelector; // defined by FilterSelector
  /** @hidden */
  static LiteralSelector: typeof LiteralSelector; // defined by LiteralSelector
  /** @hidden */
  static LambdaFunc: typeof LambdaFunc; // defined by LambdaFunc
  /** @hidden */
  static BridgeFunc: typeof BridgeFunc; // defined by BridgeFunc
  /** @hidden */
  static MathModule: typeof MathModule; // defined by MathModule
}
