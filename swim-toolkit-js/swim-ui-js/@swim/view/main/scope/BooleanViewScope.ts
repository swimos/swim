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
export interface BooleanViewScope<V extends View> extends ViewScope<V, boolean, boolean | string> {
}

/** @hidden */
export const BooleanViewScope: ViewScopeConstructor<boolean, boolean | string> = (function (_super: typeof ViewScope): ViewScopeConstructor<boolean, boolean | string> {
  const BooleanViewScope: ViewScopeConstructor<boolean, boolean | string> = function <V extends View>(
      this: BooleanViewScope<V>, view: V, scopeName: string, descriptor?: ViewScopeDescriptor<V, boolean, boolean | string>): BooleanViewScope<V> {
    let _this: BooleanViewScope<V> = function accessor(state?: boolean | string): boolean | undefined | V {
      if (arguments.length === 0) {
        return _this.state;
      } else {
        _this.setState(state);
        return _this._view;
      }
    } as BooleanViewScope<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, scopeName, descriptor) || _this;
    return _this;
  } as unknown as ViewScopeConstructor<boolean, boolean | string>;
  __extends(BooleanViewScope, _super);

  BooleanViewScope.prototype.fromAny = function (this: BooleanViewScope<View>, value: boolean | string | null): boolean | null {
    if (typeof value === "string") {
      return !!value;
    } else {
      return value;
    }
  };

  return BooleanViewScope;
}(ViewScope));
ViewScope.Boolean = BooleanViewScope;
