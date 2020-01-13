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
import {LineHeight, FontFamily} from "@swim/font";
import {Transform} from "@swim/transform";
import {Tween, Transition} from "@swim/transition";
import {BoxShadow, StyledElement} from "@swim/style";
import {TweenFrameAnimator} from "@swim/animate";
import {StringStyleAnimator} from "./StringStyleAnimator";
import {NumberStyleAnimator} from "./NumberStyleAnimator";
import {LengthStyleAnimator} from "./LengthStyleAnimator";
import {ColorStyleAnimator} from "./ColorStyleAnimator";
import {LineHeightStyleAnimator} from "./LineHeightStyleAnimator";
import {FontFamilyStyleAnimator} from "./FontFamilyStyleAnimator";
import {TransformStyleAnimator} from "./TransformStyleAnimator";
import {BoxShadowStyleAnimator} from "./BoxShadowStyleAnimator";
import {NumberOrStringStyleAnimator} from "./NumberOrStringStyleAnimator";
import {LengthOrStringStyleAnimator} from "./LengthOrStringStyleAnimator";
import {ColorOrStringStyleAnimator} from "./ColorOrStringStyleAnimator";
import {ElementView} from "../ElementView";

export type StyleAnimatorType = typeof String
                              | typeof Number
                              | typeof Length
                              | typeof Color
                              | typeof LineHeight
                              | typeof FontFamily
                              | typeof Transform
                              | typeof BoxShadow
                              | [typeof Number, typeof String]
                              | [typeof Length, typeof String]
                              | [typeof Color, typeof String];

export interface StyleAnimatorConstructor {
  new<V extends ElementView, T, U = T>(view: V, names: string | ReadonlyArray<string>,
                                       value?: T | null, transition?: Transition<T> | null,
                                       priority?: string): StyleAnimator<V, T, U>;
}

export interface StyleAnimatorClass extends StyleAnimatorConstructor {
  (names: string | ReadonlyArray<string>, type: StyleAnimatorType): PropertyDecorator;

  // Forward type declarations
  /** @hidden */
  String: typeof StringStyleAnimator; // defined by StringStyleAnimator
  /** @hidden */
  Number: typeof NumberStyleAnimator; // defined by NumberStyleAnimator
  /** @hidden */
  Length: typeof LengthStyleAnimator; // defined by LengthStyleAnimator
  /** @hidden */
  Color: typeof ColorStyleAnimator; // defined by ColorStyleAnimator
  /** @hidden */
  LineHeight: typeof LineHeightStyleAnimator; // defined by LineHeightStyleAnimator
  /** @hidden */
  FontFamily: typeof FontFamilyStyleAnimator; // defined by FontFamilyStyleAnimator
  /** @hidden */
  Transform: typeof TransformStyleAnimator; // defined by TransformStyleAnimator
  /** @hidden */
  BoxShadow: typeof BoxShadowStyleAnimator; // defined by BoxShadowStyleAnimator
  /** @hidden */
  NumberOrString: typeof NumberOrStringStyleAnimator; // defined by NumberOrStringStyleAnimator
  /** @hidden */
  LengthOrString: typeof LengthOrStringStyleAnimator; // defined by LengthOrStringStyleAnimator
  /** @hidden */
  ColorOrString: typeof ColorOrStringStyleAnimator; // defined by ColorOrStringStyleAnimator
}

export interface StyleAnimator<V extends ElementView, T, U = T> extends TweenFrameAnimator<T> {
  (): T | null | undefined;
  (value: U | null, tween?: Tween<T>, priority?: string | null): V;

  /** @hidden */
  _view: V;
  /** @hidden */
  _names: string | ReadonlyArray<string>;
  /** @hidden */
  _priority: string | undefined;

  readonly view: V;

  readonly node: StyledElement;

  readonly names: string | ReadonlyArray<string>;

  priority: string | undefined;

  readonly propertyValue: string;

  setState(state: T | null | undefined, tween?: Tween<T>, priority?: string | null): void;

  update(newValue: T, oldValue: T): void;

  willUpdate(newValue: T, oldValue: T): void;

  didUpdate(newValue: T, oldValue: T): void;

  delete(): void;
}

export const StyleAnimator = (function (_super: typeof TweenFrameAnimator): StyleAnimatorClass {
  const StyleAnimator: StyleAnimatorClass = function <V extends ElementView, T, U>(
      this: StyleAnimator<V, T, U> | undefined, view: V | string | ReadonlyArray<string>,
      names: string | ReadonlyArray<string> | StyleAnimatorType, value?: T | null,
      transition?: Transition<T> | null, priority?: string): StyleAnimator<V, T, U> | PropertyDecorator {
    if (this instanceof StyleAnimator) { // constructor
      if (transition === void 0) {
        transition = null;
      }
      const _this = _super.call(this, value, transition) || this;
      _this._view = view;
      _this._names = names;
      _this._priority = priority;
      return _this;
    } else { // decorator
      const type = names as StyleAnimatorType;
      names = view as string | ReadonlyArray<string>;
      if (type === String) {
        return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.String, names);
      } else if (type === Number) {
        return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.Number, names);
      } else if (type === Length) {
        return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.Length, names);
      } else if (type === Color) {
        return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.Color, names);
      } else if (type === LineHeight) {
        return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.LineHeight, names);
      } else if (type === FontFamily) {
        return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.FontFamily, names);
      } else if (type === Transform) {
        return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.Transform, names);
      } else if (type === BoxShadow) {
        return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.BoxShadow, names);
      } else if (Array.isArray(type) && type.length === 2) {
        const [type0, type1] = type;
        if (type0 === Number && type1 === String) {
          return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.NumberOrString, names);
        } else if (type0 === Length && type1 === String) {
          return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.LengthOrString, names);
        } else if (type0 === Color && type1 === String) {
          return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.ColorOrString, names);
        }
      }
      throw new TypeError("" + type);
    }
  } as StyleAnimatorClass;
  __extends(StyleAnimator, _super);

  Object.defineProperty(StyleAnimator.prototype, "view", {
    get: function (this: StyleAnimator<ElementView, unknown, unknown>): ElementView {
      return this._view;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(StyleAnimator.prototype, "node", {
    get: function (this: StyleAnimator<ElementView, unknown, unknown>): StyledElement {
      return this._view._node;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(StyleAnimator.prototype, "names", {
    get: function (this: StyleAnimator<ElementView, unknown, unknown>): string | ReadonlyArray<string> {
      return this._names;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(StyleAnimator.prototype, "priority", {
    get: function (this: StyleAnimator<ElementView, unknown, unknown>): string | undefined {
      return this._priority;
    },
    set: function (this: StyleAnimator<ElementView, unknown, unknown>, value: string | undefined): void {
      this._priority = value;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(StyleAnimator.prototype, "propertyValue", {
    get: function (this: StyleAnimator<ElementView, unknown, unknown>): string | null {
      const style = this._view._node.style;
      const names = this._names;
      if (typeof names === "string") {
        return style.getPropertyValue(names);
      } else {
        for (let i = 0, n = names.length; i < n; i += 1) {
          const value = style.getPropertyValue(names[i]);
          if (value) {
            return value;
          }
        }
        return "";
      }
    },
    enumerable: true,
    configurable: true,
  });

  StyleAnimator.prototype.setState = function <V extends ElementView, T, U>(this: StyleAnimator<V, T, U>,
                                                                            state: T | null | undefined, tween?: Tween<T>,
                                                                            priority?: string | null): void {
    if (typeof priority === "string") {
      this.priority = priority;
    } else if (priority === null) {
      this.priority = void 0;
    }
    _super.prototype.setState.call(this, state, tween);
  };

  StyleAnimator.prototype.update = function <V extends ElementView, T, U>(this: StyleAnimator<V, T, U>,
                                                                          newValue: T, oldValue: T): void {
    if (!Objects.equal(oldValue, newValue)) {
      this.willUpdate(newValue, oldValue);
      const names = this._names;
      if (typeof names === "string") {
        this._view.setStyle(names, newValue, this.priority);
      } else {
        for (let i = 0, n = names.length; i < n; i += 1) {
          this._view.setStyle(names[i], newValue, this.priority);
        }
      }
      this.didUpdate(newValue, oldValue);
    }
  };

  StyleAnimator.prototype.willUpdate = function <V extends ElementView, T, U>(this: StyleAnimator<V, T, U>,
                                                                              newValue: T, oldValue: T): void {
    // stub
  };

  StyleAnimator.prototype.didUpdate = function <V extends ElementView, T, U>(this: StyleAnimator<V, T, U>,
                                                                             newValue: T, oldValue: T): void {
    // stub
  };

  StyleAnimator.prototype.delete = function <V extends ElementView, T, U>(this: StyleAnimator<V, T, U>): void {
    const names = this._names;
    if (typeof names === "string") {
      this._view.setStyle(names, null);
    } else {
      for (let i = 0, n = names.length; i < n; i += 1) {
        this._view.setStyle(names[i], null);
      }
    }
  };

  return StyleAnimator;
}(TweenFrameAnimator));
