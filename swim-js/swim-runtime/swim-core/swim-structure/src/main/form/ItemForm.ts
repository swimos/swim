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

import {AnyItem, Item} from "../Item";
import {Form} from "./Form";

/** @internal */
export class ItemForm extends Form<Item, AnyItem> {
  constructor(unit?: Item) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit !== void 0 ? unit.commit() : void 0,
      enumerable: true,
    });
  }

  override readonly unit!: Item | undefined;

  override withUnit(unit: Item | undefined): Form<Item> {
    if (unit !== this.unit) {
      return new ItemForm(unit);
    } else {
      return this;
    }
  }

  override mold(object: AnyItem, item?: Item): Item {
    object = Item.fromAny(object);
    if (item !== void 0) {
      object = item.concat(object);
    }
    return object;
  }

  override cast(item: Item, object?: Item): Item | undefined {
    return item;
  }
}
