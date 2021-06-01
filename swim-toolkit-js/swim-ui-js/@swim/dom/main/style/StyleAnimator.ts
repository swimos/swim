// Copyright 2015-2021 Swim inc.
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
import type {AnyTiming, Timing} from "@swim/mapping";
import {AnyLength, Length, AnyTransform, Transform} from "@swim/math";
import {FontFamily, AnyColor, Color, AnyBoxShadow, BoxShadow} from "@swim/style";
import {Look, MoodVector, ThemeMatrix} from "@swim/theme";
import {ViewPrecedence, View, Animator} from "@swim/view";
import {StyleContext} from "./StyleContext";
import {StringStyleAnimator} from "../"; // forward import
import {NumberStyleAnimator} from "../"; // forward import
import {LengthStyleAnimator} from "../"; // forward import
import {ColorStyleAnimator} from "../"; // forward import
import {FontFamilyStyleAnimator} from "../"; // forward import
import {TransformStyleAnimator} from "../"; // forward import
import {BoxShadowStyleAnimator} from "../"; // forward import

export type StyleAnimatorMemberType<V, K extends keyof V> =
  V[K] extends StyleAnimator<any, infer T, any> ? T : never;

export type StyleAnimatorMemberInit<V, K extends keyof V> =
  V[K] extends StyleAnimator<any, infer T, infer U> ? T | U : never;

export type StyleAnimatorMemberKey<V, K extends keyof V> =
  V[K] extends StyleAnimator<any, any> ? K : never;

export type StyleAnimatorMemberMap<V> = {
  -readonly [K in keyof V as StyleAnimatorMemberKey<V, K>]?: StyleAnimatorMemberInit<V, K>;
};

export interface StyleAnimatorInit<T, U = never> {
  propertyNames: string | ReadonlyArray<string>;
  extends?: StyleAnimatorClass;
  type?: unknown;

  state?: T | U;
  look?: Look<T>;
  precedence?: ViewPrecedence;
  updateFlags?: number;
  isDefined?(value: T): boolean;
  willSetValue?(newValue: T, oldValue: T): void;
  didSetValue?(newValue: T, oldValue: T): void;
  willSetState?(newValue: T, oldValue: T): void;
  didSetState?(newValue: T, oldValue: T): void;
  onBegin?(value: T): void;
  onEnd?(value: T): void;
  onInterrupt?(value: T): void;
  parse?(value: string): T;
  fromCssValue?(value: CSSStyleValue): T;
  fromAny?(value: T | U): T;
  initState?(): T | U;
}

export type StyleAnimatorDescriptor<V extends StyleContext, T, U = never, I = {}> = StyleAnimatorInit<T, U> & ThisType<StyleAnimator<V, T, U> & I> & Partial<I>;

export type StyleAnimatorDescriptorExtends<V extends StyleContext, T, U = never, I = {}> = {extends: StyleAnimatorClass | undefined} & StyleAnimatorDescriptor<V, T, U, I>;

export type StyleAnimatorDescriptorFromAny<V extends StyleContext, T, U = never, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & StyleAnimatorDescriptor<V, T, U, I>;

export interface StyleAnimatorConstructor<V extends StyleContext, T, U = never, I = {}> {
  new(owner: V, animatorName: string): StyleAnimator<V, T, U> & I;
  prototype: StyleAnimator<any, any> & I;
}

export interface StyleAnimatorClass extends Function {
  readonly prototype: StyleAnimator<any, any>;
}

export interface StyleAnimator<V extends StyleContext, T, U = never> extends Animator<T> {
  (): T;
  (newState: T | U, precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): V;
  (newState: T | U, timing?: AnyTiming | boolean, precedence?: ViewPrecedence): V;

  readonly name: string;

  readonly owner: V;

  readonly node: Node | null;

  readonly propertyNames: string | ReadonlyArray<string>;

  readonly propertyValue: T | undefined;

  readonly priority: string | undefined;

  setPriority(priority: string | undefined): void;

  getValue(): NonNullable<T>;

  onSetValue(newValue: T, oldValue: T): void;

  getState(): NonNullable<T>;

  setState(newState: T | U, precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  setState(newState: T | U, timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;

  /** @hidden */
  setOwnState(newState: T | U, timing?: AnyTiming | boolean): void;

  onSetLook(newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void;

  applyLook(look: Look<T>, timing: Timing | boolean): void;

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void;

  willStartAnimating(): void;

  didStartAnimating(): void;

  willStopAnimating(): void;

  didStopAnimating(): void;

  updateFlags?: number;

  parse(value: string): T;

  fromCssValue(value: CSSStyleValue): T;

  fromAny(value: T | U): T;

  isMounted(): boolean;

  /** @hidden */
  mount(): void;

  /** @hidden */
  willMount(): void;

  /** @hidden */
  onMount(): void;

  /** @hidden */
  didMount(): void;

  /** @hidden */
  unmount(): void;

  /** @hidden */
  willUnmount(): void;

  /** @hidden */
  onUnmount(): void;

  /** @hidden */
  didUnmount(): void;

  toString(): string;
}

export const StyleAnimator = function <V extends StyleContext, T, U>(
    this: StyleAnimator<V, T, U> | typeof StyleAnimator,
    owner: V | StyleAnimatorDescriptor<V, T, U>,
    animatorName?: string,
  ): StyleAnimator<V, T, U> | PropertyDecorator {
  if (this instanceof StyleAnimator) { // constructor
    return StyleAnimatorConstructor.call(this as StyleAnimator<V, unknown, unknown>, owner as V, animatorName!);
  } else { // decorator factory
    return StyleAnimatorDecoratorFactory(owner as StyleAnimatorDescriptor<V, T, U>);
  }
} as {
  /** @hidden */
  new<V extends StyleContext, T, U = never>(owner: V, animatorName: string): StyleAnimator<V, T, U>;

  <V extends StyleContext, T extends Length | null | undefined = Length | null | undefined, U extends AnyLength | null | undefined = AnyLength | null | undefined>(descriptor: {type: typeof Length} & StyleAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends StyleContext, T extends Color | null | undefined = Color | null | undefined, U extends AnyColor | null | undefined = AnyColor | null | undefined>(descriptor: {type: typeof Color} & StyleAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends StyleContext, T extends BoxShadow | null | undefined = BoxShadow | null | undefined, U extends AnyBoxShadow | null | undefined = AnyBoxShadow | null | undefined>(descriptor: {type: typeof BoxShadow} & StyleAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends StyleContext, T extends Transform | null | undefined = Transform | null | undefined, U extends AnyTransform | null | undefined = AnyTransform | null | undefined>(descriptor: {type: typeof Transform} & StyleAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends StyleContext, T extends FontFamily | ReadonlyArray<FontFamily> | null | undefined = FontFamily | ReadonlyArray<FontFamily> | null | undefined, U extends FontFamily | ReadonlyArray<FontFamily> | null | undefined = FontFamily | ReadonlyArray<FontFamily> | null | undefined>(descriptor: {type: typeof FontFamily} & StyleAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends StyleContext, T extends string | null | undefined = string | null | undefined, U extends string | null | undefined = string | null | undefined>(descriptor: {type: typeof String} & StyleAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends StyleContext, T extends number | null | undefined = number | null | undefined, U extends number | string | null | undefined = number | string | null | undefined>(descriptor: {type: typeof Number} & StyleAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V extends StyleContext, T, U = never>(descriptor: StyleAnimatorDescriptorFromAny<V, T, U>): PropertyDecorator;
  <V extends StyleContext, T, U = never, I = {}>(descriptor: StyleAnimatorDescriptorExtends<V, T, U, I>): PropertyDecorator;
  <V extends StyleContext, T, U = never>(descriptor: StyleAnimatorDescriptor<V, T, U>): PropertyDecorator;

  /** @hidden */
  prototype: StyleAnimator<any, any>;

  /** @hidden */
  getClass(type: unknown): StyleAnimatorClass | null;

  define<V extends StyleContext, T, U = never, I = {}>(descriptor: StyleAnimatorDescriptorExtends<V, T, U, I>): StyleAnimatorConstructor<V, T, U, I>;
  define<V extends StyleContext, T, U = never>(descriptor: StyleAnimatorDescriptor<V, T, U>): StyleAnimatorConstructor<V, T, U>;
};
__extends(StyleAnimator, Animator);

function StyleAnimatorConstructor<V extends StyleContext, T, U>(this: StyleAnimator<V, T, U>, owner: V, animatorName: string): StyleAnimator<V, T, U> {
  const _this: StyleAnimator<V, T, U> = (Animator as Function).call(this) || this;
  if (animatorName !== void 0) {
    Object.defineProperty(_this, "name", {
      value: animatorName,
      enumerable: true,
      configurable: true,
    });
  }
  Object.defineProperty(_this, "owner", {
    value: owner,
    enumerable: true,
  });
  Object.defineProperty(_this, "priority", {
    value: void 0,
    enumerable: true,
    configurable: true,
  });
  return _this;
}

function StyleAnimatorDecoratorFactory<V extends StyleContext, T, U>(descriptor: StyleAnimatorDescriptor<V, T, U>): PropertyDecorator {
  return StyleContext.decorateStyleAnimator.bind(StyleContext, StyleAnimator.define(descriptor as StyleAnimatorDescriptor<StyleContext, unknown>));
}

Object.defineProperty(StyleAnimator.prototype, "node", {
  get: function (this: StyleAnimator<StyleContext, unknown>): Node | null {
    return this.owner.node;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(StyleAnimator.prototype, "propertyValue", {
  get: function <T>(this: StyleAnimator<StyleContext, T>): T | undefined {
    let propertyValue: T | undefined;
    let value = this.owner.getStyle(this.propertyNames);
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
    return propertyValue;
  },
  enumerable: true,
  configurable: true,
});

StyleAnimator.prototype.setPriority = function (this: StyleAnimator<StyleContext, unknown>, priority: string | undefined): void {
  Object.defineProperty(this, "priority", {
    value: priority,
    enumerable: true,
    configurable: true,
  });
  const value = this.value;
  if (this.isDefined(value)) {
    const propertyNames = this.propertyNames;
    if (typeof propertyNames === "string") {
      this.owner.setStyle(propertyNames, value, priority);
    } else {
      for (let i = 0, n = propertyNames.length; i < n; i += 1) {
        this.owner.setStyle(propertyNames[i]!, value, priority);
      }
    }
  }
};

Object.defineProperty(StyleAnimator.prototype, "value", {
  get: function <T>(this: StyleAnimator<StyleContext, T>): T {
    let value = this.ownValue;
    if (!this.isDefined(value)) {
      const propertyValue = this.propertyValue;
      if (propertyValue !== void 0) {
        value = propertyValue;
        this.setPrecedence(View.Extrinsic);
      }
    }
    return value;
  },
  enumerable: true,
  configurable: true,
});

StyleAnimator.prototype.getValue = function <T>(this: StyleAnimator<StyleContext, T>): NonNullable<T> {
  const value = this.value;
  if (value === void 0 || value === null) {
    throw new TypeError(value + " " + this.name + " value");
  }
  return value as NonNullable<T>;
};

StyleAnimator.prototype.onSetValue = function <T>(this: StyleAnimator<StyleContext, T>, newValue: T, oldValue: T): void {
  const propertyNames = this.propertyNames;
  if (typeof propertyNames === "string") {
    this.owner.setStyle(propertyNames, newValue, this.priority);
  } else {
    for (let i = 0, n = propertyNames.length; i < n; i += 1) {
      this.owner.setStyle(propertyNames[i]!, newValue, this.priority);
    }
  }
  const updateFlags = this.updateFlags;
  if (updateFlags !== void 0) {
    this.owner.requireUpdate(updateFlags);
  }
};

StyleAnimator.prototype.getState = function <T>(this: StyleAnimator<StyleContext, T>): NonNullable<T> {
  const state = this.state;
  if (state === void 0 || state === null) {
    throw new TypeError(state + " " + this.name + " state");
  }
  return state as NonNullable<T>;
};

StyleAnimator.prototype.setOwnState = function <T, U>(this: StyleAnimator<StyleContext, T, U>, state: T | U, timing?: AnyTiming | boolean): void {
  state = this.fromAny(state);
  Animator.prototype.setOwnState.call(this, state, timing);
};

StyleAnimator.prototype.onSetLook = function <T>(this: StyleAnimator<StyleContext, T>, newLook: Look<T> | null, oldLook: Look<T> | null, timing: Timing | boolean): void {
  if (newLook !== null) {
    this.applyLook(newLook, timing);
  }
};

StyleAnimator.prototype.applyLook = function <T>(this: StyleAnimator<StyleContext, T>, look: Look<T>, timing: Timing | boolean): void {
  if (this.owner.isMounted()) {
    const state = this.owner.getLook(look);
    if (state !== void 0) {
      if (timing === true) {
        timing = this.owner.getLookOr(Look.timing, true);
      }
      this.setOwnState(state, timing);
    }
  } else {
    this.owner.requireUpdate(View.NeedsChange);
  }
};

StyleAnimator.prototype.applyTheme = function <T>(this: StyleAnimator<StyleContext, T>, theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
  const look = this.look;
  if (look !== null) {
    const state = theme.get(look, mood);
    if (state !== void 0) {
      if (timing === true) {
        timing = this.owner.getLookOr(Look.timing, true);
      }
      this.setOwnState(state, timing);
    }
  }
};

StyleAnimator.prototype.willStartAnimating = function (this: StyleAnimator<StyleContext, unknown>): void {
  this.owner.trackWillStartAnimating(this);
};

StyleAnimator.prototype.didStartAnimating = function (this: StyleAnimator<StyleContext, unknown>): void {
  this.owner.trackDidStartAnimating(this);
};

StyleAnimator.prototype.willStopAnimating = function (this: StyleAnimator<StyleContext, unknown>): void {
  this.owner.trackWillStopAnimating(this);
};

StyleAnimator.prototype.didStopAnimating = function (this: StyleAnimator<StyleContext, unknown>): void {
  this.owner.trackDidStopAnimating(this);
};

StyleAnimator.prototype.parse = function <T>(this: StyleAnimator<StyleContext, T>, value: string): T {
  throw new Error();
};

StyleAnimator.prototype.fromCssValue = function <T>(this: StyleAnimator<StyleContext, T>, value: CSSStyleValue): T {
  throw new Error();
};

StyleAnimator.prototype.fromAny = function <T, U>(this: StyleAnimator<StyleContext, T, U>, value: T | U): T {
  return value as T;
};

StyleAnimator.prototype.isMounted = function (this: StyleAnimator<StyleContext, unknown>): boolean {
  return (this.animatorFlags & Animator.MountedFlag) !== 0;
};

StyleAnimator.prototype.mount = function (this: StyleAnimator<StyleContext, unknown>): void {
  if ((this.animatorFlags & Animator.MountedFlag) === 0) {
    this.willMount();
    this.setAnimatorFlags(this.animatorFlags | Animator.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

StyleAnimator.prototype.willMount = function (this: StyleAnimator<StyleContext, unknown>): void {
  // hook
};

StyleAnimator.prototype.onMount = function (this: StyleAnimator<StyleContext, unknown>): void {
  const look = this.look;
  if (look !== null) {
    this.applyLook(look, false);
  }
};

StyleAnimator.prototype.didMount = function (this: StyleAnimator<StyleContext, unknown>): void {
  // hook
};

StyleAnimator.prototype.unmount = function (this: StyleAnimator<StyleContext, unknown>): void {
  if ((this.animatorFlags & Animator.MountedFlag) !== 0) {
    this.willUnmount();
    this.setAnimatorFlags(this.animatorFlags & ~Animator.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

StyleAnimator.prototype.willUnmount = function (this: StyleAnimator<StyleContext, unknown>): void {
  // hook
};

StyleAnimator.prototype.onUnmount = function (this: StyleAnimator<StyleContext, unknown>): void {
  this.stopAnimating();
};

StyleAnimator.prototype.didUnmount = function (this: StyleAnimator<StyleContext, unknown>): void {
  // hook
};

StyleAnimator.prototype.toString = function (this: StyleAnimator<StyleContext, unknown>): string {
  return this.name;
};

StyleAnimator.getClass = function (type: unknown): StyleAnimatorClass | null {
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

StyleAnimator.define = function <V extends StyleContext, T, U, I>(descriptor: StyleAnimatorDescriptor<V, T, U, I>): StyleAnimatorConstructor<V, T, U, I> {
  let _super: StyleAnimatorClass | null | undefined = descriptor.extends;
  const state = descriptor.state;
  const look = descriptor.look;
  const precedence = descriptor.precedence;
  const initState = descriptor.initState;
  delete descriptor.extends;
  delete descriptor.state;
  delete descriptor.look;
  delete descriptor.precedence;
  delete descriptor.initState;

  if (_super === void 0) {
    _super = StyleAnimator.getClass(descriptor.type);
  }
  if (_super === null) {
    _super = StyleAnimator;
    if (descriptor.fromAny === void 0 && FromAny.is<T, U>(descriptor.type)) {
      descriptor.fromAny = descriptor.type.fromAny;
    }
  }

  const _constructor = function DecoratedStyleAnimator(this: StyleAnimator<V, T, U>, owner: V, animatorName: string): StyleAnimator<V, T, U> {
    let _this: StyleAnimator<V, T, U> = function StyleAnimatorAccessor(state?: T | U, timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): T | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        if (arguments.length === 2) {
          _this.setState(state!, timing);
        } else {
          _this.setState(state!, timing as AnyTiming | boolean | undefined, precedence);
        }
        return _this.owner;
      }
    } as StyleAnimator<V, T, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, animatorName) || _this;
    let ownState: T | undefined;
    if (initState !== void 0) {
      ownState = _this.fromAny(initState());
    } else if (state !== void 0) {
      ownState = _this.fromAny(state);
    }
    if (ownState !== void 0) {
      Object.defineProperty(_this, "ownValue", {
        value: ownState,
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(_this, "ownState", {
        value: ownState,
        enumerable: true,
        configurable: true,
      });
    }
    if (look !== void 0) {
      Object.defineProperty(_this, "ownLook", {
        value: look,
        enumerable: true,
        configurable: true,
      });
    }
    if (precedence !== void 0) {
      Object.defineProperty(_this, "precedence", {
        value: precedence,
        enumerable: true,
        configurable: true,
      });
    }
    return _this;
  } as unknown as StyleAnimatorConstructor<V, T, U, I>;

  const _prototype = descriptor as unknown as StyleAnimator<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};
