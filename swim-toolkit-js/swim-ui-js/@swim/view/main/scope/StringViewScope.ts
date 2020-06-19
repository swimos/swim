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
export interface StringViewScope<V extends View> extends ViewScope<V, string> {
}

/** @hidden */
export const StringViewScope: ViewScopeConstructor<string> = (function (_super: typeof ViewScope): ViewScopeConstructor<string> {
  const StringViewScope: ViewScopeConstructor<string> = function <V extends View>(
      this: StringViewScope<V>, view: V, scopeName: string, descriptor?: ViewScopeDescriptor<V, string>): StringViewScope<V> {
    let _this: StringViewScope<V> = function accessor(state?: string): string | undefined | V {
      if (arguments.length === 0) {
        return _this.state;
      } else {
        _this.setState(state);
        return _this._view;
      }
    } as StringViewScope<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, scopeName, descriptor) || _this;
    return _this;
  } as unknown as ViewScopeConstructor<string>;
  __extends(StringViewScope, _super);

  StringViewScope.prototype.fromAny = function (this: StringViewScope<View>, value: string | null): string | null {
    return value;
  };

  return StringViewScope;
}(ViewScope));
ViewScope.String = StringViewScope;
