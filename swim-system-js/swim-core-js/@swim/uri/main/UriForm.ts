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

import {Item, Text, Form} from "@swim/structure";
import {Uri} from "./Uri";

/** @hidden */
export class UriForm extends Form<Uri> {
  /** @hidden */
  readonly _unit: Uri | undefined;

  constructor(unit?: Uri ) {
    super();
    this._unit = unit;
  }

  unit(): Uri | undefined;
  unit(unit: Uri | undefined): Form<Uri>;
  unit(unit?: Uri | undefined): Uri | undefined | Form<Uri> {
    if (arguments.length === 0) {
      return this._unit;
    } else {
      return new UriForm(unit);
    }
  }

  mold(object: Uri, item?: Item): Item {
    if (item === void 0) {
      return Text.from(object.toString());
    } else {
      return item.concat(Text.from(object.toString()));
    }
  }

  cast(item: Item, object?: Uri): Uri | undefined {
    const value = item.target();
    try {
      const string = value.stringValue();
      if (typeof string === "string") {
        return Uri.parse(string);
      }
    } catch (error) {
      // swallow
    }
    return void 0;
  }
}
Uri.Form = UriForm;
