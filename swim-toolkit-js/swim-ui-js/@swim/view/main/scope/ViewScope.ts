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
import {ViewClass, View} from "../View";
import {AtomicViewScope} from "./AtomicViewScope";

export type ViewScopeInit<V extends View, T> = (this: V) => T;

export interface ViewScopeDescriptor<V extends View, T> {
  init?: ViewScopeInit<V, T>;
  value?: T;
  inherit?: string | boolean | null;
  /** @hidden */
  scopeType?: ViewScopeConstructor;
}

export interface ViewScopeConstructor {
  new<V extends View, T>(view: V, scopeName: string, value?: T, inherit?: string | null): ViewScope<V, T>;
}

export interface ViewScopeClass extends ViewScopeConstructor, PropertyDecorator {
  <V extends View, T>(descriptor?: ViewScopeDescriptor<V, T>): PropertyDecorator;

  // Forward type declarations
  /** @hidden */
  Atomic: typeof AtomicViewScope; // defined by AtomicViewScope
}

export interface ViewScope<V extends View, T> {
  (): T | undefined;
  (state: T | undefined): V;

  /** @hidden */
  _view: V;
  /** @hidden */
  _inherit: string | null;

  readonly view: V;

  readonly name: string;

  readonly inherit: string | null;

  readonly superScope: ViewScope<View, T> | null;

  readonly superState: T | undefined;

  readonly state: T | undefined;

  setState(newState: T | undefined): void;
}

export const ViewScope: ViewScopeClass = (function (_super: typeof Object): ViewScopeClass {
  function ViewScopeDecorator(viewClass: ViewClass, scopeName: string): void {
    const scopeType = ViewScope.Atomic;
    const descriptor: ViewScopeDescriptor<View, unknown> = {scopeType};
    View.decorateViewScope(scopeType, descriptor, viewClass, scopeName);
  }

  function ViewScopeDecoratorFactory<V extends View, T>(descriptor?: ViewScopeDescriptor<V, T>): PropertyDecorator {
    if (descriptor === void 0) {
      descriptor = {};
    }
    let scopeType = descriptor.scopeType;
    if (scopeType === void 0) {
      scopeType = ViewScope.Atomic;
      descriptor.scopeType = scopeType;
    }
    return View.decorateViewScope.bind(void 0, scopeType, descriptor);
  }

  function ViewScopeConstructor<V extends View, T>(
      this: ViewScope<V, T>, view: V, scopeName: string,
      value?: T, inherit?: string | null): ViewScope<V, T> {
    if (inherit === void 0) {
      inherit = null;
    }
    Object.defineProperty(this, "name", {
      value: scopeName,
      enumerable: true,
      configurable: true,
    });
    this._view = view;
    this._inherit = inherit;
    return this;
  }

  const ViewScope: ViewScopeClass = function <V extends View, T>(
      this: ViewScope<V, T> | unknown,
      view?: V | ViewScopeDescriptor<V, T> | unknown,
      scopeName?: string,
      value?: T,
      inherit?: string | null): ViewScope<V, T> | PropertyDecorator | void {
    if (this instanceof ViewScope) { // constructor
      return ViewScopeConstructor.call(this, view, scopeName, value, inherit);
    } else if (arguments.length === 1) { // decorator factory
      const descriptor = view as ViewScopeDescriptor<V, T> | undefined;
      return ViewScopeDecoratorFactory(descriptor);
    } else { // decorator
      const viewClass = view as ViewClass;
      ViewScopeDecorator(viewClass, scopeName!);
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

  Object.defineProperty(ViewScope.prototype, "inherit", {
    get: function (this: ViewScope<View, unknown>): string | null {
      return this._inherit;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(ViewScope.prototype, "superScope", {
    get: function <T>(this: ViewScope<View, T>): ViewScope<View, T> | null {
      const inherit = this._inherit;
      if (inherit !== null) {
        let view = this._view.parentView;
        while (view !== null) {
          const viewScope = view.getLazyViewScope(inherit) as ViewScope<View, T> | null;
          if (viewScope !== null) {
            return viewScope;
          }
          view = view.parentView;
        }
      }
      return null;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(ViewScope.prototype, "superState", {
    get: function <T>(this: ViewScope<View, T>): T | undefined {
      const superScope = this.superScope;
      return superScope !== null ? superScope.state : void 0;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(ViewScope.prototype, "state", {
    get: function <T>(this: ViewScope<View, T>): T | undefined {
      throw new Error(); // abstract
    },
    enumerable: true,
    configurable: true,
  });

  ViewScope.prototype.setState = function <T>(this: ViewScope<View, T>, newState: T | undefined): void {
    throw new Error(); // abstract
  };

  return ViewScope;
}(Object));
