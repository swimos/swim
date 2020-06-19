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
import {Objects, FromAny} from "@swim/util";
import {View} from "../View";
import {AnyViewScope} from "./AnyViewScope";
import {ObjectViewScope} from "./ObjectViewScope";
import {StringViewScope} from "./StringViewScope";
import {BooleanViewScope} from "./BooleanViewScope";
import {NumberViewScope} from "./NumberViewScope";

export type ViewScopeInit<V extends View, T, U = T> =
  (this: ViewScope<V, T, U>) => T | U | undefined;

export type ViewScopeFromAny<V extends View, T, U = T> =
  (this: ViewScope<V, T, U>, value: T | U) => T | undefined;

export type ViewScopeTypeConstructor = FromAny<any>
                                     | typeof Object
                                     | typeof String
                                     | typeof Boolean
                                     | typeof Number
                                     | {new (...args: any): any}
                                     | any;

export type ViewScopeDescriptorType<V extends View, C extends ViewScopeTypeConstructor> =
  C extends typeof Number ? ViewScopeDescriptor<V, number | null, number | string | null> :
  C extends typeof Boolean ? ViewScopeDescriptor<V, boolean | null, boolean | string | null> :
  C extends typeof String ? ViewScopeDescriptor<V, string | null> :
  C extends typeof Object ? ViewScopeDescriptor<V, Object> :
  C extends FromAny<any> ? ViewScopeDescriptor<V, any> :
  C extends new (...args: any) => any ? ViewScopeDescriptor<V, InstanceType<C>, any> :
  ViewScopeDescriptor<V, any>;

export interface ViewScopeDescriptor<V extends View, T, U = T> {
  init?: ViewScopeInit<V, T, U>;
  value?: T | U;
  inherit?: string | boolean | null;
  fromAny?: ViewScopeFromAny<V, T, U>;
  /** @hidden */
  scopeType?: ViewScopeConstructor<T, U>;
}

export interface ViewScopeConstructor<T, U = T> {
  new<V extends View>(view: V, scopeName: string, descriptor?: ViewScopeDescriptor<V, T, U>): ViewScope<V, T, U>;
}

export interface ViewScopeClass {
  new<V extends View, T, U>(view: V, scopeName: string, value?: T | U, inherit?: string | null): ViewScope<V, T, U>;

  <V extends View, C extends ViewScopeTypeConstructor>(
      valueType: C, descriptor?: ViewScopeDescriptorType<V, C>): PropertyDecorator;

  // Forward type declarations
  /** @hidden */
  Any: typeof AnyViewScope; // defined by AnyViewScope
  /** @hidden */
  Object: typeof ObjectViewScope; // defined by ObjectViewScope
  /** @hidden */
  String: typeof StringViewScope; // defined by StringViewScope
  /** @hidden */
  Boolean: typeof BooleanViewScope; // defined by BooleanViewScope
  /** @hidden */
  Number: typeof NumberViewScope; // defined by NumberViewScope
}

export interface ViewScope<V extends View, T, U = T> {
  (): T | undefined;
  (state: T | U | undefined): V;

  /** @hidden */
  _view: V;
  /** @hidden */
  _inherit: string | null;
  /** @hidden */
  _auto: boolean;
  /** @hidden */
  _state: T | undefined;

  readonly view: V;

  readonly name: string;

  readonly inherit: string | null;

  setInherit(inherit: string | null): void;

  readonly superScope: ViewScope<View, T, U> | null;

  readonly superState: T | undefined;

  readonly ownState: T | undefined;

  readonly state: T | undefined;

  isAuto(): boolean;

  setAuto(auto: boolean): void;

  setState(newState: T | U | undefined): void;

  setAutoState(state: T | U | undefined): void;

  setOwnState(state: T | U | undefined): void;

  setBaseState(state: T | U | undefined): void;

  willSet(newState: T | undefined, oldState: T | undefined): void;

  onSet(newState: T | undefined, oldState: T | undefined): void;

  didSet(newState: T | undefined, oldState: T | undefined): void;

  fromAny(value: T | U): T | undefined;
}

export const ViewScope: ViewScopeClass = (function (_super: typeof Object): ViewScopeClass {
  function ViewScopeDecoratorFactory<V extends View, C extends ViewScopeTypeConstructor>(
      valueType: C, descriptor?: ViewScopeDescriptorType<V, C>): PropertyDecorator {
    if (descriptor === void 0) {
      descriptor = {} as ViewScopeDescriptorType<V, C>;
    }
    let scopeType = descriptor.scopeType;
    if (scopeType === void 0) {
      if (valueType === String) {
        scopeType = ViewScope.String;
      } else if (valueType === Boolean) {
        scopeType = ViewScope.Boolean;
      } else if (valueType === Number) {
        scopeType = ViewScope.Number;
      } else if (FromAny.is(valueType)) {
        scopeType = ViewScope.Any.bind(void 0, valueType);
      } else {
        scopeType = ViewScope.Object;
      }
      descriptor.scopeType = scopeType;
    }
    return View.decorateViewScope.bind(void 0, scopeType, descriptor);
  }

  function ViewScopeConstructor<V extends View, T, U = T>(
      this: ViewScope<V, T, U>, view: V, scopeName: string,
      descriptor?: ViewScopeDescriptor<V, T, U>): ViewScope<V, T, U> {
    this._view = view;
    Object.defineProperty(this, "name", {
      value: scopeName,
      enumerable: true,
      configurable: true,
    });
    if (descriptor !== void 0) {
      if (typeof descriptor.inherit === "string") {
        this._inherit = descriptor.inherit;
      } else if (descriptor.inherit === true) {
        this._inherit = scopeName;
      } else {
        this._inherit = null;
      }
    } else {
      this._inherit = null;
    }
    this._auto = true;
    if (descriptor !== void 0 && descriptor.fromAny !== void 0) {
      this.fromAny = descriptor.fromAny;
    }
    let value: T | U | undefined;
    if (descriptor !== void 0) {
      if (descriptor.init !== void 0) {
        value = descriptor.init.call(this);
      } else {
        value = descriptor.value;
      }
    }
    if (value !== void 0) {
      value = this.fromAny(value);
    }
    this._state = value as T;
    return this;
  }

  const ViewScope: ViewScopeClass = function <V extends View, T, U>(
      this: ViewScope<V, T, U> | ViewScopeClass,
      view?: V | ViewScopeTypeConstructor,
      scopeName?: string | ViewScopeDescriptor<V, T, U>,
      descriptor?: ViewScopeDescriptor<V, T, U>): ViewScope<V, T> | PropertyDecorator | void {
    if (this instanceof ViewScope) { // constructor
      return ViewScopeConstructor.call(this, view as V, scopeName as string, descriptor);
    } else { // decorator factory
      const valueType = view as ViewScopeTypeConstructor;
      descriptor = scopeName as ViewScopeDescriptor<V, T, U> | undefined;
      return ViewScopeDecoratorFactory(valueType, descriptor);
    }
  } as ViewScopeClass;
  __extends(ViewScope, _super);

  Object.defineProperty(ViewScope.prototype, "view", {
    get: function <V extends View>(this: ViewScope<V, unknown>): V {
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

  ViewScope.prototype.setInherit = function (this: ViewScope<View, unknown>,
                                             inherit: string | null): void {
    this._inherit = inherit;
  };

  Object.defineProperty(ViewScope.prototype, "superScope", {
    get: function <T, U>(this: ViewScope<View, T, U>): ViewScope<View, T, U> | null {
      const inherit = this._inherit;
      if (inherit !== null) {
        let view = this._view.parentView;
        while (view !== null) {
          const viewScope = view.getLazyViewScope(inherit) as ViewScope<View, T, U> | null;
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

  Object.defineProperty(ViewScope.prototype, "ownState", {
    get: function <T>(this: ViewScope<View, T>): T | undefined {
      return this._state;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(ViewScope.prototype, "state", {
    get: function <T>(this: ViewScope<View, T>): T | undefined {
      const state = this._state;
      return state !== void 0 ? state : this.superState;
    },
    enumerable: true,
    configurable: true,
  });

  ViewScope.prototype.isAuto = function (this: ViewScope<View, unknown>): boolean {
    return this._auto;
  };

  ViewScope.prototype.setAuto = function (this: ViewScope<View, unknown>,
                                          auto: boolean): void {
    if (this._auto !== auto) {
      this._auto = auto;
      this._view.viewScopeDidSetAuto(this, auto);
    }
  };

  ViewScope.prototype.setState = function <T, U>(this: ViewScope<View, T, U>,
                                                 state: T | U | undefined): void {
    this._auto = false;
    this.setOwnState(state);
  };

  ViewScope.prototype.setAutoState = function <T, U>(this: ViewScope<View, T, U>,
                                                     state: T | U | undefined): void {
    if (this._auto === true) {
      this.setOwnState(state);
    }
  };

  ViewScope.prototype.setOwnState = function <T, U>(this: ViewScope<View, T, U>,
                                                    newState: T | U | undefined): void {
    const oldState = this._state;
    if (newState !== void 0) {
      newState = this.fromAny(newState);
    }
    if (!Objects.equal(oldState, newState)) {
      this.willSet(newState as T | undefined, oldState);
      this._state = newState as T | undefined;
      this.onSet(newState as T | undefined, oldState);
      this.didSet(newState as T | undefined, oldState);
    }
  };

  ViewScope.prototype.setBaseState = function <T, U>(this: ViewScope<View, T, U>,
                                                     state: T | U | undefined): void {
    let superScope: ViewScope<View, T, U> | null | undefined;
    if (this._state === void 0 && (superScope = this.superScope, superScope !== null)) {
      superScope.setBaseState(state);
    } else {
      this.setState(state);
    }
  };

  ViewScope.prototype.willSet = function <T, U>(this: ViewScope<View, T, U>,
                                                newState: T | undefined,
                                                oldState: T | undefined): void {
    // hook
  };

  ViewScope.prototype.onSet = function <T, U>(this: ViewScope<View, T, U>,
                                              newState: T | undefined,
                                              oldState: T | undefined): void {
    // hook
  };

  ViewScope.prototype.didSet = function <T, U>(this: ViewScope<View, T, U>,
                                               newState: T | undefined,
                                               oldState: T | undefined): void {
    this._view.viewScopeDidSetState(this, newState, oldState);
  };

  ViewScope.prototype.fromAny = function <T, U>(this: ViewScope<View, T, U>,
                                                value: T | U): T | undefined {
    throw new Error(); // abstract
  };

  return ViewScope;
}(Object));
