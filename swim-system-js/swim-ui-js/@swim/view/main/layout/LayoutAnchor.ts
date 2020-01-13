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
import {ConstrainBinding, AnyConstraintStrength, ConstraintStrength} from "@swim/constraint";
import {LayoutScope} from "./LayoutScope";
import {View} from "../View";

export type LayoutAnchorGetState<S extends LayoutScope> = (this: S, oldState: number) => number;

export type LayoutAnchorSetValue<S extends LayoutScope> = (this: S, newValue: number) => void;

export interface LayoutAnchorDescriptor<S extends LayoutScope> {
  get?: LayoutAnchorGetState<S>;
  set?: LayoutAnchorSetValue<S>;
  value?: number;
  strength?: AnyConstraintStrength;
  enabled?: boolean;
}

export interface LayoutAnchorConstructor {
  new<S extends LayoutScope>(scope: S, name: string, value: number,
                             strength: ConstraintStrength, enabled?: boolean): LayoutAnchor<S>;
}

export interface LayoutAnchorClass extends LayoutAnchorConstructor {
  <S extends LayoutScope>(descriptor: LayoutAnchorDescriptor<S>): PropertyDecorator;
}

export interface LayoutAnchor<S extends LayoutScope> extends ConstrainBinding {
  (): number;
  (state: number): S;

  /** @hidden */
  _scope: S;
  /** @hidden */
  _enabled: boolean;

  readonly scope: S;

  enabled(): boolean;
  enabled(enabled: boolean): this;

  updateState(): void;

  /** @hidden */
  getState?: LayoutAnchorGetState<S>;

  /** @hidden */
  setValue?: LayoutAnchorSetValue<S>;
}

export const LayoutAnchor = (function (_super: typeof ConstrainBinding): LayoutAnchorClass {
  const LayoutAnchor: LayoutAnchorClass = function <S extends LayoutScope>(
      this: LayoutAnchor<S> | undefined, scope: S | LayoutAnchorDescriptor<S>,
      name?: string, value?: number, strength?: ConstraintStrength, enabled?: boolean): LayoutAnchor<S> | PropertyDecorator {
    if (this instanceof LayoutAnchor) { // constructor
      let _this: LayoutAnchor<S> = function (state?: number): number | S {
        if (state === void 0) {
          return _this.state;
        } else {
          _this.enabled(true).setState(state);
          return _this._scope;
        }
      } as LayoutAnchor<S>;
      (_this as any).__proto__ = this;
      if (enabled === void 0) {
        enabled = false;
      }
      _this = _super.call(_this, scope as S, name!, value!, strength!) || _this;
      _this._enabled = enabled;
      return _this;
    } else { // decorator
      const descriptor = scope as LayoutAnchorDescriptor<S>;
      return View.decorateLayoutAnchor.bind(void 0, LayoutAnchor, descriptor);
    }
  } as LayoutAnchorClass;
  __extends(LayoutAnchor, _super);

  LayoutAnchor.prototype.enabled = function <S extends LayoutScope>(this: LayoutAnchor<S>, enabled?: boolean): boolean | LayoutAnchor<S> {
    if (enabled === void 0) {
      return this._enabled;
    } else {
      this._enabled = enabled;
      return this;
    }
  };

  LayoutAnchor.prototype.updateValue = function <S extends LayoutScope>(this: LayoutAnchor<S>, newValue: number): void {
    const oldValue = this._value;
    if (oldValue !== newValue) {
      this._value = newValue;
      if (this._enabled) {
        const setValue = this.setValue;
        if (setValue) {
          setValue.call(this._scope, newValue);
        }
      }
    }
  };

  LayoutAnchor.prototype.updateState = function <S extends LayoutScope>(this: LayoutAnchor<S>): void {
    if (!this._enabled) {
      const getState = this.getState;
      if (getState) {
        const oldState = this._state;
        const newState = getState.call(this._scope, oldState);
        this.setState(newState);
      }
    }
  };

  return LayoutAnchor;
}(ConstrainBinding));
