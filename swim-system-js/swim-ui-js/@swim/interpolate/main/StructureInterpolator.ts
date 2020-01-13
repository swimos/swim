// Copyright 2015-2020 SWIM.AI inc.
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

import {AnyItem, Item, Field, Attr, Record, Num, BinaryOperator, UnaryOperator, InvokeOperator} from "@swim/structure";
import {Interpolator} from "./Interpolator";
import {AttrInterpolator} from "./structure/AttrInterpolator";
import {SlotInterpolator} from "./structure/SlotInterpolator";
import {ValueInterpolator} from "./structure/ValueInterpolator";
import {RecordInterpolator} from "./structure/RecordInterpolator";
import {NumInterpolator} from "./structure/NumInterpolator";
import {ConditionalOperatorInterpolator} from "./structure/ConditionalOperatorInterpolator";
import {BinaryOperatorInterpolator} from "./structure/BinaryOperatorInterpolator";
import {UnaryOperatorInterpolator} from "./structure/UnaryOperatorInterpolator";
import {InvokeOperatorInterpolator} from "./structure/InvokeOperatorInterpolator";
import {AbsentInterpolator} from "./structure/AbsentInterpolator";

export abstract class StructureInterpolator<I extends Item = Item> extends Interpolator<I, AnyItem> {
  range(): I[];
  range(is: ReadonlyArray<AnyItem>): StructureInterpolator<I>;
  range(i0: AnyItem, i1?: AnyItem): StructureInterpolator<I>;
  range(i0?: ReadonlyArray<AnyItem> | AnyItem, i1?: AnyItem): I[] | StructureInterpolator<I> {
    if (i0 === void 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (i1 === void 0) {
      i0 = i0 as ReadonlyArray<AnyItem>;
      return Interpolator.structure(i0[0] as AnyItem, i0[1] as AnyItem) as StructureInterpolator<I>;
    } else {
      return Interpolator.structure(i0 as AnyItem, i1) as StructureInterpolator<I>;
    }
  }

  static structure<I extends Item>(i0?: AnyItem, i1?: AnyItem): StructureInterpolator<I> {
    if (i0 === void 0 && i1 === void 0) {
      return new StructureInterpolator.Absent() as any;
    }
    if (i0 !== void 0) {
      i0 = Item.fromAny(i0);
    }
    if (i1 !== void 0) {
      i1 = Item.fromAny(i1);
    }
    if (!i0 && !i1) {
      i1 = i0 = Item.absent();
    } else if (!i1) {
      i1 = i0;
    } else if (!i0) {
      i0 = i1;
    }
    if (i0 instanceof Field && i1 instanceof Field) {
      if (i0 instanceof Attr && i1 instanceof Attr
          || i0 instanceof Attr && i1.key instanceof Text
          || i1 instanceof Attr && i0.key instanceof Text) {
        return new StructureInterpolator.Attr(i0, i1) as any;
      } else {
        return new StructureInterpolator.Slot(i0, i1) as any;
      }
    }
    const v0 = i0!.toValue();
    const v1 = i1!.toValue();
    if (v0 instanceof Record && v1 instanceof Record) {
      return new StructureInterpolator.Record(v0, v1) as any;
    } else if (v0 instanceof Num && v1 instanceof Num) {
      return new StructureInterpolator.Num(v0, v1) as any;
    } else if (v0 instanceof BinaryOperator && v1 instanceof BinaryOperator) {
      return new StructureInterpolator.BinaryOperator(v0, v1) as any;
    } else if (v0 instanceof UnaryOperator && v1 instanceof UnaryOperator) {
      return new StructureInterpolator.UnaryOperator(v0, v1) as any;
    } else if (v0 instanceof InvokeOperator && v1 instanceof InvokeOperator) {
      return new StructureInterpolator.InvokeOperator(v0, v1) as any;
    }
    return new StructureInterpolator.Value(v0, v1) as any;
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
  /** @hidden */
  static Absent: typeof AbsentInterpolator; // defined by AbsentInterpolator
}
Interpolator.Structure = StructureInterpolator;
Interpolator.structure = StructureInterpolator.structure;
