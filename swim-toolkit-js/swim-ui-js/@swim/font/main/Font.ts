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
  style?: FontStyle;
  variant?: FontVariant;
  weight?: FontWeight;
  stretch?: FontStretch;
  size?: AnyFontSize;
  height?: AnyLineHeight;
  family: FontFamily | FontFamily[];
}

export class Font implements Equals, Debug {
  /** @hidden */
  readonly _style?: FontStyle;
  /** @hidden */
  readonly _variant?: FontVariant;
  /** @hidden */
  readonly _weight?: FontWeight;
  /** @hidden */
  readonly _stretch?: FontStretch;
  /** @hidden */
  readonly _size?: FontSize;
  /** @hidden */
  readonly _height?: LineHeight;
  /** @hidden */
  readonly _family: FontFamily | ReadonlyArray<FontFamily>;
  /** @hidden */
  _string?: string;

  constructor(style: FontStyle | undefined, variant: FontVariant | undefined,
              weight: FontWeight | undefined, stretch: FontStretch | undefined,
              size: FontSize | undefined, height: LineHeight | undefined,
              family: FontFamily | ReadonlyArray<FontFamily>) {
    if (style !== void 0) {
      this._style = style;
    }
    if (variant !== void 0) {
      this._variant = variant;
    }
    if (weight !== void 0) {
      this._weight = weight;
    }
    if (stretch !== void 0) {
      this._stretch = stretch;
    }
    if (size !== void 0) {
      this._size = size;
    }
    if (height !== void 0) {
      this._height = height;
    }
    this._family = family;
  }

  style(): FontStyle | undefined;
  style(style: FontStyle | undefined): Font;
  style(style?: FontStyle): FontStyle | undefined | Font {
    if (arguments.length === 0) {
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

  variant(): FontVariant | undefined;
  variant(variant: FontVariant | undefined): Font;
  variant(variant?: FontVariant): FontVariant | undefined | Font {
    if (arguments.length === 0) {
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

  weight(): FontWeight | undefined;
  weight(weight: FontWeight | undefined): Font;
  weight(weight?: FontWeight): FontWeight | undefined | Font {
    if (arguments.length === 0) {
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

  stretch(): FontStretch | undefined;
  stretch(stretch: FontStretch | undefined): Font;
  stretch(stretch?: FontStretch): FontStretch | undefined | Font {
    if (arguments.length === 0) {
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

  size(): FontSize | undefined;
  size(size: AnyFontSize | undefined): Font;
  size(size?: AnyFontSize): FontSize | undefined | Font {
    if (arguments.length === 0) {
      return this._size;
    } else {
      size = size !== void 0 ? FontSize.fromAny(size) : void 0;
      if (Objects.equal(this._size, size)) {
        return this;
      } else {
        return new Font(this._style, this._variant, this._weight, this._stretch,
                        size as FontSize | undefined, this._height, this._family);
      }
    }
  }

  height(): LineHeight | undefined;
  height(height: AnyLineHeight | undefined): Font;
  height(height?: AnyLineHeight): LineHeight | undefined | Font {
    if (arguments.length === 0) {
      return this._height;
    } else {
      height = height !== void 0 ? LineHeight.fromAny(height) : void 0;
      if (Objects.equal(this._height, height)) {
        return this;
      } else {
        return new Font(this._style, this._variant, this._weight, this._stretch,
                        this._size, height as LineHeight | undefined, this._family);
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
    output = output.write("Font").write(46/*'.'*/).write("family").write(40/*'('*/);
    if (typeof this._family === "string") {
      output = output.debug(this._family);
    } else if (Array.isArray(this._family) && this._family.length !== 0) {
      output = output.debug(this._family[0]);
      for (let i = 1; i < this._family.length; i += 1) {
        output = output.write(", ").debug(this._family[i]);
      }
    }
    output = output.write(41/*')'*/);
    if (this._style !== void 0) {
      output = output.write(46/*'.'*/).write("style").write(40/*'('*/).debug(this._style).write(41/*')'*/);
    }
    if (this._variant !== void 0) {
      output = output.write(46/*'.'*/).write("variant").write(40/*'('*/).debug(this._variant).write(41/*')'*/);
    }
    if (this._weight !== void 0) {
      output = output.write(46/*'.'*/).write("weight").write(40/*'('*/).debug(this._weight).write(41/*')'*/);
    }
    if (this._stretch !== void 0) {
      output = output.write(46/*'.'*/).write("stretch").write(40/*'('*/).debug(this._stretch).write(41/*')'*/);
    }
    if (this._size !== void 0) {
      output = output.write(46/*'.'*/).write("size").write(40/*'('*/).debug(this._size).write(41/*')'*/);
    }
    if (this._height !== void 0) {
      output = output.write(46/*'.'*/).write("height").write(40/*'('*/).debug(this._height).write(41/*')'*/);
    }
  }

  toString(): string {
    let s = this._string;
    if (s === void 0) {
      s = "";
      if (this._style !== void 0 || this._variant === "normal" || this._weight === "normal" || this._stretch === "normal") {
        s += this._style || "normal";
      }
      if (this._variant !== void 0 || this._weight === "normal" || this._stretch === "normal") {
        if (s.length !== 0) {
          s += " ";
        }
        s += this._variant || "normal";
      }
      if (this._weight !== void 0 || this._stretch === "normal") {
        if (s.length !== 0) {
          s += " ";
        }
        s += this._weight || "normal";
      }
      if (this._stretch !== void 0) {
        if (s.length !== 0) {
          s += " ";
        }
        s += this._stretch;
      }
      if (this._size !== void 0) {
        if (s.length !== 0) {
          s += " ";
        }
        s += this._size.toString();
        if (this._height !== void 0) {
          s += "/";
          s += this._height.toString();
        }
      }
      if (typeof this._family === "string") {
        if (s.length !== 0) {
          s += " ";
        }
        s += FontFamily.format(this._family);
      } else if (Array.isArray(this._family) && this._family.length !== 0) {
        if (s.length !== 0) {
          s += " ";
        }
        s += FontFamily.format(this._family[0]);
        for (let i = 1; i < this._family.length; i += 1) {
          s += ", ";
          s += FontFamily.format(this._family[i]);
        }
      }
      this._string = s;
    }
    return s;
  }

  static style(style: FontStyle | undefined, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(style, void 0, void 0, void 0, void 0, void 0, family);
  }

  static variant(variant: FontVariant | undefined, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, variant, void 0, void 0, void 0, void 0, family);
  }

  static weight(weight: FontWeight | undefined, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, void 0, weight, void 0, void 0, void 0, family);
  }

  static stretch(stretch: FontStretch | undefined, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, void 0, void 0, stretch, void 0, void 0, family);
  }

  static size(size: AnyFontSize | undefined, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    size = size !== void 0 ? FontSize.fromAny(size) : void 0;
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, void 0, void 0, void 0, size as FontSize | undefined, void 0, family);
  }

  static family(family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, void 0, void 0, void 0, void 0, void 0, family);
  }

  static from(style: FontStyle | undefined, variant: FontVariant | undefined,
              weight: FontWeight | undefined, stretch: FontStretch | undefined,
              size: AnyFontSize | undefined, height: AnyLineHeight | undefined,
              family: FontFamily | ReadonlyArray<FontFamily>): Font {
    size = size !== void 0 ? FontSize.fromAny(size) : void 0;
    height = height !== void 0 ? LineHeight.fromAny(height) : void 0;
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(style, variant, weight, stretch, size as FontSize | undefined,
                    height as LineHeight | undefined, family);
  }

  static fromInit(init: FontInit): Font {
    return Font.from(init.style, init.variant, init.weight, init.stretch,
                     init.size, init.height, init.family);
  }

  static fromValue(value: Value): Font | undefined {
    const header = value.header("font");
    if (header.isDefined()) {
      const style = header.get("style").stringValue(void 0) as FontStyle | undefined;
      const variant = header.get("variant").stringValue(void 0) as FontVariant | undefined;
      const weight = header.get("weight").stringValue(void 0) as FontWeight | undefined;
      const stretch = header.get("stretch").stringValue(void 0) as FontStretch | undefined;
      const size = FontSize.fromValue(header.get("size"));
      const height = LineHeight.fromValue(header.get("height"));
      const family = FontFamily.fromValue(header.get("family"));
      if (family !== void 0) {
        return Font.from(style, variant, weight, stretch, size, height, family);
      }
    }
    return void 0;
  }

  static fromAny(value: AnyFont): Font {
    if (value instanceof Font) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return Font.fromInit(value);
    } else if (typeof value === "string") {
      return Font.parse(value);
    }
    throw new TypeError("" + value);
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
    if (typeof value === "object" && value !== null) {
      const init = value as FontInit;
      return init.family !== void 0;
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyFont {
    return value instanceof Font || Font.isInit(value);
  }

  private static _form?: Form<Font, AnyFont>;
  static form(unit?: Font): Form<Font, AnyFont> {
    if (unit !== void 0) {
      unit = Font.fromAny(unit);
      return new Font.Form(unit);
    } else {
      if (Font._form === void 0) {
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
