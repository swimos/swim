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

import {Item} from "../Item";
import {Attr} from "../Attr";
import {Form} from "../Form";

/** @hidden */
export class TagForm<T extends U, U = T> extends Form<T, U> {
  /** @hidden */
  readonly _tag: string;
  /** @hidden */
  readonly _form: Form<T, U>;

  constructor(tag: string, form: Form<T, U>) {
    super();
    this._tag = tag;
    this._form = form;
  }

  tag(): string | undefined;
  tag(tag: string | undefined): Form<T, U>;
  tag(tag?: string | undefined): string | undefined | Form<T, U> {
    if (arguments.length === 0) {
      return this._tag;
    } else if (tag !== void 0) {
      return new TagForm<T, U>(tag, this._form);
    } else {
      return this._form;
    }
  }

  unit(): T | undefined;
  unit(unit: T | undefined): Form<T, U>;
  unit(unit?: T | undefined): T | undefined | Form<T, U> {
    if (arguments.length === 0) {
      return this._form.unit();
    } else {
      return new TagForm<T, U>(this._tag, this._form.unit(unit));
    }
  }

  mold(object: U, item?: Item): Item {
    item = this._form.mold(object, item);
    if (!item.header(this._tag).isDefined()) {
      item = item.prepended(Attr.of(this._tag));
    }
    return item;
  }

  cast(item: Item, object?: T): T | undefined {
    if (item.header(this._tag).isDefined()) {
      return this._form.cast(item, object);
    } else if (item.keyEquals(this._tag)) {
      return this._form.cast(item.toValue(), object);
    }
    return void 0;
  }
}
Form.TagForm = TagForm;
