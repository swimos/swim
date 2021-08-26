// Copyright 2015-2021 Swim Inc.
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
import {Equals, FromAny} from "@swim/util";
import {ComponentFlags, ComponentPrecedence, Component} from "../Component";
import {StringComponentProperty} from "../"; // forward import
import {BooleanComponentProperty} from "../"; // forward import
import {NumberComponentProperty} from "../"; // forward import

export type ComponentPropertyMemberType<C, K extends keyof C> =
  C[K] extends ComponentProperty<any, infer T, any> ? T : never;

export type ComponentPropertyMemberInit<C, K extends keyof C> =
  C[K] extends ComponentProperty<any, infer T, infer U> ? T | U : never;

export type ComponentPropertyMemberKey<C, K extends keyof C> =
  C[K] extends ComponentProperty<any, any> ? K : never;

export type ComponentPropertyMemberMap<C> = {
  -readonly [K in keyof C as ComponentPropertyMemberKey<C, K>]?: ComponentPropertyMemberInit<C, K>;
};

export type ComponentPropertyFlags = number;

export interface ComponentPropertyInit<T, U = never> {
  extends?: ComponentPropertyClass;
  type?: unknown;
  inherit?: string | boolean;

  state?: T | U;
  precedence?: ComponentPrecedence;
  updateFlags?: ComponentFlags;
  willSetState?(newState: T, oldState: T): void;
  didSetState?(newState: T, oldState: T): void;
  equalState?(newState: T, oldState: T): boolean;
  fromAny?(value: T | U): T;
  initState?(): T | U;
}

export type ComponentPropertyDescriptor<C extends Component, T, U = never, I = {}> = ComponentPropertyInit<T, U> & ThisType<ComponentProperty<C, T, U> & I> & Partial<I>;

export type ComponentPropertyDescriptorExtends<C extends Component, T, U = never, I = {}> = {extends: ComponentPropertyClass | undefined} & ComponentPropertyDescriptor<C, T, U, I>;

export type ComponentPropertyDescriptorFromAny<C extends Component, T, U = never, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ComponentPropertyDescriptor<C, T, U, I>;

export interface ComponentPropertyConstructor<C extends Component, T, U = never, I = {}> {
  new(owner: C, propertyName: string | undefined): ComponentProperty<C, T, U> & I;
  prototype: ComponentProperty<any, any> & I;
}

export interface ComponentPropertyClass extends Function {
  readonly prototype: ComponentProperty<any, any>;
}

export interface ComponentProperty<C extends Component, T, U = never> {
  (): T;
  (state: T | U, precedence?: ComponentPrecedence): C;

  readonly name: string;

  readonly owner: C;

  readonly inherit: string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  setInherited(inherited: boolean): void;

  /** @hidden */
  readonly superName: string | undefined;

  readonly superProperty: ComponentProperty<Component, T> | null;

  /** @hidden */
  bindSuperProperty(): void;

  /** @hidden */
  unbindSuperProperty(): void;

  /** @hidden */
  readonly subProperties: ComponentProperty<Component, T>[] | null;

  /** @hidden */
  addSubProperty(subProperty: ComponentProperty<Component, T>): void;

  /** @hidden */
  removeSubProperty(subProperty: ComponentProperty<Component, T>): void;

  readonly superState: T | undefined;

  readonly ownState: T;

  readonly state: T;

  getState(): NonNullable<T>;

  getStateOr<E>(elseState: E): NonNullable<T> | E;

  setState(state: T | U, precedence?: ComponentPrecedence): void;

  /** @hidden */
  setOwnState(state: T | U): void;

  willSetState(newState: T, oldState: T): void;

  onSetState(newState: T, oldState: T): void;

  didSetState(newState: T, oldState: T): void;

  takesPrecedence(precedence: ComponentPrecedence): boolean;

  readonly precedence: ComponentPrecedence;

  setPrecedence(precedence: ComponentPrecedence): void;

  /** @hidden */
  willSetPrecedence(newPrecedence: ComponentPrecedence, oldPrecedence: ComponentPrecedence): void;

  /** @hidden */
  onSetPrecedence(newPrecedence: ComponentPrecedence, oldPrecedence: ComponentPrecedence): void;

  /** @hidden */
  didSetPrecedence(newPrecedence: ComponentPrecedence, oldPrecedence: ComponentPrecedence): void;

  /** @hidden */
  propertyFlags: ComponentPropertyFlags;

  /** @hidden */
  setPropertyFlags(propertyFlags: ComponentPropertyFlags): void;

  isUpdated(): boolean;

  readonly updatedState: T | undefined;

  takeUpdatedState(): T | undefined;

  takeState(): T;

  /** @hidden */
  revise(): void;

  /** @hidden */
  onRevise(): void;

  /** @hidden */
  onReviseInherited(): void;

  /** @hidden */
  updateSubProperties(newState: T, oldState: T): void;

  updateFlags?: ComponentFlags;

  equalState(newState: T, oldState: T): boolean;

  fromAny(value: T | U): T;

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

  toString(): string;
}

export const ComponentProperty = function <C extends Component, T, U>(
    this: ComponentProperty<C, T, U> | typeof ComponentProperty,
    owner: C | ComponentPropertyDescriptor<C, T, U>,
    propertyName?: string,
  ): ComponentProperty<C, T, U> | PropertyDecorator {
  if (this instanceof ComponentProperty) { // constructor
    return ComponentPropertyConstructor.call(this as ComponentProperty<Component, unknown, unknown>, owner as C, propertyName);
  } else { // decorator factory
    return ComponentPropertyDecoratorFactory(owner as ComponentPropertyDescriptor<C, T, U>);
  }
} as {
  /** @hidden */
  new<C extends Component, T, U = never>(owner: C, propertyName: string | undefined): ComponentProperty<C, T, U>;

  <C extends Component, T extends string | undefined = string | undefined, U extends string | undefined = string | undefined>(descriptor: {type: typeof String} & ComponentPropertyDescriptor<C, T, U>): PropertyDecorator;
  <C extends Component, T extends boolean | undefined = boolean | undefined, U extends boolean | string | undefined = boolean | string | undefined>(descriptor: {type: typeof Boolean} & ComponentPropertyDescriptor<C, T, U>): PropertyDecorator;
  <C extends Component, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & ComponentPropertyDescriptor<C, T, U>): PropertyDecorator;
  <C extends Component, T, U = never>(descriptor: ComponentPropertyDescriptorFromAny<C, T, U>): PropertyDecorator;
  <C extends Component, T, U = never, I = {}>(descriptor: ComponentPropertyDescriptorExtends<C, T, U, I>): PropertyDecorator;
  <C extends Component, T, U = never>(descriptor: ComponentPropertyDescriptor<C, T, U>): PropertyDecorator;

  /** @hidden */
  prototype: ComponentProperty<any, any>;

  /** @hidden */
  getConstructor(type: unknown): ComponentPropertyClass | null;

  define<C extends Component, T, U = never, I = {}>(descriptor: ComponentPropertyDescriptorExtends<C, T, U, I>): ComponentPropertyConstructor<C, T, U, I>;
  define<C extends Component, T, U = never>(descriptor: ComponentPropertyDescriptor<C, T, U>): ComponentPropertyConstructor<C, T, U>;

  /** @hidden */
  MountedFlag: ComponentPropertyFlags;
  /** @hidden */
  UpdatedFlag: ComponentPropertyFlags;
  /** @hidden */
  OverrideFlag: ComponentPropertyFlags;
  /** @hidden */
  InheritedFlag: ComponentPropertyFlags;
};
__extends(ComponentProperty, Object);

function ComponentPropertyConstructor<C extends Component, T, U>(this: ComponentProperty<C, T, U>, owner: C, propertyName: string | undefined): ComponentProperty<C, T, U> {
  if (propertyName !== void 0) {
    Object.defineProperty(this, "name", {
      value: propertyName,
      enumerable: true,
      configurable: true,
    });
  }
  Object.defineProperty(this, "owner", {
    value: owner,
    enumerable: true,
  });
  Object.defineProperty(this, "inherit", {
    value: false,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "superProperty", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "subProperties", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "precedence", {
    value: Component.Intrinsic,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "propertyFlags", {
    value: ComponentProperty.UpdatedFlag,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "ownState", {
    value: void 0,
    enumerable: true,
    configurable: true,
  });
  return this;
}

function ComponentPropertyDecoratorFactory<C extends Component, T, U>(descriptor: ComponentPropertyDescriptor<C, T, U>): PropertyDecorator {
  return Component.decorateComponentProperty.bind(Component, ComponentProperty.define(descriptor as ComponentPropertyDescriptor<Component, unknown>));
}

ComponentProperty.prototype.setInherit = function (this: ComponentProperty<Component, unknown>, inherit: string | boolean): void {
  if (this.inherit !== inherit) {
    this.unbindSuperProperty();
    Object.defineProperty(this, "inherit", {
      value: inherit,
      enumerable: true,
      configurable: true,
    });
    this.bindSuperProperty();
  }
};

ComponentProperty.prototype.isInherited = function (this: ComponentProperty<Component, unknown>): boolean {
  return (this.propertyFlags & ComponentProperty.InheritedFlag) !== 0;
};

ComponentProperty.prototype.setInherited = function (this: ComponentProperty<Component, unknown>, inherited: boolean): void {
  if (inherited && (this.propertyFlags & ComponentProperty.InheritedFlag) === 0) {
    const superProperty = this.superProperty;
    if (superProperty !== null && superProperty.precedence >= this.precedence) {
      this.setPropertyFlags(this.propertyFlags & ~ComponentProperty.OverrideFlag | ComponentProperty.InheritedFlag);
      this.setOwnState(superProperty.state);
      this.revise();
    }
  } else if (!inherited && (this.propertyFlags & ComponentProperty.InheritedFlag) !== 0) {
    const superProperty = this.superProperty;
    if (superProperty !== null && superProperty.precedence < this.precedence) {
      this.setPropertyFlags(this.propertyFlags & ~ComponentProperty.InheritedFlag);
    }
  }
};

Object.defineProperty(ComponentProperty.prototype, "superName", {
  get: function (this: ComponentProperty<Component, unknown>): string | undefined {
    const inherit = this.inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

ComponentProperty.prototype.bindSuperProperty = function (this: ComponentProperty<Component, unknown>): void {
  const superName = this.superName;
  if (superName !== void 0 && this.isMounted()) {
    let superComponent = this.owner.parentComponent;
    while (superComponent !== null) {
      const superProperty = superComponent.getLazyComponentProperty(superName);
      if (superProperty !== null) {
        Object.defineProperty(this, "superProperty", {
          value: superProperty,
          enumerable: true,
          configurable: true,
        });
        superProperty.addSubProperty(this);
        if ((this.propertyFlags & ComponentProperty.OverrideFlag) === 0 && superProperty.precedence >= this.precedence) {
          this.setPropertyFlags(this.propertyFlags | ComponentProperty.InheritedFlag);
          this.setOwnState(superProperty.state);
          this.revise();
        }
        break;
      }
      superComponent = superComponent.parentComponent;
    }
  }
};

ComponentProperty.prototype.unbindSuperProperty = function (this: ComponentProperty<Component, unknown>): void {
  const superProperty = this.superProperty;
  if (superProperty !== null) {
    superProperty.removeSubProperty(this);
    Object.defineProperty(this, "superProperty", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    this.setPropertyFlags(this.propertyFlags & ~ComponentProperty.InheritedFlag);
  }
};

ComponentProperty.prototype.addSubProperty = function <T>(this: ComponentProperty<Component, T>, subProperty: ComponentProperty<Component, T>): void {
  let subProperties = this.subProperties;
  if (subProperties === null) {
    subProperties = [];
    Object.defineProperty(this, "subProperties", {
      value: subProperties,
      enumerable: true,
      configurable: true,
    });
  }
  subProperties.push(subProperty);
};

ComponentProperty.prototype.removeSubProperty = function <T>(this: ComponentProperty<Component, T>, subProperty: ComponentProperty<Component, T>): void {
  const subProperties = this.subProperties;
  if (subProperties !== null) {
    const index = subProperties.indexOf(subProperty);
    if (index >= 0) {
      subProperties.splice(index, 1);
    }
  }
};

Object.defineProperty(ComponentProperty.prototype, "superState", {
  get: function <T>(this: ComponentProperty<Component, T>): T | undefined {
    const superProperty = this.superProperty;
    return superProperty !== null ? superProperty.state : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ComponentProperty.prototype, "state", {
  get: function <T>(this: ComponentProperty<Component, T>): T {
    return this.ownState;
  },
  enumerable: true,
  configurable: true,
});

ComponentProperty.prototype.getState = function <T, U>(this: ComponentProperty<Component, T, U>): NonNullable<T> {
  const state = this.state;
  if (state === void 0 || state === null) {
    throw new TypeError(state + " " + this.name + " state");
  }
  return state as NonNullable<T>;
};

ComponentProperty.prototype.getStateOr = function <T, U, E>(this: ComponentProperty<Component, T, U>, elseState: E): NonNullable<T> | E {
  let state: T | E = this.state;
  if (state === void 0 || state === null) {
    state = elseState;
  }
  return state as NonNullable<T> | E;
};

ComponentProperty.prototype.setState = function <T, U>(this: ComponentProperty<Component, T, U>, newState: T | U, precedence?: ComponentPrecedence): void {
  if (precedence === void 0) {
    precedence = Component.Extrinsic;
  }
  if (precedence >= this.precedence) {
    this.setPropertyFlags(this.propertyFlags & ~ComponentProperty.InheritedFlag | ComponentProperty.OverrideFlag);
    this.setPrecedence(precedence);
    this.setOwnState(newState);
  }
};

ComponentProperty.prototype.setOwnState = function <T, U>(this: ComponentProperty<Component, T, U>, newState: T | U): void {
  newState = this.fromAny(newState);
  const oldState = this.state;
  if (!this.equalState(newState, oldState)) {
    this.willSetState(newState, oldState);
    Object.defineProperty(this, "ownState", {
      value: newState,
      enumerable: true,
      configurable: true,
    });
    this.setPropertyFlags(this.propertyFlags | ComponentProperty.UpdatedFlag);
    this.onSetState(newState, oldState);
    this.updateSubProperties(newState, oldState);
    this.didSetState(newState, oldState);
  }
};

ComponentProperty.prototype.willSetState = function <T>(this: ComponentProperty<Component, T>, newState: T, oldState: T): void {
  // hook
};

ComponentProperty.prototype.onSetState = function <T>(this: ComponentProperty<Component, T>, newState: T, oldState: T): void {
  const updateFlags = this.updateFlags;
  if (updateFlags !== void 0) {
    this.owner.requireUpdate(updateFlags);
  }
};

ComponentProperty.prototype.didSetState = function <T>(this: ComponentProperty<Component, T>, newState: T, oldState: T): void {
  // hook
};

ComponentProperty.prototype.takesPrecedence = function (this: ComponentProperty<Component, unknown>, precedence: ComponentPrecedence): boolean {
  return precedence >= this.precedence;
};

ComponentProperty.prototype.setPrecedence = function (this: ComponentProperty<Component, unknown>, newPrecedence: ComponentPrecedence): void {
  const oldPrecedence = this.precedence;
  if (newPrecedence !== oldPrecedence) {
    this.willSetPrecedence(newPrecedence, oldPrecedence);
    Object.defineProperty(this, "precedence", {
      value: newPrecedence,
      enumerable: true,
      configurable: true,
    });
    this.onSetPrecedence(newPrecedence, oldPrecedence);
    this.didSetPrecedence(newPrecedence, oldPrecedence);
  }
};

ComponentProperty.prototype.willSetPrecedence = function (this: ComponentProperty<Component, unknown>, newPrecedence: ComponentPrecedence, oldPrecedence: ComponentPrecedence): void {
  // hook
};

ComponentProperty.prototype.onSetPrecedence = function (this: ComponentProperty<Component, unknown>, newPrecedence: ComponentPrecedence, oldPrecedence: ComponentPrecedence): void {
  if (newPrecedence > oldPrecedence && (this.propertyFlags & ComponentProperty.InheritedFlag) !== 0) {
    const superProperty = this.superProperty;
    if (superProperty !== null && superProperty.precedence < this.precedence) {
      this.setPropertyFlags(this.propertyFlags & ~ComponentProperty.InheritedFlag);
    }
  }
};

ComponentProperty.prototype.didSetPrecedence = function (this: ComponentProperty<Component, unknown>, newPrecedence: ComponentPrecedence, oldPrecedence: ComponentPrecedence): void {
  // hook
};

ComponentProperty.prototype.setPropertyFlags = function (this: ComponentProperty<Component, unknown>, propertyFlags: ComponentPropertyFlags): void {
  Object.defineProperty(this, "propertyFlags", {
    value: propertyFlags,
    enumerable: true,
    configurable: true,
  });
};

ComponentProperty.prototype.isUpdated = function (this: ComponentProperty<Component, unknown>): boolean {
  return (this.propertyFlags & ComponentProperty.UpdatedFlag) !== 0;
};

Object.defineProperty(ComponentProperty.prototype, "updatedState", {
  get: function <T>(this: ComponentProperty<Component, T>): T | undefined {
    if ((this.propertyFlags & ComponentProperty.UpdatedFlag) !== 0) {
      return this.state;
    } else {
      return void 0;
    }
  },
  enumerable: true,
  configurable: true,
});

ComponentProperty.prototype.takeUpdatedState = function <T>(this: ComponentProperty<Component, T>): T | undefined {
  const propertyFlags = this.propertyFlags;
  if ((propertyFlags & ComponentProperty.UpdatedFlag) !== 0) {
    this.setPropertyFlags(propertyFlags & ~ComponentProperty.UpdatedFlag);
    return this.state;
  } else {
    return void 0;
  }
}

ComponentProperty.prototype.takeState = function <T>(this: ComponentProperty<Component, T>): T {
  this.setPropertyFlags(this.propertyFlags & ~ComponentProperty.UpdatedFlag);
  return this.state;
}

ComponentProperty.prototype.revise = function (this: ComponentProperty<Component, unknown>): void {
  this.owner.requireUpdate(Component.NeedsRevise);
};

ComponentProperty.prototype.onRevise = function (this: ComponentProperty<Component, unknown>): void {
  if (this.isInherited()) {
    this.onReviseInherited();
  }
};

ComponentProperty.prototype.onReviseInherited = function <T>(this: ComponentProperty<Component, T>): void {
  const superProperty = this.superProperty;
  if (superProperty !== null && superProperty.precedence >= this.precedence) {
    this.setOwnState(superProperty.state);
  }
};

ComponentProperty.prototype.updateSubProperties = function <T>(this: ComponentProperty<Component, T>, newState: T, oldState: T): void {
  const subProperties = this.subProperties;
  for (let i = 0, n = subProperties !== null ? subProperties.length : 0; i < n; i += 1) {
    const subProperty = subProperties![i]!;
    if (subProperty.isInherited()) {
      subProperty.revise();
    }
  }
};

ComponentProperty.prototype.equalState = function <T>(this: ComponentProperty<Component, T>, newState: T, oldState: T): boolean {
  return Equals(newState, oldState);
};

ComponentProperty.prototype.fromAny = function <T, U>(this: ComponentProperty<Component, T, U>, value: T | U): T {
  return value as T;
};

ComponentProperty.prototype.isMounted = function (this: ComponentProperty<Component, unknown>): boolean {
  return (this.propertyFlags & ComponentProperty.MountedFlag) !== 0;
};

ComponentProperty.prototype.mount = function (this: ComponentProperty<Component, unknown>): void {
  if ((this.propertyFlags & ComponentProperty.MountedFlag) === 0) {
    this.willMount();
    this.setPropertyFlags(this.propertyFlags | ComponentProperty.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ComponentProperty.prototype.willMount = function (this: ComponentProperty<Component, unknown>): void {
  // hook
};

ComponentProperty.prototype.onMount = function (this: ComponentProperty<Component, unknown>): void {
  this.bindSuperProperty();
};

ComponentProperty.prototype.didMount = function (this: ComponentProperty<Component, unknown>): void {
  // hook
};

ComponentProperty.prototype.unmount = function (this: ComponentProperty<Component, unknown>): void {
  if ((this.propertyFlags & ComponentProperty.MountedFlag) !== 0) {
    this.willUnmount();
    this.setPropertyFlags(this.propertyFlags & ~ComponentProperty.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ComponentProperty.prototype.willUnmount = function (this: ComponentProperty<Component, unknown>): void {
  // hook
};

ComponentProperty.prototype.onUnmount = function (this: ComponentProperty<Component, unknown>): void {
  this.unbindSuperProperty();
};

ComponentProperty.prototype.didUnmount = function (this: ComponentProperty<Component, unknown>): void {
  // hook
};

ComponentProperty.prototype.toString = function (this: ComponentProperty<Component, unknown>): string {
  return this.name;
};

ComponentProperty.getConstructor = function (type: unknown): ComponentPropertyClass | null {
  if (type === String) {
    return StringComponentProperty;
  } else if (type === Boolean) {
    return BooleanComponentProperty;
  } else if (type === Number) {
    return NumberComponentProperty;
  }
  return null;
};

ComponentProperty.define = function <C extends Component, T, U, I>(descriptor: ComponentPropertyDescriptor<C, T, U, I>): ComponentPropertyConstructor<C, T, U, I> {
  let _super: ComponentPropertyClass | null | undefined = descriptor.extends;
  const inherit = descriptor.inherit;
  const state = descriptor.state;
  const precedence = descriptor.precedence;
  const initState = descriptor.initState;
  delete descriptor.extends;
  delete descriptor.inherit;
  delete descriptor.state;
  delete descriptor.precedence;
  delete descriptor.initState;

  if (_super === void 0) {
    _super = ComponentProperty.getConstructor(descriptor.type);
  }
  if (_super === null) {
    _super = ComponentProperty;
    if (descriptor.fromAny === void 0 && FromAny.is<T, U>(descriptor.type)) {
      descriptor.fromAny = descriptor.type.fromAny;
    }
  }

  const _constructor = function DecoratedComponentProperty(this: ComponentProperty<C, T, U>, owner: C, propertyName: string | undefined): ComponentProperty<C, T, U> {
    let _this: ComponentProperty<C, T, U> = function ComponentPropertyAccessor(state?: T | U, precedence?: ComponentPrecedence): T | C {
      if (arguments.length === 0) {
        return _this.state;
      } else {
        _this.setState(state!, precedence);
        return _this.owner;
      }
    } as ComponentProperty<C, T, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, propertyName) || _this;
    let ownState: T | undefined;
    if (initState !== void 0) {
      ownState = _this.fromAny(initState());
    } else if (state !== void 0) {
      ownState = _this.fromAny(state);
    }
    if (ownState !== void 0) {
      Object.defineProperty(_this, "ownState", {
        value: ownState,
        enumerable: true,
        configurable: true,
      });
    }
    if (precedence !== void 0) {
      Object.defineProperty(_this, "precedence", {
        value: precedence,
        enumerable: true,
        configurable: true,
      });
    }
    if (inherit !== void 0) {
      Object.defineProperty(_this, "inherit", {
        value: inherit,
        enumerable: true,
        configurable: true,
      });
    }
    return _this;
  } as unknown as ComponentPropertyConstructor<C, T, U, I>;

  const _prototype = descriptor as unknown as ComponentProperty<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};

ComponentProperty.MountedFlag = 1 << 0;
ComponentProperty.UpdatedFlag = 1 << 1;
ComponentProperty.OverrideFlag = 1 << 2;
ComponentProperty.InheritedFlag = 1 << 3;
