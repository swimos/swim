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
import {ComponentFlags, Component} from "../Component";
import {StringComponentScope} from "./StringComponentScope";
import {BooleanComponentScope} from "./BooleanComponentScope";
import {NumberComponentScope} from "./NumberComponentScope";

export type ComponentScopeMemberType<C, K extends keyof C> =
  C extends {[P in K]: ComponentScope<any, infer T, any>} ? T : unknown;

export type ComponentScopeMemberInit<C, K extends keyof C> =
  C extends {[P in K]: ComponentScope<any, infer T, infer U>} ? T | U : unknown;

export type ComponentScopeFlags = number;

export interface ComponentScopeInit<T, U = T> {
  extends?: ComponentScopePrototype;
  type?: unknown;
  state?: T | U;
  inherit?: string | boolean;

  updateFlags?: ComponentFlags;
  willUpdate?(newState: T, oldState: T): void;
  onUpdate?(newState: T, oldState: T): void;
  didUpdate?(newState: T, oldState: T): void;
  fromAny?(value: T | U): T;
  initState?(): T | U;
}

export type ComponentScopeDescriptorInit<C extends Component, T, U = T, I = {}> = ComponentScopeInit<T, U> & ThisType<ComponentScope<C, T, U> & I> & I;

export type ComponentScopeDescriptorExtends<C extends Component, T, U = T, I = {}> = {extends: ComponentScopePrototype | undefined} & ComponentScopeDescriptorInit<C, T, U, I>;

export type ComponentScopeDescriptorFromAny<C extends Component, T, U = T, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ComponentScopeDescriptorInit<C, T, U, I>;

export type ComponentScopeDescriptor<C extends Component, T, U = T, I = {}> =
  U extends T ? ComponentScopeDescriptorInit<C, T, U, I> :
  T extends string | null | undefined ? U extends string | null | undefined ? {type: typeof String} & ComponentScopeDescriptorInit<C, T, U, I> : ComponentScopeDescriptorExtends<C, T, U, I> :
  T extends boolean | null | undefined ? U extends boolean | string | null | undefined ? {type: typeof Boolean} & ComponentScopeDescriptorInit<C, T, U, I> : ComponentScopeDescriptorExtends<C, T, U, I> :
  T extends number | null | undefined ? U extends number | string | null | undefined ? {type: typeof Number} & ComponentScopeDescriptorInit<C, T, U, I> : ComponentScopeDescriptorExtends<C, T, U, I> :
  ComponentScopeDescriptorFromAny<C, T, U, I>;

export type ComponentScopePrototype = Function & {prototype: ComponentScope<any, any, any>};

export type ComponentScopeConstructor<C extends Component, T, U = T, I = {}> = {
  new(component: C, scopeName: string | undefined): ComponentScope<C, T, U> & I;
  prototype: ComponentScope<any, any, any> & I;
};

export declare abstract class ComponentScope<C extends Component, T, U = T> {
  /** @hidden */
  _component: C;
  /** @hidden */
  _inherit: string | boolean;
  /** @hidden */
  _scopeFlags: ComponentScopeFlags;
  /** @hidden */
  _superScope?: ComponentScope<Component, T, U>;
  /** @hidden */
  _subScopes?: ComponentScope<Component, T, U>[];
  /** @hidden */
  _state: T;

  constructor(component: C, scopeName: string | undefined);

  get name(): string;

  get component(): C;

  get inherit(): string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  setInherited(inherited: boolean): void;

  updateFlags?: ComponentFlags;

  /** @hidden */
  get superName(): string | undefined;

  get superScope(): ComponentScope<Component, T, U> | null;

  /** @hidden */
  bindSuperScope(): void;

  /** @hidden */
  unbindSuperScope(): void;

  /** @hidden */
  addSubScope(subScope: ComponentScope<Component, T, U>): void;

  /** @hidden */
  removeSubScope(subScope: ComponentScope<Component, T, U>): void;

  isAuto(): boolean;

  setAuto(auto: boolean): void;

  isUpdated(): boolean;

  isRevising(): boolean;

  get state(): T;

  get ownState(): T | undefined;

  get superState(): T | undefined;

  getState(): T extends undefined ? never : T;

  getStateOr<E>(elseState: E): (T extends undefined ? never : T) | E;

  setState(state: T | U): void;

  /** @hidden */
  willSetState(newState: T, oldState: T): void;

  /** @hidden */
  onSetState(newState: T, oldState: T): void;

  /** @hidden */
  didSetState(newState: T, oldState: T): void;

  setAutoState(state: T | U): void;

  setOwnState(state: T | U): void;

  setBaseState(state: T | U): void;

  /** @hidden */
  onRevise(): void;

  /** @hidden */
  updateInherited(): void;

  update(newState: T, oldState: T): void;

  willUpdate(newState: T, oldState: T): void;

  onUpdate(newState: T, oldState: T): void;

  didUpdate(newState: T, oldState: T): void;

  /** @hidden */
  updateSubScopes(newState: T, oldState: T): void;

  /** @hidden */
  onIdle(): void;

  /** @hidden */
  revise(): void;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;

  fromAny(value: T | U): T;

  /** @hidden */
  initState?(): T | U;

  /** @hidden */
  static getConstructor(type: unknown): ComponentScopePrototype | null;

  static define<C extends Component, T, U = T, I = {}>(descriptor: ComponentScopeDescriptorExtends<C, T, U, I>): ComponentScopeConstructor<C, T, U, I>;
  static define<C extends Component, T, U = T>(descriptor: ComponentScopeDescriptor<C, T, U>): ComponentScopeConstructor<C, T, U>;

  /** @hidden */
  static UpdatedFlag: ComponentScopeFlags;
  /** @hidden */
  static RevisingFlag: ComponentScopeFlags;
  /** @hidden */
  static OverrideFlag: ComponentScopeFlags;
  /** @hidden */
  static InheritedFlag: ComponentScopeFlags;

  // Forward type declarations
  /** @hidden */
  static String: typeof StringComponentScope; // defined by StringComponentScope
  /** @hidden */
  static Boolean: typeof BooleanComponentScope; // defined by BooleanComponentScope
  /** @hidden */
  static Number: typeof NumberComponentScope; // defined by NumberComponentScope
}

export interface ComponentScope<C extends Component, T, U = T> {
  (): T;
  (state: T | U): C;
}

export function ComponentScope<C extends Component, T, U = T, I = {}>(descriptor: ComponentScopeDescriptorExtends<C, T, U, I>): PropertyDecorator;
export function ComponentScope<C extends Component, T, U = T>(descriptor: ComponentScopeDescriptor<C, T, U>): PropertyDecorator;

export function ComponentScope<C extends Component, T, U>(
    this: ComponentScope<C, T, U> | typeof ComponentScope,
    component: C | ComponentScopeDescriptor<C, T, U>,
    scopeName?: string,
  ): ComponentScope<C, T, U> | PropertyDecorator {
  if (this instanceof ComponentScope) { // constructor
    return ComponentScopeConstructor.call(this, component as C, scopeName);
  } else { // decorator factory
    return ComponentScopeDecoratorFactory(component as ComponentScopeDescriptor<C, T, U>);
  }
}
__extends(ComponentScope, Object);
Component.Scope = ComponentScope;

function ComponentScopeConstructor<C extends Component, T, U>(this: ComponentScope<C, T, U>, component: C, scopeName: string | undefined): ComponentScope<C, T, U> {
  if (scopeName !== void 0) {
    Object.defineProperty(this, "name", {
      value: scopeName,
      enumerable: true,
      configurable: true,
    });
  }
  this._component = component;
  this._scopeFlags = ComponentScope.UpdatedFlag;
  if (this.initState !== void 0) {
    const initState = this.initState();
    if (initState !== void 0) {
      this._state = this.fromAny(initState);
    }
  } else if (this._inherit !== false) {
    this._scopeFlags |= ComponentScope.InheritedFlag;
  }
  return this;
}

function ComponentScopeDecoratorFactory<C extends Component, T, U>(descriptor: ComponentScopeDescriptor<C, T, U>): PropertyDecorator {
  return Component.decorateComponentScope.bind(Component, ComponentScope.define(descriptor));
}

Object.defineProperty(ComponentScope.prototype, "component", {
  get: function <C extends Component>(this: ComponentScope<C, unknown>): C {
    return this._component;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ComponentScope.prototype, "inherit", {
  get: function (this: ComponentScope<Component, unknown>): string | boolean {
    return this._inherit;
  },
  enumerable: true,
  configurable: true,
});

ComponentScope.prototype.setInherit = function (this: ComponentScope<Component, unknown>,
                                                inherit: string | boolean): void {
  if (this._inherit !== inherit) {
    this.unbindSuperScope();
    if (inherit !== false) {
      this._inherit = inherit;
      this.bindSuperScope();
    } else if (this._inherit !== false) {
      this._inherit = false;
    }
  }
};

ComponentScope.prototype.isInherited = function (this: ComponentScope<Component, unknown>): boolean {
  return (this._scopeFlags & ComponentScope.InheritedFlag) !== 0;
};

ComponentScope.prototype.setInherited = function (this: ComponentScope<Component, unknown>,
                                                  inherited: boolean): void {
  if (inherited && (this._scopeFlags & ComponentScope.InheritedFlag) === 0) {
    this._scopeFlags |= ComponentScope.InheritedFlag;
    this.revise();
  } else if (!inherited && (this._scopeFlags & ComponentScope.InheritedFlag) !== 0) {
    this._scopeFlags &= ~ComponentScope.InheritedFlag;
    this.revise();
  }
};

Object.defineProperty(ComponentScope.prototype, "superName", {
  get: function (this: ComponentScope<Component, unknown>): string | undefined {
    const inherit = this._inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ComponentScope.prototype, "superScope", {
  get: function (this: ComponentScope<Component, unknown>): ComponentScope<Component, unknown> | null {
    let superScope: ComponentScope<Component, unknown> | null | undefined = this._superScope;
    if (superScope === void 0) {
      superScope = null;
      let component = this._component;
      if (!component.isMounted()) {
        const superName = this.superName;
        if (superName !== void 0) {
          do {
            const parentComponent = component.parentComponent;
            if (parentComponent !== null) {
              component = parentComponent;
              const scope = component.getLazyComponentScope(superName);
              if (scope !== null) {
                superScope = scope;
              } else {
                continue;
              }
            }
            break;
          } while (true);
        }
      }
    }
    return superScope;
  },
  enumerable: true,
  configurable: true,
});

ComponentScope.prototype.bindSuperScope = function (this: ComponentScope<Component, unknown>): void {
  let component = this._component;
  if (component.isMounted()) {
    const superName = this.superName;
    if (superName !== void 0) {
      do {
        const parentComponent = component.parentComponent;
        if (parentComponent !== null) {
          component = parentComponent;
          const scope = component.getLazyComponentScope(superName);
          if (scope !== null) {
            this._superScope = scope;
            scope.addSubScope(this);
            if (this.isInherited()) {
              this._state = scope._state;
              this._scopeFlags |= ComponentScope.UpdatedFlag;
              this.revise();
            }
          } else {
            continue;
          }
        }
        break;
      } while (true);
    }
  }
};

ComponentScope.prototype.unbindSuperScope = function (this: ComponentScope<Component, unknown>): void {
  const superScope = this._superScope;
  if (superScope !== void 0) {
    superScope.removeSubScope(this);
    this._superScope = void 0;
  }
};

ComponentScope.prototype.addSubScope = function <T, U>(this: ComponentScope<Component, T, U>,
                                                       subScope: ComponentScope<Component, T, U>): void {
  let subScopes = this._subScopes;
  if (subScopes === void 0) {
    subScopes = [];
    this._subScopes = subScopes;
  }
  subScopes.push(subScope);
};

ComponentScope.prototype.removeSubScope = function <T, U>(this: ComponentScope<Component, T, U>,
                                                          subScope: ComponentScope<Component, T, U>): void {
  const subScopes = this._subScopes;
  if (subScopes !== void 0) {
    const index = subScopes.indexOf(subScope);
    if (index >= 0) {
      subScopes.splice(index, 1);
    }
  }
};

ComponentScope.prototype.isAuto = function (this: ComponentScope<Component, unknown>): boolean {
  return (this._scopeFlags & ComponentScope.OverrideFlag) === 0;
};

ComponentScope.prototype.setAuto = function (this: ComponentScope<Component, unknown>,
                                             auto: boolean): void {
  if (auto && (this._scopeFlags & ComponentScope.OverrideFlag) !== 0) {
    this._scopeFlags &= ~ComponentScope.OverrideFlag;
  } else if (!auto && (this._scopeFlags & ComponentScope.OverrideFlag) === 0) {
    this._scopeFlags |= ComponentScope.OverrideFlag;
  }
};

ComponentScope.prototype.isUpdated = function (this: ComponentScope<Component, unknown>): boolean {
  return (this._scopeFlags & ComponentScope.UpdatedFlag) !== 0;
};

ComponentScope.prototype.isRevising = function (this: ComponentScope<Component, unknown>): boolean {
  return (this._scopeFlags & ComponentScope.RevisingFlag) !== 0;
};

Object.defineProperty(ComponentScope.prototype, "state", {
  get: function <T>(this: ComponentScope<Component, T>): T {
    return this._state;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ComponentScope.prototype, "ownState", {
  get: function <T>(this: ComponentScope<Component, T>): T | undefined {
    return !this.isInherited() ? this.state : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ComponentScope.prototype, "superState", {
  get: function <T>(this: ComponentScope<Component, T>): T | undefined {
    const superScope = this.superScope;
    return superScope !== null ? superScope.state : void 0;
  },
  enumerable: true,
  configurable: true,
});

ComponentScope.prototype.getState = function <T, U>(this: ComponentScope<Component, T, U>): T extends undefined ? never : T {
  const state = this.state;
  if (state === void 0) {
    throw new TypeError("undefined " + this.name + " state");
  }
  return state as T extends undefined ? never : T;
};

ComponentScope.prototype.getStateOr = function <T, U, E>(this: ComponentScope<Component, T, U>,
                                                         elseState: E): (T extends undefined ? never : T) | E {
  let state: T | E | undefined = this.state;
  if (state === void 0) {
    state = elseState;
  }
  return state as (T extends undefined ? never : T) | E;
};

ComponentScope.prototype.setState = function <T, U>(this: ComponentScope<Component, T, U>,
                                                    state: T | U): void {
  this._scopeFlags |= ComponentScope.OverrideFlag;
  this.setOwnState(state);
};

ComponentScope.prototype.willSetState = function <T, U>(this: ComponentScope<Component, T, U>,
                                                        newState: T, oldState: T): void {
  // hook
};

ComponentScope.prototype.onSetState = function <T, U>(this: ComponentScope<Component, T, U>,
                                                      newState: T, oldState: T): void {
  // hook
};

ComponentScope.prototype.didSetState = function <T, U>(this: ComponentScope<Component, T, U>,
                                                       newState: T, oldState: T): void {
  // hook
};

ComponentScope.prototype.setAutoState = function <T, U>(this: ComponentScope<Component, T, U>,
                                                        state: T | U): void {
  if ((this._scopeFlags & ComponentScope.OverrideFlag) === 0) {
    this.setOwnState(state);
  }
};

ComponentScope.prototype.setOwnState = function <T, U>(this: ComponentScope<Component, T, U>,
                                                       newState: T | U): void {
  const oldState = this._state;
  if (newState !== void 0) {
    newState = this.fromAny(newState);
  }
  this._scopeFlags &= ~ComponentScope.InheritedFlag;
  if (!Objects.equal(oldState, newState)) {
    this.willSetState(newState as T, oldState);
    this.willUpdate(newState as T, oldState);
    this._state = newState as T;
    this._scopeFlags |= ComponentScope.RevisingFlag | ComponentScope.UpdatedFlag;
    this.onSetState(newState as T, oldState);
    this.onUpdate(newState as T, oldState);
    this.updateSubScopes(newState as T, oldState);
    this.didUpdate(newState as T, oldState);
    this.didSetState(newState as T, oldState);
  }
};

ComponentScope.prototype.setBaseState = function <T, U>(this: ComponentScope<Component, T, U>,
                                                        state: T | U): void {
  let superScope: ComponentScope<Component, T, U> | null | undefined;
  if (this.isInherited() && (superScope = this.superScope, superScope !== null)) {
    superScope.setBaseState(state);
  } else {
    this.setState(state);
  }
};

ComponentScope.prototype.onRevise = function <T, U>(this: ComponentScope<Component, T, U>): void {
  if (this.isInherited()) {
    this.updateInherited();
  } else {
    this.onIdle();
  }
};

ComponentScope.prototype.updateInherited = function <T, U>(this: ComponentScope<Component, T, U>): void {
  const superScope = this._superScope;
  if (superScope !== void 0 && superScope.isRevising()) {
    this.update(superScope.state, this.state);
  } else {
    this.onIdle();
  }
};

ComponentScope.prototype.update = function <T, U>(this: ComponentScope<Component, T, U>,
                                                  newState: T, oldState: T): void {
  if (!Objects.equal(oldState, newState)) {
    this.willUpdate(newState, oldState);
    this._state = newState;
    this._scopeFlags |= ComponentScope.RevisingFlag | ComponentScope.UpdatedFlag;
    this.onUpdate(newState, oldState);
    this.updateSubScopes(newState, oldState);
    this.didUpdate(newState, oldState);
  }
};

ComponentScope.prototype.willUpdate = function <T, U>(this: ComponentScope<Component, T, U>,
                                                      newState: T, oldState: T): void {
  // hook
};

ComponentScope.prototype.onUpdate = function <T, U>(this: ComponentScope<Component, T, U>,
                                                    newState: T, oldState: T): void {
  const updateFlags = this.updateFlags;
  if (updateFlags !== void 0) {
    this._component.requireUpdate(updateFlags);
  }
};

ComponentScope.prototype.didUpdate = function <T, U>(this: ComponentScope<Component, T, U>,
                                                     newState: T, oldState: T): void {
  // hook
};

ComponentScope.prototype.updateSubScopes = function <T, U>(this: ComponentScope<Component, T, U>,
                                                           newState: T, oldState: T): void {
  const subScopes = this._subScopes;
  if (subScopes !== void 0) {
    for (let i = 0, n = subScopes.length; i < n; i += 1) {
      const subScope = subScopes[i];
      if (subScope.isInherited()) {
        subScope.revise();
      }
    }
  }
};

ComponentScope.prototype.onIdle = function (this: ComponentScope<Component, unknown>): void {
  if ((this._scopeFlags & ComponentScope.UpdatedFlag) !== 0) {
    this._scopeFlags &= ~ComponentScope.UpdatedFlag;
  } else {
    this._scopeFlags &= ~ComponentScope.RevisingFlag;
  }
};

ComponentScope.prototype.revise = function (this: ComponentScope<Component, unknown>): void {
  this._scopeFlags |= ComponentScope.RevisingFlag;
  this._component.requireUpdate(Component.NeedsRevise);
};

ComponentScope.prototype.mount = function (this: ComponentScope<Component, unknown>): void {
  this.bindSuperScope();
};

ComponentScope.prototype.unmount = function (this: ComponentScope<Component, unknown>): void {
  this.unbindSuperScope();
};

ComponentScope.prototype.fromAny = function <T, U>(this: ComponentScope<Component, T, U>, value: T | U): T {
  return value as T;
};

ComponentScope.getConstructor = function (type: unknown): ComponentScopePrototype | null {
  if (type === String) {
    return ComponentScope.String;
  } else if (type === Boolean) {
    return ComponentScope.Boolean;
  } else if (type === Number) {
    return ComponentScope.Number;
  }
  return null;
};

ComponentScope.define = function <C extends Component, T, U, I>(descriptor: ComponentScopeDescriptor<C, T, U, I>): ComponentScopeConstructor<C, T, U, I> {
  let _super: ComponentScopePrototype | null | undefined = descriptor.extends;
  const state = descriptor.state;
  const inherit = descriptor.inherit;
  delete descriptor.extends;
  delete descriptor.state;
  delete descriptor.inherit;

  if (_super === void 0) {
    _super = ComponentScope.getConstructor(descriptor.type);
  }
  if (_super === null) {
    _super = ComponentScope;
    if (!descriptor.hasOwnProperty("fromAny") && FromAny.is<T, U>(descriptor.type)) {
      descriptor.fromAny = descriptor.type.fromAny;
    }
  }

  const _constructor = function ComponentScopeAccessor(this: ComponentScope<C, T, U>, component: C, scopeName: string | undefined): ComponentScope<C, T, U> {
    let _this: ComponentScope<C, T, U> = function accessor(state?: T | U): T | C {
      if (arguments.length === 0) {
        return _this._state;
      } else {
        _this.setState(state!);
        return _this._component;
      }
    } as ComponentScope<C, T, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, component, scopeName) || _this;
    return _this;
  } as unknown as ComponentScopeConstructor<C, T, U, I>;

  const _prototype = descriptor as unknown as ComponentScope<C, T, U> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (state !== void 0 && !_prototype.hasOwnProperty("initState")) {
    _prototype.initState = function (): T | U {
      return state;
    };
  }
  _prototype._inherit = inherit !== void 0 ? inherit : false;

  return _constructor;
};

ComponentScope.UpdatedFlag = 1 << 0;
ComponentScope.RevisingFlag = 1 << 1;
ComponentScope.OverrideFlag = 1 << 2;
ComponentScope.InheritedFlag = 1 << 3;
