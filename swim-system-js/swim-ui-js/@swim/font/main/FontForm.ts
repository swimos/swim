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

import {Item, Attr, Record, Form} from "@swim/structure";
import {Length} from "@swim/length";
import {AnyFont, Font} from "./Font";

/** @hidden */
export class FontForm extends Form<Font, AnyFont> {
  private readonly _unit: Font | undefined;

  constructor(unit?: Font) {
    super();
    this._unit = unit;
  }

  unit(): Font | undefined;
  unit(unit: Font | undefined): Form<Font, AnyFont>;
  unit(unit?: Font): Font | undefined | Form<Font, AnyFont> {
    if (arguments.length === 0) {
      return this._unit;
    } else {
      return new FontForm(unit);
    }
  }

  mold(font: AnyFont): Item {
    font = Font.fromAny(font);
    const header = Record.create(7);
    if (font._style !== null) {
      header.slot("style", font._style);
    }
    if (font._variant !== null) {
      header.slot("variant", font._variant);
    }
    if (font._weight !== null) {
      header.slot("weight", font._weight);
    }
    if (font._stretch !== null) {
      header.slot("stretch", font._stretch);
    }
    if (font._size instanceof Length) {
      header.slot("size", Length.form().mold(font._size));
    } else if (font._size !== null) {
      header.slot("size", font._size);
    }
    if (font._height instanceof Length) {
      header.slot("height", Length.form().mold(font._height));
    } else if (font._height !== null) {
      header.slot("height", font._height);
    }
    if (Array.isArray(font._family)) {
      const family = Record.create(font._family.length);
      for (let i = 0; i < font._family.length; i += 1) {
        family.push(font._family[i]);
      }
      header.slot("family", family);
    } else {
      header.slot("family", font._family);
    }
    return Record.of(Attr.of("font", header));
  }

  cast(item: Item): Font | undefined {
    const value = item.toValue();
    let font: Font | undefined;
    try {
      font = Font.fromValue(value);
      if (!font) {
        const string = value.stringValue();
        if (string !== void 0) {
          font = Font.parse(string);
        }
      }
    } catch (e) {
      // swallow
    }
    return font;
  }
}
Font.Form = FontForm;
