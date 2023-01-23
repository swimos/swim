// Copyright 2015-2023 Swim.inc
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
import type {AnimatorValue, AnimatorValueInit} from "@swim/component";
import {Length, Transform} from "@swim/math";
import {Color} from "@swim/style";
import {ThemeAnimatorDescriptor, ThemeAnimatorClass, ThemeAnimator} from "@swim/theme";
import {StringAttributeAnimator} from "./"; // forward import
import {NumberAttributeAnimator} from "./"; // forward import
import {BooleanAttributeAnimator} from "./"; // forward import
import {LengthAttributeAnimator} from "./"; // forward import
import {ColorAttributeAnimator} from "./"; // forward import
import {TransformAttributeAnimator} from "./"; // forward import
import {ElementView} from "../"; // forward import

/** @public */
export interface AttributeAnimatorDescriptor<T = unknown, U = T> extends ThemeAnimatorDescriptor<T, U> {
  extends?: Proto<AttributeAnimator<any, any, any>> | string | boolean | null;
  attributeName?: string;
}

/** @public */
export type AttributeAnimatorTemplate<A extends AttributeAnimator<any, any, any>> =
  ThisType<A> &
  AttributeAnimatorDescriptor<AnimatorValue<A>, AnimatorValueInit<A>> &
  Partial<Omit<A, keyof AttributeAnimatorDescriptor>>;

/** @public */
export interface AttributeAnimatorClass<A extends AttributeAnimator<any, any, any> = AttributeAnimator<any, any, any>> extends ThemeAnimatorClass<A> {
  /** @override */
  specialize(template: AttributeAnimatorDescriptor<any, any>): AttributeAnimatorClass<A>;

  /** @override */
  refine(animatorClass: AttributeAnimatorClass<any>): void;

  /** @override */
  extend<A2 extends A>(className: string, template: AttributeAnimatorTemplate<A2>): AttributeAnimatorClass<A2>;
  extend<A2 extends A>(className: string, template: AttributeAnimatorTemplate<A2>): AttributeAnimatorClass<A2>;

  /** @override */
  define<A2 extends A>(className: string, template: AttributeAnimatorTemplate<A2>): AttributeAnimatorClass<A2>;
  define<A2 extends A>(className: string, template: AttributeAnimatorTemplate<A2>): AttributeAnimatorClass<A2>;

  /** @override */
  <A2 extends A>(template: AttributeAnimatorTemplate<A2>): PropertyDecorator;
}

/** @public */
export interface AttributeAnimator<O = unknown, T = unknown, U = T> extends ThemeAnimator<O, T, U> {
  readonly attributeName: string; // prototype property

  get attributeValue(): T;

  getAttributeValue(): NonNullable<T>;

  /** @override @protected */
  onSetValue(newValue: T, oldValue: T): void;

  parse(value: string): T;
}

/** @public */
export const AttributeAnimator = (function (_super: typeof ThemeAnimator) {
  const AttributeAnimator = _super.extend("AttributeAnimator", {}) as AttributeAnimatorClass;

  Object.defineProperty(AttributeAnimator.prototype, "attributeValue", {
    get: function <T>(this: AttributeAnimator<unknown, T>): T {
      const view = this.owner;
      if (view instanceof ElementView) {
        const value = view.getAttribute(this.attributeName);
        if (value !== null) {
          try {
            return this.parse(value);
          } catch (e) {
            // swallow parse errors
          }
        }
      }
      return (Object.getPrototypeOf(this) as AttributeAnimator<unknown, T>).value;
    },
    configurable: true,
  });

  AttributeAnimator.prototype.getAttributeValue = function <T>(this: AttributeAnimator<unknown, T>): NonNullable<T> {
    const attributeValue = this.attributeValue;
    if (attributeValue === void 0 || attributeValue === null) {
      let message = attributeValue + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "attribute value";
      throw new TypeError(message);
    }
    return attributeValue as NonNullable<T>;
  };

  AttributeAnimator.prototype.onSetValue = function <T>(this: AttributeAnimator<unknown, T>, newValue: T, oldValue: T): void {
    const view = this.owner;
    if (view instanceof ElementView) {
      view.setAttribute(this.attributeName, newValue);
    }
    _super.prototype.onSetValue.call(this, newValue, oldValue);
  };

  AttributeAnimator.prototype.parse = function <T>(this: AttributeAnimator<unknown, T>): T {
    throw new Error();
  };

  AttributeAnimator.specialize = function (template: AttributeAnimatorDescriptor<any, any>): AttributeAnimatorClass {
    let superClass = template.extends as AttributeAnimatorClass | null | undefined;
    if (superClass === void 0 || superClass === null) {
      const valueType = template.valueType;
      if (valueType === String) {
        superClass = StringAttributeAnimator;
      } else if (valueType === Number) {
        superClass = NumberAttributeAnimator;
      } else if (valueType === Boolean) {
        superClass = BooleanAttributeAnimator;
      } else if (valueType === Length) {
        superClass = LengthAttributeAnimator;
      } else if (valueType === Color) {
        superClass = ColorAttributeAnimator;
      } else if (valueType === Transform) {
        superClass = TransformAttributeAnimator;
      } else {
        superClass = this;
      }
    }
    return superClass
  };

  return AttributeAnimator;
})(ThemeAnimator);
