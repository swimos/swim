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
import {BoxShadow} from "@swim/shadow";
import {Transform} from "@swim/transform";
import {Tween} from "@swim/transition";
import {StyledElement} from "@swim/style";
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
import {ElementView} from "../element/ElementView";

export type StyleAnimatorType = typeof String
                              | typeof Number
                              | typeof Length
                              | typeof Color
                              | typeof LineHeight
                              | typeof FontFamily
                              | typeof BoxShadow
                              | typeof Transform
                              | [typeof Number, typeof String]
                              | [typeof Length, typeof String]
                              | [typeof Color, typeof String];

export interface StyleAnimatorConstructor<T, U = T> {
  new<V extends ElementView>(view: V, animatorName: string,
                             propertyNames: string | ReadonlyArray<string>): StyleAnimator<V, T, U>;
}

export interface StyleAnimatorClass {
  new<V extends ElementView, T, U = T>(view: V, animatorName: string,
                                       propertyNames: string | ReadonlyArray<string>): StyleAnimator<V, T, U>;

  (propertyNames: string | ReadonlyArray<string>, animatorType: StyleAnimatorType): PropertyDecorator;

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
  BoxShadow: typeof BoxShadowStyleAnimator; // defined by BoxShadowStyleAnimator
  /** @hidden */
  Transform: typeof TransformStyleAnimator; // defined by TransformStyleAnimator
  /** @hidden */
  NumberOrString: typeof NumberOrStringStyleAnimator; // defined by NumberOrStringStyleAnimator
  /** @hidden */
  LengthOrString: typeof LengthOrStringStyleAnimator; // defined by LengthOrStringStyleAnimator
  /** @hidden */
  ColorOrString: typeof ColorOrStringStyleAnimator; // defined by ColorOrStringStyleAnimator
}

export interface StyleAnimator<V extends ElementView, T, U = T> extends TweenFrameAnimator<T> {
  (): T | undefined;
  (value: T | U | undefined, tween?: Tween<T>, priority?: string): V;

  /** @hidden */
  _view: V;
  /** @hidden */
  _propertyNames: string | ReadonlyArray<string>;
  /** @hidden */
  _priority: string | undefined;
  /** @hidden */
  _auto: boolean;

  readonly view: V;

  readonly name: string;

  readonly node: StyledElement;

  readonly propertyNames: string | ReadonlyArray<string>;

  readonly propertyValue: T | undefined;

  readonly priority: string | undefined;

  isAuto(): boolean;

  setAuto(auto: boolean): void;

  setState(state: T | U | undefined, tween?: Tween<T>, priority?: string): void;

  setAutoState(state: T | U | undefined, tween?: Tween<T>, priority?: string): void;

  update(newValue: T | undefined, oldValue: T | undefined): void;

  willUpdate(newValue: T | undefined, oldValue: T | undefined): void;

  onUpdate(newValue: T | undefined, oldValue: T | undefined): void;

  didUpdate(newValue: T | undefined, oldValue: T | undefined): void;

  delete(): void;

  parse(value: string): T;

  fromAny(value: T | U): T;
}

export const StyleAnimator: StyleAnimatorClass = (function (_super: typeof TweenFrameAnimator): StyleAnimatorClass {
  function StyleAnimatorDecoratorFactory(propertyNames: string | ReadonlyArray<string>,
                                         animatorType: StyleAnimatorType): PropertyDecorator {
    if (animatorType === String) {
      return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.String, propertyNames);
    } else if (animatorType === Number) {
      return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.Number, propertyNames);
    } else if (animatorType === Length) {
      return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.Length, propertyNames);
    } else if (animatorType === Color) {
      return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.Color, propertyNames);
    } else if (animatorType === LineHeight) {
      return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.LineHeight, propertyNames);
    } else if (animatorType === FontFamily) {
      return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.FontFamily, propertyNames);
    } else if (animatorType === BoxShadow) {
      return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.BoxShadow, propertyNames);
    } else if (animatorType === Transform) {
      return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.Transform, propertyNames);
    } else if (Array.isArray(animatorType) && animatorType.length === 2) {
      const [type0, type1] = animatorType;
      if (type0 === Number && type1 === String) {
        return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.NumberOrString, propertyNames);
      } else if (type0 === Length && type1 === String) {
        return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.LengthOrString, propertyNames);
      } else if (type0 === Color && type1 === String) {
        return ElementView.decorateStyleAnimator.bind(void 0, StyleAnimator.ColorOrString, propertyNames);
      }
    }
    throw new TypeError("" + animatorType);
  }

  function StyleAnimatorConstructor<V extends ElementView, T, U = T>(
      this: StyleAnimator<V, T, U>, view: V, animatorName: string,
      propertyNames: string | ReadonlyArray<string>): StyleAnimator<V, T, U> {
    Object.defineProperty(this, "name", {
      value: animatorName,
      enumerable: true,
      configurable: true,
    });
    this._view = view;
    this._propertyNames = propertyNames;
    this._auto = true;
    const _this = _super.call(this, void 0, null) || this;
    return _this;
  }

  const StyleAnimator: StyleAnimatorClass = function <V extends ElementView, T, U>(
      this: StyleAnimator<V, T, U> | StyleAnimatorClass,
      view: V | string | ReadonlyArray<string>,
      animatorName: string | StyleAnimatorType,
      propertyNames: string | ReadonlyArray<string>): StyleAnimator<V, T, U> | PropertyDecorator {
    if (this instanceof StyleAnimator) { // constructor
      return StyleAnimatorConstructor.call(this, view, animatorName, propertyNames);
    } else { // decorator factory
      propertyNames = view as string | ReadonlyArray<string>;
      const animatorType = animatorName as StyleAnimatorType;
      return StyleAnimatorDecoratorFactory(propertyNames, animatorType);
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

  Object.defineProperty(StyleAnimator.prototype, "propertyNames", {
    get: function (this: StyleAnimator<ElementView, unknown, unknown>): string | ReadonlyArray<string> {
      return this._propertyNames;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(StyleAnimator.prototype, "propertyValue", {
    get: function <T, U>(this: StyleAnimator<ElementView, T, U>): T | undefined {
      const value = this._view.getStyle(this._propertyNames);
      if (value !== "") {
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

  Object.defineProperty(StyleAnimator.prototype, "value", {
    get: function <T, U>(this: StyleAnimator<ElementView, T, U>): T | undefined {
      let value = this._value;
      if (value === void 0) {
        value = this.propertyValue;
        if (value !== void 0) {
          this.setAuto(false);
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  StyleAnimator.prototype.isAuto = function (this: StyleAnimator<ElementView, unknown, unknown>): boolean {
    return this._auto;
  };

  StyleAnimator.prototype.setAuto = function (this: StyleAnimator<ElementView, unknown, unknown>,
                                              auto: boolean): void {
    if (this._auto !== auto) {
      this._auto = auto;
      this._view.animatorDidSetAuto(this, auto);
    }
  };

  StyleAnimator.prototype.setState = function <T, U>(this: StyleAnimator<ElementView, T, U>,
                                                     state: T | U | undefined, tween?: Tween<T>,
                                                     priority?: string): void {
    if (state !== void 0) {
      state = this.fromAny(state);
    }
    if (priority !== void 0) {
      if (priority !== "") {
        this._priority = priority;
      } else if (this._priority !== void 0) {
        this._priority = void 0;
      }
    }
    this._auto = false;
    _super.prototype.setState.call(this, state, tween);
  };

  StyleAnimator.prototype.setAutoState = function <T, U>(this: StyleAnimator<ElementView, T, U>,
                                                         state: T | U | undefined, tween?: Tween<T>,
                                                         priority?: string): void {
    if (this._auto === true) {
      if (state !== void 0) {
        state = this.fromAny(state);
      }
      if (priority !== void 0) {
        if (priority !== "") {
          this._priority = priority;
        } else if (this._priority !== void 0) {
          this._priority = void 0;
        }
      }
      _super.prototype.setState.call(this, state, tween);
    }
  };

  StyleAnimator.prototype.update = function <T, U>(this: StyleAnimator<ElementView, T, U>,
                                                   newValue: T | undefined,
                                                   oldValue: T | undefined): void {
    if (!Objects.equal(oldValue, newValue)) {
      this.willUpdate(newValue, oldValue);
      this.onUpdate(newValue, oldValue);
      this.didUpdate(newValue, oldValue);
    }
  };

  StyleAnimator.prototype.willUpdate = function <T, U>(this: StyleAnimator<ElementView, T, U>,
                                                       newValue: T | undefined,
                                                       oldValue: T | undefined): void {
    // hook
  };

  StyleAnimator.prototype.onUpdate = function <T, U>(this: StyleAnimator<ElementView, T, U>,
                                                     newValue: T | undefined,
                                                     oldValue: T | undefined): void {
    const propertyNames = this._propertyNames;
    if (typeof propertyNames === "string") {
      this._view.setStyle(propertyNames, newValue, this._priority);
    } else {
      for (let i = 0, n = propertyNames.length; i < n; i += 1) {
        this._view.setStyle(propertyNames[i], newValue, this._priority);
      }
    }
  };

  StyleAnimator.prototype.didUpdate = function <T, U>(this: StyleAnimator<ElementView, T, U>,
                                                      newValue: T | undefined,
                                                      oldValue: T | undefined): void {
    // hook
  };

  StyleAnimator.prototype.delete = function <T, U>(this: StyleAnimator<ElementView, T, U>): void {
    const propertyNames = this._propertyNames;
    if (typeof propertyNames === "string") {
      this._view.setStyle(propertyNames, void 0);
    } else {
      for (let i = 0, n = propertyNames.length; i < n; i += 1) {
        this._view.setStyle(propertyNames[i], void 0);
      }
    }
  };

  StyleAnimator.prototype.parse = function <T, U>(this: StyleAnimator<ElementView, T, U>, value: string): T {
    throw new Error(); // abstract
  };

  StyleAnimator.prototype.fromAny = function <T, U>(this: StyleAnimator<ElementView, T, U>, value: T | U): T {
    throw new Error(); // abstract
  };

  return StyleAnimator;
}(TweenFrameAnimator));
