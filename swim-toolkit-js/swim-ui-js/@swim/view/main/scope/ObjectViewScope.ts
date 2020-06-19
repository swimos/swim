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
import {ViewScopeDescriptor, ViewScope} from "./ViewScope";

/** @hidden */
export interface ObjectViewScopeClass {
  new<V extends View, T>(view: V, scopeName: string, descriptor?: ViewScopeDescriptor<V, T>): ObjectViewScope<V, T>;
}

/** @hidden */
export interface ObjectViewScope<V extends View, T> extends ViewScope<V, T> {
}

/** @hidden */
export const ObjectViewScope: ObjectViewScopeClass = (function (_super: typeof ViewScope): ObjectViewScopeClass {
  const ObjectViewScope: ObjectViewScopeClass = function <V extends View, T>(
      this: ObjectViewScope<V, T>, view: V, scopeName: string,
      descriptor?: ViewScopeDescriptor<V, T>): ObjectViewScope<V, T> {
    let _this: ObjectViewScope<V, T> = function accessor(state?: T): T | undefined | V {
      if (arguments.length === 0) {
        return _this.state;
      } else {
        _this.setState(state);
        return _this._view;
      }
    } as ObjectViewScope<V, T>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, scopeName, descriptor) || _this;
    return _this;
  } as unknown as ObjectViewScopeClass;
  __extends(ObjectViewScope, _super);

  ObjectViewScope.prototype.fromAny = function <T>(this: ObjectViewScope<View, T>, value: T | null): T | null {
    return value;
  };

  return ObjectViewScope;
}(ViewScope));
ViewScope.Object = ObjectViewScope;
