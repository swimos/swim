// Copyright 2015-2020 SWIM.AI inc.
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
import {Tween, Transition} from "@swim/transition";
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
import {ElementView} from "../ElementView";

export type AttributeAnimatorType = typeof String
                                  | typeof Boolean
                                  | typeof Number
                                  | typeof Length
                                  | typeof Color
                                  | typeof Transform
                                  | [typeof Number, typeof String]
                                  | [typeof Length, typeof String]
                                  | [typeof Color, typeof String];

export interface AttributeAnimatorConstructor {
  new<V extends ElementView, T, U = T>(view: V, name: string, value?: T | null,
                                       transition?: Transition<T> | null): AttributeAnimator<V, T, U>;
}

export interface AttributeAnimatorClass extends AttributeAnimatorConstructor {
  (name: string, type: AttributeAnimatorType): PropertyDecorator;

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
  (): T | null | undefined;
  (value: U | null, tween?: Tween<T>): V;

  /** @hidden */
  _view: V;
  /** @hidden */
  _name: string;

  readonly view: V;

  readonly node: Element;

  readonly name: string;

  readonly attributeValue: string | null;

  update(newValue: T, oldValue: T): void;

  willUpdate(newValue: T, oldValue: T): void;

  didUpdate(newValue: T, oldValue: T): void;

  delete(): void;
}

export const AttributeAnimator = (function (_super: typeof TweenFrameAnimator): AttributeAnimatorClass {
  const AttributeAnimator: AttributeAnimatorClass = function <V extends ElementView, T, U>(
      this: AttributeAnimator<V, T, U> | undefined, view: V | string, name: string | AttributeAnimatorType,
      value?: T | null, transition?: Transition<T> | null): AttributeAnimator<V, T, U> | PropertyDecorator {
    if (this instanceof AttributeAnimator) { // constructor
      if (transition === void 0) {
        transition = null;
      }
      const _this = _super.call(this, value, transition) || this;
      _this._view = view;
      _this._name = name;
      return _this;
    } else { // decorator
      const type = name as AttributeAnimatorType;
      name = view as string;
      if (type === String) {
        return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.String, name);
      } else if (type === Boolean) {
        return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.Boolean, name);
      } else if (type === Number) {
        return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.Number, name);
      } else if (type === Length) {
        return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.Length, name);
      } else if (type === Color) {
        return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.Color, name);
      } else if (type === Transform) {
        return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.Transform, name);
      } else if (Array.isArray(type) && type.length === 2) {
        const [type0, type1] = type;
        if (type0 === Number && type1 === String) {
          return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.NumberOrString, name);
        } else if (type0 === Length && type1 === String) {
          return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.LengthOrString, name);
        } else if (type0 === Color && type1 === String) {
          return ElementView.decorateAttributeAnimator.bind(void 0, AttributeAnimator.ColorOrString, name);
        }
      }
      throw new TypeError("" + type);
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

  Object.defineProperty(AttributeAnimator.prototype, "name", {
    get: function (this: AttributeAnimator<ElementView, unknown, unknown>): string {
      return this._name;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(AttributeAnimator.prototype, "attributeValue", {
    get: function (this: AttributeAnimator<ElementView, unknown, unknown>): string | null {
      return this._view._node.getAttribute(this._name);
    },
    enumerable: true,
    configurable: true,
  });

  AttributeAnimator.prototype.update = function <V extends ElementView, T, U>(this: AttributeAnimator<V, T, U>,
                                                                              newValue: T, oldValue: T): void {
    if (!Objects.equal(oldValue, newValue)) {
      this.willUpdate(newValue, oldValue);
      this._view.setAttribute(this._name, newValue);
      this.didUpdate(newValue, oldValue);
    }
  };

  AttributeAnimator.prototype.willUpdate = function <V extends ElementView, T, U>(this: AttributeAnimator<V, T, U>,
                                                                                  newValue: T, oldValue: T): void {
    // hook
  };

  AttributeAnimator.prototype.didUpdate = function <V extends ElementView, T, U>(this: AttributeAnimator<V, T, U>,
                                                                                 newValue: T, oldValue: T): void {
    // hook
  };

  AttributeAnimator.prototype.delete = function <V extends ElementView, T, U>(this: AttributeAnimator<V, T, U>): void {
    this._view.setAttribute(this._name, null);
  };

  return AttributeAnimator;
}(TweenFrameAnimator));
