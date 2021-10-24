// Copyright 2015-2021 Swim Inc.
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

import {Mutable, FromAny} from "@swim/util";
import {Affinity, FastenerOwner} from "@swim/fastener";
import {AnyLength, Length, AnyTransform, Transform} from "@swim/math";
import {FontFamily, AnyColor, Color, AnyBoxShadow, BoxShadow} from "@swim/style";
import {ThemeAnimatorInit, ThemeAnimatorClass, ThemeAnimator} from "@swim/theme";
import {StringStyleAnimator} from "./"; // forward import
import {NumberStyleAnimator} from "./"; // forward import
import {LengthStyleAnimator} from "./"; // forward import
import {ColorStyleAnimator} from "./"; // forward import
import {FontFamilyStyleAnimator} from "./"; // forward import
import {TransformStyleAnimator} from "./"; // forward import
import {BoxShadowStyleAnimator} from "./"; // forward import
import {StyleContext} from "../"; // forward import

export interface StyleAnimatorInit<T = unknown, U = never> extends ThemeAnimatorInit<T, U> {
  extends?: {prototype: StyleAnimator<any, any>} | string | boolean | null;
  propertyNames: string | ReadonlyArray<string>;

  parse?(value: string): T;
  fromCssValue?(value: CSSStyleValue): T;
}

export type StyleAnimatorDescriptor<O = unknown, T = unknown, U = never, I = {}> = ThisType<StyleAnimator<O, T, U> & I> & StyleAnimatorInit<T, U> & Partial<I>;

export interface StyleAnimatorClass<A extends StyleAnimator<any, any> = StyleAnimator<any, any, any>> extends ThemeAnimatorClass<A> {
}

export interface StyleAnimatorFactory<A extends StyleAnimator<any, any> = StyleAnimator<any, any, any>> extends StyleAnimatorClass<A> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): StyleAnimatorFactory<A> & I;

  specialize(type: unknown): StyleAnimatorFactory | null;

  define<O, T, U = never>(className: string, descriptor: StyleAnimatorDescriptor<O, T, U>): StyleAnimatorFactory<StyleAnimator<any, T, U>>;
  define<O, T, U = never, I = {}>(className: string, descriptor: StyleAnimatorDescriptor<O, T, U, I>): StyleAnimatorFactory<StyleAnimator<any, T, U> & I>;

  <O, T extends Length | null | undefined = Length | null | undefined, U extends AnyLength | null | undefined = AnyLength | null | undefined>(descriptor: {type: typeof Length} & StyleAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends Color | null | undefined = Color | null | undefined, U extends AnyColor | null | undefined = AnyColor | null | undefined>(descriptor: {type: typeof Color} & StyleAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends BoxShadow | null | undefined = BoxShadow | null | undefined, U extends AnyBoxShadow | null | undefined = AnyBoxShadow | null | undefined>(descriptor: {type: typeof BoxShadow} & StyleAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends Transform | null | undefined = Transform | null | undefined, U extends AnyTransform | null | undefined = AnyTransform | null | undefined>(descriptor: {type: typeof Transform} & StyleAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends FontFamily | ReadonlyArray<FontFamily> | null | undefined = FontFamily | ReadonlyArray<FontFamily> | null | undefined, U extends FontFamily | ReadonlyArray<FontFamily> | null | undefined = FontFamily | ReadonlyArray<FontFamily> | null | undefined>(descriptor: {type: typeof FontFamily} & StyleAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends string | null | undefined = string | null | undefined, U extends string | null | undefined = string | null | undefined>(descriptor: {type: typeof String} & StyleAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends number | null | undefined = number | null | undefined, U extends number | string | null | undefined = number | string | null | undefined>(descriptor: {type: typeof Number} & StyleAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = never>(descriptor: ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & StyleAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = never>(descriptor: StyleAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = never, I = {}>(descriptor: StyleAnimatorDescriptor<O, T, U, I>): PropertyDecorator;
}

export interface StyleAnimator<O = unknown, T = unknown, U = never> extends ThemeAnimator<O, T, U> {
  get propertyNames(): string | ReadonlyArray<string>; // prototype property

  get propertyValue(): T | undefined;

  /** @internal */
  readonly ownValue: T;

  get value(): T;
  set value(value: T);

  /** @override @protected */
  onSetValue(newValue: T, oldValue: T): void;

  readonly priority: string | undefined;

  setPriority(priority: string | undefined): void;

  parse(value: string): T;

  fromCssValue(value: CSSStyleValue): T;
}

export const StyleAnimator = (function (_super: typeof ThemeAnimator) {
  const StyleAnimator: StyleAnimatorFactory = _super.extend("StyleAnimator");

  Object.defineProperty(StyleAnimator.prototype, "propertyNames", {
    get(this: StyleAnimator): string | ReadonlyArray<string> {
      throw new Error("no property names");
    },
    configurable: true,
  });

  Object.defineProperty(StyleAnimator.prototype, "propertyValue", {
    get: function <T>(this: StyleAnimator<unknown, T>): T | undefined {
      let propertyValue: T | undefined;
      const styleContext = this.owner;
      if (StyleContext.is(styleContext)) {
        let value = styleContext.getStyle(this.propertyNames);
        if (typeof CSSStyleValue !== "undefined" && value instanceof CSSStyleValue) { // CSS Typed OM support
          try {
            propertyValue = this.fromCssValue(value);
          } catch (e) {
            // swallow decode errors
          }
          if (propertyValue === void 0) {
            value = value.toString();
          }
        }
        if (typeof value === "string" && value !== "") {
          try {
            propertyValue = this.parse(value);
          } catch (e) {
            // swallow parse errors
          }
        }
      }
      return propertyValue;
    },
    configurable: true,
  });

  Object.defineProperty(StyleAnimator.prototype, "value", {
    get<T>(this: StyleAnimator<unknown, T>): T {
      let value = this.ownValue;
      if (!this.isDefined(value)) {
        const propertyValue = this.propertyValue;
        if (propertyValue !== void 0) {
          value = propertyValue;
          this.setAffinity(Affinity.Extrinsic);
        }
      }
      return value;
    },
    set<T>(this: StyleAnimator<unknown, T>, value: T): void {
      (this as Mutable<typeof this>).ownValue = value;
    },
    configurable: true,
  });

  StyleAnimator.prototype.onSetValue = function <T>(this: StyleAnimator<unknown, T>, newValue: T, oldValue: T): void {
    const styleContext = this.owner;
    if (StyleContext.is(styleContext)) {
      const propertyNames = this.propertyNames;
      if (typeof propertyNames === "string") {
        styleContext.setStyle(propertyNames, newValue, this.priority);
      } else {
        for (let i = 0, n = propertyNames.length; i < n; i += 1) {
          styleContext.setStyle(propertyNames[i]!, newValue, this.priority);
        }
      }
    }
    _super.prototype.onSetValue.call(this, newValue, oldValue);
  };

  StyleAnimator.prototype.setPriority = function (this: StyleAnimator<unknown, unknown>, priority: string | undefined): void {
    (this as Mutable<typeof this>).priority = priority;
    const styleContext = this.owner;
    const value = this.value;
    if (StyleContext.is(styleContext) && this.isDefined(value)) {
      const propertyNames = this.propertyNames;
      if (typeof propertyNames === "string") {
        styleContext.setStyle(propertyNames, value, priority);
      } else {
        for (let i = 0, n = propertyNames.length; i < n; i += 1) {
          styleContext.setStyle(propertyNames[i]!, value, priority);
        }
      }
    }
  };

  StyleAnimator.prototype.parse = function <T>(this: StyleAnimator<unknown, T>): T {
    throw new Error();
  };

  StyleAnimator.prototype.fromCssValue = function <T>(this: StyleAnimator<unknown, T>, value: CSSStyleValue): T {
    throw new Error();
  };

  StyleAnimator.construct = function <A extends StyleAnimator<any, any, any>>(animatorClass: {prototype: A}, animator: A | null, owner: FastenerOwner<A>): A {
    animator = _super.construct(animatorClass, animator, owner) as A;
    (animator as Mutable<typeof animator>).priority = void 0;
    return animator;
  };

  StyleAnimator.specialize = function (type: unknown): StyleAnimatorFactory | null {
    if (type === String) {
      return StringStyleAnimator;
    } else if (type === Number) {
      return NumberStyleAnimator;
    } else if (type === Length) {
      return LengthStyleAnimator;
    } else if (type === Color) {
      return ColorStyleAnimator;
    } else if (type === FontFamily) {
      return FontFamilyStyleAnimator;
    } else if (type === BoxShadow) {
      return BoxShadowStyleAnimator;
    } else if (type === Transform) {
      return TransformStyleAnimator;
    }
    return null;
  };

  StyleAnimator.define = function <O, T, U>(className: string, descriptor: StyleAnimatorDescriptor<O, T, U>): StyleAnimatorFactory<StyleAnimator<any, T, U>> {
    let superClass = descriptor.extends as StyleAnimatorFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const look = descriptor.look;
    const state = descriptor.state;
    const initState = descriptor.initState;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.look;
    delete descriptor.state;
    delete descriptor.initState;

    if (superClass === void 0 || superClass === null) {
      superClass = this.specialize(descriptor.type);
    }
    if (superClass === null) {
      superClass = this;
      if (descriptor.fromAny === void 0 && FromAny.is<T, U>(descriptor.type)) {
        descriptor.fromAny = descriptor.type.fromAny;
      }
    }

    const animatorClass = superClass.extend(className, descriptor);

    animatorClass.construct = function (animatorClass: {prototype: StyleAnimator<any, any, any>}, animator: StyleAnimator<O, T, U> | null, owner: O): StyleAnimator<O, T, U> {
      animator = superClass!.construct(animatorClass, animator, owner);
      if (affinity !== void 0) {
        animator.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        animator.initInherits(inherits);
      }
      if (look !== void 0) {
        (animator as Mutable<typeof animator>).look = look;
      }
      if (initState !== void 0) {
        (animator as Mutable<typeof animator>).state = animator.fromAny(initState());
        (animator as Mutable<typeof animator>).value = animator.state;
      } else if (state !== void 0) {
        (animator as Mutable<typeof animator>).state = animator.fromAny(state);
        (animator as Mutable<typeof animator>).value = animator.state;
      }
      return animator;
    };

    return animatorClass;
  };

  return StyleAnimator;
})(ThemeAnimator);
