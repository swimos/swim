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

import {Item, Attr, Record, Form} from "@swim/structure";
import {Length} from "@swim/math";
import {AnyFont, Font} from "./Font";

/** @internal */
export class FontForm extends Form<Font, AnyFont> {
  constructor(unit: Font | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
    });
  }

  override readonly unit!: Font | undefined;

  override withUnit(unit: Font | undefined): Form<Font, AnyFont> {
    if (unit !== this.unit) {
      return new FontForm(unit);
    } else {
      return this;
    }
  }

  override mold(font: AnyFont): Item {
    font = Font.fromAny(font);
    const header = Record.create(7);
    if (font.style !== void 0) {
      header.slot("style", font.style);
    }
    if (font.variant !== void 0) {
      header.slot("variant", font.variant);
    }
    if (font.weight !== void 0) {
      header.slot("weight", font.weight);
    }
    if (font.stretch !== void 0) {
      header.slot("stretch", font.stretch);
    }
    if (font.size instanceof Length) {
      header.slot("size", Length.form().mold(font.size));
    } else if (font.size !== void 0) {
      header.slot("size", font.size);
    }
    if (font.height instanceof Length) {
      header.slot("height", Length.form().mold(font.height));
    } else if (font.height !== void 0) {
      header.slot("height", font.height);
    }
    if (Array.isArray(font.family)) {
      const family = Record.create(font.family.length);
      for (let i = 0; i < font.family.length; i += 1) {
        family.push(font.family[i]);
      }
      header.slot("family", family);
    } else {
      header.slot("family", font.family);
    }
    return Record.of(Attr.of("font", header));
  }

  override cast(item: Item): Font | undefined {
    const value = item.toValue();
    let font: Font | null = null;
    try {
      font = Font.fromValue(value);
      if (font === null) {
        const string = value.stringValue();
        if (string !== void 0) {
          font = Font.parse(string);
        }
      }
    } catch (e) {
      // swallow
    }
    return font !== null ? font : void 0;
  }
}
