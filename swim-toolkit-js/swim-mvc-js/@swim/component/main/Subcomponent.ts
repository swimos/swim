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
import {Component} from "./Component";
import {ComponentObserverType} from "./ComponentObserver";
import {SubcomponentObserver} from "./SubcomponentObserver";

export type SubcomponentMemberType<C, K extends keyof C> =
  C extends {[P in K]: Subcomponent<any, infer S, any>} ? S : unknown;

export type SubcomponentMemberInit<C, K extends keyof C> =
  C extends {[P in K]: Subcomponent<any, infer T, infer U>} ? T | U : unknown;

export interface SubcomponentInit<S extends Component, U = S> {
  extends?: SubcomponentPrototype;
  observe?: boolean;
  child?: boolean;
  type?: unknown;

  willSetSubcomponent?(newSubcomponent: S | null, oldSubcomponent: S | null): void;
  onSetSubcomponent?(newSubcomponent: S | null, oldSubcomponent: S | null): void;
  didSetSubcomponent?(newSubcomponent: S | null, oldSubcomponent: S | null): void;
  createSubcomponent?(): S | U | null;
  fromAny?(value: S | U): S | null;
}

export type SubcomponentDescriptorInit<C extends Component, S extends Component, U = S, I = ComponentObserverType<S>> = SubcomponentInit<S, U> & ThisType<Subcomponent<C, S, U> & I> & I;

export type SubcomponentDescriptorExtends<C extends Component, S extends Component, U = S, I = ComponentObserverType<S>> = {extends: SubcomponentPrototype | undefined} & SubcomponentDescriptorInit<C, S, U, I>;

export type SubcomponentDescriptorFromAny<C extends Component, S extends Component, U = S, I = ComponentObserverType<S>> = ({type: FromAny<S, U>} | {fromAny(value: S | U): S | null}) & SubcomponentDescriptorInit<C, S, U, I>;

export type SubcomponentDescriptor<C extends Component, S extends Component, U = S, I = ComponentObserverType<S>> =
  U extends S ? SubcomponentDescriptorInit<C, S, U, I> :
  SubcomponentDescriptorFromAny<C, S, U, I>;

export type SubcomponentPrototype = Function & {prototype: Subcomponent<any, any>};

export type SubcomponentConstructor<C extends Component, S extends Component, U = S, I = ComponentObserverType<S>> = {
  new(component: C, subcomponentName: string | undefined): Subcomponent<C, S, U> & I;
  prototype: Subcomponent<any, any, any> & I;
};

export declare abstract class Subcomponent<C extends Component, S extends Component, U = S> {
  /** @hidden */
  _component: C;
  /** @hidden */
  _subcomponent: S | null;

  constructor(component: C, subcomponentName: string | undefined);

  /** @hidden */
  child: boolean;

  /** @hidden */
  readonly type?: unknown;

  get name(): string;

  get component(): C;

  get subcomponent(): S | null;

  getSubcomponent(): S;

  setSubcomponent(subcomponent: S | U | null): void;

  /** @hidden */
  doSetSubcomponent(newSubcomponent: S | null): void;

  /** @hidden */
  willSetSubcomponent(newSubcomponent: S | null, oldSubcomponent: S | null): void;

  /** @hidden */
  onSetSubcomponent(newSubcomponent: S | null, oldSubcomponent: S | null): void;

  /** @hidden */
  didSetSubcomponent(newSubcomponent: S | null, oldSubcomponent: S | null): void;

  /** @hidden */
  willSetOwnSubcomponent(newSubcomponent: S | null, oldSubcomponent: S | null): void;

  /** @hidden */
  onSetOwnSubcomponent(newSubcomponent: S | null, oldSubcomponent: S | null): void;

  /** @hidden */
  didSetOwnSubcomponent(newSubcomponent: S | null, oldSubcomponent: S | null): void;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;

  insert(parentComponent: Component, key?: string): S | null;
  insert(key?: string): S | null;

  remove(): S | null;

  createSubcomponent(): S | U | null;

  fromAny(value: S | U): S | null;

  static define<C extends Component, S extends Component = Component, U = S, I = ComponentObserverType<S>>(descriptor: SubcomponentDescriptorExtends<C, S, U, I>): SubcomponentConstructor<C, S, U, I>;
  static define<C extends Component, S extends Component = Component, U = S>(descriptor: SubcomponentDescriptor<C, S, U>): SubcomponentConstructor<C, S, U>;

  // Forward type declarations
  /** @hidden */
  static Observer: typeof SubcomponentObserver; // defined by SubcomponentObserver
}

export interface Subcomponent<C extends Component, S extends Component, U = S> {
  (): S | null;
  (subcomponent: S | U | null): C;
}

export function Subcomponent<C extends Component, S extends Component = Component, U = S, I = ComponentObserverType<S>>(descriptor: SubcomponentDescriptorExtends<C, S, U, I>): PropertyDecorator;
export function Subcomponent<C extends Component, S extends Component = Component, U = S>(descriptor: SubcomponentDescriptor<C, S, U>): PropertyDecorator;

export function Subcomponent<C extends Component, S extends Component, U>(
    this: Subcomponent<C, S> | typeof Subcomponent,
    component: C | SubcomponentDescriptor<C, S, U>,
    subcomponentName?: string,
  ): Subcomponent<C, S> | PropertyDecorator {
  if (this instanceof Subcomponent) { // constructor
    return SubcomponentConstructor.call(this, component as C, subcomponentName);
  } else { // decorator factory
    return SubcomponentDecoratorFactory(component as SubcomponentDescriptor<C, S, U>);
  }
}
__extends(Subcomponent, Object);
Component.Subcomponent = Subcomponent;

function SubcomponentConstructor<C extends Component, S extends Component, U>(this: Subcomponent<C, S, U>, component: C, subcomponentName: string | undefined): Subcomponent<C, S, U> {
  if (subcomponentName !== void 0) {
    Object.defineProperty(this, "name", {
      value: subcomponentName,
      enumerable: true,
      configurable: true,
    });
  }
  this._component = component;
  this._subcomponent = null;
  return this;
}

function SubcomponentDecoratorFactory<C extends Component, S extends Component, U>(descriptor: SubcomponentDescriptor<C, S, U>): PropertyDecorator {
  return Component.decorateSubcomponent.bind(Component, Subcomponent.define(descriptor));
}

Object.defineProperty(Subcomponent.prototype, "component", {
  get: function <C extends Component>(this: Subcomponent<C, Component>): C {
    return this._component;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(Subcomponent.prototype, "subcomponent", {
  get: function <S extends Component>(this: Subcomponent<Component, S>): S | null {
    return this._subcomponent;
  },
  enumerable: true,
  configurable: true,
});

Subcomponent.prototype.getSubcomponent = function <S extends Component>(this: Subcomponent<Component, S>): S {
  const subcomponent = this.subcomponent;
  if (subcomponent === null) {
    throw new TypeError("null " + this.name + " subcomponent");
  }
  return subcomponent;
};

Subcomponent.prototype.setSubcomponent = function <S extends Component, U>(this: Subcomponent<Component, S, U>,
                                                                           subcomponent: S | U | null): void {
  if (subcomponent !== null) {
    subcomponent = this.fromAny(subcomponent);
  }
  if (this.child) {
    this._component.setChildComponent(this.name, subcomponent as S | null);
  } else {
    this.doSetSubcomponent(subcomponent as S | null);
  }
};

Subcomponent.prototype.doSetSubcomponent = function <S extends Component>(this: Subcomponent<Component, S>,
                                                                          newSubcomponent: S | null): void {
  const oldSubcomponent = this._subcomponent;
  if (oldSubcomponent !== newSubcomponent) {
    this.willSetOwnSubcomponent(newSubcomponent, oldSubcomponent);
    this.willSetSubcomponent(newSubcomponent, oldSubcomponent);
    this._subcomponent = newSubcomponent;
    this.onSetOwnSubcomponent(newSubcomponent, oldSubcomponent);
    this.onSetSubcomponent(newSubcomponent, oldSubcomponent);
    this.didSetSubcomponent(newSubcomponent, oldSubcomponent);
    this.didSetOwnSubcomponent(newSubcomponent, oldSubcomponent);
  }
};

Subcomponent.prototype.willSetSubcomponent = function <S extends Component>(this: Subcomponent<Component, S>,
                                                                            newSubcomponent: S | null,
                                                                            oldSubcomponent: S | null): void {
  // hook
};

Subcomponent.prototype.onSetSubcomponent = function <S extends Component>(this: Subcomponent<Component, S>,
                                                                          newSubcomponent: S | null,
                                                                          oldSubcomponent: S | null): void {
  // hook
};

Subcomponent.prototype.didSetSubcomponent = function <S extends Component>(this: Subcomponent<Component, S>,
                                                                           newSubcomponent: S | null,
                                                                           oldSubcomponent: S | null): void {
  // hook
};

Subcomponent.prototype.willSetOwnSubcomponent = function <S extends Component>(this: Subcomponent<Component, S>,
                                                                               newSubcomponent: S | null,
                                                                               oldSubcomponent: S | null): void {
  // hook
};

Subcomponent.prototype.onSetOwnSubcomponent = function <S extends Component>(this: Subcomponent<Component, S>,
                                                                             newSubcomponent: S | null,
                                                                             oldSubcomponent: S | null): void {
  // hook
};

Subcomponent.prototype.didSetOwnSubcomponent = function <S extends Component>(this: Subcomponent<Component, S>,
                                                                              newSubcomponent: S | null,
                                                                              oldSubcomponent: S | null): void {
  // hook
};

Subcomponent.prototype.mount = function (this: Subcomponent<Component, Component>): void {
  // hook
};

Subcomponent.prototype.unmount = function (this: Subcomponent<Component, Component>): void {
  // hook
};

Subcomponent.prototype.insert = function <S extends Component>(this: Subcomponent<Component, S>,
                                                               parentComponent?: Component | string,
                                                               key?: string): S | null {
  let subcomponent = this._subcomponent;
  if (subcomponent === null) {
    subcomponent = this.createSubcomponent();
  }
  if (subcomponent !== null) {
    if (typeof parentComponent === "string") {
      key = parentComponent;
      parentComponent = void 0;
    }
    if (parentComponent === void 0) {
      parentComponent = this._component;
    }
    if (subcomponent.parentComponent !== parentComponent) {
      if (key !== void 0) {
        parentComponent.setChildComponent(key, subcomponent);
      } else {
        parentComponent.appendChildComponent(subcomponent);
      }
    }
    if (this._subcomponent === null) {
      this.doSetSubcomponent(subcomponent);
    }
  }
  return subcomponent
};

Subcomponent.prototype.remove = function <S extends Component>(this: Subcomponent<Component, S>): S | null {
  const subcomponent = this._subcomponent;
  if (subcomponent !== null) {
    subcomponent.remove();
  }
  return subcomponent;
};

Subcomponent.prototype.createSubcomponent = function <S extends Component, U>(this: Subcomponent<Component, S, U>): S | U | null {
  return null;
};

Subcomponent.prototype.fromAny = function <S extends Component, U>(this: Subcomponent<Component, S, U>, value: S | U): S | null {
  return value as S | null;
};

Subcomponent.define = function <C extends Component, S extends Component, U, I>(descriptor: SubcomponentDescriptor<C, S, U, I>): SubcomponentConstructor<C, S, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    if (descriptor.observe !== false) {
      _super = Subcomponent.Observer;
    } else {
      _super = Subcomponent;
    }
  }

  const _constructor = function SubcomponentAccessor(this: Subcomponent<C, S>, component: C, subcomponentName: string | undefined): Subcomponent<C, S, U> {
    let _this: Subcomponent<C, S, U> = function accessor(subcomponent?: S | U | null): S | null | C {
      if (subcomponent === void 0) {
        return _this._subcomponent;
      } else {
        _this.setSubcomponent(subcomponent);
        return _this._component;
      }
    } as Subcomponent<C, S, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, component, subcomponentName) || _this;
    return _this;
  } as unknown as SubcomponentConstructor<C, S, U, I>;

  const _prototype = descriptor as unknown as Subcomponent<C, S, U> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (!_prototype.hasOwnProperty("child")) {
    _prototype.child = true;
  }

  return _constructor;
};
