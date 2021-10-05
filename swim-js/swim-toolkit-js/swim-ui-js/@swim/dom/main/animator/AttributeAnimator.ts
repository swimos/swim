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
import {AnyColor, Color} from "@swim/style";
import {ThemeAnimatorInit, ThemeAnimatorClass, ThemeAnimator} from "@swim/theme";
import {StringAttributeAnimator} from "./"; // forward import
import {NumberAttributeAnimator} from "./"; // forward import
import {BooleanAttributeAnimator} from "./"; // forward import
import {LengthAttributeAnimator} from "./"; // forward import
import {ColorAttributeAnimator} from "./"; // forward import
import {TransformAttributeAnimator} from "./"; // forward import
import {ElementView} from "../"; // forward import

export interface AttributeAnimatorInit<T = unknown, U = never> extends ThemeAnimatorInit<T, U> {
  attributeName: string;

  parse?(value: string): T;
}

export type AttributeAnimatorDescriptor<V = unknown, T = unknown, U = never, I = {}> = ThisType<AttributeAnimator<V, T, U> & I> & AttributeAnimatorInit<T, U> & Partial<I>;

export interface AttributeAnimatorClass<A extends AttributeAnimator<any, any> = AttributeAnimator<any, any, any>> extends ThemeAnimatorClass<A> {
  create(this: AttributeAnimatorClass<A>, owner: FastenerOwner<A>, animatorName: string): A;

  construct(animatorClass: AttributeAnimatorClass, animator: A | null, owner: FastenerOwner<A>, animatorName: string): A;

  specialize(type: unknown): AttributeAnimatorClass | null;

  extend(this: AttributeAnimatorClass<A>, classMembers?: {} | null): AttributeAnimatorClass<A>;

  define<V, T, U = never, I = {}>(descriptor: {extends: AttributeAnimatorClass | null} & AttributeAnimatorDescriptor<V, T, U, I>): AttributeAnimatorClass<AttributeAnimator<any, T, U> & I>;
  define<V, T, U = never>(descriptor: AttributeAnimatorDescriptor<V, T, U>): AttributeAnimatorClass<AttributeAnimator<any, T, U>>;

  <V, T extends Length | undefined = Length | undefined, U extends AnyLength | undefined = AnyLength | undefined>(descriptor: {type: typeof Length} & AttributeAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V, T extends Color | undefined = Color | undefined, U extends AnyColor | undefined = AnyColor | undefined>(descriptor: {type: typeof Color} & AttributeAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V, T extends Transform | undefined = Transform | undefined, U extends AnyTransform | undefined = AnyTransform | undefined>(descriptor: {type: typeof Transform} & AttributeAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V, T extends string | undefined = string | undefined, U extends string | undefined = string | undefined>(descriptor: {type: typeof String} & AttributeAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & AttributeAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V, T extends boolean | undefined = boolean | undefined, U extends boolean | string | undefined = boolean | string | undefined>(descriptor: {type: typeof Boolean} & AttributeAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V, T, U = never>(descriptor: ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & AttributeAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V, T, U = never, I = {}>(descriptor: {extends: AttributeAnimatorClass | null} & AttributeAnimatorDescriptor<V, T, U, I>): PropertyDecorator;
  <V, T, U = never>(descriptor: AttributeAnimatorDescriptor<V, T, U>): PropertyDecorator;
}

export interface AttributeAnimator<V = unknown, T = unknown, U = never> extends ThemeAnimator<V, T, U> {
  get attributeName(): string;

  get attributeValue(): T | undefined;

  /** @internal */
  readonly ownValue: T;

  get value(): T;
  set value(value: T);

  /** @override @protected */
  onSetValue(newValue: T, oldValue: T): void;

  parse(value: string): T;
}

export const AttributeAnimator = (function (_super: typeof ThemeAnimator) {
  const AttributeAnimator = _super.extend() as AttributeAnimatorClass;

  Object.defineProperty(AttributeAnimator.prototype, "attributeName", {
    get(this: AttributeAnimator): string {
      throw new Error("no attribute name");
    },
    configurable: true,
  });

  Object.defineProperty(AttributeAnimator.prototype, "attributeValue", {
    get: function <T>(this: AttributeAnimator<unknown, T>): T | undefined {
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
      return void 0;
    },
    configurable: true,
  });

  Object.defineProperty(AttributeAnimator.prototype, "value", {
    get<T>(this: AttributeAnimator<unknown, T>): T {
      let value = this.ownValue;
      if (!this.isDefined(value)) {
        const attributeValue = this.attributeValue;
        if (attributeValue !== void 0) {
          value = attributeValue;
          this.setAffinity(Affinity.Extrinsic);
        }
      }
      return value;
    },
    set<T>(this: AttributeAnimator<unknown, T>, value: T): void {
      (this as Mutable<typeof this>).ownValue = value;
    },
    configurable: true,
  });

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

  AttributeAnimator.construct = function <A extends AttributeAnimator<any, any, any>>(animatorClass: AttributeAnimatorClass, animator: A | null, owner: FastenerOwner<A>, animatorName: string): A {
    animator = _super.construct(animatorClass, animator, owner, animatorName) as A;
    return animator;
  };

  AttributeAnimator.specialize = function (type: unknown): AttributeAnimatorClass | null {
    if (type === String) {
      return StringAttributeAnimator;
    } else if (type === Number) {
      return NumberAttributeAnimator;
    } else if (type === Boolean) {
      return BooleanAttributeAnimator;
    } else if (type === Length) {
      return LengthAttributeAnimator;
    } else if (type === Color) {
      return ColorAttributeAnimator;
    } else if (type === Transform) {
      return TransformAttributeAnimator;
    }
    return null;
  };

  AttributeAnimator.define = function <V, T, U>(descriptor: AttributeAnimatorDescriptor<V, T, U>): AttributeAnimatorClass<AttributeAnimator<any, T, U>> {
    let superClass = descriptor.extends as AttributeAnimatorClass | null | undefined;
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

    const animatorClass = superClass.extend(descriptor);

    animatorClass.construct = function (animatorClass: AttributeAnimatorClass, animator: AttributeAnimator<V, T, U> | null, owner: V, animatorName: string): AttributeAnimator<V, T, U> {
      animator = superClass!.construct(animatorClass, animator, owner, animatorName);
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

  return AttributeAnimator;
})(ThemeAnimator);
