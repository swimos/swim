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

import type {Proto} from "@swim/util";
import {Objects} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import type {Fastener} from "@swim/component";
import {Length} from "@swim/math";
import {Transform} from "@swim/math";
import {Color} from "@swim/style";
import type {ThemeAnimatorDescriptor} from "@swim/theme";
import type {ThemeAnimatorClass} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import type {Look} from "@swim/theme";

/** @public */
export interface AttributeContext {
  getAttribute(attributeName: string): string | null;

  setAttribute(attributeName: string, value: unknown): this;
}

/** @public */
export const AttributeContext = {
  [Symbol.hasInstance](instance: unknown): instance is AttributeContext {
    return Objects.hasAllKeys<AttributeContext>(instance, "getAttribute", "setAttribute");
  },
};

/** @public */
export interface AttributeAnimatorDescriptor<R, T> extends ThemeAnimatorDescriptor<R, T> {
  extends?: Proto<AttributeAnimator<any, any, any>> | boolean | null;
  attributeName?: string;
}

/** @public */
export interface AttributeAnimatorClass<A extends AttributeAnimator<any, any, any> = AttributeAnimator<any, any, any>> extends ThemeAnimatorClass<A> {
}

/** @public */
export interface AttributeAnimator<R = any, T = any, I extends any[] = [Look<NonNullable<T>> | T]> extends ThemeAnimator<R, T, I> {
  /** @override */
  get descriptorType(): Proto<AttributeAnimatorDescriptor<R, T>>;

  get attributeName(): string;

  get attributeValue(): T;

  getAttributeValue(): NonNullable<T>;

  /** @override @protected */
  onSetValue(newValue: T, oldValue: T): void;

  parse(value: string): T;
}

/** @public */
export const AttributeAnimator = (<R, T, I extends any[], A extends AttributeAnimator<any, any, any>>() => ThemeAnimator.extend<AttributeAnimator<R, T, I>, AttributeAnimatorClass<A>>("AttributeAnimator", {
  get attributeName(): string {
    throw new Error("no attribute name");
  },

  get attributeValue(): T {
    if (AttributeContext[Symbol.hasInstance](this.owner)) {
      const value = this.owner.getAttribute(this.attributeName);
      if (value !== null) {
        try {
          return this.parse(value);
        } catch (e) {
          // swallow parse errors
        }
      }
    }
    return (Object.getPrototypeOf(this) as AttributeAnimator<R, T, I>).value;
  },

  getAttributeValue(): NonNullable<T> {
    const attributeValue = this.attributeValue;
    if (attributeValue === void 0 || attributeValue === null) {
      let message = attributeValue + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "attribute value";
      throw new TypeError(message);
    }
    return attributeValue as NonNullable<T>;
  },

  onSetValue(newValue: T, oldValue: T): void {
    if (AttributeContext[Symbol.hasInstance](this.owner)) {
      this.owner.setAttribute(this.attributeName, newValue);
    }
    super.onSetValue(newValue, oldValue);
  },

  parse(): T {
    throw new Error();
  },
},
{
  construct(animator: A | null, owner: A extends Fastener<infer R, any, any> ? R : never): A {
    animator = super.construct(animator, owner) as A;
    return animator;
  },

  specialize(template: A extends {readonly descriptorType?: Proto<infer D>} ? D : never): FastenerClass<A> {
    let superClass = template.extends as FastenerClass<A> | null | undefined;
    if (superClass === void 0 || superClass === null) {
      const valueType = template.valueType;
      if (valueType === String) {
        superClass = StringAttributeAnimator as unknown as FastenerClass<A>;
      } else if (valueType === Number) {
        superClass = NumberAttributeAnimator as unknown as FastenerClass<A>;
      } else if (valueType === Boolean) {
        superClass = BooleanAttributeAnimator as unknown as FastenerClass<A>;
      } else if (valueType === Length) {
        superClass = LengthAttributeAnimator as unknown as FastenerClass<A>;
      } else if (valueType === Color) {
        superClass = ColorAttributeAnimator as unknown as FastenerClass<A>;
      } else if (valueType === Transform) {
        superClass = TransformAttributeAnimator as unknown as FastenerClass<A>;
      } else {
        superClass = this;
      }
    }
    return superClass;
  },
}))();

/** @internal */
export interface StringAttributeAnimator<R = any, T extends string | undefined = string | undefined, I extends any[] = [Look<NonNullable<T>> | T]> extends AttributeAnimator<R, T, I> {
}

/** @internal */
export const StringAttributeAnimator = (<R, T extends string | undefined, I extends any[], A extends StringAttributeAnimator<any, any, any>>() => AttributeAnimator.extend<StringAttributeAnimator<R, T, I>, AttributeAnimatorClass<A>>("StringAttributeAnimator", {
  valueType: String,

  equalValues(newValue: T, oldValue: T): boolean {
    return newValue === oldValue;
  },

  parse(value: string): T {
    return value as T;
  },

  fromLike(value: T | LikeType<T>): T {
    return value as T;
  },
}))();

/** @internal */
export interface NumberAttributeAnimator<R = any, T extends number | undefined = number | undefined, I extends any[] = [Look<NonNullable<T>> | T]> extends AttributeAnimator<R, T, I> {
}

/** @internal */
export const NumberAttributeAnimator = (<R, T extends number | undefined, I extends any[], A extends NumberAttributeAnimator<any, any, any>>() => AttributeAnimator.extend<NumberAttributeAnimator<R, T, I>, AttributeAnimatorClass<A>>("NumberAttributeAnimator", {
  valueType: Number,

  equalValues(newValue: T, oldValue: T): boolean {
    return newValue === oldValue;
  },

  parse(value: string): T {
    const number = +value;
    return isFinite(number) ? number as T : void 0 as T;
  },

  fromLike(value: T | LikeType<T>): T {
    if (typeof value === "number") {
      return value as T;
    }
    const number = +(value as any);
    return isFinite(number) ? number as T : void 0 as T;
  },
}))();

/** @internal */
export interface BooleanAttributeAnimator<R = any, T extends boolean | undefined = boolean | undefined, I extends any[] = [Look<NonNullable<T>> | T]> extends AttributeAnimator<R, T, I> {
}

/** @internal */
export const BooleanAttributeAnimator = (<R, T extends boolean | undefined, I extends any[], A extends BooleanAttributeAnimator<any, any, any>>() => AttributeAnimator.extend<BooleanAttributeAnimator<R, T, I>, AttributeAnimatorClass<A>>("BooleanAttributeAnimator", {
  valueType: Boolean,

  equalValues(newValue: T, oldValue: T): boolean {
    return newValue === oldValue;
  },

  parse(value: string): T {
    return !!value as T;
  },

  fromLike(value: T | LikeType<T>): T {
    return !!value as T;
  },
}))();

/** @internal */
export interface LengthAttributeAnimator<R = any, T extends Length | null | undefined = Length | null, I extends any[] = [Look<NonNullable<T>> | T]> extends AttributeAnimator<R, T, I> {
}

/** @internal */
export const LengthAttributeAnimator = (<R, T extends Length | null | undefined, I extends any[], A extends LengthAttributeAnimator<any, any, any>>() => AttributeAnimator.extend<LengthAttributeAnimator<R, T, I>, AttributeAnimatorClass<A>>("LengthAttributeAnimator", {
  valueType: Length,
  value: null as T,

  equalValues(newValue: T, oldValue: T): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldValue);
    }
    return newValue === oldValue;
  },

  parse(value: string): T {
    return Length.parse(value) as T;
  },

  fromLike(value: T | LikeType<T>): T {
    try {
      return Length.fromLike(value) as T;
    } catch (swallow) {
      return null as T;
    }
  },
}))();

/** @internal */
export interface ColorAttributeAnimator<R = any, T extends Color | null | undefined = Color | null, I extends any[] = [Look<NonNullable<T>> | T]> extends AttributeAnimator<R, T, I> {
}

/** @internal */
export const ColorAttributeAnimator = (<R, T extends Color | null | undefined, I extends any[], A extends ColorAttributeAnimator<any, any, any>>() => AttributeAnimator.extend<ColorAttributeAnimator<R, T, I>, AttributeAnimatorClass<A>>("ColorAttributeAnimator", {
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

/** @internal */
export interface TransformAttributeAnimator<R = any, T extends Transform | null | undefined = Transform | null, I extends any[] = [Look<NonNullable<T>> | T]> extends AttributeAnimator<R, T, I> {
}

/** @internal */
export const TransformAttributeAnimator = (<R, T extends Transform | null | undefined, I extends any[], A extends TransformAttributeAnimator<any, any, any>>() => AttributeAnimator.extend<TransformAttributeAnimator<R, T, I>, AttributeAnimatorClass<A>>("TransformAttributeAnimator", {
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

  fromLike(value: T | LikeType<T>): T {
    try {
      return Transform.fromLike(value) as T;
    } catch (swallow) {
      return null as T;
    }
  },
}))();
