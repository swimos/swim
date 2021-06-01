// Copyright 2015-2021 Swim inc.
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

import {Equivalent, Equals, Lazy, Values} from "@swim/util";
import {Output, Parser, Debug, Diagnostic, Unicode} from "@swim/codec";
import type {Interpolate, Interpolator} from "@swim/mapping";
import type {Value, Form} from "@swim/structure";
import type {FontStyle} from "./FontStyle";
import type {FontVariant} from "./FontVariant";
import type {FontWeight} from "./FontWeight";
import type {FontStretch} from "./FontStretch";
import {AnyFontSize, FontSize} from "./FontSize";
import {AnyLineHeight, LineHeight} from "./LineHeight";
import {FontFamily} from "./FontFamily";
import {FontInterpolator} from "../"; // forward import
import {FontForm} from "../"; // forward import
import {FontParser} from "../"; // forward import

export type AnyFont = Font | FontInit | string;

export interface FontInit {
  style?: FontStyle;
  variant?: FontVariant;
  weight?: FontWeight;
  stretch?: FontStretch;
  size?: AnyFontSize | null;
  height?: AnyLineHeight | null;
  family: FontFamily | FontFamily[];
}

export class Font implements Interpolate<Font>, Equals, Equivalent, Debug {
  constructor(style: FontStyle | undefined, variant: FontVariant | undefined,
              weight: FontWeight | undefined, stretch: FontStretch | undefined,
              size: FontSize | null, height: LineHeight | null,
              family: FontFamily | ReadonlyArray<FontFamily>) {
    Object.defineProperty(this, "style", {
      value: style,
      enumerable: true,
    });
    Object.defineProperty(this, "variant", {
      value: variant,
      enumerable: true,
    });
    Object.defineProperty(this, "weight", {
      value: weight,
      enumerable: true,
    });
    Object.defineProperty(this, "stretch", {
      value: stretch,
      enumerable: true,
    });
    Object.defineProperty(this, "size", {
      value: size,
      enumerable: true,
    });
    Object.defineProperty(this, "height", {
      value: height,
      enumerable: true,
    });
    Object.defineProperty(this, "family", {
      value: family,
      enumerable: true,
    });
    Object.defineProperty(this, "stringValue", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
  }

  readonly style!: FontStyle | undefined;

  withStyle(style: FontStyle | undefined): Font {
    if (style === this.style) {
      return this;
    } else {
      return new Font(style, this.variant, this.weight, this.stretch,
                      this.size, this.height, this.family);
    }
  }

  readonly variant!: FontVariant | undefined;

  withVariant(variant: FontVariant | undefined): Font {
    if (variant === this.variant) {
      return this;
    } else {
      return new Font(this.style, variant, this.weight, this.stretch,
                      this.size, this.height, this.family);
    }
  }

  readonly weight!: FontWeight | undefined;

  withWeight(weight: FontWeight | undefined): Font {
    if (weight === this.weight) {
      return this;
    } else {
      return new Font(this.style, this.variant, weight, this.stretch,
                      this.size, this.height, this.family);
    }
  }

  readonly stretch!: FontStretch | undefined;

  withStretch(stretch: FontStretch | undefined): Font {
    if (stretch === this.stretch) {
      return this;
    } else {
      return new Font(this.style, this.variant, this.weight, stretch,
                      this.size, this.height, this.family);
    }
  }

  readonly size!: FontSize | null;

  withSize(size: AnyFontSize | null): Font{
    if (size !== null) {
      size = FontSize.fromAny(size);
    }
    if (Values.equal(size, this.size)) {
      return this;
    } else {
      return new Font(this.style, this.variant, this.weight, this.stretch,
                      size as FontSize | null, this.height, this.family);
    }
  }

  readonly height!: LineHeight | null;

  withHeight(height: AnyLineHeight | null): Font {
    if (height !== null) {
      height = LineHeight.fromAny(height);
    }
    if (Values.equal(height, this.height)) {
      return this;
    } else {
      return new Font(this.style, this.variant, this.weight, this.stretch,
                      this.size, height as LineHeight | null, this.family);
    }
  }

  readonly family!: FontFamily | ReadonlyArray<FontFamily>;

  withFamily(family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    if (Values.equal(family, this.family)) {
      return this;
    } else {
      return new Font(this.style, this.variant, this.weight, this.stretch,
                      this.size, this.height, family);
    }
  }

  toAny(): FontInit {
    return {
      style: this.style,
      variant: this.variant,
      weight: this.weight,
      stretch: this.stretch,
      size: this.size,
      height: this.height,
      family: (Array.isArray(this.family) ? this.family.slice(0) : this.family) as FontFamily | FontFamily[],
    };
  }

  interpolateTo(that: Font): Interpolator<Font>;
  interpolateTo(that: unknown): Interpolator<Font> | null;
  interpolateTo(that: unknown): Interpolator<Font> | null {
    if (that instanceof Font) {
      return FontInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Font) {
      return this.style === that.style && this.variant === that.variant
          && this.weight === that.weight && this.stretch === that.stretch
          && Values.equivalent(this.size, that.size, epsilon)
          && Values.equivalent(this.height, that.height, epsilon)
          && Values.equivalent(this.family, that.family, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Font) {
      return this.style === that.style && this.variant === that.variant
          && this.weight === that.weight && this.stretch === that.stretch
          && Values.equal(this.size, that.size)
          && Values.equal(this.height, that.height)
          && Values.equal(this.family, that.family);
    }
    return false;
  }

  debug(output: Output): void {
    output = output.write("Font").write(46/*'.'*/).write("family").write(40/*'('*/);
    if (typeof this.family === "string") {
      output = output.debug(this.family);
    } else if (Array.isArray(this.family) && this.family.length !== 0) {
      output = output.debug(this.family[0]);
      for (let i = 1; i < this.family.length; i += 1) {
        output = output.write(", ").debug(this.family[i]);
      }
    }
    output = output.write(41/*')'*/);
    if (this.style !== void 0) {
      output = output.write(46/*'.'*/).write("style").write(40/*'('*/).debug(this.style).write(41/*')'*/);
    }
    if (this.variant !== void 0) {
      output = output.write(46/*'.'*/).write("variant").write(40/*'('*/).debug(this.variant).write(41/*')'*/);
    }
    if (this.weight !== void 0) {
      output = output.write(46/*'.'*/).write("weight").write(40/*'('*/).debug(this.weight).write(41/*')'*/);
    }
    if (this.stretch !== void 0) {
      output = output.write(46/*'.'*/).write("stretch").write(40/*'('*/).debug(this.stretch).write(41/*')'*/);
    }
    if (this.size !== void 0) {
      output = output.write(46/*'.'*/).write("size").write(40/*'('*/).debug(this.size).write(41/*')'*/);
    }
    if (this.height !== void 0) {
      output = output.write(46/*'.'*/).write("height").write(40/*'('*/).debug(this.height).write(41/*')'*/);
    }
  }

  /* @hidden */
  readonly stringValue!: string | undefined;

  toString(): string {
    let s = this.stringValue;
    if (s === void 0) {
      s = "";
      if (this.style !== void 0 || this.variant === "normal" || this.weight === "normal" || this.stretch === "normal") {
        s += this.style ?? "normal";
      }
      if (this.variant !== void 0 || this.weight === "normal" || this.stretch === "normal") {
        if (s.length !== 0) {
          s += " ";
        }
        s += this.variant ?? "normal";
      }
      if (this.weight !== void 0 || this.stretch === "normal") {
        if (s.length !== 0) {
          s += " ";
        }
        s += this.weight ?? "normal";
      }
      if (this.stretch !== void 0) {
        if (s.length !== 0) {
          s += " ";
        }
        s += this.stretch;
      }
      if (this.size !== null) {
        if (s.length !== 0) {
          s += " ";
        }
        s += this.size.toString();
        if (this.height !== null) {
          s += "/";
          s += this.height.toString();
        }
      }
      if (typeof this.family === "string") {
        if (s.length !== 0) {
          s += " ";
        }
        s += FontFamily.format(this.family);
      } else if (Array.isArray(this.family) && this.family.length !== 0) {
        if (s.length !== 0) {
          s += " ";
        }
        s += FontFamily.format(this.family[0]);
        for (let i = 1; i < this.family.length; i += 1) {
          s += ", ";
          s += FontFamily.format(this.family[i]);
        }
      }
      Object.defineProperty(this, "stringValue", {
        value: s,
        enumerable: true,
        configurable: true,
      });
    }
    return s;
  }

  static style(style: FontStyle | undefined, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(style, void 0, void 0, void 0, null, null, family);
  }

  static variant(variant: FontVariant | undefined, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, variant, void 0, void 0, null, null, family);
  }

  static weight(weight: FontWeight | undefined, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, void 0, weight, void 0, null, null, family);
  }

  static stretch(stretch: FontStretch | undefined, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, void 0, void 0, stretch, null, null, family);
  }

  static size(size: AnyFontSize | null, family: FontFamily | ReadonlyArray<FontFamily>): Font {
    size = size !== null ? FontSize.fromAny(size) : null;
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, void 0, void 0, void 0, size as FontSize | null, null, family);
  }

  static family(family: FontFamily | ReadonlyArray<FontFamily>): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, void 0, void 0, void 0, null, null, family);
  }

  static create(style: FontStyle | undefined, variant: FontVariant | undefined,
                weight: FontWeight | undefined, stretch: FontStretch | undefined,
                size: AnyFontSize | null | undefined, height: AnyLineHeight | null | undefined,
                family: FontFamily | ReadonlyArray<FontFamily>): Font {
    size = size !== void 0 && size !== null ? FontSize.fromAny(size) : null;
    height = height !== void 0 && height !== null ? LineHeight.fromAny(height) : null;
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(style, variant, weight, stretch, size as FontSize | null,
                    height as LineHeight | null, family);
  }

  static fromInit(init: FontInit): Font {
    return Font.create(init.style, init.variant, init.weight, init.stretch,
                       init.size, init.height, init.family);
  }

  static fromValue(value: Value): Font | null {
    const header = value.header("font");
    if (header.isDefined()) {
      const style = header.get("style").stringValue(void 0) as FontStyle | undefined;
      const variant = header.get("variant").stringValue(void 0) as FontVariant | undefined;
      const weight = header.get("weight").stringValue(void 0) as FontWeight | undefined;
      const stretch = header.get("stretch").stringValue(void 0) as FontStretch | undefined;
      const size = FontSize.fromValue(header.get("size"));
      const height = LineHeight.fromValue(header.get("height"));
      const family = FontFamily.fromValue(header.get("family"));
      if (family !== null) {
        return Font.create(style, variant, weight, stretch, size, height, family);
      }
    }
    return null;
  }

  static fromAny(value: AnyFont): Font {
    if (value === void 0 || value === null || value instanceof Font) {
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
    let parser = FontParser.parse(input);
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

  @Lazy
  static form(unit?: Font): Form<Font, AnyFont> {
    return new FontForm(void 0);
  }
}
