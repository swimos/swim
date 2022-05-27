// Copyright 2015-2022 Swim.inc
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

import type {Mutable, Proto} from "@swim/util";
import type {FastenerOwner, AnimatorValue, AnimatorValueInit} from "@swim/component";
import {Length, Transform} from "@swim/math";
import {FontFamily, Color, BoxShadow} from "@swim/style";
import {ThemeAnimatorDescriptor, ThemeAnimatorClass, ThemeAnimator} from "@swim/theme";
import {StringStyleAnimator} from "./"; // forward import
import {NumberStyleAnimator} from "./"; // forward import
import {LengthStyleAnimator} from "./"; // forward import
import {ColorStyleAnimator} from "./"; // forward import
import {FontFamilyStyleAnimator} from "./"; // forward import
import {TransformStyleAnimator} from "./"; // forward import
import {BoxShadowStyleAnimator} from "./"; // forward import
import {StyleContext} from "../"; // forward import

/** @public */
export interface StyleAnimatorDescriptor<T = unknown, U = T> extends ThemeAnimatorDescriptor<T, U> {
  extends?: Proto<StyleAnimator<any, any, any>> | string | boolean | null;
  propertyNames?: string | ReadonlyArray<string>;
}

/** @public */
export type StyleAnimatorTemplate<A extends StyleAnimator<any, any, any>> =
  ThisType<A> &
  StyleAnimatorDescriptor<AnimatorValue<A>, AnimatorValueInit<A>> &
  Partial<Omit<A, keyof StyleAnimatorDescriptor>>;

/** @public */
export interface StyleAnimatorClass<A extends StyleAnimator<any, any, any> = StyleAnimator<any, any, any>> extends ThemeAnimatorClass<A> {
  /** @override */
  specialize(template: StyleAnimatorDescriptor<any, any>): StyleAnimatorClass<A>;

  /** @override */
  refine(animatorClass: StyleAnimatorClass<any>): void;

  /** @override */
  extend<A2 extends A>(className: string, template: StyleAnimatorTemplate<A2>): StyleAnimatorClass<A2>;
  extend<A2 extends A>(className: string, template: StyleAnimatorTemplate<A2>): StyleAnimatorClass<A2>;

  /** @override */
  define<A2 extends A>(className: string, template: StyleAnimatorTemplate<A2>): StyleAnimatorClass<A2>;
  define<A2 extends A>(className: string, template: StyleAnimatorTemplate<A2>): StyleAnimatorClass<A2>;

  /** @override */
  <A2 extends A>(template: StyleAnimatorTemplate<A2>): PropertyDecorator;
}

/** @public */
export interface StyleAnimator<O = unknown, T = unknown, U = T> extends ThemeAnimator<O, T, U> {
  readonly propertyNames: string | ReadonlyArray<string>; // prototype property

  get propertyValue(): T;

  getPropertyValue(): NonNullable<T>;

  get computedValue(): T;

  getComputedValue(): NonNullable<T>;

  get cssValue(): T;

  getCssValue(): NonNullable<T>;

  get cssState(): T;

  getCssState(): NonNullable<T>;

  /** @override @protected */
  onSetValue(newValue: T, oldValue: T): void;

  initPriority(): string | undefined;

  readonly priority: string | undefined;

  setPriority(priority: string | undefined): void;

  /** @internal */
  applyStyle(value: T, priority: string | undefined): void;

  parse(value: string): T;

  fromCssValue(value: CSSStyleValue): T;
}

/** @public */
export const StyleAnimator = (function (_super: typeof ThemeAnimator) {
  const StyleAnimator = _super.extend("StyleAnimator", {}) as StyleAnimatorClass;

  Object.defineProperty(StyleAnimator.prototype, "propertyValue", {
    get: function <T>(this: StyleAnimator<unknown, T>): T {
      const styleContext = this.owner;
      if (StyleContext.is(styleContext)) {
        let value = styleContext.getStyle(this.propertyNames);
        if (typeof CSSStyleValue !== "undefined" && value instanceof CSSStyleValue) { // CSS Typed OM support
          try {
            value = this.fromCssValue(value);
          } catch (e) {
            value = value.toString(); // coerce to string on decode error
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
      return (Object.getPrototypeOf(this) as StyleAnimator<unknown, T>).value;
    },
    configurable: true,
  });

  StyleAnimator.prototype.getPropertyValue = function <T>(this: StyleAnimator<unknown, T>): NonNullable<T> {
    const propertyValue = this.propertyValue;
    if (propertyValue === void 0 || propertyValue === null) {
      let message = propertyValue + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "property value";
      throw new TypeError(message);
    }
    return propertyValue as NonNullable<T>;
  };

  Object.defineProperty(StyleAnimator.prototype, "computedValue", {
    get: function <T>(this: StyleAnimator<unknown, T>): T {
      let computedValue: T | undefined;
      const styleContext = this.owner;
      let node: Node | undefined;
      if (StyleContext.is(styleContext) && (node = styleContext.node, node instanceof Element)) {
        const styles = getComputedStyle(node);
        const propertyNames = this.propertyNames;
        let propertyValue = "";
        if (typeof propertyNames === "string") {
          propertyValue = styles.getPropertyValue(propertyNames);
        } else {
          for (let i = 0, n = propertyNames.length; i < n && propertyValue.length === 0; i += 1) {
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
      if (computedValue !== void 0) {
        return computedValue;
      } else {
        return (Object.getPrototypeOf(this) as StyleAnimator<unknown, T>).value;
      }
    },
    configurable: true,
  });

  StyleAnimator.prototype.getComputedValue = function <T>(this: StyleAnimator<unknown, T>): NonNullable<T> {
    const computedValue = this.computedValue;
    if (computedValue === void 0 || computedValue === null) {
      let message = computedValue + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "computed value";
      throw new TypeError(message);
    }
    return computedValue as NonNullable<T>;
  };

  Object.defineProperty(StyleAnimator.prototype, "cssValue", {
    get<T>(this: StyleAnimator<unknown, T>): T {
      let value = this.value;
      if (!this.definedValue(value)) {
        value = this.computedValue;
      }
      return value;
    },
    configurable: true,
  });

  StyleAnimator.prototype.getCssValue = function <T>(this: StyleAnimator<unknown, T>): NonNullable<T> {
    const cssValue = this.cssValue;
    if (cssValue === void 0 || cssValue === null) {
      let message = cssValue + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "css value";
      throw new TypeError(message);
    }
    return cssValue as NonNullable<T>;
  };

  Object.defineProperty(StyleAnimator.prototype, "cssState", {
    get<T>(this: StyleAnimator<unknown, T>): T {
      let state = this.state;
      if (!this.definedValue(state)) {
        state = this.computedValue;
      }
      return state;
    },
    configurable: true,
  });

  StyleAnimator.prototype.getCssState = function <T>(this: StyleAnimator<unknown, T>): NonNullable<T> {
    const cssState = this.cssState;
    if (cssState === void 0 || cssState === null) {
      let message = cssState + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "css state";
      throw new TypeError(message);
    }
    return cssState as NonNullable<T>;
  };

  StyleAnimator.prototype.onSetValue = function <T>(this: StyleAnimator<unknown, T>, newValue: T, oldValue: T): void {
    this.applyStyle(newValue, this.priority);
    _super.prototype.onSetValue.call(this, newValue, oldValue);
  };

  StyleAnimator.prototype.initPriority = function (this: StyleAnimator): string | undefined {
    return (Object.getPrototypeOf(this) as StyleAnimator).priority as string | undefined;
  };

  StyleAnimator.prototype.setPriority = function (this: StyleAnimator, priority: string | undefined): void {
    (this as Mutable<typeof this>).priority = priority;
    this.applyStyle(this.value, priority);
  };

  StyleAnimator.prototype.applyStyle = function <T>(this: StyleAnimator<unknown, T>, value: T, priority: string | undefined): void {
    const styleContext = this.owner;
    if (StyleContext.is(styleContext)) {
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

  StyleAnimator.construct = function <A extends StyleAnimator<any, any, any>>(animator: A | null, owner: FastenerOwner<A>): A {
    animator = _super.construct.call(this, animator, owner) as A;
    (animator as Mutable<typeof animator>).priority = animator.initPriority();
    return animator;
  };

  StyleAnimator.specialize = function (template: StyleAnimatorDescriptor<any, any>): StyleAnimatorClass {
    let superClass = template.extends as StyleAnimatorClass | null | undefined;
    if (superClass === void 0 || superClass === null) {
      const valueType = template.valueType;
      if (valueType === String) {
        superClass = StringStyleAnimator;
      } else if (valueType === Number) {
        superClass = NumberStyleAnimator;
      } else if (valueType === Length) {
        superClass = LengthStyleAnimator;
      } else if (valueType === Color) {
        superClass = ColorStyleAnimator;
      } else if (valueType === FontFamily) {
        superClass = FontFamilyStyleAnimator;
      } else if (valueType === BoxShadow) {
        superClass = BoxShadowStyleAnimator;
      } else if (valueType === Transform) {
        superClass = TransformStyleAnimator;
      } else {
        superClass = this;
      }
    }
    return superClass
  };

  return StyleAnimator;
})(ThemeAnimator);
