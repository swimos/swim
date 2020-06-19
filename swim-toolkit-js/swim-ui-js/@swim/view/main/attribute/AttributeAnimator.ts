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

import {__extends} from "tslib";
import {Objects} from "@swim/util";
import {Length} from "@swim/length";
import {Color} from "@swim/color";
import {Transform} from "@swim/transform";
import {Tween} from "@swim/transition";
import {TweenFrameAnimator} from "@swim/animate";
import {StringAttributeAnimator} from "./StringAttributeAnimator";
import {BooleanAttributeAnimator} from "./BooleanAttributeAnimator";
import {NumberAttributeAnimator} from "./NumberAttributeAnimator";
import {LengthAttributeAnimator} from "./LengthAttributeAnimator";
import {ColorAttributeAnimator} from "./ColorAttributeAnimator";
import {TransformAttributeAnimator} from "./TransformAttributeAnimator";
import {NumberOrStringAttributeAnimator} from "./NumberOrStringAttributeAnimator";
import {LengthOrStringAttributeAnimator} from "./LengthOrStringAttributeAnimator";
import {ColorOrStringAttributeAnimator} from "./ColorOrStringAttributeAnimator";
import {ElementView} from "../element/ElementView";

export type AttributeAnimatorType = typeof String
                                  | typeof Boolean
                                  | typeof Number
                                  | typeof Length
                                  | typeof Color
                                  | typeof Transform
                                  | [typeof Number, typeof String]
                                  | [typeof Length, typeof String]
                                  | [typeof Color, typeof String];

export interface AttributeAnimatorConstructor<T, U = T> {
  new<V extends ElementView>(view: V, animatorName: string,
                             attributeName: string): AttributeAnimator<V, T, U>;
}

export interface AttributeAnimatorClass {
  new<V extends ElementView, T, U = T>(view: V, animatorName: string,
                                       attributeName: string): AttributeAnimator<V, T, U>;

  (attributeName: string, animatorType: AttributeAnimatorType): PropertyDecorator;

  // Forward type declarations
  /** @hidden */
  String: typeof StringAttributeAnimator; // defined by StringAttributeAnimator
  /** @hidden */
  Boolean: typeof BooleanAttributeAnimator; // defined by BooleanAttributeAnimator
  /** @hidden */
  Number: typeof NumberAttributeAnimator; // defined by NumberAttributeAnimator
  /** @hidden */
  Length: typeof LengthAttributeAnimator; // defined by LengthAttributeAnimator
  /** @hidden */
  Color: typeof ColorAttributeAnimator; // defined by ColorAttributeAnimator
  /** @hidden */
  Transform: typeof TransformAttributeAnimator; // defined by TransformAttributeAnimator
  /** @hidden */
  NumberOrString: typeof NumberOrStringAttributeAnimator; // defined by NumberOrStringAttributeAnimator
  /** @hidden */
  LengthOrString: typeof LengthOrStringAttributeAnimator; // defined by LengthOrStringAttributeAnimator
  /** @hidden */
  ColorOrString: typeof ColorOrStringAttributeAnimator; // defined by ColorOrStringAttributeAnimator
}

export interface AttributeAnimator<V extends ElementView, T, U = T> extends TweenFrameAnimator<T> {
  (): T | undefined;
  (value: T | U | undefined, tween?: Tween<T>): V;

  /** @hidden */
  _view: V;
  /** @hidden */
  _attributeName: string;
  /** @hidden */
  _auto: boolean;

  readonly view: V;

  readonly name: string;

  readonly node: Element;

  readonly attributeName: string;

  readonly attributeValue: T | undefined;

  isAuto(): boolean;

  setAuto(auto: boolean): void;

  setState(state: T | U | undefined, tween?: Tween<T>): void;

  setAutoState(state: T | U | undefined, tween?: Tween<T>): void;

  update(newValue: T | undefined, oldValue: T | undefined): void;

  willUpdate(newValue: T | undefined, oldValue: T | undefined): void;

  onUpdate(newValue: T | undefined, oldValue: T | undefined): void;

  didUpdate(newValue: T | undefined, oldValue: T | undefined): void;

  delete(): void;

  parse(value: string): T;

  fromAny(value: T | U): T;
}

export const AttributeAnimator: AttributeAnimatorClass = (function (_super: typeof TweenFrameAnimator): AttributeAnimatorClass {
  function AttributeAnimatorDecoratorFactory(attributeName: string, animatorType: AttributeAnimatorType): PropertyDecorator {
    if (animatorType === String) {
      return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.String, attributeName);
    } else if (animatorType === Boolean) {
      return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.Boolean, attributeName);
    } else if (animatorType === Number) {
      return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.Number, attributeName);
    } else if (animatorType === Length) {
      return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.Length, attributeName);
    } else if (animatorType === Color) {
      return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.Color, attributeName);
    } else if (animatorType === Transform) {
      return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.Transform, attributeName);
    } else if (Array.isArray(animatorType) && animatorType.length === 2) {
      const [type0, type1] = animatorType;
      if (type0 === Number && type1 === String) {
        return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.NumberOrString, attributeName);
      } else if (type0 === Length && type1 === String) {
        return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.LengthOrString, attributeName);
      } else if (type0 === Color && type1 === String) {
        return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.ColorOrString, attributeName);
      }
    }
    throw new TypeError("" + animatorType);
  }

  function AttributeAnimatorConstructor<V extends ElementView, T, U = T>(
      this: AttributeAnimator<V, T, U>, view: V, animatorName: string,
      attributeName: string): AttributeAnimator<V, T, U> {
    Object.defineProperty(this, "name", {
      value: animatorName,
      enumerable: true,
      configurable: true,
    });
    this._view = view;
    this._attributeName = attributeName;
    this._auto = true;
    const _this = _super.call(this, void 0, null) || this;
    return _this;
  }

  const AttributeAnimator: AttributeAnimatorClass = function <V extends ElementView, T, U>(
      this: AttributeAnimator<V, T, U> | AttributeAnimatorClass,
      view: V | string,
      animatorName: string | AttributeAnimatorType,
      attributeName: string): AttributeAnimator<V, T, U> | PropertyDecorator {
    if (this instanceof AttributeAnimator) { // constructor
      return AttributeAnimatorConstructor.call(this, view, animatorName, attributeName);
    } else { // decorator factory
      attributeName = view as string;
      const animatorType = animatorName as AttributeAnimatorType;
      return AttributeAnimatorDecoratorFactory(attributeName, animatorType);
    }
  } as AttributeAnimatorClass;
  __extends(AttributeAnimator, _super);

  Object.defineProperty(AttributeAnimator.prototype, "view", {
    get: function (this: AttributeAnimator<ElementView, unknown, unknown>): ElementView {
      return this._view;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(AttributeAnimator.prototype, "node", {
    get: function (this: AttributeAnimator<ElementView, unknown, unknown>): Element {
      return this._view._node;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(AttributeAnimator.prototype, "attributeName", {
    get: function (this: AttributeAnimator<ElementView, unknown, unknown>): string {
      return this._attributeName;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(AttributeAnimator.prototype, "attributeValue", {
    get: function <T, U>(this: AttributeAnimator<ElementView, T, unknown>): T | undefined {
      const value = this._view.getAttribute(this._attributeName);
      if (value !== null) {
        try {
          return this.parse(value);
        } catch (e) {
          // swallow parse errors
        }
      }
      return void 0;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(AttributeAnimator.prototype, "value", {
    get: function <T, U>(this: AttributeAnimator<ElementView, T, U>): T | undefined {
      let value = this._value;
      if (value === void 0) {
        value = this.attributeValue;
        if (value !== void 0) {
          this.setAuto(false);
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  AttributeAnimator.prototype.isAuto = function (this: AttributeAnimator<ElementView, unknown, unknown>): boolean {
    return this._auto;
  };

  AttributeAnimator.prototype.setAuto = function (this: AttributeAnimator<ElementView, unknown, unknown>,
                                                  auto: boolean): void {
    if (this._auto !== auto) {
      this._auto = auto;
      this._view.animatorDidSetAuto(this, auto);
    }
  };

  AttributeAnimator.prototype.setState = function <T, U>(this: AttributeAnimator<ElementView, T, U>,
                                                         state: T | U | undefined, tween?: Tween<T>): void {
    if (state !== void 0) {
      state = this.fromAny(state);
    }
    this._auto = false;
    _super.prototype.setState.call(this, state, tween);
  };

  AttributeAnimator.prototype.setAutoState = function <T, U>(this: AttributeAnimator<ElementView, T, U>,
                                                             state: T | U | undefined, tween?: Tween<T>): void {
    if (this._auto === true) {
      if (state !== void 0) {
        state = this.fromAny(state);
      }
      _super.prototype.setState.call(this, state, tween);
    }
  };

  AttributeAnimator.prototype.update = function <T, U>(this: AttributeAnimator<ElementView, T, U>,
                                                       newValue: T | undefined,
                                                       oldValue: T | undefined): void {
    if (!Objects.equal(oldValue, newValue)) {
      this.willUpdate(newValue, oldValue);
      this.onUpdate(newValue, oldValue);
      this.didUpdate(newValue, oldValue);
    }
  };

  AttributeAnimator.prototype.willUpdate = function <T, U>(this: AttributeAnimator<ElementView, T, U>,
                                                           newValue: T | undefined,
                                                           oldValue: T | undefined): void {
    // hook
  };

  AttributeAnimator.prototype.onUpdate = function <T, U>(this: AttributeAnimator<ElementView, T, U>,
                                                         newValue: T | undefined,
                                                         oldValue: T | undefined): void {
    this._view.setAttribute(this._attributeName, newValue);
  };

  AttributeAnimator.prototype.didUpdate = function <T, U>(this: AttributeAnimator<ElementView, T, U>,
                                                          newValue: T | undefined,
                                                          oldValue: T | undefined): void {
    // hook
  };

  AttributeAnimator.prototype.delete = function <T, U>(this: AttributeAnimator<ElementView, T, U>): void {
    this._view.setAttribute(this._attributeName, void 0);
  };

  AttributeAnimator.prototype.parse = function <T, U>(this: AttributeAnimator<ElementView, T, U>, value: string): T {
    throw new Error(); // abstract
  };

  AttributeAnimator.prototype.fromAny = function <T, U>(this: AttributeAnimator<ElementView, T, U>, value: T | U): T {
    throw new Error(); // abstract
  };

  return AttributeAnimator;
}(TweenFrameAnimator));
