// Copyright 2015-2021 Swim.inc
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
import {Attr} from "../Attr";
import {Form} from "./Form";

/** @internal */
export class TagForm<T, U = never> extends Form<T, U> {
  constructor(form: Form<T, U>, tag: string) {
    super();
    this.form = form;
    this.tag = tag;
  }

  /** @internal */
  readonly form: Form<T, U>;

  override readonly tag: string;

  override withTag(tag: string | undefined): Form<T, U> {
     if (tag !== void 0 && tag !== this.tag) {
      return new TagForm(this.form, tag);
    } else if (tag === void 0) {
      return this.form;
    } else {
      return this;
    }
  }

  override readonly unit!: T | undefined; // // getter defined below to work around useDefineForClassFields lunacy

  override withUnit(unit: T | undefined): Form<T, U> {
    if (unit !== this.unit) {
      return new TagForm(this.form.withUnit(unit), this.tag);
    } else {
      return this;
    }
  }

  override mold(object: T | U, item?: Item): Item {
    item = this.form.mold(object, item);
    if (!item.header(this.tag).isDefined()) {
      item = item.prepended(Attr.of(this.tag));
    }
    return item;
  }

  override cast(item: Item, object?: T): T | undefined {
    if (item.header(this.tag).isDefined()) {
      return this.form.cast(item, object);
    } else if (item.keyEquals(this.tag)) {
      return this.form.cast(item.toValue(), object);
    }
    return void 0;
  }
}
Object.defineProperty(TagForm.prototype, "unit", {
  get<T, U>(this: TagForm<T, U>): T | undefined {
    return this.form.unit;
  },
  configurable: true,
});
