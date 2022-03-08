// Copyright 2015-2022 Swim.inc
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
import {AnyItem, Item} from "../Item";
import {AnyValue, Value} from "../Value";
import {TagForm} from "../"; // forward import
import {UnitForm} from "../"; // forward import
import {StringForm} from "../"; // forward import
import {NumberForm} from "../"; // forward import
import {BooleanForm} from "../"; // forward import
import {AnyForm} from "../"; // forward import
import {ItemForm} from "../"; // forward import
import {ValueForm} from "../"; // forward import

/**
 * Transformation between a structurally typed [Item] and a nominally typed
 * JavaScript object.
 * @public
 */
export abstract class Form<T, U = never> {
  /**
   * Returns the key of the tag attribute that distinguishes structures of this
   * `Form`; returns `undefined` if this `Form` has no distinguishing tag
   * attribute. Used to accelerate distrcrimination of polymorphic structural
   * types with nominal type hints.
   */
  declare readonly tag: string | undefined; // getter defined below to work around useDefineForClassFields lunacy

  /**
   * Returns a version of this `Form` that requires a head [Attr] with the
   * given `tag` name.
   */
  withTag(tag: string | undefined): Form<T, U> {
    if (tag !== void 0 && tag !== this.tag) {
      return new TagForm(this, tag);
    } else {
      return this;
    }
  }

  /**
   * Returns a default–possibly `undefined`–value of type `T`. Used as the
   * fallback return value when [Item.coerce coercing] an invalid structural
   * value.
   */
  declare readonly unit: T | undefined; // getter defined below to work around useDefineForClassFields lunacy

  /**
   * Returns a version of this `Form` with the given `unit` value.
   */
  withUnit(unit: T | undefined): Form<T, U> {
    if (unit !== this.unit) {
      return new UnitForm(this, unit);
    } else {
      return this;
    }
  }

  /**
   * Converts a nominally typed JavaScript `object` into its structurally typed
   * equivalent, optionally based on the provided prototype `item`.
   */
  abstract mold(object: T | U, item?: Item): Item;

  /**
   * Converts a structurally typed `item` into a nominally typed JavaScript
   * object, optionally based on the provided prototype `object`.
   */
  abstract cast(item: Item, object?: T): T | undefined;

  @Lazy
  static forString(): Form<string> {
    return new StringForm("");
  }

  @Lazy
  static forNumber(): Form<number> {
    return new NumberForm(0);
  }

  @Lazy
  static forBoolean(): Form<boolean> {
    return new BooleanForm(false);
  }

  @Lazy
  static forAny(): Form<AnyItem> {
    return new AnyForm(void 0);
  }

  @Lazy
  static forItem(): Form<Item, AnyItem> {
    return new ItemForm(Item.absent());
  }

  @Lazy
  static forValue(): Form<Value, AnyValue> {
    return new ValueForm(Value.absent());
  }
}
Object.defineProperty(Form.prototype, "tag", {
  get<T, U>(this: Form<T, U>): string | undefined {
    return void 0;
  },
  configurable: true,
});
Object.defineProperty(Form.prototype, "unit", {
  get<T, U>(this: Form<T, U>): T | undefined {
    return void 0;
  },
  configurable: true,
});
