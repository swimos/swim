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

import {Equals, Objects} from "@swim/util";
import {Output, Parser, Debug, Diagnostic, Unicode} from "@swim/codec";
import {Value, Form} from "@swim/structure";
import {FontStyle} from "./FontStyle";
import {FontVariant} from "./FontVariant";
import {FontWeight} from "./FontWeight";
import {FontStretch} from "./FontStretch";
import {AnyFontSize, FontSize} from "./FontSize";
import {AnyLineHeight, LineHeight} from "./LineHeight";
import {FontFamily} from "./FontFamily";
import {FontParser} from "./FontParser";
import {FontForm} from "./FontForm";

export type AnyFont = Font | FontInit | string;

export interface FontInit {
  style?: FontStyle | null;
  variant?: FontVariant | null;
  weight?: FontWeight | null;
  stretch?: FontStretch | null;
  size?: AnyFontSize | null;
  height?: AnyLineHeight | null;
  family: FontFamily | FontFamily[];
}

export class Font implements Equals, Debug {
  /** @hidden */
  readonly _style: FontStyle | null;
  /** @hidden */
  readonly _variant: FontVariant | null;
  /** @hidden */
  readonly _weight: FontWeight | null;
  /** @hidden */
  readonly _stretch: FontStretch | null;
  /** @hidden */
  readonly _size: FontSize | null;
  /** @hidden */
  readonly _height: LineHeight | null;
  /** @hidden */
  readonly _family: FontFamily | ReadonlyArray<FontFamily>;

  constructor(style: FontStyle | null, variant: FontVariant | null,
              weight: FontWeight | null, stretch: FontStretch | null,
              size: FontSize | null, height: LineHeight | null,
              family: FontFamily | ReadonlyArray<FontFamily>) {
    this._style = style;
    this._variant = variant;
    this._weight = weight;
    this._stretch = stretch;
    this._size = size;
    this._height = height;
    this._family = family;
  }

  style(): FontStyle | null;
  style(style: FontStyle | null): Font;
  style(style?: FontStyle | null): FontStyle | null | Font {
    if (style === void 0) {
      return this._style;
    } else {
      if (this._style === style) {
        return this;
      } else {
        return new Font(style, this._variant, this._weight, this._stretch,
                        this._size, this._height, this._family);
      }
    }
  }

  variant(): FontVariant | null;
  variant(variant: FontVariant | null): Font;
  variant(variant?: FontVariant | null): FontVariant | null | Font {
    if (variant === void 0) {
      return this._variant;
    } else {
      if (this._variant === variant) {
        return this;
      } else {
        return new Font(this._style, variant, this._weight, this._stretch,
                        this._size, this._height, this._family);
      }
    }
  }

  weight(): FontWeight | null;
  weight(weight: FontWeight | null): Font;
  weight(weight?: FontWeight | null): FontWeight | null | Font {
    if (weight === void 0) {
      return this._weight;
    } else {
      if (this._weight === weight) {
        return this;
      } else {
        return new Font(this._style, this._variant, weight, this._stretch,
                        this._size, this._height, this._family);
      }
    }
  }

  stretch(): FontStretch | null;
  stretch(stretch: FontStretch | null): Font;
  stretch(stretch?: FontStretch | null): FontStretch | null | Font {
    if (stretch === void 0) {
      return this._stretch;
    } else {
      if (this._stretch === stretch) {
        return this;
      } else {
        return new Font(this._style, this._variant, this._weight, stretch,
                        this._size, this._height, this._family);
      }
    }
  }

  size(): FontSize | null;
  size(size: AnyFontSize | null): Font;
  size(size?: AnyFontSize | null): FontSize | null | Font {
    if (size === void 0) {
      return this._size;
    } else {
      size = size !== null ? FontSize.fromAny(size) : null;
      if (Objects.equal(this._size, size)) {
        return this;
      } else {
        return new Font(this._style, this._variant, this._weight, this._stretch,
                        size as FontSize | null, this._height, this._family);
      }
    }
  }

  height(): LineHeight | null;
  height(height: AnyLineHeight | null): Font;
  height(height?: AnyLineHeight | null): LineHeight | null | Font {
    if (height === void 0) {
      return this._height;
    } else {
      height = height !== null ? LineHeight.fromAny(height) : null;
      if (Objects.equal(this._height, height)) {
        return this;
      } else {
        return new Font(this._style, this._variant, this._weight, this._stretch,
                        this._size, height as LineHeight | null, this._family);
      }
    }
  }

  family(): FontFamily | FontFamily[];
  family(family: FontFamily | ReadonlyArray<FontFamily>): Font;
  family(family?: FontFamily | ReadonlyArray<FontFamily>): FontFamily | FontFamily[] | Font {
    if (family === void 0) {
      return (Array.isArray(this._family) ? this._family.slice(0) : this._family) as FontFamily | FontFamily[];
    } else {
      if (Objects.equal(this._family, family)) {
        return this;
      } else {
        if (Array.isArray(family) && family.length === 1) {
          family = family[0];
        }
        return new Font(this._style, this._variant, this._weight, this._stretch,
                        this._size, this._height, family as FontFamily | ReadonlyArray<FontFamily>);
      }
    }
  }

  toAny(): FontInit {
    return {
      style: this._style,
      variant: this._variant,
      weight: this._weight,
      stretch: this._stretch,
      size: this._size,
      height: this._height,
      family: (Array.isArray(this._family) ? this._family.slice(0) : this._family) as FontFamily | FontFamily[],
    };
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Font) {
      return this._style === that._style && this._variant === that._variant
          && this._weight === that._weight && this._stretch === that._stretch
          && Objects.equal(this._size, that._size)
          && Objects.equal(this._height, that._height)
          && Objects.equal(this._family, that._family);
    }
    return false;
  }

  debug(output: Output): void {
    output = output.write("Font").write(46/*'.'*/).write("family").write(40/*'('*/).write(41/*')'*/);
    if (typeof this._family === "string") {
      output = output.debug(this._family);
    } else if (Array.isArray(this._family) && this._family.length) {
      output = output.debug(this._family[0]);
      for (let i = 1; i < this._family.length; i += 1) {
        output = output.write(", ").debug(this._family[i]);
      }
    }
    output = output.write(41/*')'*/);
    if (this._style !== null) {
      output = output.write(46/*'.'*/).write("style").write(40/*'('*/).debug(this._style).write(41/*')'*/);
    }
    if (this._variant !== null) {
      output = output.write(46/*'.'*/).write("variant").write(40/*'('*/).debug(this._variant).write(41/*')'*/);
    }
    if (this._weight !== null) {
      output = output.write(46/*'.'*/).write("weight").write(40/*'('*/).debug(this._weight).write(41/*')'*/);
    }
    if (this._stretch !== null) {
      output = output.write(46/*'.'*/).write("stretch").write(40/*'('*/).debug(this._stretch).write(41/*')'*/);
    }
    if (this._size !== null) {
      output = output.write(46/*'.'*/).write("size").write(40/*'('*/).debug(this._size).write(41/*')'*/);
    }
    if (this._height !== null) {
      output = output.write(46/*'.'*/).write("height").write(40/*'('*/).debug(this._height).write(41/*')'*/);
    }
  }

  toString(): string {
    let s = "";
    if (this._style !== null || this._variant === "normal" || this._weight === "normal" || this._stretch === "normal") {
      s += this._style || "normal";
    }
    if (this._variant !== null || this._weight === "normal" || this._stretch === "normal") {
      if (s) {
        s += " ";
      }
      s += this._variant || "normal";
    }
    if (this._weight !== null || this._stretch === "normal") {
      if (s) {
        s += " ";
      }
      s += this._weight || "normal";
    }
    if (this._stretch !== null) {
      if (s) {
        s += " ";
      }
      s += this._stretch;
    }
    if (this._size !== null) {
      if (s) {
        s += " ";
      }
      s += this._size.toString();
      if (this._height !== null) {
        s += "/";
        s += this._height.toString();
      }
    }
    if (typeof this._family === "string") {
      if (s) {
        s += " ";
      }
      s += FontFamily.format(this._family);
    } else if (Array.isArray(this._family) && this._family.length) {
      if (s) {
        s += " ";
      }
      s += FontFamily.format(this._family[0]);
      for (let i = 1; i < this._family.length; i += 1) {
        s += ", ";
        s += FontFamily.format(this._family[i]);
      }
    }
    return s;
  }

  static style(style: FontStyle | null, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(style, null, null, null, null, null, family);
  }

  static variant(variant: FontVariant | null, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(null, variant, null, null, null, null, family);
  }

  static weight(weight: FontWeight | null, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(null, null, weight, null, null, null, family);
  }

  static stretch(stretch: FontStretch | null, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(null, null, null, stretch, null, null, family);
  }

  static size(size: AnyFontSize | null, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    size = size !== null ? FontSize.fromAny(size) : null;
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(null, null, null, null, size as FontSize | null, null, family);
  }

  static family(family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(null, null, null, null, null, null, family);
  }

  static from(style: FontStyle | null = null, variant: FontVariant | null = null,
              weight: FontWeight | null = null, stretch: FontStretch | null = null,
              size: AnyFontSize | null = null, height: AnyLineHeight | null = null,
              family: FontFamily | ReadonlyArray<FontFamily>): Font {
    size = size !== null ? FontSize.fromAny(size) : null;
    height = height !== null ? LineHeight.fromAny(height) : null;
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(style, variant, weight, stretch, size as FontSize | null,
                    height as LineHeight | null, family);
  }

  static fromAny(value: AnyFont): Font {
    if (value instanceof Font) {
      return value;
    } else if (typeof value === "object" && value) {
      return Font.from(value.style, value.variant, value.weight, value.stretch,
                       value.size, value.height, value.family);
    } else if (typeof value === "string") {
      return Font.parse(value);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): Font | undefined {
    const header = value.header("font");
    if (header) {
      const style = header.get("style").stringValue(null) as FontStyle | null;
      const variant = header.get("variant").stringValue(null) as FontVariant | null;
      const weight = header.get("weight").stringValue(null) as FontWeight | null;
      const stretch = header.get("stretch").stringValue(null) as FontStretch | null;
      const size = FontSize.fromValue(header.get("size"));
      const height = LineHeight.fromValue(header.get("height"));
      const family = FontFamily.fromValue(header.get("family"));
      if (family !== void 0) {
        return Font.from(style, variant, weight, stretch, size, height, family);
      }
    }
    return void 0;
  }

  static parse(string: string): Font {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = Font.Parser.parse(input);
    if (parser.isDone()) {
      while (input.isCont() && Unicode.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  /** @hidden */
  static isInit(value: unknown): value is FontInit {
    if (value && typeof value === "object") {
      const init = value as FontInit;
      return init.family !== void 0;
    }
    return false;
  }

  private static _form: Form<Font, AnyFont>;
  static form(unit?: Font): Form<Font, AnyFont> {
    if (unit !== void 0) {
      unit = Font.fromAny(unit);
      return new Font.Form(unit);
    } else {
      if (!Font._form) {
        Font._form = new Font.Form();
      }
      return Font._form;
    }
  }

  // Forward type declarations
  /** @hidden */
  static Parser: typeof FontParser; // defined by FontParser
  /** @hidden */
  static Form: typeof FontForm; // defined by FontForm
}
