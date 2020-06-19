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
import {ConstrainBinding, AnyConstraintStrength, ConstraintStrength} from "@swim/constraint";
import {LayoutContext} from "./LayoutContext";

export type LayoutAnchorGetState<L extends LayoutContext> =
  (this: LayoutAnchor<L>, oldState: number) => number;

export type LayoutAnchorSetValue<L extends LayoutContext> =
  (this: LayoutAnchor<L>, newValue: number) => void;

export interface LayoutAnchorDescriptor<L extends LayoutContext> {
  value?: number;
  strength?: AnyConstraintStrength;
  enabled?: boolean;
  get?: LayoutAnchorGetState<L>;
  set?: LayoutAnchorSetValue<L>;
}

export interface LayoutAnchorConstructor {
  new<L extends LayoutContext>(scope: L, anchorName: string, descriptor?: LayoutAnchorDescriptor<L>): LayoutAnchor<L>;
}

export interface LayoutAnchorClass extends LayoutAnchorConstructor {
  <L extends LayoutContext>(descriptor: LayoutAnchorDescriptor<L>): PropertyDecorator;
}

export interface LayoutAnchor<L extends LayoutContext> extends ConstrainBinding {
  (): number;
  (state: number): L;

  /** @hidden */
  _scope: L;
  /** @hidden */
  _enabled: boolean;

  readonly scope: L;

  enabled(): boolean;
  enabled(enabled: boolean): this;

  updateState(): void;

  /** @hidden */
  getState?: LayoutAnchorGetState<L>;

  /** @hidden */
  setValue?: LayoutAnchorSetValue<L>;
}

export const LayoutAnchor: LayoutAnchorClass = (function (_super: typeof ConstrainBinding): LayoutAnchorClass {
  function LayoutAnchorDecoratorFactory<L extends LayoutContext>(descriptor: LayoutAnchorDescriptor<L>): PropertyDecorator {
    return LayoutContext.decorateLayoutAnchor.bind(void 0, LayoutAnchor, descriptor);
  }

  function LayoutAnchorConstructor<L extends LayoutContext>(this: LayoutAnchor<L>, scope: L, anchorName: string,
                                                            descriptor?: LayoutAnchorDescriptor<L>): LayoutAnchor<L> {
    let value: number;
    let strength: ConstraintStrength;
    if (descriptor !== void 0 && descriptor.value !== void 0) {
      value = descriptor.value;
    } else {
      value = NaN;
    }
    if (descriptor !== void 0 && descriptor.strength !== void 0 && descriptor.strength !== null) {
      strength = ConstraintStrength.fromAny(descriptor.strength);
    } else {
      strength = ConstraintStrength.Strong;
    }
    const _this: LayoutAnchor<L> = _super.call(this, scope, anchorName, value, strength) || this;
    _this._enabled = descriptor !== void 0 ? !!descriptor.enabled : false;
    if (descriptor !== void 0) {
      if (descriptor.get !== void 0) {
        _this.getState = descriptor.get;
      }
      if (descriptor.set !== void 0) {
        _this.setValue = descriptor.set;
      }
    }
    return _this;
  }

  const LayoutAnchor: LayoutAnchorClass = function <L extends LayoutContext>(
      this: LayoutAnchor<L> | LayoutAnchorClass,
      scope: L | LayoutAnchorDescriptor<L>,
      anchorName?: string,
      descriptor?: LayoutAnchorDescriptor<L>): LayoutAnchor<L> | PropertyDecorator {
    if (this instanceof LayoutAnchor) { // constructor
      let _this: LayoutAnchor<L> = function accessor(state?: number): number | L {
        if (state === void 0) {
          return _this.state;
        } else {
          _this.enabled(true).setState(state);
          return _this._scope;
        }
      } as LayoutAnchor<L>;
      (_this as any).__proto__ = this;
      _this = LayoutAnchorConstructor.call(this, scope as L, anchorName as string, descriptor);
      return _this;
    } else { // decorator factory
      descriptor = scope as LayoutAnchorDescriptor<L>;
      return LayoutAnchorDecoratorFactory(descriptor);
    }
  } as LayoutAnchorClass;
  __extends(LayoutAnchor, _super);

  LayoutAnchor.prototype.enabled = function <L extends LayoutContext>(this: LayoutAnchor<L>, enabled?: boolean): boolean | LayoutAnchor<L> {
    if (enabled === void 0) {
      return this._enabled;
    } else {
      this._enabled = enabled;
      return this;
    }
  };

  LayoutAnchor.prototype.updateValue = function <L extends LayoutContext>(this: LayoutAnchor<L>, newValue: number): void {
    const oldValue = this._value;
    if (oldValue !== newValue) {
      this._value = newValue;
      if (this._enabled && this.setValue !== void 0) {
        this.setValue(newValue);
      }
    }
  };

  LayoutAnchor.prototype.updateState = function <L extends LayoutContext>(this: LayoutAnchor<L>): void {
    if (!this._enabled && this.getState !== void 0) {
      const oldState = this._state;
      const newState = this.getState(oldState);
      this.setState(newState);
    }
  };

  return LayoutAnchor;
}(ConstrainBinding));
