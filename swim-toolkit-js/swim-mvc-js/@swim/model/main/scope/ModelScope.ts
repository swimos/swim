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
import {ModelFlags, Model} from "../Model";
import {StringModelScope} from "./StringModelScope";
import {BooleanModelScope} from "./BooleanModelScope";
import {NumberModelScope} from "./NumberModelScope";

export type ModelScopeMemberType<M, K extends keyof M> =
  M extends {[P in K]: ModelScope<any, infer T, any>} ? T : unknown;

export type ModelScopeMemberInit<M, K extends keyof M> =
  M extends {[P in K]: ModelScope<any, infer T, infer U>} ? T | U : unknown;

export type ModelScopeFlags = number;

export interface ModelScopeInit<T, U = T> {
  extends?: ModelScopePrototype;
  type?: unknown;
  state?: T | U;
  inherit?: string | boolean;

  updateFlags?: ModelFlags;
  willUpdate?(newState: T, oldState: T): void;
  onUpdate?(newState: T, oldState: T): void;
  didUpdate?(newState: T, oldState: T): void;
  fromAny?(value: T | U): T;
  initState?(): T | U;
}

export type ModelScopeDescriptorInit<M extends Model, T, U = T, I = {}> = ModelScopeInit<T, U> & ThisType<ModelScope<M, T, U> & I> & I;

export type ModelScopeDescriptorExtends<M extends Model, T, U = T, I = {}> = {extends: ModelScopePrototype | undefined} & ModelScopeDescriptorInit<M, T, U, I>;

export type ModelScopeDescriptorFromAny<M extends Model, T, U = T, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ModelScopeDescriptorInit<M, T, U, I>;

export type ModelScopeDescriptor<M extends Model, T, U = T, I = {}> =
  U extends T ? ModelScopeDescriptorInit<M, T, U, I> :
  T extends string | null | undefined ? U extends string | null | undefined ? {type: typeof String} & ModelScopeDescriptorInit<M, T, U, I> : ModelScopeDescriptorExtends<M, T, U, I> :
  T extends boolean | null | undefined ? U extends boolean | string | null | undefined ? {type: typeof Boolean} & ModelScopeDescriptorInit<M, T, U, I> : ModelScopeDescriptorExtends<M, T, U, I> :
  T extends number | null | undefined ? U extends number | string | null | undefined ? {type: typeof Number} & ModelScopeDescriptorInit<M, T, U, I> : ModelScopeDescriptorExtends<M, T, U, I> :
  ModelScopeDescriptorFromAny<M, T, U, I>;

export type ModelScopePrototype = Function & {prototype: ModelScope<any, any, any>};

export type ModelScopeConstructor<M extends Model, T, U = T, I = {}> = {
  new(model: M, scopeName: string | undefined): ModelScope<M, T, U> & I;
  prototype: ModelScope<any, any, any> & I;
};

export declare abstract class ModelScope<M extends Model, T, U = T> {
  /** @hidden */
  _model: M;
  /** @hidden */
  _inherit: string | boolean;
  /** @hidden */
  _scopeFlags: ModelScopeFlags;
  /** @hidden */
  _superScope?: ModelScope<Model, T, U>;
  /** @hidden */
  _subScopes?: ModelScope<Model, T, U>[];
  /** @hidden */
  _state: T;

  constructor(model: M, scopeName: string | undefined);

  get name(): string;

  get model(): M;

  get inherit(): string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  setInherited(inherited: boolean): void;

  updateFlags?: ModelFlags;

  /** @hidden */
  get superName(): string | undefined;

  get superScope(): ModelScope<Model, T, U> | null;

  /** @hidden */
  bindSuperScope(): void;

  /** @hidden */
  unbindSuperScope(): void;

  /** @hidden */
  addSubScope(subScope: ModelScope<Model, T, U>): void;

  /** @hidden */
  removeSubScope(subScope: ModelScope<Model, T, U>): void;

  isAuto(): boolean;

  setAuto(auto: boolean): void;

  isUpdated(): boolean;

  isMutating(): boolean;

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
  onMutate(): void;

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
  mutate(): void;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;

  fromAny(value: T | U): T;

  /** @hidden */
  initState?(): T | U;

  /** @hidden */
  static getConstructor(type: unknown): ModelScopePrototype | null;

  static define<M extends Model, T, U = T, I = {}>(descriptor: ModelScopeDescriptorExtends<M, T, U, I>): ModelScopeConstructor<M, T, U, I>;
  static define<M extends Model, T, U = T>(descriptor: ModelScopeDescriptor<M, T, U>): ModelScopeConstructor<M, T, U>;

  /** @hidden */
  static UpdatedFlag: ModelScopeFlags;
  /** @hidden */
  static MutatingFlag: ModelScopeFlags;
  /** @hidden */
  static OverrideFlag: ModelScopeFlags;
  /** @hidden */
  static InheritedFlag: ModelScopeFlags;

  // Forward type declarations
  /** @hidden */
  static String: typeof StringModelScope; // defined by StringModelScope
  /** @hidden */
  static Boolean: typeof BooleanModelScope; // defined by BooleanModelScope
  /** @hidden */
  static Number: typeof NumberModelScope; // defined by NumberModelScope
}

export interface ModelScope<M extends Model, T, U = T> {
  (): T;
  (state: T | U): M;
}

export function ModelScope<M extends Model, T, U = T, I = {}>(descriptor: ModelScopeDescriptorExtends<M, T, U, I>): PropertyDecorator;
export function ModelScope<M extends Model, T, U = T>(descriptor: ModelScopeDescriptor<M, T, U>): PropertyDecorator;

export function ModelScope<M extends Model, T, U>(
    this: ModelScope<M, T, U> | typeof ModelScope,
    model: M | ModelScopeDescriptor<M, T, U>,
    scopeName?: string,
  ): ModelScope<M, T, U> | PropertyDecorator {
  if (this instanceof ModelScope) { // constructor
    return ModelScopeConstructor.call(this, model as M, scopeName);
  } else { // decorator factory
    return ModelScopeDecoratorFactory(model as ModelScopeDescriptor<M, T, U>);
  }
}
__extends(ModelScope, Object);
Model.Scope = ModelScope;

function ModelScopeConstructor<M extends Model, T, U>(this: ModelScope<M, T, U>, model: M, scopeName: string | undefined): ModelScope<M, T, U> {
  if (scopeName !== void 0) {
    Object.defineProperty(this, "name", {
      value: scopeName,
      enumerable: true,
      configurable: true,
    });
  }
  this._model = model;
  this._scopeFlags = ModelScope.UpdatedFlag;
  if (this.initState !== void 0) {
    const initState = this.initState();
    if (initState !== void 0) {
      this._state = this.fromAny(initState);
    }
  } else if (this._inherit !== false) {
    this._scopeFlags |= ModelScope.InheritedFlag;
  }
  return this;
}

function ModelScopeDecoratorFactory<M extends Model, T, U>(descriptor: ModelScopeDescriptor<M, T, U>): PropertyDecorator {
  return Model.decorateModelScope.bind(Model, ModelScope.define(descriptor));
}

Object.defineProperty(ModelScope.prototype, "model", {
  get: function <M extends Model>(this: ModelScope<M, unknown>): M {
    return this._model;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ModelScope.prototype, "inherit", {
  get: function (this: ModelScope<Model, unknown>): string | boolean {
    return this._inherit;
  },
  enumerable: true,
  configurable: true,
});

ModelScope.prototype.setInherit = function (this: ModelScope<Model, unknown>,
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

ModelScope.prototype.isInherited = function (this: ModelScope<Model, unknown>): boolean {
  return (this._scopeFlags & ModelScope.InheritedFlag) !== 0;
};

ModelScope.prototype.setInherited = function (this: ModelScope<Model, unknown>,
                                              inherited: boolean): void {
  if (inherited && (this._scopeFlags & ModelScope.InheritedFlag) === 0) {
    this._scopeFlags |= ModelScope.InheritedFlag;
    this.mutate();
  } else if (!inherited && (this._scopeFlags & ModelScope.InheritedFlag) !== 0) {
    this._scopeFlags &= ~ModelScope.InheritedFlag;
    this.mutate();
  }
};

Object.defineProperty(ModelScope.prototype, "superName", {
  get: function (this: ModelScope<Model, unknown>): string | undefined {
    const inherit = this._inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ModelScope.prototype, "superScope", {
  get: function (this: ModelScope<Model, unknown>): ModelScope<Model, unknown> | null {
    let superScope: ModelScope<Model, unknown> | null | undefined = this._superScope;
    if (superScope === void 0) {
      superScope = null;
      let model = this._model;
      if (!model.isMounted()) {
        const superName = this.superName;
        if (superName !== void 0) {
          do {
            const parentModel = model.parentModel;
            if (parentModel !== null) {
              model = parentModel;
              const scope = model.getLazyModelScope(superName);
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

ModelScope.prototype.bindSuperScope = function (this: ModelScope<Model, unknown>): void {
  let model = this._model;
  if (model.isMounted()) {
    const superName = this.superName;
    if (superName !== void 0) {
      do {
        const parentModel = model.parentModel;
        if (parentModel !== null) {
          model = parentModel;
          const scope = model.getLazyModelScope(superName);
          if (scope !== null) {
            this._superScope = scope;
            scope.addSubScope(this);
            if (this.isInherited()) {
              this._state = scope._state;
              this._scopeFlags |= ModelScope.UpdatedFlag;
              this.mutate();
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

ModelScope.prototype.unbindSuperScope = function (this: ModelScope<Model, unknown>): void {
  const superScope = this._superScope;
  if (superScope !== void 0) {
    superScope.removeSubScope(this);
    this._superScope = void 0;
  }
};

ModelScope.prototype.addSubScope = function <T, U>(this: ModelScope<Model, T, U>,
                                                   subScope: ModelScope<Model, T, U>): void {
  let subScopes = this._subScopes;
  if (subScopes === void 0) {
    subScopes = [];
    this._subScopes = subScopes;
  }
  subScopes.push(subScope);
};

ModelScope.prototype.removeSubScope = function <T, U>(this: ModelScope<Model, T, U>,
                                                      subScope: ModelScope<Model, T, U>): void {
  const subScopes = this._subScopes;
  if (subScopes !== void 0) {
    const index = subScopes.indexOf(subScope);
    if (index >= 0) {
      subScopes.splice(index, 1);
    }
  }
};

ModelScope.prototype.isAuto = function (this: ModelScope<Model, unknown>): boolean {
  return (this._scopeFlags & ModelScope.OverrideFlag) === 0;
};

ModelScope.prototype.setAuto = function (this: ModelScope<Model, unknown>,
                                         auto: boolean): void {
  if (auto && (this._scopeFlags & ModelScope.OverrideFlag) !== 0) {
    this._scopeFlags &= ~ModelScope.OverrideFlag;
  } else if (!auto && (this._scopeFlags & ModelScope.OverrideFlag) === 0) {
    this._scopeFlags |= ModelScope.OverrideFlag;
  }
};

ModelScope.prototype.isUpdated = function (this: ModelScope<Model, unknown>): boolean {
  return (this._scopeFlags & ModelScope.UpdatedFlag) !== 0;
};

ModelScope.prototype.isMutating = function (this: ModelScope<Model, unknown>): boolean {
  return (this._scopeFlags & ModelScope.MutatingFlag) !== 0;
};

Object.defineProperty(ModelScope.prototype, "state", {
  get: function <T>(this: ModelScope<Model, T>): T {
    return this._state;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ModelScope.prototype, "ownState", {
  get: function <T>(this: ModelScope<Model, T>): T | undefined {
    return !this.isInherited() ? this.state : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ModelScope.prototype, "superState", {
  get: function <T>(this: ModelScope<Model, T>): T | undefined {
    const superScope = this.superScope;
    return superScope !== null ? superScope.state : void 0;
  },
  enumerable: true,
  configurable: true,
});

ModelScope.prototype.getState = function <T, U>(this: ModelScope<Model, T, U>): T extends undefined ? never : T {
  const state = this.state;
  if (state === void 0) {
    throw new TypeError("undefined " + this.name + " state");
  }
  return state as T extends undefined ? never : T;
};

ModelScope.prototype.getStateOr = function <T, U, E>(this: ModelScope<Model, T, U>,
                                                     elseState: E): (T extends undefined ? never : T) | E {
  let state: T | E | undefined = this.state;
  if (state === void 0) {
    state = elseState;
  }
  return state as (T extends undefined ? never : T) | E;
};

ModelScope.prototype.setState = function <T, U>(this: ModelScope<Model, T, U>,
                                                state: T | U): void {
  this._scopeFlags |= ModelScope.OverrideFlag;
  this.setOwnState(state);
};

ModelScope.prototype.willSetState = function <T, U>(this: ModelScope<Model, T, U>,
                                                    newState: T, oldState: T): void {
  // hook
};

ModelScope.prototype.onSetState = function <T, U>(this: ModelScope<Model, T, U>,
                                                  newState: T, oldState: T): void {
  // hook
};

ModelScope.prototype.didSetState = function <T, U>(this: ModelScope<Model, T, U>,
                                                   newState: T, oldState: T): void {
  // hook
};

ModelScope.prototype.setAutoState = function <T, U>(this: ModelScope<Model, T, U>,
                                                    state: T | U): void {
  if ((this._scopeFlags & ModelScope.OverrideFlag) === 0) {
    this.setOwnState(state);
  }
};

ModelScope.prototype.setOwnState = function <T, U>(this: ModelScope<Model, T, U>,
                                                   newState: T | U): void {
  const oldState = this._state;
  if (newState !== void 0) {
    newState = this.fromAny(newState);
  }
  this._scopeFlags &= ~ModelScope.InheritedFlag;
  if (!Objects.equal(oldState, newState)) {
    this.willSetState(newState as T, oldState);
    this.willUpdate(newState as T, oldState);
    this._state = newState as T;
    this._scopeFlags |= ModelScope.MutatingFlag | ModelScope.UpdatedFlag;
    this.onSetState(newState as T, oldState);
    this.onUpdate(newState as T, oldState);
    this.updateSubScopes(newState as T, oldState);
    this.didUpdate(newState as T, oldState);
    this.didSetState(newState as T, oldState);
  }
};

ModelScope.prototype.setBaseState = function <T, U>(this: ModelScope<Model, T, U>,
                                                    state: T | U): void {
  let superScope: ModelScope<Model, T, U> | null | undefined;
  if (this.isInherited() && (superScope = this.superScope, superScope !== null)) {
    superScope.setBaseState(state);
  } else {
    this.setState(state);
  }
};

ModelScope.prototype.onMutate = function <T, U>(this: ModelScope<Model, T, U>): void {
  if (this.isInherited()) {
    this.updateInherited();
  } else {
    this.onIdle();
  }
};

ModelScope.prototype.updateInherited = function <T, U>(this: ModelScope<Model, T, U>): void {
  const superScope = this._superScope;
  if (superScope !== void 0 && superScope.isMutating()) {
    this.update(superScope.state, this.state);
  } else {
    this.onIdle();
  }
};

ModelScope.prototype.update = function <T, U>(this: ModelScope<Model, T, U>,
                                              newState: T, oldState: T): void {
  if (!Objects.equal(oldState, newState)) {
    this.willUpdate(newState, oldState);
    this._state = newState;
    this._scopeFlags |= ModelScope.MutatingFlag | ModelScope.UpdatedFlag;
    this.onUpdate(newState, oldState);
    this.updateSubScopes(newState, oldState);
    this.didUpdate(newState, oldState);
  }
};

ModelScope.prototype.willUpdate = function <T, U>(this: ModelScope<Model, T, U>,
                                                  newState: T, oldState: T): void {
  // hook
};

ModelScope.prototype.onUpdate = function <T, U>(this: ModelScope<Model, T, U>,
                                                newState: T, oldState: T): void {
  const updateFlags = this.updateFlags;
  if (updateFlags !== void 0) {
    this._model.requireUpdate(updateFlags);
  }
};

ModelScope.prototype.didUpdate = function <T, U>(this: ModelScope<Model, T, U>,
                                                 newState: T, oldState: T): void {
  // hook
};

ModelScope.prototype.updateSubScopes = function <T, U>(this: ModelScope<Model, T, U>,
                                                       newState: T, oldState: T): void {
  const subScopes = this._subScopes;
  if (subScopes !== void 0) {
    for (let i = 0, n = subScopes.length; i < n; i += 1) {
      const subScope = subScopes[i];
      if (subScope.isInherited()) {
        subScope.mutate();
      }
    }
  }
};

ModelScope.prototype.onIdle = function (this: ModelScope<Model, unknown>): void {
  if ((this._scopeFlags & ModelScope.UpdatedFlag) !== 0) {
    this._scopeFlags &= ~ModelScope.UpdatedFlag;
  } else {
    this._scopeFlags &= ~ModelScope.MutatingFlag;
  }
};

ModelScope.prototype.mutate = function (this: ModelScope<Model, unknown>): void {
  this._scopeFlags |= ModelScope.MutatingFlag;
  this._model.requireUpdate(Model.NeedsMutate);
};

ModelScope.prototype.mount = function (this: ModelScope<Model, unknown>): void {
  this.bindSuperScope();
};

ModelScope.prototype.unmount = function (this: ModelScope<Model, unknown>): void {
  this.unbindSuperScope();
};

ModelScope.prototype.fromAny = function <T, U>(this: ModelScope<Model, T, U>, value: T | U): T {
  return value as T;
};

ModelScope.getConstructor = function (type: unknown): ModelScopePrototype | null {
  if (type === String) {
    return ModelScope.String;
  } else if (type === Boolean) {
    return ModelScope.Boolean;
  } else if (type === Number) {
    return ModelScope.Number;
  }
  return null;
};

ModelScope.define = function <M extends Model, T, U, I>(descriptor: ModelScopeDescriptor<M, T, U, I>): ModelScopeConstructor<M, T, U, I> {
  let _super: ModelScopePrototype | null | undefined = descriptor.extends;
  const state = descriptor.state;
  const inherit = descriptor.inherit;
  delete descriptor.extends;
  delete descriptor.state;
  delete descriptor.inherit;

  if (_super === void 0) {
    _super = ModelScope.getConstructor(descriptor.type);
  }
  if (_super === null) {
    _super = ModelScope;
    if (!descriptor.hasOwnProperty("fromAny") && FromAny.is<T, U>(descriptor.type)) {
      descriptor.fromAny = descriptor.type.fromAny;
    }
  }

  const _constructor = function ModelScopeAccessor(this: ModelScope<M, T, U>, model: M, scopeName: string | undefined): ModelScope<M, T, U> {
    let _this: ModelScope<M, T, U> = function accessor(state?: T | U): T | M {
      if (arguments.length === 0) {
        return _this._state;
      } else {
        _this.setState(state!);
        return _this._model;
      }
    } as ModelScope<M, T, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, model, scopeName) || _this;
    return _this;
  } as unknown as ModelScopeConstructor<M, T, U, I>;

  const _prototype = descriptor as unknown as ModelScope<M, T, U> & I;
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

ModelScope.UpdatedFlag = 1 << 0;
ModelScope.MutatingFlag = 1 << 1;
ModelScope.OverrideFlag = 1 << 2;
ModelScope.InheritedFlag = 1 << 3;
