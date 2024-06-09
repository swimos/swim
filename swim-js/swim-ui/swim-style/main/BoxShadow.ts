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
import {Equals} from "@swim/util";
import {Equivalent} from "@swim/util";
import {Objects} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import {Unicode} from "@swim/codec";
import type {Item} from "@swim/structure";
import {Value} from "@swim/structure";
import {Record} from "@swim/structure";
import {Text} from "@swim/structure";
import {Form} from "@swim/structure";
import type {LengthLike} from "@swim/math";
import {Length} from "@swim/math";
import {LengthParser} from "@swim/math";
import type {ColorLike} from "./Color";
import {Color} from "./Color";
import {ColorParser} from "./Color";

/** @public */
export type BoxShadowLike = BoxShadow | BoxShadowInit | string | readonly BoxShadowLike[];

/** @public */
export const BoxShadowLike = {
  [Symbol.hasInstance](instance: unknown): instance is BoxShadowLike {
    return instance instanceof BoxShadow
        || BoxShadowInit[Symbol.hasInstance](instance)
        || typeof instance === "string"
        || BoxShadowLike.isArray(instance);
  },
  /** @internal */
  isArray(value: unknown): value is readonly BoxShadowLike[] {
    if (!Array.isArray(value) || value.length === 0) {
      return false;
    }
    for (let i = 0; i < value.length; i += 1) {
      if (!BoxShadowLike[Symbol.hasInstance](value)) {
        return false;
      }
    }
    return true;
  },
};

/** @public */
export interface BoxShadowInit {
  inset?: boolean;
  offsetX?: LengthLike;
  offsetY?: LengthLike;
  blurRadius?: LengthLike;
  spreadRadius?: LengthLike;
  color?: ColorLike;
}

/** @public */
export const BoxShadowInit = {
  [Symbol.hasInstance](instance: unknown): instance is BoxShadowInit {
    return Objects.hasAnyKey(instance, "inset", "offsetX", "offsetY", "blurRadius", "spreadRadius", "color");
  },
};

/** @public */
export class BoxShadow implements Interpolate<BoxShadow>, Equals, Equivalent {
  constructor(inset: boolean, offsetX: Length, offsetY: Length, blurRadius: Length,
              spreadRadius: Length, color: Color, next: BoxShadow | null) {
    this.inset = inset;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.blurRadius = blurRadius;
    this.spreadRadius = spreadRadius;
    this.color = color;
    this.next = next;
    this.stringValue = void 0;
  }

  likeType?(like: BoxShadowInit | string | readonly BoxShadowLike[]): void;

  readonly inset: boolean;

  withInset(inset: boolean): BoxShadow {
    if (inset === this.inset) {
      return this;
    }
    return new BoxShadow(inset, this.offsetX, this.offsetY, this.blurRadius,
                         this.spreadRadius, this.color, this.next);
  }

  readonly offsetX: Length;

  withOffsetX(offsetX: LengthLike): BoxShadow {
    offsetX = Length.fromLike(offsetX);
    if (offsetX.equals(this.offsetX)) {
      return this;
    }
    return new BoxShadow(this.inset, offsetX, this.offsetY, this.blurRadius,
                         this.spreadRadius, this.color, this.next);
  }

  readonly offsetY: Length;

  withOffsetY(offsetY: LengthLike): BoxShadow {
    offsetY = Length.fromLike(offsetY);
    if (offsetY.equals(this.offsetY)) {
      return this;
    }
    return new BoxShadow(this.inset, this.offsetX, offsetY, this.blurRadius,
                         this.spreadRadius, this.color, this.next);
  }

  readonly blurRadius: Length;

  withBlurRadius(blurRadius: LengthLike): BoxShadow {
    blurRadius = Length.fromLike(blurRadius);
    if (blurRadius.equals(this.blurRadius)) {
      return this;
    }
    return new BoxShadow(this.inset, this.offsetX, this.offsetY, blurRadius,
                         this.spreadRadius, this.color, this.next);
  }

  readonly spreadRadius: Length;

  withSpreadRadius(spreadRadius: LengthLike): BoxShadow {
    spreadRadius = Length.fromLike(spreadRadius);
    if (spreadRadius.equals(this.spreadRadius)) {
      return this;
    }
    return new BoxShadow(this.inset, this.offsetX, this.offsetY, this.blurRadius,
                         spreadRadius, this.color, this.next);
  }

  readonly color: Color;

  withColor(color: ColorLike): BoxShadow {
    color = Color.fromLike(color);
    if (color.equals(this.color)) {
      return this;
    }
    return new BoxShadow(this.inset, this.offsetX, this.offsetY, this.blurRadius,
                         this.spreadRadius, color, this.next);
  }

  readonly next: BoxShadow | null;

  and(value: BoxShadowLike): BoxShadow;
  and(offsetX: LengthLike, offsetY: LengthLike, color: ColorLike): BoxShadow;
  and(offsetX: LengthLike, offsetY: LengthLike, blurRadius: LengthLike, color: ColorLike): BoxShadow;
  and(offsetX: LengthLike, offsetY: LengthLike, blurRadius: LengthLike, spreadRadius: LengthLike, color: ColorLike): BoxShadow;
  and(inset: boolean, offsetX: LengthLike, offsetY: LengthLike, color: ColorLike): BoxShadow;
  and(inset: boolean, offsetX: LengthLike, offsetY: LengthLike, blurRadius: LengthLike, color: ColorLike): BoxShadow;
  and(inset: boolean, offsetX: LengthLike, offsetY: LengthLike, blurRadius: LengthLike, spreadRadius: LengthLike, color: ColorLike): BoxShadow;
  and(inset: BoxShadowLike | LengthLike | boolean, offsetX?: LengthLike, offsetY?: ColorLike | LengthLike, blurRadius?: ColorLike | LengthLike, spreadRadius?: ColorLike | LengthLike, color?: ColorLike): BoxShadow {
    let next: BoxShadow | null;
    if (this.next !== null) {
      // eslint-disable-next-line prefer-rest-params, prefer-spread
      next = this.next.and.apply(this.next, arguments as any);
    } else {
      // eslint-disable-next-line prefer-rest-params, prefer-spread
      next = BoxShadow.create.apply(BoxShadow, arguments as any);
    }
    return new BoxShadow(this.inset, this.offsetX, this.offsetY, this.blurRadius,
                         this.spreadRadius, this.color, next);
  }

  /** @override */
  interpolateTo(that: BoxShadow): Interpolator<BoxShadow>;
  interpolateTo(that: unknown): Interpolator<BoxShadow> | null;
  interpolateTo(that: unknown): Interpolator<BoxShadow> | null {
    if (that instanceof BoxShadow) {
      return BoxShadowInterpolator(this, that);
    }
    return null;
  }

  /** @override */
  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BoxShadow) {
      return this.inset === that.inset
          && this.offsetX.equivalentTo(that.offsetX, epsilon)
          && this.offsetY.equivalentTo(that.offsetY, epsilon)
          && this.blurRadius.equivalentTo(that.blurRadius, epsilon)
          && this.spreadRadius.equivalentTo(that.spreadRadius, epsilon)
          && this.color.equivalentTo(that.color, epsilon)
          && Equivalent(this.next, that.next, epsilon);
    }
    return false;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BoxShadow) {
      return this.inset === that.inset && this.offsetX.equals(that.offsetX)
          && this.offsetY.equals(that.offsetY) && this.blurRadius.equals(that.blurRadius)
          && this.spreadRadius.equals(that.spreadRadius) && this.color.equals(that.color)
          && Equals(this.next, that.next);
    }
    return false;
  }

  /** @internal */
  readonly stringValue: string | undefined;

  /** @override */
  toString(): string {
    let s = this.stringValue;
    if (s === void 0) {
      s = "";
      if (this.inset) {
        s += "inset";
        s += " ";
      }
      s += this.offsetX.toString();
      s += " ";
      s += this.offsetY.toString();
      s += " ";
      s += this.blurRadius.toString();
      s += " ";
      s += this.spreadRadius.toString();
      s += " ";
      s += this.color.toString();
      if (this.next !== null) {
        s += ", ";
        s += this.next.toString();
      }
      (this as Mutable<this>).stringValue = s;
    }
    return s;
  }

  static create(value: BoxShadowLike): BoxShadow;
  static create(offsetX: LengthLike, offsetY: LengthLike, color: ColorLike): BoxShadow;
  static create(offsetX: LengthLike, offsetY: LengthLike, blurRadius: LengthLike, color: ColorLike): BoxShadow;
  static create(offsetX: LengthLike, offsetY: LengthLike, blurRadius: LengthLike, spreadRadius: LengthLike, color: ColorLike): BoxShadow;
  static create(inset: boolean, offsetX: LengthLike, offsetY: LengthLike, color: ColorLike): BoxShadow;
  static create(inset: boolean, offsetX: LengthLike, offsetY: LengthLike, blurRadius: LengthLike, color: ColorLike): BoxShadow;
  static create(inset: boolean, offsetX: LengthLike, offsetY: LengthLike, blurRadius: LengthLike, spreadRadius: LengthLike, color: ColorLike): BoxShadow;
  static create(inset: BoxShadowLike | LengthLike | boolean, offsetX?: LengthLike, offsetY?: ColorLike | LengthLike, blurRadius?: ColorLike | LengthLike, spreadRadius?: ColorLike | LengthLike, color?: ColorLike): BoxShadow {
    if (arguments.length === 1) {
      return BoxShadow.fromLike(inset as BoxShadowLike)!;
    } else if (typeof inset !== "boolean") {
      if (arguments.length === 3) {
        color = Color.fromLike(offsetY as ColorLike);
        spreadRadius = Length.zero();
        blurRadius = Length.zero();
        offsetY = Length.fromLike(offsetX!);
        offsetX = Length.fromLike(inset as LengthLike);
      } else if (arguments.length === 4) {
        color = Color.fromLike(blurRadius as ColorLike);
        spreadRadius = Length.zero();
        blurRadius = Length.fromLike(offsetY as LengthLike);
        offsetY = Length.fromLike(offsetX!);
        offsetX = Length.fromLike(inset as LengthLike);
      } else if (arguments.length === 5) {
        color = Color.fromLike(spreadRadius as ColorLike);
        spreadRadius = Length.fromLike(blurRadius as LengthLike);
        blurRadius = Length.fromLike(offsetY as LengthLike);
        offsetY = Length.fromLike(offsetX!);
        offsetX = Length.fromLike(inset as LengthLike);
      } else {
        throw new Error(inset + ", " + offsetX + ", " + offsetY + ", " + blurRadius + ", " + spreadRadius + ", " + color);
      }
      inset = false;
    } else {
      if (arguments.length === 4) {
        color = Color.fromLike(blurRadius as ColorLike);
        spreadRadius = Length.zero();
        blurRadius = Length.zero();
        offsetY = Length.fromLike(offsetY as LengthLike);
        offsetX = Length.fromLike(offsetX!);
      } else if (arguments.length === 5) {
        color = Color.fromLike(spreadRadius as ColorLike);
        spreadRadius = Length.zero();
        blurRadius = Length.fromLike(blurRadius as LengthLike);
        offsetY = Length.fromLike(offsetY as LengthLike);
        offsetX = Length.fromLike(offsetX!);
      } else if (arguments.length === 6) {
        color = Color.fromLike(color!);
        spreadRadius = Length.fromLike(spreadRadius as LengthLike);
        blurRadius = Length.fromLike(blurRadius as LengthLike);
        offsetY = Length.fromLike(offsetY as LengthLike);
        offsetX = Length.fromLike(offsetX!);
      } else {
        throw new Error(inset + ", " + offsetX + ", " + offsetY + ", " + blurRadius + ", " + spreadRadius + ", " + color);
      }
    }
    return new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, null);
  }

  static fromLike<T extends BoxShadowLike | null | undefined>(values: T): BoxShadow | Uninitable<T>;
  static fromLike(...values: BoxShadowLike[]): BoxShadow;
  static fromLike(...values: BoxShadowLike[]): BoxShadow | null {
    let value: BoxShadowLike;
    if (arguments.length === 0) {
      return null;
    } else if (arguments.length === 1) {
      value = values[0]!;
    } else {
      value = values;
    }
    if (value === void 0 || value === null || value instanceof BoxShadow) {
      return value;
    } else if (typeof value === "string") {
      return BoxShadow.parse(value);
    } else if (typeof value === "object" && (value as any).length === void 0) {
      return BoxShadow.fromInit(value as BoxShadowInit);
    } else if (typeof value === "object" && (value as any).length !== 0) {
      return BoxShadow.fromArray(value as readonly BoxShadowLike[]);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: BoxShadowInit): BoxShadow {
    const inset = init.inset || false;
    const offsetX = init.offsetX !== void 0 ? Length.fromLike(init.offsetX) : Length.zero();
    const offsetY = init.offsetY !== void 0 ? Length.fromLike(init.offsetY) : Length.zero();
    const blurRadius = init.blurRadius !== void 0 ? Length.fromLike(init.blurRadius) : Length.zero();
    const spreadRadius = init.spreadRadius !== void 0 ? Length.fromLike(init.spreadRadius) : Length.zero();
    const color = init.color !== void 0 ? Color.fromLike(init.color) : Color.black();
    return new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, null);
  }

  static fromArray(array: readonly BoxShadowLike[]): BoxShadow {
    let boxShadow = BoxShadow.fromLike(array[0]!)!;
    for (let i = 1; i < array.length; i += 1) {
      boxShadow = boxShadow.and(array[i]!);
    }
    return boxShadow;
  }

  static fromValue(value: Value): BoxShadow | null {
    let boxShadow: BoxShadow | null = null;
    value.forEach(function (item: Item, index: number): void {
      const header = item.header("boxShadow");
      if (!header.isDefined()) {
        return;
      }
      let inset: boolean | undefined;
      let offsetX: Length | undefined;
      let offsetY: Length | undefined;
      let blurRadius: Length | undefined;
      let spreadRadius: Length | undefined;
      let color: Color | undefined;
      header.forEach(function (item: Item, index: number): void {
        const key = item.key.stringValue();
        if (key !== void 0) {
          if (key === "inset") {
            inset = item.toValue().booleanValue(inset);
          } else if (key === "offsetX") {
            offsetX = item.toValue().cast(Length.form(), offsetX);
          } else if (key === "offsetY") {
            offsetY = item.toValue().cast(Length.form(), offsetY);
          } else if (key === "blurRadius") {
            blurRadius = item.toValue().cast(Length.form(), blurRadius);
          } else if (key === "spreadRadius") {
            spreadRadius = item.toValue().cast(Length.form(), spreadRadius);
          } else if (key === "color") {
            color = item.toValue().cast(Color.form(), color);
          }
        } else if (item instanceof Value) {
          if (index === 0 && item instanceof Text && item.value === "inset") {
            inset = true;
          } else if (index === 0 || index === 1 && inset !== void 0) {
            offsetX = item.cast(Length.form(), offsetX);
          } else if (index === 1 || index === 2 && inset !== void 0) {
            offsetY = item.cast(Length.form(), offsetY);
          } else if (index === 2 || index === 3 && inset !== void 0) {
            blurRadius = item.cast(Length.form(), blurRadius);
            if (blurRadius === void 0) {
              color = item.cast(Color.form(), color);
            }
          } else if ((index === 3 || index === 4 && inset === void 0) && color === void 0) {
            spreadRadius = item.cast(Length.form(), spreadRadius);
            if (spreadRadius === void 0) {
              color = item.cast(Color.form(), color);
            }
          } else if ((index === 4 || index === 5 && inset === void 0) && color === void 0) {
            color = item.cast(Color.form(), color);
          }
        }
      });
      inset = inset !== void 0 ? inset : false;
      offsetX = offsetX !== void 0 ? offsetX : Length.zero();
      offsetY = offsetY !== void 0 ? offsetY : Length.zero();
      blurRadius = blurRadius !== void 0 ? blurRadius : Length.zero();
      spreadRadius = spreadRadius !== void 0 ? spreadRadius : Length.zero();
      color = color !== void 0 ? color : Color.black();
      const next = new BoxShadow(inset || false, offsetX, offsetY, blurRadius, spreadRadius, color, null);
      if (boxShadow !== null) {
        boxShadow = boxShadow.and(next);
      } else {
        boxShadow = next;
      }
    });
    return boxShadow;
  }

  static parse(string: string): BoxShadow | null {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = BoxShadowParser.parse(input);
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
  static form(): Form<BoxShadow | null, BoxShadowLike> {
    return new BoxShadowForm(null);
  }
}

/** @internal */
export interface BoxShadowInterpolator extends Interpolator<BoxShadow> {
  /** @internal */
  readonly insetInterpolator: Interpolator<boolean>;
  /** @internal */
  readonly offsetXInterpolator: Interpolator<Length>;
  /** @internal */
  readonly offsetYInterpolator: Interpolator<Length>;
  /** @internal */
  readonly blurRadiusInterpolator: Interpolator<Length>;
  /** @internal */
  readonly spreadRadiusInterpolator: Interpolator<Length>;
  /** @internal */
  readonly colorInterpolator: Interpolator<Color>;
  /** @internal */
  readonly nextInterpolator: Interpolator<BoxShadow | null>;

  get 0(): BoxShadow;

  get 1(): BoxShadow;

  equals(that: unknown): boolean;
}

/** @internal */
export const BoxShadowInterpolator = (function (_super: typeof Interpolator) {
  const BoxShadowInterpolator = function (b0: BoxShadow, b1: BoxShadow): BoxShadowInterpolator {
    const interpolator = function (u: number): BoxShadow {
      const inset = interpolator.insetInterpolator(u);
      const offsetX = interpolator.offsetXInterpolator(u);
      const offsetY = interpolator.offsetYInterpolator(u);
      const blurRadius = interpolator.blurRadiusInterpolator(u);
      const spreadRadius = interpolator.spreadRadiusInterpolator(u);
      const color = interpolator.colorInterpolator(u);
      const next = interpolator.nextInterpolator(u);
      return new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, next);
    } as BoxShadowInterpolator;
    Object.setPrototypeOf(interpolator, BoxShadowInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).insetInterpolator = Interpolator(b0.inset, b1.inset);
    (interpolator as Mutable<typeof interpolator>).offsetXInterpolator = b0.offsetX.interpolateTo(b1.offsetX);
    (interpolator as Mutable<typeof interpolator>).offsetYInterpolator = b0.offsetY.interpolateTo(b1.offsetY);
    (interpolator as Mutable<typeof interpolator>).blurRadiusInterpolator = b0.blurRadius.interpolateTo(b1.blurRadius);
    (interpolator as Mutable<typeof interpolator>).spreadRadiusInterpolator = b0.spreadRadius.interpolateTo(b1.spreadRadius);
    (interpolator as Mutable<typeof interpolator>).colorInterpolator = b0.color.interpolateTo(b1.color);
    (interpolator as Mutable<typeof interpolator>).nextInterpolator = Interpolator(b0.next, b1.next);
    return interpolator;
  } as {
    (b0: BoxShadow, b1: BoxShadow): BoxShadowInterpolator;

    /** @internal */
    prototype: BoxShadowInterpolator;
  };

  BoxShadowInterpolator.prototype = Object.create(_super.prototype);
  BoxShadowInterpolator.prototype.constructor = BoxShadowInterpolator;

  Object.defineProperty(BoxShadowInterpolator.prototype, 0, {
    get(this: BoxShadowInterpolator): BoxShadow {
      const inset = this.insetInterpolator[0];
      const offsetX = this.offsetXInterpolator[0];
      const offsetY = this.offsetYInterpolator[0];
      const blurRadius = this.blurRadiusInterpolator[0];
      const spreadRadius = this.spreadRadiusInterpolator[0];
      const color = this.colorInterpolator[0];
      const next = this.nextInterpolator[0];
      return new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, next);
    },
    configurable: true,
  });

  Object.defineProperty(BoxShadowInterpolator.prototype, 1, {
    get(this: BoxShadowInterpolator): BoxShadow {
      const inset = this.insetInterpolator[1];
      const offsetX = this.offsetXInterpolator[1];
      const offsetY = this.offsetYInterpolator[1];
      const blurRadius = this.blurRadiusInterpolator[1];
      const spreadRadius = this.spreadRadiusInterpolator[1];
      const color = this.colorInterpolator[1];
      const next = this.nextInterpolator[1];
      return new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, next);
    },
    configurable: true,
  });

  BoxShadowInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BoxShadowInterpolator) {
      return this.insetInterpolator.equals(that.insetInterpolator)
          && this.offsetXInterpolator.equals(that.offsetXInterpolator)
          && this.offsetYInterpolator.equals(that.offsetYInterpolator)
          && this.blurRadiusInterpolator.equals(that.blurRadiusInterpolator)
          && this.spreadRadiusInterpolator.equals(that.spreadRadiusInterpolator)
          && this.colorInterpolator.equals(that.colorInterpolator)
          && this.nextInterpolator.equals(that.nextInterpolator);
    }
    return false;
  };

  return BoxShadowInterpolator;
})(Interpolator);

/** @internal */
export class BoxShadowForm extends Form<BoxShadow | null, BoxShadowLike> {
  constructor(unit: BoxShadow | null | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly unit: BoxShadow | null | undefined;

  override withUnit(unit: BoxShadow | null | undefined): Form<BoxShadow | null, BoxShadowLike> {
    if (unit === this.unit) {
      return this;
    }
    return new BoxShadowForm(unit);
  }

  override mold(boxShadow: BoxShadowLike): Item {
    let shadow = BoxShadow.fromLike(boxShadow)!;
    const record = Record.create();
    do {
      const header = Record.create(5);
      if (shadow.inset) {
        header.push("inset");
      }
      header.push(Length.form().mold(shadow.offsetX));
      header.push(Length.form().mold(shadow.offsetY));
      header.push(Length.form().mold(shadow.blurRadius));
      header.push(Length.form().mold(shadow.spreadRadius));
      header.push(Color.form().mold(shadow.color));
      record.attr("boxShadow", header);
      if (shadow.next !== null) {
        shadow = shadow.next;
        continue;
      }
      break;
    } while (true);
    return record;
  }

  override cast(item: Item): BoxShadow | null | undefined {
    const value = item.toValue();
    let boxShadow: BoxShadow | null | undefined;
    try {
      boxShadow = BoxShadow.fromValue(value);
      if (boxShadow === void 0) {
        const string = value.stringValue();
        if (string !== void 0) {
          boxShadow = BoxShadow.parse(string);
        }
      }
    } catch (e) {
      // swallow
    }
    return boxShadow;
  }
}

/** @internal */
export class BoxShadowParser extends Parser<BoxShadow | null> {
  private readonly boxShadow: BoxShadow | undefined;
  private readonly identOutput: Output<string> | undefined;
  private readonly offsetXParser: Parser<Length> | undefined;
  private readonly offsetYParser: Parser<Length> | undefined;
  private readonly blurRadiusParser: Parser<Length> | undefined;
  private readonly spreadRadiusParser: Parser<Length> | undefined;
  private readonly colorParser: Parser<Color> | undefined;
  private readonly step: number | undefined;

  constructor(boxShadow?: BoxShadow, identOutput?: Output<string>,
              offsetXParser?: Parser<Length>, offsetYParser?: Parser<Length>,
              blurRadiusParser?: Parser<Length>, spreadRadiusParser?: Parser<Length>,
              colorParser?: Parser<Color>, step?: number) {
    super();
    this.boxShadow = boxShadow;
    this.identOutput = identOutput;
    this.offsetXParser = offsetXParser;
    this.offsetYParser = offsetYParser;
    this.blurRadiusParser = blurRadiusParser;
    this.spreadRadiusParser = spreadRadiusParser;
    this.colorParser = colorParser;
    this.step = step;
  }

  override feed(input: Input): Parser<BoxShadow | null> {
    return BoxShadowParser.parse(input, this.boxShadow, this.identOutput, this.offsetXParser,
                                 this.offsetYParser, this.blurRadiusParser, this.spreadRadiusParser,
                                 this.colorParser, this.step);
  }

  static parse(input: Input, boxShadow?: BoxShadow, identOutput?: Output<string>,
               offsetXParser?: Parser<Length>, offsetYParser?: Parser<Length>,
               blurRadiusParser?: Parser<Length>, spreadRadiusParser?: Parser<Length>,
               colorParser?: Parser<Color>, step: number = 1): Parser<BoxShadow | null> {
    let c = 0;
    do {
      if (step === 1) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (input.isCont()) {
          if (Unicode.isAlpha(c)) {
            step = 2;
          } else {
            step = 4;
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 2) {
        identOutput = identOutput || Unicode.stringOutput();
        while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
          input = input.step();
          identOutput.write(c);
        }
        if (!input.isEmpty()) {
          const ident = identOutput.bind();
          switch (ident) {
            case "inset": step = 3; break;
            case "none": return Parser.done(null);
            default: return Parser.error(Diagnostic.message("unknown box-shadow: " + ident, input));
          }
        }
      }
      if (step === 3) {
        if (input.isCont()) {
          if (Unicode.isSpace(input.head())) {
            input.step();
            step = 4;
          } else {
            return Parser.error(Diagnostic.expected("space", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 4) {
        if (offsetXParser === void 0) {
          while (input.isCont() && Unicode.isSpace(input.head())) {
            input.step();
          }
          if (!input.isEmpty()) {
            offsetXParser = LengthParser.parse(input);
          }
        } else {
          offsetXParser = offsetXParser.feed(input);
        }
        if (offsetXParser !== void 0) {
          if (offsetXParser.isDone()) {
            step = 5;
          } else if (offsetXParser.isError()) {
            return offsetXParser.asError();
          }
        }
      }
      if (step === 5) {
        if (input.isCont()) {
          if (Unicode.isSpace(input.head())) {
            input.step();
            step = 6;
          } else {
            return Parser.error(Diagnostic.expected("space", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 6) {
        if (offsetYParser === void 0) {
          while (input.isCont() && Unicode.isSpace(input.head())) {
            input.step();
          }
          if (!input.isEmpty()) {
            offsetYParser = LengthParser.parse(input);
          }
        } else {
          offsetYParser = offsetYParser.feed(input);
        }
        if (offsetYParser !== void 0) {
          if (offsetYParser.isDone()) {
            step = 7;
          } else if (offsetYParser.isError()) {
            return offsetYParser.asError();
          }
        }
      }
      if (step === 7) {
        if (input.isCont()) {
          if (Unicode.isSpace(input.head())) {
            input.step();
            step = 8;
          } else {
            return Parser.error(Diagnostic.expected("space", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 8) {
        if (blurRadiusParser === void 0) {
          while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
            input.step();
          }
          if (input.isCont() && (c === 45/*'-'*/ || c >= 48/*'0'*/ && c <= 57/*'9'*/)) {
            blurRadiusParser = LengthParser.parse(input);
          } else if (!input.isEmpty()) {
            step = 12;
          }
        } else {
          blurRadiusParser = blurRadiusParser.feed(input);
        }
        if (blurRadiusParser !== void 0) {
          if (blurRadiusParser.isDone()) {
            step = 9;
          } else if (blurRadiusParser.isError()) {
            return blurRadiusParser.asError();
          }
        }
      }
      if (step === 9) {
        if (input.isCont()) {
          if (Unicode.isSpace(input.head())) {
            input.step();
            step = 10;
          } else {
            return Parser.error(Diagnostic.expected("space", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 10) {
        if (spreadRadiusParser === void 0) {
          while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
            input.step();
          }
          if (input.isCont() && (c === 45/*'-'*/ || c >= 48/*'0'*/ && c <= 57/*'9'*/)) {
            spreadRadiusParser = LengthParser.parse(input);
          } else if (!input.isEmpty()) {
            step = 12;
          }
        } else {
          spreadRadiusParser = spreadRadiusParser.feed(input);
        }
        if (spreadRadiusParser !== void 0) {
          if (spreadRadiusParser.isDone()) {
            step = 11;
          } else if (spreadRadiusParser.isError()) {
            return spreadRadiusParser.asError();
          }
        }
      }
      if (step === 11) {
        if (input.isCont()) {
          if (Unicode.isSpace(input.head())) {
            input.step();
            step = 12;
          } else {
            return Parser.error(Diagnostic.expected("space", input));
          }
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step === 12) {
        if (colorParser === void 0) {
          while (input.isCont() && Unicode.isSpace(input.head())) {
            input.step();
          }
          if (!input.isEmpty()) {
            colorParser = ColorParser.parse(input);
          }
        } else {
          colorParser = colorParser.feed(input);
        }
        if (colorParser !== void 0) {
          if (colorParser.isDone()) {
            const inset = identOutput !== void 0 ? identOutput.bind() === "inset" : false;
            const offsetX = offsetXParser!.bind();
            const offsetY = offsetYParser!.bind();
            const blurRadius = blurRadiusParser !== void 0 ? blurRadiusParser.bind() : Length.zero();
            const spreadRadius = spreadRadiusParser !== void 0 ? spreadRadiusParser.bind() : Length.zero();
            const color = colorParser!.bind();
            const next = new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, null);
            if (boxShadow === void 0) {
              boxShadow = next;
            } else {
              boxShadow = boxShadow.and(next);
            }
            identOutput = void 0;
            offsetXParser = void 0;
            offsetYParser = void 0;
            blurRadiusParser = void 0;
            spreadRadiusParser = void 0;
            colorParser = void 0;
            step = 13;
          } else if (colorParser.isError()) {
            return colorParser.asError();
          }
        }
      }
      if (step === 13) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (input.isCont() && c === 44/*','*/) {
          input.step();
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.done(boxShadow!);
        }
      }
      break;
    } while (true);
    return new BoxShadowParser(boxShadow, identOutput, offsetXParser, offsetYParser,
                               blurRadiusParser, spreadRadiusParser, colorParser, step);
  }
}
