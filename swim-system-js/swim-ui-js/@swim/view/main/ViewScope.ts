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
import {Objects} from "@swim/util";
import {View} from "./View";

export interface ViewScopeDescriptor<T> {
  state?: T | null;
  inherit?: string | boolean | null;
}

export interface ViewScopeConstructor {
  new<V extends View, T>(view: V, name: string, state?: T | null, inherit?: string | null): ViewScope<V, T>;
}

export interface ViewScopeClass extends ViewScopeConstructor {
  <V extends View, T>(descriptor: ViewScopeDescriptor<T>): PropertyDecorator;
}

export interface ViewScope<V extends View, T> {
  (): T | null;
  (state: T | null): V;

  /** @hidden */
  _view: V;
  /** @hidden */
  _state: T | null;
  /** @hidden */
  _inherit: string | null;

  readonly view: V;

  readonly name: string;

  readonly state: T | null;

  setState(newState: T | null): void;

  readonly inherit: string | null;
}

export const ViewScope = (function (_super: typeof Object): ViewScopeClass {
  const ViewScope: ViewScopeClass = function <V extends View, T>(
      this: ViewScope<V, T> | undefined, view: V | ViewScopeDescriptor<T>,
      name?: string, state?: T | null, inherit?: string | null): ViewScope<V, T> | PropertyDecorator {
    if (this instanceof ViewScope) { // constructor
      let _this: ViewScope<V, T> = function (state?: T | null): T | null | V {
        if (state === void 0) {
          return _this.state;
        } else {
          _this.setState(state);
          return _this._view;
        }
      } as ViewScope<V, T>;
      (_this as any).__proto__ = this;
      if (state === void 0) {
        state = null;
      }
      if (inherit === void 0) {
        inherit = null;
      }
      _this = _super.call(_this) || _this;
      _this._view = view as V;
      Object.defineProperty(_this, "name", {
        value: name,
        enumerable: true,
        configurable: true,
      });
      _this._state = state;
      _this._inherit = inherit;
      return _this;
    } else { // decorator
      const descriptor = view as ViewScopeDescriptor<T>;
      return View.decorateViewScope.bind(void 0, ViewScope, descriptor);
    }
  } as ViewScopeClass;
  __extends(ViewScope, _super);

  Object.defineProperty(ViewScope.prototype, "view", {
    get: function <V extends View, T>(this: ViewScope<V, T>): V {
      return this._view;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(ViewScope.prototype, "state", {
    get: function <V extends View, T>(this: ViewScope<V, T>): T | null {
      let state = this._state;
      if (state === null) {
        const inherit = this._inherit;
        if (inherit !== null) {
          let view = this._view.parentView;
          while (view) {
            const scope = (view as any)[inherit];
            if (scope instanceof ViewScope) {
              state = scope.state;
              break;
            }
            view = view.parentView;
          }
        }
      }
      return state;
    },
    enumerable: true,
    configurable: true,
  });

  ViewScope.prototype.setState = function <V extends View, T>(this: ViewScope<V, T>, newState: T | null): void {
    const oldState = this._state;
    if (!Objects.equal(oldState, newState)) {
      this._state = newState;
      this._view.didSetViewScope(this, newState, oldState);
    }
  };

  Object.defineProperty(ViewScope.prototype, "inherit", {
    get: function <V extends View, T>(this: ViewScope<V, T>): string | null {
      return this._inherit;
    },
    enumerable: true,
    configurable: true,
  });

  return ViewScope;
}(Object));
