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
import {FromAny} from "@swim/util";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyLineHeight, LineHeight, FontFamily} from "@swim/font";
import {AnyBoxShadow, BoxShadow} from "@swim/shadow";
import {AnyTransform, Transform} from "@swim/transform";
import {Tween} from "@swim/transition";
import {Animator, TweenAnimator} from "@swim/animate";
import {StyleContext} from "../sheet/StyleContext";
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

export type StyleAnimatorMemberType<V, K extends keyof V> =
  V extends {[P in K]: StyleAnimator<any, infer T, any>} ? T : unknown;

export type StyleAnimatorMemberInit<V, K extends keyof V> =
  V extends {[P in K]: StyleAnimator<any, infer T, infer U>} ? T | U : unknown;

export interface StyleAnimatorInit<T, U = T> {
  propertyNames: string | ReadonlyArray<string>;
  extends?: StyleAnimatorPrototype;
  type?: unknown;

  updateFlags?: number;
  willUpdate?(newValue: T | undefined, oldValue: T | undefined): void;
  onUpdate?(newValue: T | undefined, oldValue: T | undefined): void;
  didUpdate?(newValue: T | undefined, oldValue: T | undefined): void;
  parse?(value: string): T | undefined;
  fromCss?(value: CSSStyleValue): T | undefined;
  fromAny?(value: T | U): T | undefined;
}

export type StyleAnimatorDescriptorInit<V extends StyleContext, T, U = T, I = {}> = StyleAnimatorInit<T, U> & ThisType<StyleAnimator<V, T, U> & I> & I;

export type StyleAnimatorDescriptorExtends<V extends StyleContext, T, U = T, I = {}> = {extends: StyleAnimatorPrototype | undefined} & StyleAnimatorDescriptorInit<V, T, U, I>;

export type StyleAnimatorDescriptorFromAny<V extends StyleContext, T, U = T, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T | undefined}) & StyleAnimatorDescriptorInit<V, T, U, I>;

export type StyleAnimatorDescriptor<V extends StyleContext, T, U = T, I = {}> =
  U extends T ? StyleAnimatorDescriptorInit<V, T, U, I> :
  T extends LineHeight | undefined ? U extends AnyLineHeight | undefined ? {type: typeof LineHeight} & StyleAnimatorDescriptorInit<V, T, U, I> : StyleAnimatorDescriptorExtends<V, T, U, I> :
  T extends Length | undefined ? U extends AnyLength | undefined ? {type: typeof Length} & StyleAnimatorDescriptorInit<V, T, U, I> : StyleAnimatorDescriptorExtends<V, T, U, I> :
  T extends Color | undefined ? U extends AnyColor | undefined ? {type: typeof Color} & StyleAnimatorDescriptorInit<V, T, U, I> : StyleAnimatorDescriptorExtends<V, T, U, I> :
  T extends BoxShadow | undefined ? U extends AnyBoxShadow | undefined ? {type: typeof BoxShadow} & StyleAnimatorDescriptorInit<V, T, U, I> : StyleAnimatorDescriptorExtends<V, T, U, I> :
  T extends Transform | undefined ? U extends AnyTransform | undefined ? {type: typeof Transform} & StyleAnimatorDescriptorInit<V, T, U, I> : StyleAnimatorDescriptorExtends<V, T, U, I> :
  T extends FontFamily | FontFamily[] | undefined ? U extends FontFamily | ReadonlyArray<FontFamily> | undefined ? {type: typeof FontFamily} & StyleAnimatorDescriptorInit<V, T, U, I> : StyleAnimatorDescriptorExtends<V, T, U, I> :
  T extends string | undefined ? U extends string | undefined ? {type: typeof String} & StyleAnimatorDescriptorInit<V, T, U, I> : StyleAnimatorDescriptorExtends<V, T, U, I> :
  T extends number | undefined ? U extends number | string | undefined ? {type: typeof Number} & StyleAnimatorDescriptorInit<V, T, U, I> : StyleAnimatorDescriptorExtends<V, T, U, I> :
  T extends Length | string | undefined ? U extends AnyLength | string | undefined ? {type: [typeof Length, typeof String]} & StyleAnimatorDescriptorInit<V, T, U, I> : StyleAnimatorDescriptorExtends<V, T, U, I> :
  T extends Color | string | undefined ? U extends AnyColor | string | undefined ? {type: [typeof Color, typeof String]} & StyleAnimatorDescriptorInit<V, T, U, I> : StyleAnimatorDescriptorExtends<V, T, U, I> :
  T extends number | string | undefined ? U extends number | string | undefined ? {type: [typeof Number, typeof String]} & StyleAnimatorDescriptorInit<V, T, U, I> : StyleAnimatorDescriptorExtends<V, T, U, I> :
  StyleAnimatorDescriptorFromAny<V, T, U, I>;

export type StyleAnimatorPrototype = Function & {prototype: StyleAnimator<any, any, any>};

export type StyleAnimatorConstructor<V extends StyleContext, T, U = T, I = {}> = {
  new(owner: V, animatorName: string): StyleAnimator<V, T, U> & I;
  prototype: StyleAnimator<any, any, any> & I;
};

export declare abstract class StyleAnimator<V extends StyleContext, T, U = T> {
  /** @hidden */
  _owner: V;
  /** @hidden */
  _priority: string | undefined;

  constructor(owner: V, animatorName: string);

  get name(): string;

  get owner(): V;

  get node(): Node | undefined;

  updateFlags?: number;

  abstract readonly propertyNames: string | ReadonlyArray<string>;

  get propertyValue(): T | undefined;

  get priority(): string | undefined;

  isAuto(): boolean;

  setAuto(auto: boolean): void;

  getValue(): T;

  getState(): T;

  getValueOr<E>(elseValue: E): T | E;

  getStateOr<E>(elseState: E): T | E;

  setState(state: T | U | undefined, tween?: Tween<T>, priority?: string): void;

  setAutoState(state: T | U | undefined, tween?: Tween<T>, priority?: string): void;

  onUpdate(newValue: T | undefined, oldValue: T | undefined): void;

  animate(animator?: Animator): void;

  parse(value: string): T | undefined;

  fromCss(value: CSSStyleValue): T | undefined;

  fromAny(value: T | U): T | undefined;

  /** @hidden */
  static getConstructor(type: unknown): StyleAnimatorPrototype | null;

  static define<V extends StyleContext, T, U = T, I = {}>(descriptor: StyleAnimatorDescriptorExtends<V, T, U, I>): StyleAnimatorConstructor<V, T, U, I>;
  static define<V extends StyleContext, T, U = T>(descriptor: StyleAnimatorDescriptor<V, T, U>): StyleAnimatorConstructor<V, T, U>;

  // Forward type declarations
  /** @hidden */
  static String: typeof StringStyleAnimator; // defined by StringStyleAnimator
  /** @hidden */
  static Number: typeof NumberStyleAnimator; // defined by NumberStyleAnimator
  /** @hidden */
  static Length: typeof LengthStyleAnimator; // defined by LengthStyleAnimator
  /** @hidden */
  static Color: typeof ColorStyleAnimator; // defined by ColorStyleAnimator
  /** @hidden */
  static LineHeight: typeof LineHeightStyleAnimator; // defined by LineHeightStyleAnimator
  /** @hidden */
  static FontFamily: typeof FontFamilyStyleAnimator; // defined by FontFamilyStyleAnimator
  /** @hidden */
  static BoxShadow: typeof BoxShadowStyleAnimator; // defined by BoxShadowStyleAnimator
  /** @hidden */
  static Transform: typeof TransformStyleAnimator; // defined by TransformStyleAnimator
  /** @hidden */
  static NumberOrString: typeof NumberOrStringStyleAnimator; // defined by NumberOrStringStyleAnimator
  /** @hidden */
  static LengthOrString: typeof LengthOrStringStyleAnimator; // defined by LengthOrStringStyleAnimator
  /** @hidden */
  static ColorOrString: typeof ColorOrStringStyleAnimator; // defined by ColorOrStringStyleAnimator
}

export interface StyleAnimator<V extends StyleContext, T, U = T> extends TweenAnimator<T | undefined> {
  (): T | undefined;
  (state: T | U | undefined, tween?: Tween<T>, priority?: string): V;
}

export function StyleAnimator<V extends StyleContext, T, U = T, I = {}>(descriptor: StyleAnimatorDescriptorExtends<V, T, U, I>): PropertyDecorator;
export function StyleAnimator<V extends StyleContext, T, U = T>(descriptor: StyleAnimatorDescriptor<V, T, U>): PropertyDecorator;

export function StyleAnimator<V extends StyleContext, T, U>(
    this: StyleAnimator<V, T, U> | typeof StyleAnimator,
    owner: V | StyleAnimatorDescriptor<V, T, U>,
    animatorName?: string,
  ): StyleAnimator<V, T, U> | PropertyDecorator {
  if (this instanceof StyleAnimator) { // constructor
    return StyleAnimatorConstructor.call(this, owner as V, animatorName);
  } else { // decorator factory
    return StyleAnimatorDecoratorFactory(owner as StyleAnimatorDescriptor<V, T, U>);
  }
}
__extends(StyleAnimator, TweenAnimator);

function StyleAnimatorConstructor<V extends StyleContext, T, U = T>(this: StyleAnimator<V, T, U>, owner: V, animatorName: string): StyleAnimator<V, T, U> {
  const _this: StyleAnimator<V, T, U> = TweenAnimator.call(this, void 0, null) || this;
  if (animatorName !== void 0) {
    Object.defineProperty(_this, "name", {
      value: animatorName,
      enumerable: true,
      configurable: true,
    });
  }
  _this._owner = owner;
  return _this;
}

function StyleAnimatorDecoratorFactory<V extends StyleContext, T, U = T>(descriptor: StyleAnimatorDescriptor<V, T, U>): PropertyDecorator {
  return StyleContext.decorateStyleAnimator.bind(StyleContext, StyleAnimator.define(descriptor));
}

Object.defineProperty(StyleAnimator.prototype, "owner", {
  get: function (this: StyleAnimator<StyleContext, unknown, unknown>): StyleContext {
    return this._owner;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(StyleAnimator.prototype, "node", {
  get: function (this: StyleAnimator<StyleContext, unknown, unknown>): Node | undefined {
    return this._owner.node;
  },
  enumerable: true,
  configurable: true,
});

if (typeof CSSStyleValue !== "undefined") { // CSS Typed OM support
  Object.defineProperty(StyleAnimator.prototype, "propertyValue", {
    get: function <T, U>(this: StyleAnimator<StyleContext, T, U>): T | undefined {
      let propertyValue: T | undefined;
      let value = this._owner.getStyle(this.propertyNames);
      if (value instanceof CSSStyleValue) {
        try {
          propertyValue = this.fromCss(value);
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
      return propertyValue;
    },
    enumerable: true,
    configurable: true,
  });
} else {
  Object.defineProperty(StyleAnimator.prototype, "propertyValue", {
    get: function <T, U>(this: StyleAnimator<StyleContext, T, U>): T | undefined {
      const value = this._owner.getStyle(this.propertyNames);
      if (typeof value === "string" && value !== "") {
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
}

Object.defineProperty(StyleAnimator.prototype, "priority", {
  get: function (this: StyleAnimator<StyleContext, unknown, unknown>): string | undefined {
    return this._priority;
  },
  set: function (this: StyleAnimator<StyleContext, unknown, unknown>, value: string | undefined): void {
    this._priority = value;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(StyleAnimator.prototype, "value", {
  get: function <T, U>(this: StyleAnimator<StyleContext, T, U>): T | undefined {
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

StyleAnimator.prototype.isAuto = function (this: StyleAnimator<StyleContext, unknown, unknown>): boolean {
  return (this._animatorFlags & TweenAnimator.OverrideFlag) === 0;
};

StyleAnimator.prototype.setAuto = function (this: StyleAnimator<StyleContext, unknown, unknown>,
                                            auto: boolean): void {
  if (auto && (this._animatorFlags & TweenAnimator.OverrideFlag) !== 0) {
    this._animatorFlags &= ~TweenAnimator.OverrideFlag;
  } else if (!auto && (this._animatorFlags & TweenAnimator.OverrideFlag) === 0) {
    this._animatorFlags |= TweenAnimator.OverrideFlag;
  }
};

StyleAnimator.prototype.getValue = function <T, U>(this: StyleAnimator<StyleContext, T, U>): T {
  const value = this.value;
  if (value === void 0) {
    throw new TypeError("undefined " + this.name + " value");
  }
  return value;
};

StyleAnimator.prototype.getState = function <T, U>(this: StyleAnimator<StyleContext, T, U>): T {
  const state = this.state;
  if (state === void 0) {
    throw new TypeError("undefined " + this.name + " state");
  }
  return state;
};

StyleAnimator.prototype.getValueOr = function <T, U, E>(this: StyleAnimator<StyleContext, T, U>,
                                                        elseValue: E): T | E {
  let value: T | E | undefined = this.value;
  if (value === void 0) {
    value = elseValue;
  }
  return value;
};

StyleAnimator.prototype.getStateOr = function <T, U, E>(this: StyleAnimator<StyleContext, T, U>,
                                                        elseState: E): T | E {
  let state: T | E | undefined = this.state;
  if (state === void 0) {
    state = elseState
  }
  return state;
};

StyleAnimator.prototype.setState = function <T, U>(this: StyleAnimator<StyleContext, T, U>,
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
  this._animatorFlags |= TweenAnimator.OverrideFlag;
  TweenAnimator.prototype.setState.call(this, state, tween);
};

StyleAnimator.prototype.setAutoState = function <T, U>(this: StyleAnimator<StyleContext, T, U>,
                                                       state: T | U | undefined, tween?: Tween<T>,
                                                       priority?: string): void {
  if ((this._animatorFlags & TweenAnimator.OverrideFlag) === 0) {
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
    TweenAnimator.prototype.setState.call(this, state, tween);
  }
};

StyleAnimator.prototype.onUpdate = function <T, U>(this: StyleAnimator<StyleContext, T, U>,
                                                   newValue: T | undefined,
                                                   oldValue: T | undefined): void {
  const propertyNames = this.propertyNames;
  if (typeof propertyNames === "string") {
    this._owner.setStyle(propertyNames, newValue, this._priority);
  } else {
    for (let i = 0, n = propertyNames.length; i < n; i += 1) {
      this._owner.setStyle(propertyNames[i], newValue, this._priority);
    }
  }
  const updateFlags = this.updateFlags;
  if (updateFlags !== void 0) {
    this._owner.requireUpdate(updateFlags);
  }
};

StyleAnimator.prototype.animate = function <T, U>(this: StyleAnimator<StyleContext, T, U>,
                                                  animator: Animator = this): void {
  if (animator !== this || (this._animatorFlags & TweenAnimator.DisabledFlag) === 0) {
    this._owner.animate(animator);
  }
};

StyleAnimator.prototype.parse = function <T, U>(this: StyleAnimator<StyleContext, T, U>, value: string): T | undefined {
  return void 0;
};

StyleAnimator.prototype.fromCss = function <T, U>(this: StyleAnimator<StyleContext, T, U>, value: CSSStyleValue): T | undefined {
  return void 0;
};

StyleAnimator.prototype.fromAny = function <T, U>(this: StyleAnimator<StyleContext, T, U>, value: T | U): T | undefined {
  return void 0;
};

StyleAnimator.getConstructor = function (type: unknown): StyleAnimatorPrototype | null {
  if (type === String) {
    return StyleAnimator.String;
  } else if (type === Number) {
    return StyleAnimator.Number;
  } else if (type === Length) {
    return StyleAnimator.Length;
  } else if (type === Color) {
    return StyleAnimator.Color;
  } else if (type === LineHeight) {
    return StyleAnimator.LineHeight;
  } else if (type === FontFamily) {
    return StyleAnimator.FontFamily;
  } else if (type === BoxShadow) {
    return StyleAnimator.BoxShadow;
  } else if (type === Transform) {
    return StyleAnimator.Transform;
  } else if (Array.isArray(type) && type.length === 2) {
    const [type0, type1] = type;
    if (type0 === Number && type1 === String) {
      return StyleAnimator.NumberOrString;
    } else if (type0 === Length && type1 === String) {
      return StyleAnimator.LengthOrString;
    } else if (type0 === Color && type1 === String) {
      return StyleAnimator.ColorOrString;
    }
  }
  return null;
};

StyleAnimator.define = function <V extends StyleContext, T, U, I>(descriptor: StyleAnimatorDescriptor<V, T, U, I>): StyleAnimatorConstructor<V, T, U, I> {
  let _super: StyleAnimatorPrototype | null | undefined = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    _super = StyleAnimator.getConstructor(descriptor.type);
  }
  if (_super === null) {
    _super = StyleAnimator;
    if (!descriptor.hasOwnProperty("fromAny") && FromAny.is<T, U>(descriptor.type)) {
      descriptor.fromAny = descriptor.type.fromAny;
    }
  }

  const _constructor = function StyleAnimatorAccessor(this: StyleAnimator<V, T, U>, owner: V, animatorName: string): StyleAnimator<V, T, U> {
    let _this: StyleAnimator<V, T, U> = function accessor(state?: T | U, tween?: Tween<T>, priority?: string): T | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(state, tween, priority);
        return _this._owner;
      }
    } as StyleAnimator<V, T, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, animatorName) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor<V, T, U, I>;

  const _prototype = descriptor as unknown as StyleAnimator<V, T, U> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};
