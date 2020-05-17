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

import {AnyItem, Item} from "./Item";
import {AnyValue, Value} from "./Value";
import {TagForm} from "./form/TagForm";
import {UnitForm} from "./form/UnitForm";
import {StringForm} from "./form/StringForm";
import {NumberForm} from "./form/NumberForm";
import {BooleanForm} from "./form/BooleanForm";
import {AnyForm} from "./form/AnyForm";
import {ItemForm} from "./form/ItemForm";
import {ValueForm} from "./form/ValueForm";

/**
 * Transformation between a structurally typed [Item] and a nominally typed
 * JavaScript object.
 */
export abstract class Form<T extends U, U = T> {
  /**
   * Returns the key of the tag attribute that distinguishes structures of this
   * `Form`; returns `undefined` if this `Form` has no distinguishing tag
   * attribute.  Used to accelerate distrcrimination of polymorphic structural
   * types with nominal type hints.
   */
  tag(): string | undefined;

  /**
   * Returns a version of this `Form` that requires a head [Attr] with the
   * given `tag` name.
   */
  tag(tag: string | undefined): Form<T, U>;

  tag(tag?: string | undefined): string | undefined | Form<T, U> {
    if (arguments.length === 0) {
      return void 0;
    } else if (tag !== void 0) {
      return new Form.TagForm<T, U>(tag, this);
    } else {
      return this;
    }
  }

  /**
   * Returns a default–possibly `undefined`–value of type `T`.  Used as the
   * fallback return value when [Item.coerce coercing] an invalid structural
   * value.
   */
  unit(): T | undefined;

  /**
   * Returns a version of this `Form` with the given `unit` value.
   */
  unit(unit: T | undefined): Form<T, U>;

  unit(unit?: T | undefined): T | undefined | Form<T, U> {
    if (arguments.length === 0) {
      return void 0;
    } else if (unit !== void 0) {
      return new Form.UnitForm<T, U>(unit, this);
    } else {
      return this;
    }
  }

  /**
   * Converts a nominally typed JavaScript `object` into its structurally typed
   * equivalent, optionally based on the provided prototype `item`.
   */
  abstract mold(object: U, item?: Item): Item;

  /**
   * Converts a structurally typed `item` into a nominally typed JavaScript
   * object, optionally based on the provided prototype `object`.
   */
  abstract cast(item: Item, object?: T): T | undefined;

  // Forward type declarations
  /** @hidden */
  static TagForm: typeof TagForm; // defined by TagForm
  /** @hidden */
  static UnitForm: typeof UnitForm; // defined by UnitForm
  /** @hidden */
  static StringForm: typeof StringForm; // defined by StringForm
  /** @hidden */
  static NumberForm: typeof NumberForm; // defined by NumberForm
  /** @hidden */
  static BooleanForm: typeof BooleanForm; // defined by BooleanForm
  /** @hidden */
  static AnyForm: typeof AnyForm; // defined by AnyForm
  /** @hidden */
  static ItemForm: typeof ItemForm; // defined by ItemForm
  /** @hidden */
  static ValueForm: typeof ValueForm; // defined by ValueForm

  private static _stringForm?: Form<string>;
  private static _numberForm?: Form<number>;
  private static _booleanForm?: Form<boolean>;
  private static _anyForm?: Form<AnyItem>;
  private static _itemForm?: Form<Item, AnyItem>;
  private static _valueForm?: Form<Value, AnyValue>;

  static forString(): Form<string> {
    if (Form._stringForm === void 0) {
      Form._stringForm = new Form.StringForm("");
    }
    return Form._stringForm;
  }

  static forNumber(): Form<number> {
    if (Form._numberForm === void 0) {
      Form._numberForm = new Form.NumberForm(0);
    }
    return Form._numberForm;
  }

  static forBoolean(): Form<boolean> {
    if (Form._booleanForm === void 0) {
      Form._booleanForm = new Form.BooleanForm(false);
    }
    return Form._booleanForm;
  }

  static forAny(): Form<AnyItem> {
    if (Form._anyForm === void 0) {
      Form._anyForm = new Form.AnyForm(void 0);
    }
    return Form._anyForm;
  }

  static forItem(): Form<Item, AnyItem> {
    if (Form._itemForm === void 0) {
      Form._itemForm = new Form.ItemForm(Item.absent());
    }
    return Form._itemForm;
  }

  static forValue(): Form<Value, AnyValue> {
    if (Form._valueForm === void 0) {
      Form._valueForm = new Form.ValueForm(Value.absent());
    }
    return Form._valueForm;
  }
}
