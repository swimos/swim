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
import {Component} from "../Component";
import type {ComponentObserverType} from "../ComponentObserver";

export type ComponentFastenerMemberType<C, K extends keyof C> =
  C[K] extends ComponentFastener<any, infer S, any> ? S : never;

export type ComponentFastenerMemberInit<C, K extends keyof C> =
  C[K] extends ComponentFastener<any, infer T, infer U> ? T | U : never;

export type ComponentFastenerFlags = number;

export interface ComponentFastenerInit<S extends Component, U = never> {
  extends?: ComponentFastenerClass;
  key?: string | boolean;
  type?: unknown;
  child?: boolean;
  observe?: boolean;

  willSetComponent?(newComponent: S | null, oldComponent: S | null, targetComponent: Component | null): void;
  onSetComponent?(newComponent: S | null, oldComponent: S | null, targetComponent: Component | null): void;
  didSetComponent?(newComponent: S | null, oldComponent: S | null, targetComponent: Component | null): void;

  parentComponent?: Component | null;
  createComponent?(): S | U | null;
  insertComponent?(parentComponent: Component, childComponent: S, targetComponent: Component | null, key: string | undefined): void;
  fromAny?(value: S | U): S | null;
}

export type ComponentFastenerDescriptor<C extends Component, S extends Component, U = never, I = {}> = ComponentFastenerInit<S, U> & ThisType<ComponentFastener<C, S, U> & I> & Partial<I>;

export interface ComponentFastenerConstructor<C extends Component, S extends Component, U = never, I = {}> {
  new<O extends C>(owner: O, key: string | undefined, fastenerName: string | undefined): ComponentFastener<O, S, U> & I;
  prototype: Omit<ComponentFastener<any, any>, "key"> & {key?: string | boolean} & I;
}

export interface ComponentFastenerClass extends Function {
  readonly prototype: Omit<ComponentFastener<any, any>, "key"> & {key?: string | boolean};
}

export interface ComponentFastener<C extends Component, S extends Component, U = never> {
  (): S | null;
  (component: S | U | null, targetComponent?: Component | null): C;

  readonly name: string;

  readonly owner: C;

  /** @hidden */
  fastenerFlags: ComponentFastenerFlags;

  /** @hidden */
  setFastenerFlags(fastenerFlags: ComponentFastenerFlags): void;

  readonly key: string | undefined;

  readonly component: S | null;

  getComponent(): S;

  setComponent(newComponent: S | U | null, targetComponent?: Component | null): S | null;

  /** @hidden */
  doSetComponent(newComponent: S | null, targetComponent: Component | null): void;

  /** @hidden */
  attachComponent(newComponent: S): void;

  /** @hidden */
  detachComponent(oldComponent: S): void;

  /** @hidden */
  willSetComponent(newComponent: S | null, oldComponent: S | null, targetComponent: Component | null): void;

  /** @hidden */
  onSetComponent(newComponent: S | null, oldComponent: S | null, targetComponent: Component | null): void;

  /** @hidden */
  didSetComponent(newComponent: S | null, oldComponent: S | null, targetComponent: Component | null): void;

  /** @hidden */
  readonly parentComponent: Component | null;

  injectComponent(parentComponent?: Component | null, childComponent?: S | U | null, targetComponent?: Component | null, key?: string | null): S | null;

  createComponent(): S | U | null;

  /** @hidden */
  insertComponent(parentComponent: Component, childComponent: S, targetComponent: Component | null, key: string | undefined): void;

  removeComponent(): S | null;

  /** @hidden */
  observe?: boolean;

  /** @hidden */
  child?: boolean;

  /** @hidden */
  readonly type?: unknown;

  fromAny(value: S | U): S | null;

  isMounted(): boolean;

  /** @hidden */
  mount(): void;

  /** @hidden */
  willMount(): void;

  /** @hidden */
  onMount(): void;

  /** @hidden */
  didMount(): void;

  /** @hidden */
  unmount(): void;

  /** @hidden */
  willUnmount(): void;

  /** @hidden */
  onUnmount(): void;

  /** @hidden */
  didUnmount(): void;
}

export const ComponentFastener = function <C extends Component, S extends Component, U>(
    this: ComponentFastener<C, S, U> | typeof ComponentFastener,
    owner: C | ComponentFastenerDescriptor<C, S, U>,
    key?: string,
    fastenerName?: string,
  ): ComponentFastener<C, S, U> | PropertyDecorator {
  if (this instanceof ComponentFastener) { // constructor
    return ComponentFastenerConstructor.call(this as unknown as ComponentFastener<Component, Component, unknown>, owner as C, key, fastenerName);
  } else { // decorator factory
    return ComponentFastenerDecoratorFactory(owner as ComponentFastenerDescriptor<C, S, U>);
  }
} as {
  /** @hidden */
  new<C extends Component, S extends Component, U = never>(owner: C, key: string | undefined, fastenerName: string | undefined): ComponentFastener<C, S, U>;

  <C extends Component, S extends Component = Component, U = never, I = {}>(descriptor: {observe: boolean} & ComponentFastenerDescriptor<C, S, U, I & ComponentObserverType<S>>): PropertyDecorator;
  <C extends Component, S extends Component = Component, U = never, I = {}>(descriptor: ComponentFastenerDescriptor<C, S, U, I>): PropertyDecorator;

  /** @hidden */
  prototype: ComponentFastener<any, any>;

  define<C extends Component, S extends Component = Component, U = never, I = {}>(descriptor: {observe: boolean} & ComponentFastenerDescriptor<C, S, U, I & ComponentObserverType<S>>): ComponentFastenerConstructor<C, S, U, I>;
  define<C extends Component, S extends Component = Component, U = never, I = {}>(descriptor: ComponentFastenerDescriptor<C, S, U, I>): ComponentFastenerConstructor<C, S, U, I>;

  /** @hidden */
  MountedFlag: ComponentFastenerFlags;
};
__extends(ComponentFastener, Object);

function ComponentFastenerConstructor<C extends Component, S extends Component, U>(this: ComponentFastener<C, S, U>, owner: C, key: string | undefined, fastenerName: string | undefined): ComponentFastener<C, S, U> {
  if (fastenerName !== void 0) {
    Object.defineProperty(this, "name", {
      value: fastenerName,
      enumerable: true,
      configurable: true,
    });
  }
  Object.defineProperty(this, "owner", {
    value: owner,
    enumerable: true,
  });
  Object.defineProperty(this, "fastenerFlags", {
    value: 0,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "key", {
    value: key,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "component", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  return this;
}

function ComponentFastenerDecoratorFactory<C extends Component, S extends Component, U>(descriptor: ComponentFastenerDescriptor<C, S, U>): PropertyDecorator {
  return Component.decorateComponentFastener.bind(Component, ComponentFastener.define(descriptor as ComponentFastenerDescriptor<Component, Component>));
}

ComponentFastener.prototype.setFastenerFlags = function (this: ComponentFastener<Component, Component>, fastenerFlags: ComponentFastenerFlags): void {
  Object.defineProperty(this, "fastenerFlags", {
    value: fastenerFlags,
    enumerable: true,
    configurable: true,
  });
};

ComponentFastener.prototype.getComponent = function <S extends Component>(this: ComponentFastener<Component, S>): S {
  const component = this.component;
  if (component === null) {
    throw new TypeError("null " + this.name + " component");
  }
  return component;
};

ComponentFastener.prototype.setComponent = function <S extends Component>(this: ComponentFastener<Component, S>, newComponent: S | null, targetComponent?: Component | null): S | null {
  const oldComponent = this.component;
  if (newComponent !== null) {
    newComponent = this.fromAny(newComponent);
  }
  if (targetComponent === void 0) {
    targetComponent = null;
  }
  if (this.child === true) {
    if (newComponent !== null && (newComponent.parentComponent !== this.owner || newComponent.key !== this.key)) {
      this.insertComponent(this.owner, newComponent, targetComponent, this.key);
    } else if (newComponent === null && oldComponent !== null) {
      oldComponent.remove();
    }
  }
  this.doSetComponent(newComponent, targetComponent);
  return oldComponent;
};

ComponentFastener.prototype.doSetComponent = function <S extends Component>(this: ComponentFastener<Component, S>, newComponent: S | null, targetComponent: Component | null): void {
  const oldComponent = this.component;
  if (oldComponent !== newComponent) {
    this.willSetComponent(newComponent, oldComponent, targetComponent);
    if (oldComponent !== null) {
      this.detachComponent(oldComponent);
    }
    Object.defineProperty(this, "component", {
      value: newComponent,
      enumerable: true,
      configurable: true,
    });
    if (newComponent !== null) {
      this.attachComponent(newComponent);
    }
    this.onSetComponent(newComponent, oldComponent, targetComponent);
    this.didSetComponent(newComponent, oldComponent, targetComponent);
  }
};

ComponentFastener.prototype.attachComponent = function <S extends Component>(this: ComponentFastener<Component, S>, newComponent: S): void {
  if (this.observe === true) {
    newComponent.addComponentObserver(this as ComponentObserverType<S>);
  }
};

ComponentFastener.prototype.detachComponent = function <S extends Component>(this: ComponentFastener<Component, S>, oldComponent: S): void {
  if (this.observe === true) {
    oldComponent.removeComponentObserver(this as ComponentObserverType<S>);
  }
};

ComponentFastener.prototype.willSetComponent = function <S extends Component>(this: ComponentFastener<Component, S>, newComponent: S | null, oldComponent: S | null, targetComponent: Component | null): void {
  // hook
};

ComponentFastener.prototype.onSetComponent = function <S extends Component>(this: ComponentFastener<Component, S>, newComponent: S | null, oldComponent: S | null, targetComponent: Component | null): void {
  // hook
};

ComponentFastener.prototype.didSetComponent = function <S extends Component>(this: ComponentFastener<Component, S>, newComponent: S | null, oldComponent: S | null, targetComponent: Component | null): void {
  // hook
};

Object.defineProperty(ComponentFastener.prototype, "parentComponent", {
  get(this: ComponentFastener<Component, Component>): Component | null {
    return this.owner;
  },
  enumerable: true,
  configurable: true,
});

ComponentFastener.prototype.injectComponent = function <S extends Component>(this: ComponentFastener<Component, S>, parentComponent?: Component | null, childComponent?: S | null, targetComponent?: Component | null, key?: string | null): S | null {
  if (targetComponent === void 0) {
    targetComponent = null;
  }
  if (childComponent === void 0 || childComponent === null) {
    childComponent = this.component;
    if (childComponent === null) {
      childComponent = this.createComponent();
    }
  } else {
    childComponent = this.fromAny(childComponent);
    if (childComponent !== null) {
      this.doSetComponent(childComponent, targetComponent);
    }
  }
  if (childComponent !== null) {
    if (parentComponent === void 0 || parentComponent === null) {
      parentComponent = this.parentComponent;
    }
    if (key === void 0) {
      key = this.key;
    } else if (key === null) {
      key = void 0;
    }
    if (parentComponent !== null && (childComponent.parentComponent !== parentComponent || childComponent.key !== key)) {
      this.insertComponent(parentComponent, childComponent, targetComponent, key);
    }
    if (this.component === null) {
      this.doSetComponent(childComponent, targetComponent);
    }
  }
  return childComponent
};

ComponentFastener.prototype.createComponent = function <S extends Component, U>(this: ComponentFastener<Component, S, U>): S | U | null {
  return null;
};

ComponentFastener.prototype.insertComponent = function <S extends Component>(this: ComponentFastener<Component, S>, parentComponent: Component, childComponent: S, targetComponent: Component | null, key: string | undefined): void {
  parentComponent.insertChildComponent(childComponent, targetComponent, key);
};

ComponentFastener.prototype.removeComponent = function <S extends Component>(this: ComponentFastener<Component, S>): S | null {
  const childComponent = this.component;
  if (childComponent !== null) {
    childComponent.remove();
  }
  return childComponent;
};

ComponentFastener.prototype.fromAny = function <S extends Component, U>(this: ComponentFastener<Component, S, U>, value: S | U): S | null {
  const type = this.type;
  if (FromAny.is<S, U>(type)) {
    return type.fromAny(value);
  } else if (value instanceof Component) {
    return value;
  }
  return null;
};

ComponentFastener.prototype.isMounted = function (this: ComponentFastener<Component, Component>): boolean {
  return (this.fastenerFlags & ComponentFastener.MountedFlag) !== 0;
};

ComponentFastener.prototype.mount = function (this: ComponentFastener<Component, Component>): void {
  if ((this.fastenerFlags & ComponentFastener.MountedFlag) === 0) {
    this.willMount();
    this.setFastenerFlags(this.fastenerFlags | ComponentFastener.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ComponentFastener.prototype.willMount = function (this: ComponentFastener<Component, Component>): void {
  // hook
};

ComponentFastener.prototype.onMount = function (this: ComponentFastener<Component, Component>): void {
  // hook
};

ComponentFastener.prototype.didMount = function (this: ComponentFastener<Component, Component>): void {
  // hook
};

ComponentFastener.prototype.unmount = function (this: ComponentFastener<Component, Component>): void {
  if ((this.fastenerFlags & ComponentFastener.MountedFlag) !== 0) {
    this.willUnmount();
    this.setFastenerFlags(this.fastenerFlags & ~ComponentFastener.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ComponentFastener.prototype.willUnmount = function (this: ComponentFastener<Component, Component>): void {
  // hook
};

ComponentFastener.prototype.onUnmount = function (this: ComponentFastener<Component, Component>): void {
  // hook
};

ComponentFastener.prototype.didUnmount = function (this: ComponentFastener<Component, Component>): void {
  // hook
};

ComponentFastener.define = function <C extends Component, S extends Component, U, I>(descriptor: ComponentFastenerDescriptor<C, S, U, I>): ComponentFastenerConstructor<C, S, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    _super = ComponentFastener;
  }

  const _constructor = function DecoratedComponentFastener(this: ComponentFastener<C, S>, owner: C, key: string | undefined, fastenerName: string | undefined): ComponentFastener<C, S, U> {
    let _this: ComponentFastener<C, S, U> = function ComponentFastenerAccessor(component?: S | U | null, targetComponent?: Component | null): S | null | C {
      if (component === void 0) {
        return _this.component;
      } else {
        _this.setComponent(component, targetComponent);
        return _this.owner;
      }
    } as ComponentFastener<C, S, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, key, fastenerName) || _this;
    return _this;
  } as unknown as ComponentFastenerConstructor<C, S, U, I>;

  const _prototype = descriptor as unknown as ComponentFastener<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (_prototype.child === void 0) {
    _prototype.child = true;
  }

  return _constructor;
};

ComponentFastener.MountedFlag = 1 << 0;
