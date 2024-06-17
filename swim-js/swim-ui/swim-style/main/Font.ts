// Copyright 2015-2024 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import type {Mutable} from "@swim/util";
import {Lazy} from "@swim/util";
import type {Equals} from "@swim/util";
import type {Equivalent} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Strings} from "@swim/util";
import {Objects} from "@swim/util";
import {Values} from "@swim/util";
import {Interpolator} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Base16} from "@swim/codec";
import {Unicode} from "@swim/codec";
import type {Item} from "@swim/structure";
import {Value} from "@swim/structure";
import {Attr} from "@swim/structure";
import {Record} from "@swim/structure";
import {Form} from "@swim/structure";
import type {LengthLike} from "@swim/math";
import {Length} from "@swim/math";
import {LengthParser} from "@swim/math";

/** @public */
export type FontStyle = "normal"
                      | "italic"
                      | "oblique";

/** @public */
export type FontVariant = "normal" | "small-caps";

/** @public */
export type FontWeight = "normal"
                       | "100"
                       | "200"
                       | "300"
                       | "400"
                       | "500"
                       | "600"
                       | "700"
                       | "800"
                       | "900"
                       | "bold"
                       | "bolder"
                       | "lighter";

/** @public */
export type FontStretch = "normal"
                        | "ultra-condensed"
                        | "extra-condensed"
                        | "semi-condensed"
                        | "condensed"
                        | "expanded"
                        | "semi-expanded"
                        | "extra-expanded"
                        | "ultra-expanded";

/** @public */
export type FontSizeLike = LengthLike | FontSize;

/** @public */
export type FontSize = Length
                     | "large"
                     | "larger"
                     | "medium"
                     | "small"
                     | "smaller"
                     | "x-large"
                     | "x-small"
                     | "xx-large"
                     | "xx-small";

/** @public */
export const FontSize = {
  fromLike<T extends FontSizeLike | null | undefined>(value: T): FontSize | Uninitable<T> {
    if (value === void 0 || value === null) {
      return value as FontSize | Uninitable<T>;
    } else if (typeof value === "string"
        && (value === "large" || value === "larger" || value === "medium"
         || value === "small" || value === "smaller"  || value === "x-large" || value === "x-small"
         || value === "xx-large" || value === "xx-small")) {
      return value as FontSize;
    }
    return Length.fromLike(value);
  },

  fromValue(value: Value): FontSize | null {
    const string = value.stringValue(null);
    if (string !== null) {
      return FontSize.fromLike(string);
    }
    const size = Length.form().cast(value);
    return size !== void 0 ? size : null;
  },
};

/** @public */
export type LineHeightLike = LengthLike | LineHeight;

/** @public */
export type LineHeight = Length | "normal";

/** @public */
export const LineHeight = {
  fromLike<T extends LineHeightLike | null | undefined>(value: T): LineHeight | Uninitable<T> {
    if (value === void 0 || value === null) {
      return value as LineHeight | Uninitable<T>;
    } else if (typeof value === "string" && value === "normal") {
      return value as LineHeight;
    }
    return Length.fromLike(value);
  },

  fromValue(value: Value): LineHeight | null {
    const string = value.stringValue(null);
    if (string !== null) {
      return LineHeight.fromLike(string);
    }
    const height = Length.form().cast(value);
    return height !== void 0 ? height : null;
  },
};

/** @public */
export type GenericFamily = "serif"
                          | "sans-serif"
                          | "cursive"
                          | "fantasy"
                          | "monospace"
                          | "system-ui"
                          | "emoji"
                          | "math"
                          | "fangsong";

/** @public */
export type FontFamily = string | GenericFamily;

/** @public */
export const FontFamily = {
  fromValue(value: Value): FontFamily | FontFamily[] | null {
    let family: FontFamily | FontFamily[] | null = null;
    value.forEach(function (item: Item): void {
      let string: string | undefined;
      if (!(item instanceof Value) || (string = item.stringValue(void 0)) === void 0) {
        return;
      }
      if (family === null) {
        family = string;
      } else if (typeof family === "string") {
        family = [family, string];
      } else {
        family.push(string);
      }
    });
    return family;
  },

  format(family: FontFamily): string {
    let isIdent = false;
    if (family.length !== 0) {
      isIdent = Unicode.isAlpha(family.charCodeAt(0));
      for (let i = Strings.offsetByCodePoints(family, 0, 1); isIdent && i < family.length; i = Strings.offsetByCodePoints(family, i, 1)) {
        const c = family.charCodeAt(i);
        isIdent = Unicode.isAlpha(c) || c === 45/*'-'*/;
      }
    }
    if (isIdent) {
      return family;
    }
    let output = Unicode.stringOutput();
    output = output.write(34/*'"'*/);
    for (let i = 0; i < family.length; i = Strings.offsetByCodePoints(family, i, 1)) {
      const c = family.charCodeAt(i);
      if (c === 10/*'\n'*/ || c === 34/*'"'*/ || c === 39/*'\''*/) {
        output = output.write(92/*'\\'*/).write(c);
      } else if (c >= 0x20) {
        output = output.write(c);
      } else {
        const base16 = Base16.uppercase;
        output = output.write(92/*'\\'*/).write(base16.encodeDigit(c >>> 20 & 0xf))
                                         .write(base16.encodeDigit(c >>> 16 & 0xf))
                                         .write(base16.encodeDigit(c >>> 12 & 0xf))
                                         .write(base16.encodeDigit(c >>>  8 & 0xf))
                                         .write(base16.encodeDigit(c >>>  4 & 0xf))
                                         .write(base16.encodeDigit(c        & 0xf));
      }
    }
    output = output.write(34/*'"'*/);
    return output.toString();
  },
};

/** @public */
export type FontLike = Font | FontInit | string;

/** @public */
export const FontLike = {
  [Symbol.hasInstance](instance: unknown): instance is FontLike {
    return instance instanceof Font
        || FontInit[Symbol.hasInstance](instance);
  },
};

/** @public */
export interface FontInit {
  style?: FontStyle;
  variant?: FontVariant;
  weight?: FontWeight;
  stretch?: FontStretch;
  size?: FontSizeLike | null;
  height?: LineHeightLike | null;
  family: FontFamily | FontFamily[];
}

/** @public */
export const FontInit = {
  [Symbol.hasInstance](instance: unknown): instance is FontInit {
    return Objects.hasAllKeys<FontInit>(instance, "family");
  },
};

/** @public */
export class Font implements Interpolate<Font>, Equals, Equivalent, Debug {
  constructor(style: FontStyle | undefined, variant: FontVariant | undefined,
              weight: FontWeight | undefined, stretch: FontStretch | undefined,
              size: FontSize | null, height: LineHeight | null,
              family: FontFamily | readonly FontFamily[]) {
    this.style = style;
    this.variant = variant;
    this.weight = weight;
    this.stretch = stretch;
    this.size = size;
    this.height = height;
    this.family = family;
    this.stringValue = void 0;
  }

  likeType?(like: FontInit | string): void;

  readonly style: FontStyle | undefined;

  withStyle(style: FontStyle | undefined): Font {
    if (style === this.style) {
      return this;
    }
    return new Font(style, this.variant, this.weight, this.stretch,
                    this.size, this.height, this.family);
  }

  readonly variant: FontVariant | undefined;

  withVariant(variant: FontVariant | undefined): Font {
    if (variant === this.variant) {
      return this;
    }
    return new Font(this.style, variant, this.weight, this.stretch,
                    this.size, this.height, this.family);
  }

  readonly weight: FontWeight | undefined;

  withWeight(weight: FontWeight | undefined): Font {
    if (weight === this.weight) {
      return this;
    }
    return new Font(this.style, this.variant, weight, this.stretch,
                    this.size, this.height, this.family);
  }

  readonly stretch: FontStretch | undefined;

  withStretch(stretch: FontStretch | undefined): Font {
    if (stretch === this.stretch) {
      return this;
    }
    return new Font(this.style, this.variant, this.weight, stretch,
                    this.size, this.height, this.family);
  }

  readonly size: FontSize | null;

  withSize(size: FontSizeLike | null): Font{
    size = FontSize.fromLike(size);
    if (Values.equal(size, this.size)) {
      return this;
    }
    return new Font(this.style, this.variant, this.weight, this.stretch,
                    size as FontSize | null, this.height, this.family);
  }

  readonly height: LineHeight | null;

  withHeight(height: LineHeightLike | null): Font {
    height = LineHeight.fromLike(height);
    if (Values.equal(height, this.height)) {
      return this;
    }
    return new Font(this.style, this.variant, this.weight, this.stretch,
                    this.size, height as LineHeight | null, this.family);
  }

  readonly family: FontFamily | readonly FontFamily[];

  withFamily(family: FontFamily | readonly FontFamily[]): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    if (Values.equal(family, this.family)) {
      return this;
    }
    return new Font(this.style, this.variant, this.weight, this.stretch,
                    this.size, this.height, family);
  }

  toLike(): FontInit {
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

  /** @override */
  interpolateTo(that: Font): Interpolator<Font>;
  interpolateTo(that: unknown): Interpolator<Font> | null;
  interpolateTo(that: unknown): Interpolator<Font> | null {
    if (that instanceof Font) {
      return FontInterpolator(this, that);
    }
    return null;
  }

  /** @override */
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

  /** @override */
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

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
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
    return output;
  }

  /* @internal */
  readonly stringValue: string | undefined;

  /** @override */
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
      (this as Mutable<this>).stringValue = s;
    }
    return s;
  }

  static style(style: FontStyle | undefined, family: FontFamily | readonly FontFamily[]): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(style, void 0, void 0, void 0, null, null, family);
  }

  static variant(variant: FontVariant | undefined, family: FontFamily | readonly FontFamily[]): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, variant, void 0, void 0, null, null, family);
  }

  static weight(weight: FontWeight | undefined, family: FontFamily | readonly FontFamily[]): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, void 0, weight, void 0, null, null, family);
  }

  static stretch(stretch: FontStretch | undefined, family: FontFamily | readonly FontFamily[]): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, void 0, void 0, stretch, null, null, family);
  }

  static size(size: FontSizeLike | null, family: FontFamily | readonly FontFamily[]): Font {
    size = size !== null ? FontSize.fromLike(size) : null;
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, void 0, void 0, void 0, size as FontSize | null, null, family);
  }

  static family(family: FontFamily | readonly FontFamily[]): Font {
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(void 0, void 0, void 0, void 0, null, null, family);
  }

  static create(style: FontStyle | undefined, variant: FontVariant | undefined,
                weight: FontWeight | undefined, stretch: FontStretch | undefined,
                size: FontSizeLike | null | undefined, height: LineHeightLike | null | undefined,
                family: FontFamily | readonly FontFamily[]): Font {
    size = size !== void 0 && size !== null ? FontSize.fromLike(size) : null;
    height = height !== void 0 && height !== null ? LineHeight.fromLike(height) : null;
    if (Array.isArray(family) && family.length === 1) {
      family = family[0];
    }
    return new Font(style, variant, weight, stretch, size as FontSize | null,
                    height as LineHeight | null, family);
  }

  static fromLike<T extends FontLike | null | undefined>(value: T): Font | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Font) {
      return value as Font | Uninitable<T>;
    } else if (typeof value === "object" && value !== null) {
      return Font.fromInit(value);
    } else if (typeof value === "string") {
      return Font.parse(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: FontInit): Font {
    return Font.create(init.style, init.variant, init.weight, init.stretch,
                       init.size, init.height, init.family);
  }

  static fromValue(value: Value): Font | null {
    const header = value.header("font");
    if (!header.isDefined()) {
      return null;
    }
    const style = header.get("style").stringValue(void 0) as FontStyle | undefined;
    const variant = header.get("variant").stringValue(void 0) as FontVariant | undefined;
    const weight = header.get("weight").stringValue(void 0) as FontWeight | undefined;
    const stretch = header.get("stretch").stringValue(void 0) as FontStretch | undefined;
    const size = FontSize.fromValue(header.get("size"));
    const height = LineHeight.fromValue(header.get("height"));
    const family = FontFamily.fromValue(header.get("family"));
    if (family === null) {
      return null;
    }
    return Font.create(style, variant, weight, stretch, size, height, family);
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

  @Lazy
  static form(): Form<Font, FontLike> {
    return new FontForm(void 0);
  }
}

/** @internal */
export interface FontInterpolator extends Interpolator<Font> {
  /** @internal */
  readonly styleInterpolator: Interpolator<FontStyle | undefined>;
  /** @internal */
  readonly variantInterpolator: Interpolator<FontVariant | undefined>;
  /** @internal */
  readonly weightInterpolator: Interpolator<FontWeight | undefined>;
  /** @internal */
  readonly stretchInterpolator: Interpolator<FontStretch | undefined>;
  /** @internal */
  readonly sizeInterpolator: Interpolator<FontSize | null>;
  /** @internal */
  readonly heightInterpolator: Interpolator<LineHeight | null>;
  /** @internal */
  readonly familyInterpolator: Interpolator<FontFamily | readonly FontFamily[]>;

  get 0(): Font;

  get 1(): Font;

  equals(that: unknown): boolean;
}

/** @internal */
export const FontInterpolator = (function (_super: typeof Interpolator) {
  const FontInterpolator = function (f0: Font, f1: Font): FontInterpolator {
    const interpolator = function (u: number): Font {
      const style = interpolator.styleInterpolator(u);
      const variant = interpolator.variantInterpolator(u);
      const weight = interpolator.weightInterpolator(u);
      const stretch = interpolator.stretchInterpolator(u);
      const size = interpolator.sizeInterpolator(u);
      const height = interpolator.heightInterpolator(u);
      const family = interpolator.familyInterpolator(u);
      return new Font(style, variant, weight, stretch, size, height, family);
    } as FontInterpolator;
    Object.setPrototypeOf(interpolator, FontInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).styleInterpolator = Interpolator(f0.style, f1.style);
    (interpolator as Mutable<typeof interpolator>).variantInterpolator = Interpolator(f0.variant, f1.variant);
    (interpolator as Mutable<typeof interpolator>).weightInterpolator = Interpolator(f0.weight, f1.weight);
    (interpolator as Mutable<typeof interpolator>).stretchInterpolator = Interpolator(f0.stretch, f1.stretch);
    (interpolator as Mutable<typeof interpolator>).sizeInterpolator = Interpolator(f0.size, f1.size);
    (interpolator as Mutable<typeof interpolator>).heightInterpolator = Interpolator(f0.height, f1.height);
    (interpolator as Mutable<typeof interpolator>).familyInterpolator = Interpolator(f0.family, f1.family);
    return interpolator;
  } as {
    (f0: Font, f1: Font): FontInterpolator;

    /** @internal */
    prototype: FontInterpolator;
  };

  FontInterpolator.prototype = Object.create(_super.prototype);
  FontInterpolator.prototype.constructor = FontInterpolator;

  Object.defineProperty(FontInterpolator.prototype, 0, {
    get(this: FontInterpolator): Font {
      const style = this.styleInterpolator[0];
      const variant = this.variantInterpolator[0];
      const weight = this.weightInterpolator[0];
      const stretch = this.stretchInterpolator[0];
      const size = this.sizeInterpolator[0];
      const height = this.heightInterpolator[0];
      const family = this.familyInterpolator[0];
      return new Font(style, variant, weight, stretch, size, height, family);
    },
    configurable: true,
  });

  Object.defineProperty(FontInterpolator.prototype, 1, {
    get(this: FontInterpolator): Font {
      const style = this.styleInterpolator[1];
      const variant = this.variantInterpolator[1];
      const weight = this.weightInterpolator[1];
      const stretch = this.stretchInterpolator[1];
      const size = this.sizeInterpolator[1];
      const height = this.heightInterpolator[1];
      const family = this.familyInterpolator[1];
      return new Font(style, variant, weight, stretch, size, height, family);
    },
    configurable: true,
  });

  FontInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof FontInterpolator) {
      return this.styleInterpolator.equals(that.styleInterpolator)
          && this.variantInterpolator.equals(that.variantInterpolator)
          && this.weightInterpolator.equals(that.weightInterpolator)
          && this.stretchInterpolator.equals(that.stretchInterpolator)
          && this.sizeInterpolator.equals(that.sizeInterpolator)
          && this.heightInterpolator.equals(that.heightInterpolator)
          && this.familyInterpolator.equals(that.familyInterpolator);
    }
    return false;
  };

  return FontInterpolator;
})(Interpolator);

/** @internal */
export class FontForm extends Form<Font, FontLike> {
  constructor(unit: Font | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly unit: Font | undefined;

  override withUnit(unit: Font | undefined): Form<Font, FontLike> {
    if (unit === this.unit) {
      return this;
    }
    return new FontForm(unit);
  }

  override mold(font: FontLike): Item {
    font = Font.fromLike(font);
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

/** @internal */
export class FontFamilyParser extends Parser<FontFamily> {
  private readonly output: Output<string> | undefined;
  private readonly quote: number | undefined;
  private readonly code: number | undefined;
  private readonly step: number | undefined;

  constructor(output?: Output<string>, quote?: number, code?: number, step?: number) {
    super();
    this.output = output;
    this.quote = quote;
    this.code = code;
    this.step = step;
  }

  override feed(input: Input): Parser<FontFamily> {
    return FontFamilyParser.parse(input, this.output, this.quote, this.code, this.step);
  }

  static parse<I, V>(input: Input, output?: Output<string>, quote: number = 0,
                     code: number = 0, step: number = 1): Parser<FontFamily> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont()) {
        if (Unicode.isAlpha(c) || c === 45/*'-'*/) {
          output = output || Unicode.stringOutput();
          step = 2;
        } else if (c === 34/*'"'*/ || c === 39/*'\''*/ && (quote === c || quote === 0)) {
          input = input.step();
          output = output || Unicode.stringOutput();
          quote = c;
          step = 3;
        } else {
          return Parser.error(Diagnostic.expected("font family", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("font family", input));
      }
    }
    if (step === 2) {
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c) || c === 45/*'-'*/)) {
        input = input.step();
        output!.write(c);
      }
      if (!input.isEmpty()) {
        return Parser.done(output!.bind());
      }
    }
    string: do {
      if (step === 3) {
        while (input.isCont()) {
          c = input.head();
          if (c >= 0x20 && c !== quote && c !== 92/*'\\'*/) {
            input = input.step();
            output!.write(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c === quote) {
            input = input.step();
            return Parser.done(output!.bind());
          } else if (c === 92/*'\\'*/) {
            input = input.step();
            step = 4;
          } else {
            return Parser.error(Diagnostic.expected(quote, input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected(quote, input));
        }
      }
      if (step === 4) {
        if (input.isCont()) {
          c = input.head();
          if (Base16.isDigit(c)) {
            step = 5;
          } else if (c === 10/*'\n'*/) {
            input.step();
            step = 3;
            continue;
          } else {
            input.step();
            output!.write(c);
            step = 3;
            continue;
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step >= 5) {
        do {
          if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
            input = input.step();
            code = 16 * code + Base16.decodeDigit(c);
            if (step <= 11) {
              step += 1;
              continue;
            } else {
              if (code === 0) {
                return Parser.error(Diagnostic.message("zero escape", input));
              }
              output!.write(code);
              code = 0;
              step = 3;
              continue string;
            }
          } else if (!input.isEmpty()) {
            return Parser.error(Diagnostic.unexpected(input));
          }
          break;
        } while (true);
      }
      break;
    } while (true);
    return new FontFamilyParser(output, quote, code, step);
  }
}

/** @internal */
export class FontParser extends Parser<Font> {
  private readonly style: FontStyle | undefined;
  private readonly variant: FontVariant | undefined;
  private readonly weight: FontWeight | undefined;
  private readonly stretch: FontStretch | undefined;
  private readonly size: FontSize | undefined;
  private readonly height: LineHeight | undefined;
  private readonly family: FontFamily | FontFamily[] | undefined;
  private readonly identOutput: Output<string> | undefined;
  private readonly lengthParser: Parser<Length> | undefined;
  private readonly familyParser: Parser<FontFamily> | undefined;
  private readonly step: number | undefined;

  constructor(style?: FontStyle, variant?: FontVariant, weight?: FontWeight,
              stretch?: FontStretch, size?: FontSize, height?: LineHeight,
              family?: FontFamily | FontFamily[], identOutput?: Output<string>,
              lengthParser?: Parser<Length>, familyParser?: Parser<FontFamily>,
              step?: number) {
    super();
    this.style = style;
    this.variant = variant;
    this.weight = weight;
    this.stretch = stretch;
    this.size = size;
    this.height = height;
    this.family = family;
    this.identOutput = identOutput;
    this.lengthParser = lengthParser;
    this.familyParser = familyParser;
    this.step = step;
  }

  override feed(input: Input): Parser<Font> {
    return FontParser.parse(input, this.style, this.variant, this.weight,
                            this.stretch, this.size, this.height, this.family,
                            this.identOutput, this.lengthParser,
                            this.familyParser, this.step);
  }

  static parse(input: Input, style?: FontStyle, variant?: FontVariant,
               weight?: FontWeight, stretch?: FontStretch, size?: FontSize,
               height?: LineHeight, family?: FontFamily | FontFamily[],
               identOutput?: Output<string>, lengthParser?: Parser<Length>,
               familyParser?: Parser<FontFamily>, step: number = 1): Parser<Font> {
    let c = 0;
    do {
      if (step === 1) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (input.isCont()) {
          if (Unicode.isAlpha(c)) {
            step = 2;
          } else if (c === 34/*'"'*/ || c === 39/*'\''*/) {
            step = 11;
          } else {
            step = 4;
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 2) {
        identOutput = identOutput || Unicode.stringOutput();
        while (input.isCont() && (c = input.head(), Unicode.isAlpha(c) || c === 45/*'-'*/)) {
          input = input.step();
          identOutput.write(c);
        }
        if (!input.isEmpty()) {
          const ident = identOutput.bind();
          identOutput = void 0;
          switch (ident) {
            case "italic":
            case "oblique":
              if (style === void 0) {
                style = ident;
              } else {
                return Parser.error(Diagnostic.message("reapeated font style: " + ident, input));
              }
              step = 3;
              break;
            case "small-caps":
              if (variant === void 0) {
                variant = ident;
              } else {
                return Parser.error(Diagnostic.message("reapeated font variant: " + ident, input));
              }
              step = 3;
              break;
            case "bold":
            case "bolder":
            case "lighter":
              if (weight === void 0) {
                weight = ident;
              } else {
                return Parser.error(Diagnostic.message("reapeated font weight: " + ident, input));
              }
              step = 3;
              break;
            case "ultra-condensed":
            case "extra-condensed":
            case "semi-condensed":
            case "condensed":
            case "expanded":
            case "semi-expanded":
            case "extra-expanded":
            case "ultra-expanded":
              if (stretch === void 0) {
                stretch = ident;
              } else {
                return Parser.error(Diagnostic.message("reapeated font stretch: " + ident, input));
              }
              step = 3;
              break;
            case "normal":
              if (style === void 0) {
                style = ident;
              } else if (variant === void 0) {
                variant = ident;
              } else if (weight === void 0) {
                weight = ident;
              } else if (stretch === void 0) {
                stretch = ident;
              } else {
                return Parser.error(Diagnostic.message("reapeated font property: " + ident, input));
              }
              step = 3;
              break;
            case "large":
            case "larger":
            case "medium":
            case "small":
            case "smaller":
            case "x-large":
            case "x-small":
            case "xx-large":
            case "xx-small":
              size = ident;
              step = 5;
              break;
            default:
              family = ident;
              step = 12;
          }
        }
      }
      if (step === 3) {
        if (input.isCont()) {
          c = input.head();
          if (Unicode.isSpace(c)) {
            input.step();
            step = 1;
            continue;
          } else {
            return Parser.error(Diagnostic.expected("font property, size, or family", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 4) {
        if (lengthParser === void 0) {
          lengthParser = LengthParser.parse(input);
        } else {
          lengthParser = lengthParser.feed(input);
        }
        if (lengthParser.isDone()) {
          const length = lengthParser.bind();
          if (length.units === "") {
            const value = length.value;
            switch (value) {
              case 100:
              case 200:
              case 300:
              case 400:
              case 500:
              case 600:
              case 700:
              case 800:
              case 900:
                if (weight === void 0) {
                  weight = String(value) as FontWeight;
                } else {
                  return Parser.error(Diagnostic.message("reapeated font weight: " + value, input));
                }
                break;
              default:
                return Parser.error(Diagnostic.message("unknown font property: " + value, input));
            }
            step = 3;
            continue;
          } else {
            size = length;
            lengthParser = void 0;
            step = 5;
          }
        } else if (lengthParser.isError()) {
          return lengthParser.asError();
        }
      }
      if (step === 5) {
        if (input.isCont()) {
          c = input.head();
          if (Unicode.isSpace(c)) {
            input.step();
            step = 6;
          } else if (c === 47/*'/'*/) {
            input.step();
            step = 7;
          } else {
            return Parser.error(Diagnostic.expected("font family", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 6) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (input.isCont()) {
          if (c === 47/*'/'*/) {
            input.step();
            step = 7;
          } else {
            step = 11;
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 7) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (input.isCont()) {
          if (Unicode.isAlpha(c)) {
            step = 8;
          } else {
            step = 9;
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 8) {
        identOutput = identOutput || Unicode.stringOutput();
        while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
          input = input.step();
          identOutput.write(c);
        }
        if (!input.isEmpty()) {
          const ident = identOutput.bind();
          identOutput = void 0;
          switch (ident) {
            case "normal":
              height = ident;
              step = 10;
              break;
            default:
              return Parser.error(Diagnostic.message("unknown line height: " + ident, input));
          }
        }
      }
      if (step === 9) {
        if (lengthParser === void 0) {
          lengthParser = LengthParser.parse(input);
        } else {
          lengthParser = lengthParser.feed(input);
        }
        if (lengthParser.isDone()) {
          height = lengthParser.bind();
          lengthParser = void 0;
          step = 10;
        } else if (lengthParser.isError()) {
          return lengthParser.asError();
        }
      }
      if (step === 10) {
        if (input.isCont()) {
          c = input.head();
          if (Unicode.isSpace(c)) {
            input.step();
            step = 11;
          } else {
            return Parser.error(Diagnostic.expected("font family", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 11) {
        if (familyParser === void 0) {
          familyParser = FontFamilyParser.parse(input);
        } else {
          familyParser = familyParser.feed(input);
        }
        if (familyParser.isDone()) {
          if (Array.isArray(family)) {
            family.push(familyParser.bind());
          } else if (family !== void 0) {
            family = [family!, familyParser.bind()];
          } else {
            family = familyParser.bind();
          }
          familyParser = void 0;
          step = 12;
        } else if (familyParser.isError()) {
          return familyParser.asError();
        }
      }
      if (step === 12) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (input.isCont() && c === 44/*','*/) {
          input.step();
          step = 11;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.done(Font.create(style, variant, weight, stretch, size, height, family!));
        }
      }
      break;
    } while (true);
    return new FontParser(style, variant, weight, stretch, size, height, family,
                          identOutput, lengthParser, familyParser, step);
  }

  static parseRest(input: Input, style?: FontStyle, variant?: FontVariant,
                   weight?: FontWeight, stretch?: FontStretch, size?: FontSize,
                   height?: LineHeight, family?: FontFamily | FontFamily[]): Parser<Font> {
    const step = family !== void 0 ? 12 : size !== void 0 ? 5 : 3;
    return FontParser.parse(input, style, variant, weight, stretch, size, height,
                            family, void 0, void 0, void 0, step);
  }
}
