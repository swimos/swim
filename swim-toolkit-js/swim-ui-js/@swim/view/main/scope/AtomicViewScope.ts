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
import {View} from "../View";
import {ViewScopeConstructor, ViewScope} from "./ViewScope";

/** @hidden */
export interface AtomicViewScope<V extends View, T> extends ViewScope<V, T> {
  /** @hidden */
  _state: T | undefined;
}

/** @hidden */
export const AtomicViewScope: ViewScopeConstructor = (function (_super: typeof ViewScope): ViewScopeConstructor {
  const AtomicViewScope: ViewScopeConstructor = function <V extends View, T>(
      this: AtomicViewScope<V, T>, view: V, scopeName: string,
      value?: T, inherit?: string | null): AtomicViewScope<V, T> {
    let _this: AtomicViewScope<V, T> = function accessor(state?: T): T | undefined | V {
      if (arguments.length === 0) {
        return _this.state;
      } else {
        _this.setState(state);
        return _this._view;
      }
    } as AtomicViewScope<V, T>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, scopeName, value, inherit) || _this;
    this._state = value;
    return _this;
  } as unknown as ViewScopeConstructor;
  __extends(AtomicViewScope, _super);

  Object.defineProperty(AtomicViewScope.prototype, "state", {
    get: function <T>(this: AtomicViewScope<View, T>): T | undefined {
      const state = this._state;
      return state !== void 0 ? state : this.superState;
    },
    enumerable: true,
    configurable: true,
  });

  AtomicViewScope.prototype.setState = function <T>(this: AtomicViewScope<View, T>, newState: T | undefined): void {
    const oldState = this._state;
    if (!Objects.equal(oldState, newState)) {
      this._state = newState;
      this._view.viewScopeDidSetState(this, newState, oldState);
    }
  };

  return AtomicViewScope;
}(ViewScope));
ViewScope.Atomic = AtomicViewScope;
