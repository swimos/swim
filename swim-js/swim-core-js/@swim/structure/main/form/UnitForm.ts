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

import {Item} from "../Item";
import {Form} from "../Form";

/** @hidden */
export class UnitForm<T extends U, U = T> extends Form<T, U> {
  /** @hidden */
  readonly _unit: T;
  /** @hidden */
  readonly _form: Form<T, U>;

  constructor(unit: T, form: Form<T, U>) {
    super();
    this._unit = unit;
    this._form = form;
  }

  tag(): string | undefined;
  tag(tag: string | undefined): Form<T, U>;
  tag(tag?: string | undefined): string | undefined | Form<T, U> {
    if (arguments.length === 0) {
      return this._form.tag();
    } else {
      return new UnitForm<T, U>(this._unit, this._form.tag(tag));
    }
  }

  unit(): T | undefined;
  unit(unit: T | undefined): Form<T, U>;
  unit(unit?: T | undefined): T | undefined | Form<T, U> {
    if (arguments.length === 0) {
      return this._form.unit();
    } else if (unit !== void 0) {
      return new UnitForm<T, U>(unit, this._form);
    } else {
      return this._form;
    }
  }

  mold(object: U, item?: Item): Item {
    return this._form.mold.apply(this._form, arguments);
  }

  cast(item: Item, object?: T): T | undefined {
    return this._form.cast.apply(this._form, arguments);
  }
}
Form.UnitForm = UnitForm;
