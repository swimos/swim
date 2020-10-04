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
import {ConstrainVariable, AnyConstraintStrength, ConstraintStrength} from "@swim/constraint";
import {View} from "../View";

export interface LayoutAnchorInit {
  extends?: LayoutAnchorPrototype;
  value?: number;
  strength?: AnyConstraintStrength;
  constrained?: boolean;

  getState?(oldState: number): number;
  setValue?(newValue: number): void;
  initValue?(): number;
}

export type LayoutAnchorDescriptorInit<V extends View, I = {}> = LayoutAnchorInit & ThisType<LayoutAnchor<V> & I> & I;

export type LayoutAnchorDescriptorExtends<V extends View, I = {}> = {extends: LayoutAnchorPrototype | undefined} & LayoutAnchorDescriptorInit<V, I>;

export type LayoutAnchorDescriptor<V extends View, I = {}> = LayoutAnchorDescriptorInit<V, I>;

export type LayoutAnchorPrototype = Function & {prototype: LayoutAnchor<any>};

export type LayoutAnchorConstructor<V extends View, I = {}> = {
  new(view: V, anchorName: string | undefined): LayoutAnchor<V> & I;
  prototype: LayoutAnchor<any> & I;
};

export declare abstract class LayoutAnchor<V extends View> {
  /** @hidden */
  _view: V;
  /** @hidden */
  _value: number;
  /** @hidden */
  _state: number;
  /** @hidden */
  _strength: ConstraintStrength;
  /** @hidden */
  _constrained: boolean;

  constructor(view: V, anchorName: string | undefined);

  get name(): string;

  get view(): V;

  get value(): number;

  updateValue(value: number): void;

  get state(): number;

  setState(newState: number): void;

  updateState(): void;

  get strength(): ConstraintStrength;

  setStrength(newStrength: AnyConstraintStrength): void;

  constrained(): boolean;
  constrained(constrained: boolean): this;

  /** @hidden */
  getState?(oldState: number): number;

  /** @hidden */
  setValue?(newValue: number): void;

  /** @hidden */
  initValue(): number;

  static define<V extends View, I = {}>(descriptor: LayoutAnchorDescriptorExtends<V, I>): LayoutAnchorConstructor<V, I>;
  static define<V extends View>(descriptor: LayoutAnchorDescriptor<V>): LayoutAnchorConstructor<V>;
}

export interface LayoutAnchor<V extends View> extends ConstrainVariable {
  (): number;
  (state: number): V;
}

export function LayoutAnchor<V extends View, I = {}>(descriptor: LayoutAnchorDescriptorExtends<V, I>): PropertyDecorator;
export function LayoutAnchor<V extends View>(descriptor: LayoutAnchorDescriptor<V>): PropertyDecorator;

export function LayoutAnchor<V extends View>(
    this: LayoutAnchor<V> | typeof LayoutAnchor,
    view: V | LayoutAnchorDescriptor<V>,
    anchorName?: string,
  ): LayoutAnchor<V> | PropertyDecorator {
  if (this instanceof LayoutAnchor) { // constructor
    return LayoutAnchorConstructor.call(this, view as V, anchorName);
  } else { // decorator factory
    return LayoutAnchorDecoratorFactory(view as LayoutAnchorDescriptor<V>);
  }
}
__extends(LayoutAnchor, ConstrainVariable);

function LayoutAnchorConstructor<V extends View>(this: LayoutAnchor<V>, view: V, anchorName: string | undefined): LayoutAnchor<V> {
  const _this: LayoutAnchor<V> = ConstrainVariable.call(this) || this;
  if (anchorName !== void 0) {
    Object.defineProperty(_this, "name", {
      value: anchorName,
      enumerable: true,
      configurable: true,
    });
  }
  _this._view = view;
  _this._value = _this.initValue();
  _this._state = NaN;
  _this._strength = ConstraintStrength.Strong;
  _this._constrained = false;
  return _this;
}

function LayoutAnchorDecoratorFactory<V extends View>(descriptor: LayoutAnchorDescriptor<V>): PropertyDecorator {
  return View.decorateLayoutAnchor.bind(View, LayoutAnchor.define(descriptor));
}

Object.defineProperty(LayoutAnchor.prototype, "view", {
  get: function <V extends View>(this: LayoutAnchor<V>): V {
    return this._view;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(LayoutAnchor.prototype, "value", {
  get: function (this: LayoutAnchor<View>): number {
    return this._value;
  },
  enumerable: true,
  configurable: true,
});

LayoutAnchor.prototype.updateValue = function (this: LayoutAnchor<View>, newValue: number): void {
  const oldValue = this._value;
  if (oldValue !== newValue) {
    this._value = newValue;
    if (this._constrained && this.setValue !== void 0) {
      this.setValue(newValue);
    }
  }
};

Object.defineProperty(LayoutAnchor.prototype, "state", {
  get: function (this: LayoutAnchor<View>): number {
    return this._state;
  },
  enumerable: true,
  configurable: true,
});

LayoutAnchor.prototype.setState = function (this: LayoutAnchor<View>, newState: number): void {
  const oldState = this._state;
  if (isFinite(oldState) && !isFinite(newState)) {
    this._view.removeConstraintVariable(this);
  }
  this._state = newState;
  if (isFinite(newState)) {
    if (!isFinite(oldState)) {
      this._view.addConstraintVariable(this);
    } else {
      this._view.setConstraintVariable(this, newState);
    }
  }
};

LayoutAnchor.prototype.updateState = function (this: LayoutAnchor<View>): void {
  if (!this._constrained && this.getState !== void 0) {
    const oldState = this._state;
    const newState = this.getState(oldState);
    this.setState(newState);
  }
};

Object.defineProperty(LayoutAnchor.prototype, "strength", {
  get: function (this: LayoutAnchor<View>): ConstraintStrength {
    return this._strength;
  },
  enumerable: true,
  configurable: true,
});

LayoutAnchor.prototype.setStrength = function (this: LayoutAnchor<View>, newStrength: AnyConstraintStrength): void {
  const state = this._state;
  const oldStrength = this._strength;
  newStrength = ConstraintStrength.fromAny(newStrength);
  if (isFinite(state) && oldStrength !== newStrength) {
    this._view.removeConstraintVariable(this);
  }
  this._strength = newStrength;
  if (isFinite(state) && oldStrength !== newStrength) {
    this._view.addConstraintVariable(this);
  }
};

LayoutAnchor.prototype.constrained = function (this: LayoutAnchor<View>, constrained?: boolean): boolean | any {
  if (constrained === void 0) {
    return this._constrained;
  } else {
    this._constrained = constrained;
    return this;
  }
};

LayoutAnchor.prototype.initValue = function (this: LayoutAnchor<View>): number {
  return NaN;
};

LayoutAnchor.define = function <V extends View, I>(descriptor: LayoutAnchorDescriptor<V, I>): LayoutAnchorConstructor<V, I> {
  let _super = descriptor.extends;
  const value = descriptor.value;
  const strength = descriptor.strength;
  const constrained = descriptor.constrained;
  delete descriptor.extends;
  delete descriptor.value;
  delete descriptor.strength;
  delete descriptor.constrained;

  if (_super === void 0) {
    _super = LayoutAnchor;
  }

  const _constructor = function LayoutAnchorAccessor(this: LayoutAnchor<V>, view: V, anchorName: string | undefined): LayoutAnchor<V> {
    let _this: LayoutAnchor<V> = function accessor(state?: number): number | V {
      if (state === void 0) {
        return _this._state;
      } else {
        _this.constrained(true).setState(state);
        return _this._view;
      }
    } as LayoutAnchor<V>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, view, anchorName) || _this;
    return _this;
  } as unknown as LayoutAnchorConstructor<V, I>;

  const _prototype = descriptor as unknown as LayoutAnchor<V> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (value !== void 0 && !_prototype.hasOwnProperty("initValue")) {
    _prototype.initValue = function (): number {
      return value;
    };
  }
  if (strength !== void 0) {
    _prototype._strength = ConstraintStrength.fromAny(strength);
  }
  if (constrained !== void 0) {
    _prototype._constrained = constrained;
  }

  return _constructor;
}
