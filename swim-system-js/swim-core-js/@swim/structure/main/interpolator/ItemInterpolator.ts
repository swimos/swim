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

import {Interpolator} from "@swim/interpolate";
import {AnyItem, Item} from "../Item";
import {Field} from "../Field";
import {Attr} from "../Attr";
import {Value} from "../Value";
import {Record} from "../Record";
import {Num} from "../Num";
import {BinaryOperator} from "../operator/BinaryOperator";
import {UnaryOperator} from "../operator/UnaryOperator";
import {InvokeOperator} from "../operator/InvokeOperator";
import {AttrInterpolator} from "./AttrInterpolator";
import {SlotInterpolator} from "./SlotInterpolator";
import {ValueInterpolator} from "./ValueInterpolator";
import {RecordInterpolator} from "./RecordInterpolator";
import {NumInterpolator} from "./NumInterpolator";
import {ConditionalOperatorInterpolator} from "./ConditionalOperatorInterpolator";
import {BinaryOperatorInterpolator} from "./BinaryOperatorInterpolator";
import {UnaryOperatorInterpolator} from "./UnaryOperatorInterpolator";
import {InvokeOperatorInterpolator} from "./InvokeOperatorInterpolator";

export abstract class ItemInterpolator<I extends Item = Item> extends Interpolator<I, AnyItem> {
  range(): readonly [I, I];
  range(is: readonly [I, I]): ItemInterpolator<I>;
  range(i0: I, i1: I): ItemInterpolator<I>;
  range(is: readonly [AnyItem, AnyItem]): ItemInterpolator;
  range(i0: AnyItem, i1: AnyItem): ItemInterpolator;
  range(i0?: readonly [AnyItem, AnyItem] | AnyItem, i1?: AnyItem): readonly [I, I] | ItemInterpolator {
    if (i0 === void 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (i1 === void 0) {
      i0 = i0 as readonly [AnyItem, AnyItem];
      return ItemInterpolator.between(i0[0] as AnyItem, i0[1] as AnyItem);
    } else {
      return ItemInterpolator.between(i0 as AnyItem, i1);
    }
  }

  static between<I extends Item>(i0: I, i1: I): ItemInterpolator<I>;
  static between(i0: AnyItem, i1: AnyItem): ItemInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof Attr && b instanceof Attr) {
      return new ItemInterpolator.Attr(a, b);
    } else if (a instanceof Field && b instanceof Field) {
      return new ItemInterpolator.Slot(a, b);
    } if (a instanceof Record && b instanceof Record) {
      return new ItemInterpolator.Record(a, b);
    } else if (a instanceof Num && b instanceof Num) {
      return new ItemInterpolator.Num(a.value, b.value);
    } else if (a instanceof BinaryOperator && b instanceof BinaryOperator) {
      return new ItemInterpolator.BinaryOperator(a, b);
    } else if (a instanceof UnaryOperator && b instanceof UnaryOperator) {
      return new ItemInterpolator.UnaryOperator(a, b);
    } else if (a instanceof InvokeOperator && b instanceof InvokeOperator) {
      return new ItemInterpolator.InvokeOperator(a, b);
    } else if (a instanceof Value && b instanceof Value) {
      return new ItemInterpolator.Value(a, b);
    } else if (!(a instanceof Item) && !(b instanceof Item)) {
      return ItemInterpolator.between(Item.fromAny(a as AnyItem), Item.fromAny(b as AnyItem));
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): ItemInterpolator | null {
    if (a instanceof Attr && b instanceof Attr) {
      return new ItemInterpolator.Attr(a, b);
    } else if (a instanceof Field && b instanceof Field) {
      return new ItemInterpolator.Slot(a, b);
    } if (a instanceof Record && b instanceof Record) {
      return new ItemInterpolator.Record(a, b);
    } else if (a instanceof Num && b instanceof Num) {
      return new ItemInterpolator.Num(a.value, b.value);
    } else if (a instanceof BinaryOperator && b instanceof BinaryOperator) {
      return new ItemInterpolator.BinaryOperator(a, b);
    } else if (a instanceof UnaryOperator && b instanceof UnaryOperator) {
      return new ItemInterpolator.UnaryOperator(a, b);
    } else if (a instanceof InvokeOperator && b instanceof InvokeOperator) {
      return new ItemInterpolator.InvokeOperator(a, b);
    } else if (a instanceof Value && b instanceof Value) {
      return new ItemInterpolator.Value(a, b);
    }
    return null;
  }

  // Forward type declarations
  /** @hidden */
  static Attr: typeof AttrInterpolator; // defined by AttrInterpolator
  /** @hidden */
  static Slot: typeof SlotInterpolator; // defined by SlotInterpolator
  /** @hidden */
  static Value: typeof ValueInterpolator; // defined by ValueInterpolator
  /** @hidden */
  static Record: typeof RecordInterpolator; // defined by RecordInterpolator
  /** @hidden */
  static Num: typeof NumInterpolator; // defined by NumInterpolator
  /** @hidden */
  static ConditionalOperator: typeof ConditionalOperatorInterpolator; // defined by ConditionalOperatorInterpolator
  /** @hidden */
  static BinaryOperator: typeof BinaryOperatorInterpolator; // defined by BinaryOperatorInterpolator
  /** @hidden */
  static UnaryOperator: typeof UnaryOperatorInterpolator; // defined by UnaryOperatorInterpolator
  /** @hidden */
  static InvokeOperator: typeof InvokeOperatorInterpolator; // defined by InvokeOperatorInterpolator
}
Interpolator.registerFactory(ItemInterpolator);
