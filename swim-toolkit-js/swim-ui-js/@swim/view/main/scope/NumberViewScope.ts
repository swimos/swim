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
import {View} from "../View";
import {ViewScopeDescriptor, ViewScopeConstructor, ViewScope} from "./ViewScope";

/** @hidden */
export interface NumberViewScope<V extends View> extends ViewScope<V, number, number | string> {
}

/** @hidden */
export const NumberViewScope: ViewScopeConstructor<number, number | string> = (function (_super: typeof ViewScope): ViewScopeConstructor<number, number | string> {
  const NumberViewScope: ViewScopeConstructor<number, number | string> = function <V extends View>(
      this: NumberViewScope<V>, view: V, scopeName: string, descriptor?: ViewScopeDescriptor<V, number, number | string>): NumberViewScope<V> {
    let _this: NumberViewScope<V> = function accessor(state?: number | string): number | undefined | V {
      if (arguments.length === 0) {
        return _this.state;
      } else {
        _this.setState(state);
        return _this._view;
      }
    } as NumberViewScope<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, scopeName, descriptor) || _this;
    return _this;
  } as unknown as ViewScopeConstructor<number, number | string>;
  __extends(NumberViewScope, _super);

  NumberViewScope.prototype.fromAny = function (this: NumberViewScope<View>, value: number | string | null): number | null {
    if (typeof value === "string") {
      const number = +value;
      if (isFinite(number)) {
        return number;
      } else {
        throw new Error(value);
      }
    } else {
      return value;
    }
  };

  return NumberViewScope;
}(ViewScope));
ViewScope.Number = NumberViewScope;
