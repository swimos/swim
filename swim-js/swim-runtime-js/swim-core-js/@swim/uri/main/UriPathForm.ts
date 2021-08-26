// Copyright 2015-2021 Swim Inc.
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

import {Item, Text, Form} from "@swim/structure";
import {AnyUriPath, UriPath} from "./UriPath";

/** @hidden */
export class UriPathForm extends Form<UriPath, AnyUriPath> {
  constructor(unit: UriPath | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
    });
  }

  override readonly unit!: UriPath | undefined;

  override withUnit(unit: UriPath | undefined): Form<UriPath, AnyUriPath> {
    if (unit !== this.unit) {
      return new UriPathForm(unit);
    } else {
      return this;
    }
  }

  override mold(object: AnyUriPath, item?: Item): Item {
    object = UriPath.fromAny(object);
    if (item === void 0) {
      return Text.from(object.toString());
    } else {
      return item.concat(Text.from(object.toString()));
    }
  }

  override cast(item: Item, object?: UriPath): UriPath | undefined {
    const value = item.target;
    try {
      const string = value.stringValue();
      if (typeof string === "string") {
        return UriPath.parse(string);
      }
    } catch (error) {
      // swallow
    }
    return void 0;
  }
}
