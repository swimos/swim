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
import {FromAny} from "@swim/util";
import {View} from "../View";
import {ViewScopeDescriptor, ViewScope} from "./ViewScope";

/** @hidden */
export interface AnyViewScopeClass {
  new<V extends View, T, U = T>(type: FromAny<T, U>, view: V, scopeName?: string,
                                descriptor?: ViewScopeDescriptor<V, T, U>): AnyViewScope<V, T, U>;
}

/** @hidden */
export interface AnyViewScope<V extends View, T, U = T> extends ViewScope<V, T, U> {
  /** @hidden */
  readonly _type: FromAny<T, U>;

  readonly type: FromAny<T, U>;
}

/** @hidden */
export const AnyViewScope: AnyViewScopeClass = (function (_super: typeof ViewScope): AnyViewScopeClass {
  const AnyViewScope: AnyViewScopeClass = function <V extends View, T, U>(
      this: AnyViewScope<V, T, U>, type: FromAny<T, U>, view: V, scopeName: string,
      descriptor?: ViewScopeDescriptor<V, T, U>): AnyViewScope<V, T, U> {
    let _this: AnyViewScope<V, T, U> = function accessor(state?: T | U): T | undefined | V {
      if (arguments.length === 0) {
        return _this.state;
      } else {
        _this.setState(state as T | undefined);
        return _this._view;
      }
    } as AnyViewScope<V, T, U>;
    (_this as any).__proto__ = this;
    (_this as any)._type = type;
    _this = _super.call(_this, view, scopeName, descriptor) || _this;
    return _this;
  } as unknown as AnyViewScopeClass;
  __extends(AnyViewScope, _super);

  Object.defineProperty(AnyViewScope.prototype, "type", {
    get: function <V extends View, T, U>(this: AnyViewScope<V, T, U>): FromAny<T, U> {
      return this._type;
    },
    enumerable: true,
    configurable: true,
  });

  AnyViewScope.prototype.fromAny = function <T, U>(this: AnyViewScope<View, T, U>, value: T | U): T {
    return this._type.fromAny(value);
  };

  return AnyViewScope;
}(ViewScope));
ViewScope.Any = AnyViewScope;
