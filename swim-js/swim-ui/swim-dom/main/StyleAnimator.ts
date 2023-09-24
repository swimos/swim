// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Proto} from "@swim/util";
import {Objects} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import type {Fastener} from "@swim/component";
import type {LengthUnits} from "@swim/math";
import type {LengthBasis} from "@swim/math";
import {Length} from "@swim/math";
import {PxLength} from "@swim/math";
import {EmLength} from "@swim/math";
import {RemLength} from "@swim/math";
import {PctLength} from "@swim/math";
import {Transform} from "@swim/math";
import {FontFamily} from "@swim/style";
import {Font} from "@swim/style";
import {Color} from "@swim/style";
import {BoxShadow} from "@swim/style";
import type {ThemeAnimatorDescriptor} from "@swim/theme";
import type {ThemeAnimatorClass} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import type {Look} from "@swim/theme";

/** @public */
export interface StyleContext {
  readonly node?: Node;

  getStyle(propertyNames: string | readonly string[]): CSSStyleValue | string | undefined;

  setStyle(propertyName: string, value: unknown, priority?: string): this;
}

/** @public */
export const StyleContext = {
  [Symbol.hasInstance](instance: unknown): instance is StyleContext {
    return Objects.hasAllKeys<StyleContext>(instance, "getStyle", "setStyle");
  },
};

/** @public */
export interface StyleAnimatorDescriptor<R, T> extends ThemeAnimatorDescriptor<R, T> {
  extends?: Proto<StyleAnimator<any, any, any>> | boolean | null;
  propertyNames?: string | readonly string[];
  priority?: string;
}

/** @public */
export interface StyleAnimatorClass<A extends StyleAnimator<any, any, any> = StyleAnimator> extends ThemeAnimatorClass<A> {
}

/** @public */
export interface StyleAnimator<R = any, T = any, I extends any[] = [Look<NonNullable<T>> | T]> extends ThemeAnimator<R, T, I> {
  /** @override */
  get descriptorType(): Proto<StyleAnimatorDescriptor<R, T>>;

  get propertyNames(): string | readonly string[];

  get propertyValue(): T;

  getPropertyValue(): NonNullable<T>;

  get computedValue(): T;

  get cssValue(): T;

  getCssValue(): NonNullable<T>;

  get cssState(): T;

  getCssState(): NonNullable<T>;

  /** @override @protected */
  onSetValue(newValue: T, oldValue: T): void;

  initPriority(): string | undefined;

  get priority(): string | undefined;

  setPriority(priority: string | undefined): void;

  /** @internal */
  applyStyle(value: T, priority: string | undefined): void;

  parse(value: string): T;

  fromCssValue(value: CSSStyleValue): T;
}

/** @public */
export const StyleAnimator = (<R, T, I extends any[], A extends StyleAnimator<any, any, any>>() => ThemeAnimator.extend<StyleAnimator<R, T, I>, StyleAnimatorClass<A>>("StyleAnimator", {
  get propertyNames(): string | readonly string[] {
    throw new Error("no property names");
  },

  get propertyValue(): T {
    if (StyleContext[Symbol.hasInstance](this.owner)) {
      let value: T | CSSStyleValue | string | undefined = this.owner.getStyle(this.propertyNames);
      if (typeof CSSStyleValue !== "undefined" && value instanceof CSSStyleValue) { // CSS Typed OM support
        try {
          value = this.fromCssValue(value);
        } catch (e) {
          value = "" + value; // coerce to string on decode error
        }
      }
      if (typeof value === "string" && value.length !== 0) {
        try {
          return this.parse(value);
        } catch (e) {
          // swallow parse errors
        }
      }
    }
    return (Object.getPrototypeOf(this) as StyleAnimator<R, T, I>).value;
  },

  getPropertyValue(): NonNullable<T> {
    const propertyValue = this.propertyValue;
    if (propertyValue === void 0 || propertyValue === null) {
      let message = propertyValue + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "property value";
      throw new TypeError(message);
    }
    return propertyValue as NonNullable<T>;
  },

  get computedValue(): T {
    let computedValue: T | undefined;
    const node = StyleContext[Symbol.hasInstance](this.owner) ? this.owner.node : void 0;
    if (node instanceof Element) {
      const styles = getComputedStyle(node);
      const propertyNames = this.propertyNames;
      let propertyValue = "";
      if (typeof propertyNames === "string") {
        propertyValue = styles.getPropertyValue(propertyNames);
      } else {
        for (let i = 0; i < propertyNames.length && propertyValue.length === 0; i += 1) {
          propertyValue = styles.getPropertyValue(propertyNames[i]!);
        }
      }
      if (propertyValue.length !== 0) {
        try {
          computedValue = this.parse(propertyValue);
        } catch (e) {
          // swallow parse errors
        }
      }
    }
    if (computedValue === void 0) {
      computedValue = (Object.getPrototypeOf(this) as StyleAnimator<R, T, I>).value;
    }
    return computedValue;
  },

  get cssValue(): T {
    const value = this.value;
    if (!this.definedValue(value)) {
      return this.computedValue;
    }
    return value;
  },

  getCssValue(): NonNullable<T> {
    const cssValue = this.cssValue;
    if (cssValue === void 0 || cssValue === null) {
      let message = cssValue + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "css value";
      throw new TypeError(message);
    }
    return cssValue as NonNullable<T>;
  },

  get cssState(): T {
    const state = this.state;
    if (!this.definedValue(state)) {
      return this.computedValue;
    }
    return state;
  },

  getCssState(): NonNullable<T> {
    const cssState = this.cssState;
    if (cssState === void 0 || cssState === null) {
      let message = cssState + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "css state";
      throw new TypeError(message);
    }
    return cssState as NonNullable<T>;
  },

  onSetValue(newValue: T, oldValue: T): void {
    this.applyStyle(newValue, this.priority);
    super.onSetValue(newValue, oldValue);
  },

  priority: void 0,

  initPriority(): string | undefined {
    return (Object.getPrototypeOf(this) as StyleAnimator<R, T, I>).priority;
  },

  setPriority(priority: string | undefined): void {
    (this as Mutable<typeof this>).priority = priority;
    this.applyStyle(this.value, priority);
  },

  applyStyle(value: T, priority: string | undefined): void {
    if (!StyleContext[Symbol.hasInstance](this.owner)) {
      return;
    }
    const propertyNames = this.propertyNames;
    if (typeof propertyNames === "string") {
      this.owner.setStyle(propertyNames, value, priority);
    } else {
      for (let i = 0; i <  propertyNames.length; i += 1) {
        this.owner.setStyle(propertyNames[i]!, value, priority);
      }
    }
  },

  parse(): T {
    throw new Error("abstract");
  },

  fromCssValue(value: CSSStyleValue): T {
    throw new Error("unsupported");
  },
},
{
  construct(animator: A | null, owner: A extends Fastener<infer R, any, any> ? R : never): A {
    animator = super.construct(animator, owner) as A;
    (animator as Mutable<typeof animator>).priority = animator.initPriority();
    return animator;
  },

  specialize(template: A extends {readonly descriptorType?: Proto<infer D>} ? D : never): FastenerClass<A> {
    let superClass = template.extends as FastenerClass<A> | null | undefined;
    if (superClass === void 0 || superClass === null) {
      const valueType = template.valueType;
      if (valueType === String) {
        superClass = StringStyleAnimator as unknown as FastenerClass<A>;
      } else if (valueType === Number) {
        superClass = NumberStyleAnimator as unknown as FastenerClass<A>;
      } else if (valueType === Length) {
        superClass = LengthStyleAnimator as unknown as FastenerClass<A>;
      } else if (valueType === Color) {
        superClass = ColorStyleAnimator as unknown as FastenerClass<A>;
      } else if (valueType === FontFamily) {
        superClass = FontFamilyStyleAnimator as unknown as FastenerClass<A>;
      } else if (valueType === BoxShadow) {
        superClass = BoxShadowStyleAnimator as unknown as FastenerClass<A>;
      } else if (valueType === Transform) {
        superClass = TransformStyleAnimator as unknown as FastenerClass<A>;
      } else {
        superClass = this;
      }
    }
    return superClass;
  },
}))();

/** @public */
export interface StringStyleAnimator<R = any, T extends string | undefined = string | undefined, I extends any[] = [Look<NonNullable<T>> | T]> extends StyleAnimator<R, T, I> {
}

/** @public */
export const StringStyleAnimator = (<R, T extends string | undefined, I extends any[], A extends StringStyleAnimator<any, any, any>>() => StyleAnimator.extend<StringStyleAnimator<R, T, I>, StyleAnimatorClass<A>>("StringStyleAnimator", {
  valueType: String,

  equalValues(newValue: T, oldValue: T): boolean {
    return newValue === oldValue;
  },

  parse(value: string): T {
    return value as T;
  },

  fromCssValue(value: CSSStyleValue): T {
    return value.toString() as T;
  },

  fromLike(value: T | LikeType<T>): T {
    return value as T;
  },
}))();

/** @public */
export interface NumberStyleAnimator<R = any, T extends number | undefined = number | undefined, I extends any[] = [Look<NonNullable<T>> | T]> extends StyleAnimator<R, T, I> {
}

/** @public */
export const NumberStyleAnimator = (<R, T extends number | undefined, I extends any[], A extends NumberStyleAnimator<any, any, any>>() => StyleAnimator.extend<NumberStyleAnimator<R, T, I>, StyleAnimatorClass<A>>("NumberStyleAnimator", {
  valueType: Number,

  equalValues(newValue: T, oldValue: T): boolean {
    return newValue === oldValue;
  },

  parse(value: string): T {
    const number = +value;
    return isFinite(number) ? number as T : void 0 as T;
  },

  fromCssValue(value: CSSStyleValue): T {
    if (value instanceof CSSNumericValue) {
      return value.to("number").value as T;
    }
    return void 0 as T;
  },

  fromLike(value: T | LikeType<T>): T {
    if (typeof value === "number") {
      return value as T;
    }
    const number = +(value as any);
    return isFinite(number) ? number as T : void 0 as T;
  },
}))();

/** @public */
export interface LengthStyleAnimator<R = any, T extends Length | null | undefined = Length | null, I extends any[] = [Look<NonNullable<T>> | T]> extends StyleAnimator<R, T, I>, LengthBasis {
  get units(): LengthUnits | undefined;

  pxValue(basis?: LengthBasis | number, defaultValue?: number): number;

  emValue(basis?: LengthBasis | number, defaultValue?: number): number;

  remValue(basis?: LengthBasis | number, defaultValue?: number): number;

  pctValue(basis?: LengthBasis | number, defaultValue?: number): number;

  pxState(basis?: LengthBasis | number, defaultValue?: number): number;

  emState(basis?: LengthBasis | number, defaultValue?: number): number;

  remState(basis?: LengthBasis | number, defaultValue?: number): number;

  pctState(basis?: LengthBasis | number, defaultValue?: number): number;

  px(basis?: LengthBasis | number, defaultValue?: number): PxLength;

  em(basis?: LengthBasis | number, defaultValue?: number): EmLength;

  rem(basis?: LengthBasis | number, defaultValue?: number): RemLength;

  pct(basis?: LengthBasis | number, defaultValue?: number): PctLength;

  to(units: LengthUnits, basis?: LengthBasis | number, defaultValue?: number): Length;

  /** @override */
  get emUnit(): Node | number | undefined;

  /** @override */
  get remUnit(): number | undefined;

  /** @override */
  get pctUnit(): number | undefined;

  /** @override */
  parse(value: string): T;

  /** @override */
  fromCssValue(value: CSSStyleValue): T;

  /** @override */
  equalValues(newValue: T, oldValue: T | undefined): boolean;

  /** @override */
  fromLike(value: T | LikeType<T>): T;
}

/** @public */
export const LengthStyleAnimator = (<R, T extends Length | null | undefined, I extends any[], A extends LengthStyleAnimator<any, any, any>>() => StyleAnimator.extend<LengthStyleAnimator<R, T, I>, StyleAnimatorClass<A>>("LengthStyleAnimator", {
  valueType: Length,
  value: null as T,

  get units(): LengthUnits | undefined {
    const value = this.cssValue;
    return value !== void 0 && value !== null ? value.units : void 0;
  },

  pxValue(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.pxValue(basis);
  },

  emValue(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.emValue(basis);
  },

  remValue(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.remValue(basis);
  },

  pctValue(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.pctValue(basis);
  },

  pxState(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssState;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.pxValue(basis);
  },

  emState(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssState;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.emValue(basis);
  },

  remState(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssState;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.remValue(basis);
  },

  pctState(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssState;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.pctValue(basis);
  },

  px(basis?: LengthBasis | number, defaultValue?: number): PxLength {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return PxLength.of(defaultValue !== void 0 ? defaultValue : 0);
    } else if (basis === void 0) {
      basis = this;
    }
    return value.px(basis);
  },

  em(basis?: LengthBasis | number, defaultValue?: number): EmLength {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return EmLength.of(defaultValue !== void 0 ? defaultValue : 0);
    } else if (basis === void 0) {
      basis = this;
    }
    return value.em(basis);
  },

  rem(basis?: LengthBasis | number, defaultValue?: number): RemLength {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return RemLength.of(defaultValue !== void 0 ? defaultValue : 0);
    } else if (basis === void 0) {
      basis = this;
    }
    return value.rem(basis);
  },

  pct(basis?: LengthBasis | number, defaultValue?: number): PctLength {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return PctLength.of(defaultValue !== void 0 ? defaultValue : 0);
    } else if (basis === void 0) {
      basis = this;
    }
    return value.pct(basis);
  },

  to(units: LengthUnits, basis?: LengthBasis | number, defaultValue?: number): Length {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return Length.of(defaultValue !== void 0 ? defaultValue : 0, units);
    } else if (basis === void 0) {
      basis = this;
    }
    return value.to(units, basis);
  },

  get emUnit(): Node | number | undefined {
    if (StyleContext[Symbol.hasInstance](this.owner)) {
      const node = this.owner.node;
      if (node !== void 0) {
        return node;
      }
    }
    return 0;
  },

  get remUnit(): number {
    return 0;
  },

  get pctUnit(): number {
    return 0;
  },

  equalValues(newValue: T, oldValue: T): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldValue);
    }
    return newValue === oldValue;
  },

  parse(value: string): T {
    return Length.parse(value) as T;
  },

  fromCssValue(value: CSSStyleValue): T {
    return Length.fromCssValue(value) as T;
  },

  fromLike(value: T | LikeType<T>): T {
    try {
      return Length.fromLike(value) as T;
    } catch (swallow) {
      return null as T;
    }
  },
}))();

/** @public */
export interface ColorStyleAnimator<R = any, T extends Color | null | undefined = Color | null, I extends any[] = [Look<NonNullable<T>> | T]> extends StyleAnimator<R, T, I> {
}

/** @public */
export const ColorStyleAnimator = (<R, T extends Color | null | undefined, I extends any[], A extends ColorStyleAnimator<any, any, any>>() => StyleAnimator.extend<ColorStyleAnimator<R, T, I>, StyleAnimatorClass<A>>("ColorStyleAnimator", {
  valueType: Color,
  value: null as T,

  equalValues(newValue: T, oldValue: T): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldValue);
    }
    return newValue === oldValue;
  },

  parse(value: string): T {
    return Color.parse(value) as T;
  },

  fromLike(value: T | LikeType<T>): T {
    try {
      return Color.fromLike(value) as T;
    } catch (swallow) {
      return null as T;
    }
  },
}))();

/** @public */
export interface FontFamilyStyleAnimator<R = any, T extends FontFamily | readonly FontFamily[] | undefined = FontFamily | readonly FontFamily[] | undefined, I extends any[] = [Look<NonNullable<T>> | T]> extends StyleAnimator<R, T, I> {
}

/** @public */
export const FontFamilyStyleAnimator = (<R, T extends FontFamily | readonly FontFamily[] | undefined, I extends any[], A extends FontFamilyStyleAnimator<any, any, any>>() => StyleAnimator.extend<FontFamilyStyleAnimator<R, T, I>, StyleAnimatorClass<A>>("FontFamilyStyleAnimator", {
  valueType: FontFamily,

  parse(value: string): T {
    return Font.parse(value).family as T;
  },

  fromLike(value: T | LikeType<T>): T {
    return Font.family(value as FontFamily | readonly FontFamily[]).family as T;
  },
}))();

/** @public */
export interface BoxShadowStyleAnimator<R = any, T extends BoxShadow | null | undefined = BoxShadow | null, I extends any[] = [Look<NonNullable<T>> | T]> extends StyleAnimator<R, T, I> {
}

/** @public */
export const BoxShadowStyleAnimator = (<R, T extends BoxShadow | null | undefined, I extends any[], A extends BoxShadowStyleAnimator<any, any, any>>() => StyleAnimator.extend<BoxShadowStyleAnimator<R, T, I>, StyleAnimatorClass<A>>("BoxShadowStyleAnimator", {
  valueType: BoxShadow,
  value: null as T,

  equalValues(newValue: T, oldValue: T): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldValue);
    }
    return newValue === oldValue;
  },

  parse(value: string): T {
    return BoxShadow.parse(value) as T;
  },

  fromLike(value: T | LikeType<T>): T {
    try {
      return BoxShadow.fromLike(value) as T;
    } catch (swallow) {
      return null as T;
    }
  },
}))();

/** @public */
export interface TransformStyleAnimator<R = any, T extends Transform | null | undefined = Transform | null, I extends any[] = [Look<NonNullable<T>> | T]> extends StyleAnimator<R, T, I> {
}

/** @public */
export const TransformStyleAnimator = (<R, T extends Transform | null | undefined, I extends any[], A extends TransformStyleAnimator<any, any, any>>() => StyleAnimator.extend<TransformStyleAnimator<R, T, I>, StyleAnimatorClass<A>>("TransformStyleAnimator", {
  valueType: Transform,
  value: null as T,

  equalValues(newValue: T, oldValue: T): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldValue);
    }
    return newValue === oldValue;
  },

  parse(value: string): T {
    return Transform.parse(value) as T;
  },

  fromCssValue(value: CSSStyleValue): T {
    return Transform.fromCssValue(value) as T;
  },

  fromLike(value: T | LikeType<T>): T {
    try {
      return Transform.fromLike(value) as T;
    } catch (swallow) {
      return null as T;
    }
  },
}))();
