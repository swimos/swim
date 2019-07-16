// Copyright 2015-2019 SWIM.AI inc.
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

export interface LayoutAnchorConstructor {
  new<S extends LayoutScope>(scope: S, name: string, value: number, strength: ConstraintStrength): LayoutAnchor<S>;
}

export interface LayoutAnchorClass extends LayoutAnchorConstructor {
  (strength: AnyConstraintStrength): PropertyDecorator;
}

export interface LayoutAnchor<S extends LayoutScope> extends ConstrainBinding {
  (): number;
  (state: number): S;

  /** @hidden */
  readonly _scope: S;

  readonly scope: S;

  /** @hidden */
  _enabled: boolean;

  enabled(): boolean;
  enabled(enabled: boolean): this;
}

export const LayoutAnchor = (function (_super: typeof ConstrainBinding): LayoutAnchorClass {
  const LayoutAnchor: LayoutAnchorClass = function <S extends LayoutScope>(
      this: LayoutAnchor<S> | undefined, scope: S | AnyConstraintStrength,
      name?: string, value?: number, strength?: ConstraintStrength): LayoutAnchor<S> | PropertyDecorator {
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
      _this = _super.call(_this, scope as S, name!, value!, strength!) || _this;
      _this._enabled = false;
      return _this;
    } else { // decorator
      strength = ConstraintStrength.fromAny(scope as AnyConstraintStrength);
      return View.decorateLayoutAnchor.bind(void 0, LayoutAnchor, 0, strength);
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

  return LayoutAnchor;
}(ConstrainBinding));
