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

import type {Item} from "../Item";
import {Form} from "./Form";

/** @hidden */
export class UnitForm<T, U = never> extends Form<T, U> {
  constructor(form: Form<T, U>, unit: T | undefined) {
    super();
    Object.defineProperty(this, "form", {
      value: form,
      enumerable: true,
    });
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
    });
  }

  /** @hidden */
  declare readonly form: Form<T, U>;

  declare readonly tag: string | undefined; // // getter defined below to work around useDefineForClassFields lunacy

  withTag(tag: string | undefined): Form<T, U> {
    if (tag !== this.tag) {
      return new UnitForm(this.form.withTag(tag), this.unit);
    } else {
      return this;
    }
  }

  declare readonly unit: T | undefined;

  withUnit(unit: T | undefined): Form<T, U> {
    if (unit !== this.unit) {
      return new UnitForm(this.form, unit);
    } else if (unit === this.form.unit) {
      return this.form;
    } else {
      return this;
    }
  }

  mold(object: T | U, item?: Item): Item {
    if (arguments.length === 1) {
      return this.form.mold(object);
    } else {
      return this.form.mold(object, item);
    }
  }

  cast(item: Item, object?: T): T | undefined {
    if (arguments.length === 1) {
      return this.form.cast(item);
    } else {
      return this.form.cast(item, object);
    }
  }
}
Object.defineProperty(UnitForm.prototype, "tag", {
  get<T, U>(this: UnitForm<T, U>): string | undefined {
    return this.form.tag;
  },
  enumerable: true,
  configurable: true,
});
