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
import {ControllerFlags, ControllerPrecedence, Controller} from "../Controller";
import {StringControllerProperty} from "../"; // forward import
import {BooleanControllerProperty} from "../"; // forward import
import {NumberControllerProperty} from "../"; // forward import

export type ControllerPropertyMemberType<C, K extends keyof C> =
  C[K] extends ControllerProperty<any, infer T, any> ? T : never;

export type ControllerPropertyMemberInit<C, K extends keyof C> =
  C[K] extends ControllerProperty<any, infer T, infer U> ? T | U : never;

export type ControllerPropertyMemberKey<C, K extends keyof C> =
  C[K] extends ControllerProperty<any, any> ? K : never;

export type ControllerPropertyMemberMap<C> = {
  -readonly [K in keyof C as ControllerPropertyMemberKey<C, K>]?: ControllerPropertyMemberInit<C, K>;
};

export type ControllerPropertyFlags = number;

export interface ControllerPropertyInit<T, U = never> {
  extends?: ControllerPropertyClass;
  type?: unknown;
  inherit?: string | boolean;

  state?: T | U;
  precedence?: ControllerPrecedence;
  updateFlags?: ControllerFlags;
  willSetState?(newState: T, oldState: T): void;
  didSetState?(newState: T, oldState: T): void;
  equalState?(newState: T, oldState: T): boolean;
  fromAny?(value: T | U): T;
  initState?(): T | U;
}

export type ControllerPropertyDescriptor<C extends Controller, T, U = never, I = {}> = ControllerPropertyInit<T, U> & ThisType<ControllerProperty<C, T, U> & I> & Partial<I>;

export type ControllerPropertyDescriptorExtends<C extends Controller, T, U = never, I = {}> = {extends: ControllerPropertyClass | undefined} & ControllerPropertyDescriptor<C, T, U, I>;

export type ControllerPropertyDescriptorFromAny<C extends Controller, T, U = never, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ControllerPropertyDescriptor<C, T, U, I>;

export interface ControllerPropertyConstructor<C extends Controller, T, U = never, I = {}> {
  new(owner: C, propertyName: string | undefined): ControllerProperty<C, T, U> & I;
  prototype: ControllerProperty<any, any> & I;
}

export interface ControllerPropertyClass extends Function {
  readonly prototype: ControllerProperty<any, any>;
}

export interface ControllerProperty<C extends Controller, T, U = never> {
  (): T;
  (state: T | U, precedence?: ControllerPrecedence): C;

  readonly name: string;

  readonly owner: C;

  readonly inherit: string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  setInherited(inherited: boolean): void;

  /** @hidden */
  readonly superName: string | undefined;

  readonly superProperty: ControllerProperty<Controller, T> | null;

  /** @hidden */
  bindSuperProperty(): void;

  /** @hidden */
  unbindSuperProperty(): void;

  /** @hidden */
  readonly subProperties: ControllerProperty<Controller, T>[] | null;

  /** @hidden */
  addSubProperty(subProperty: ControllerProperty<Controller, T>): void;

  /** @hidden */
  removeSubProperty(subProperty: ControllerProperty<Controller, T>): void;

  readonly superState: T | undefined;

  readonly ownState: T;

  readonly state: T;

  getState(): NonNullable<T>;

  getStateOr<E>(elseState: E): NonNullable<T> | E;

  setState(state: T | U, precedence?: ControllerPrecedence): void;

  /** @hidden */
  setOwnState(state: T | U): void;

  willSetState(newState: T, oldState: T): void;

  onSetState(newState: T, oldState: T): void;

  didSetState(newState: T, oldState: T): void;

  takesPrecedence(precedence: ControllerPrecedence): boolean;

  readonly precedence: ControllerPrecedence;

  setPrecedence(precedence: ControllerPrecedence): void;

  /** @hidden */
  willSetPrecedence(newPrecedence: ControllerPrecedence, oldPrecedence: ControllerPrecedence): void;

  /** @hidden */
  onSetPrecedence(newPrecedence: ControllerPrecedence, oldPrecedence: ControllerPrecedence): void;

  /** @hidden */
  didSetPrecedence(newPrecedence: ControllerPrecedence, oldPrecedence: ControllerPrecedence): void;

  /** @hidden */
  propertyFlags: ControllerPropertyFlags;

  /** @hidden */
  setPropertyFlags(propertyFlags: ControllerPropertyFlags): void;

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

  updateFlags?: ControllerFlags;

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

export const ControllerProperty = function <C extends Controller, T, U>(
    this: ControllerProperty<C, T, U> | typeof ControllerProperty,
    owner: C | ControllerPropertyDescriptor<C, T, U>,
    propertyName?: string,
  ): ControllerProperty<C, T, U> | PropertyDecorator {
  if (this instanceof ControllerProperty) { // constructor
    return ControllerPropertyConstructor.call(this as ControllerProperty<Controller, unknown, unknown>, owner as C, propertyName);
  } else { // decorator factory
    return ControllerPropertyDecoratorFactory(owner as ControllerPropertyDescriptor<C, T, U>);
  }
} as {
  /** @hidden */
  new<C extends Controller, T, U = never>(owner: C, propertyName: string | undefined): ControllerProperty<C, T, U>;

  <C extends Controller, T extends string | undefined = string | undefined, U extends string | undefined = string | undefined>(descriptor: {type: typeof String} & ControllerPropertyDescriptor<C, T, U>): PropertyDecorator;
  <C extends Controller, T extends boolean | undefined = boolean | undefined, U extends boolean | string | undefined = boolean | string | undefined>(descriptor: {type: typeof Boolean} & ControllerPropertyDescriptor<C, T, U>): PropertyDecorator;
  <C extends Controller, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & ControllerPropertyDescriptor<C, T, U>): PropertyDecorator;
  <C extends Controller, T, U = never>(descriptor: ControllerPropertyDescriptorFromAny<C, T, U>): PropertyDecorator;
  <C extends Controller, T, U = never, I = {}>(descriptor: ControllerPropertyDescriptorExtends<C, T, U, I>): PropertyDecorator;
  <C extends Controller, T, U = never>(descriptor: ControllerPropertyDescriptor<C, T, U>): PropertyDecorator;

  /** @hidden */
  prototype: ControllerProperty<any, any>;

  /** @hidden */
  getConstructor(type: unknown): ControllerPropertyClass | null;

  define<C extends Controller, T, U = never, I = {}>(descriptor: ControllerPropertyDescriptorExtends<C, T, U, I>): ControllerPropertyConstructor<C, T, U, I>;
  define<C extends Controller, T, U = never>(descriptor: ControllerPropertyDescriptor<C, T, U>): ControllerPropertyConstructor<C, T, U>;

  /** @hidden */
  MountedFlag: ControllerPropertyFlags;
  /** @hidden */
  UpdatedFlag: ControllerPropertyFlags;
  /** @hidden */
  OverrideFlag: ControllerPropertyFlags;
  /** @hidden */
  InheritedFlag: ControllerPropertyFlags;
};
__extends(ControllerProperty, Object);

function ControllerPropertyConstructor<C extends Controller, T, U>(this: ControllerProperty<C, T, U>, owner: C, propertyName: string | undefined): ControllerProperty<C, T, U> {
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
    value: Controller.Intrinsic,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "propertyFlags", {
    value: ControllerProperty.UpdatedFlag,
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

function ControllerPropertyDecoratorFactory<C extends Controller, T, U>(descriptor: ControllerPropertyDescriptor<C, T, U>): PropertyDecorator {
  return Controller.decorateControllerProperty.bind(Controller, ControllerProperty.define(descriptor as ControllerPropertyDescriptor<Controller, unknown>));
}

ControllerProperty.prototype.setInherit = function (this: ControllerProperty<Controller, unknown>, inherit: string | boolean): void {
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

ControllerProperty.prototype.isInherited = function (this: ControllerProperty<Controller, unknown>): boolean {
  return (this.propertyFlags & ControllerProperty.InheritedFlag) !== 0;
};

ControllerProperty.prototype.setInherited = function (this: ControllerProperty<Controller, unknown>, inherited: boolean): void {
  if (inherited && (this.propertyFlags & ControllerProperty.InheritedFlag) === 0) {
    const superProperty = this.superProperty;
    if (superProperty !== null && superProperty.precedence >= this.precedence) {
      this.setPropertyFlags(this.propertyFlags & ~ControllerProperty.OverrideFlag | ControllerProperty.InheritedFlag);
      this.setOwnState(superProperty.state);
      this.revise();
    }
  } else if (!inherited && (this.propertyFlags & ControllerProperty.InheritedFlag) !== 0) {
    const superProperty = this.superProperty;
    if (superProperty !== null && superProperty.precedence < this.precedence) {
      this.setPropertyFlags(this.propertyFlags & ~ControllerProperty.InheritedFlag);
    }
  }
};

Object.defineProperty(ControllerProperty.prototype, "superName", {
  get: function (this: ControllerProperty<Controller, unknown>): string | undefined {
    const inherit = this.inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

ControllerProperty.prototype.bindSuperProperty = function (this: ControllerProperty<Controller, unknown>): void {
  const superName = this.superName;
  if (superName !== void 0 && this.isMounted()) {
    let superController = this.owner.parentController;
    while (superController !== null) {
      const superProperty = superController.getLazyControllerProperty(superName);
      if (superProperty !== null) {
        Object.defineProperty(this, "superProperty", {
          value: superProperty,
          enumerable: true,
          configurable: true,
        });
        superProperty.addSubProperty(this);
        if ((this.propertyFlags & ControllerProperty.OverrideFlag) === 0 && superProperty.precedence >= this.precedence) {
          this.setPropertyFlags(this.propertyFlags | ControllerProperty.InheritedFlag);
          this.setOwnState(superProperty.state);
          this.revise();
        }
        break;
      }
      superController = superController.parentController;
    }
  }
};

ControllerProperty.prototype.unbindSuperProperty = function (this: ControllerProperty<Controller, unknown>): void {
  const superProperty = this.superProperty;
  if (superProperty !== null) {
    superProperty.removeSubProperty(this);
    Object.defineProperty(this, "superProperty", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    this.setPropertyFlags(this.propertyFlags & ~ControllerProperty.InheritedFlag);
  }
};

ControllerProperty.prototype.addSubProperty = function <T>(this: ControllerProperty<Controller, T>, subProperty: ControllerProperty<Controller, T>): void {
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

ControllerProperty.prototype.removeSubProperty = function <T>(this: ControllerProperty<Controller, T>, subProperty: ControllerProperty<Controller, T>): void {
  const subProperties = this.subProperties;
  if (subProperties !== null) {
    const index = subProperties.indexOf(subProperty);
    if (index >= 0) {
      subProperties.splice(index, 1);
    }
  }
};

Object.defineProperty(ControllerProperty.prototype, "superState", {
  get: function <T>(this: ControllerProperty<Controller, T>): T | undefined {
    const superProperty = this.superProperty;
    return superProperty !== null ? superProperty.state : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ControllerProperty.prototype, "state", {
  get: function <T>(this: ControllerProperty<Controller, T>): T {
    return this.ownState;
  },
  enumerable: true,
  configurable: true,
});

ControllerProperty.prototype.getState = function <T, U>(this: ControllerProperty<Controller, T, U>): NonNullable<T> {
  const state = this.state;
  if (state === void 0 || state === null) {
    throw new TypeError(state + " " + this.name + " state");
  }
  return state as NonNullable<T>;
};

ControllerProperty.prototype.getStateOr = function <T, U, E>(this: ControllerProperty<Controller, T, U>, elseState: E): NonNullable<T> | E {
  let state: T | E = this.state;
  if (state === void 0 || state === null) {
    state = elseState;
  }
  return state as NonNullable<T> | E;
};

ControllerProperty.prototype.setState = function <T, U>(this: ControllerProperty<Controller, T, U>, newState: T | U, precedence?: ControllerPrecedence): void {
  if (precedence === void 0) {
    precedence = Controller.Extrinsic;
  }
  if (precedence >= this.precedence) {
    this.setPropertyFlags(this.propertyFlags & ~ControllerProperty.InheritedFlag | ControllerProperty.OverrideFlag);
    this.setPrecedence(precedence);
    this.setOwnState(newState);
  }
};

ControllerProperty.prototype.setOwnState = function <T, U>(this: ControllerProperty<Controller, T, U>, newState: T | U): void {
  newState = this.fromAny(newState);
  const oldState = this.state;
  if (!this.equalState(newState, oldState)) {
    this.willSetState(newState, oldState);
    Object.defineProperty(this, "ownState", {
      value: newState,
      enumerable: true,
      configurable: true,
    });
    this.setPropertyFlags(this.propertyFlags | ControllerProperty.UpdatedFlag);
    this.onSetState(newState, oldState);
    this.updateSubProperties(newState, oldState);
    this.didSetState(newState, oldState);
  }
};

ControllerProperty.prototype.willSetState = function <T>(this: ControllerProperty<Controller, T>, newState: T, oldState: T): void {
  // hook
};

ControllerProperty.prototype.onSetState = function <T>(this: ControllerProperty<Controller, T>, newState: T, oldState: T): void {
  const updateFlags = this.updateFlags;
  if (updateFlags !== void 0) {
    this.owner.requireUpdate(updateFlags);
  }
};

ControllerProperty.prototype.didSetState = function <T>(this: ControllerProperty<Controller, T>, newState: T, oldState: T): void {
  // hook
};

ControllerProperty.prototype.takesPrecedence = function (this: ControllerProperty<Controller, unknown>, precedence: ControllerPrecedence): boolean {
  return precedence >= this.precedence;
};

ControllerProperty.prototype.setPrecedence = function (this: ControllerProperty<Controller, unknown>, newPrecedence: ControllerPrecedence): void {
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

ControllerProperty.prototype.willSetPrecedence = function (this: ControllerProperty<Controller, unknown>, newPrecedence: ControllerPrecedence, oldPrecedence: ControllerPrecedence): void {
  // hook
};

ControllerProperty.prototype.onSetPrecedence = function (this: ControllerProperty<Controller, unknown>, newPrecedence: ControllerPrecedence, oldPrecedence: ControllerPrecedence): void {
  if (newPrecedence > oldPrecedence && (this.propertyFlags & ControllerProperty.InheritedFlag) !== 0) {
    const superProperty = this.superProperty;
    if (superProperty !== null && superProperty.precedence < this.precedence) {
      this.setPropertyFlags(this.propertyFlags & ~ControllerProperty.InheritedFlag);
    }
  }
};

ControllerProperty.prototype.didSetPrecedence = function (this: ControllerProperty<Controller, unknown>, newPrecedence: ControllerPrecedence, oldPrecedence: ControllerPrecedence): void {
  // hook
};

ControllerProperty.prototype.setPropertyFlags = function (this: ControllerProperty<Controller, unknown>, propertyFlags: ControllerPropertyFlags): void {
  Object.defineProperty(this, "propertyFlags", {
    value: propertyFlags,
    enumerable: true,
    configurable: true,
  });
};

ControllerProperty.prototype.isUpdated = function (this: ControllerProperty<Controller, unknown>): boolean {
  return (this.propertyFlags & ControllerProperty.UpdatedFlag) !== 0;
};

Object.defineProperty(ControllerProperty.prototype, "updatedState", {
  get: function <T>(this: ControllerProperty<Controller, T>): T | undefined {
    if ((this.propertyFlags & ControllerProperty.UpdatedFlag) !== 0) {
      return this.state;
    } else {
      return void 0;
    }
  },
  enumerable: true,
  configurable: true,
});

ControllerProperty.prototype.takeUpdatedState = function <T>(this: ControllerProperty<Controller, T>): T | undefined {
  const propertyFlags = this.propertyFlags;
  if ((propertyFlags & ControllerProperty.UpdatedFlag) !== 0) {
    this.setPropertyFlags(propertyFlags & ~ControllerProperty.UpdatedFlag);
    return this.state;
  } else {
    return void 0;
  }
}

ControllerProperty.prototype.takeState = function <T>(this: ControllerProperty<Controller, T>): T {
  this.setPropertyFlags(this.propertyFlags & ~ControllerProperty.UpdatedFlag);
  return this.state;
}

ControllerProperty.prototype.revise = function (this: ControllerProperty<Controller, unknown>): void {
  this.owner.requireUpdate(Controller.NeedsRevise);
};

ControllerProperty.prototype.onRevise = function (this: ControllerProperty<Controller, unknown>): void {
  if (this.isInherited()) {
    this.onReviseInherited();
  }
};

ControllerProperty.prototype.onReviseInherited = function <T>(this: ControllerProperty<Controller, T>): void {
  const superProperty = this.superProperty;
  if (superProperty !== null && superProperty.precedence >= this.precedence) {
    this.setOwnState(superProperty.state);
  }
};

ControllerProperty.prototype.updateSubProperties = function <T>(this: ControllerProperty<Controller, T>, newState: T, oldState: T): void {
  const subProperties = this.subProperties;
  for (let i = 0, n = subProperties !== null ? subProperties.length : 0; i < n; i += 1) {
    const subProperty = subProperties![i]!;
    if (subProperty.isInherited()) {
      subProperty.revise();
    }
  }
};

ControllerProperty.prototype.equalState = function <T>(this: ControllerProperty<Controller, T>, newState: T, oldState: T): boolean {
  return Equals(newState, oldState);
};

ControllerProperty.prototype.fromAny = function <T, U>(this: ControllerProperty<Controller, T, U>, value: T | U): T {
  return value as T;
};

ControllerProperty.prototype.isMounted = function (this: ControllerProperty<Controller, unknown>): boolean {
  return (this.propertyFlags & ControllerProperty.MountedFlag) !== 0;
};

ControllerProperty.prototype.mount = function (this: ControllerProperty<Controller, unknown>): void {
  if ((this.propertyFlags & ControllerProperty.MountedFlag) === 0) {
    this.willMount();
    this.setPropertyFlags(this.propertyFlags | ControllerProperty.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ControllerProperty.prototype.willMount = function (this: ControllerProperty<Controller, unknown>): void {
  // hook
};

ControllerProperty.prototype.onMount = function (this: ControllerProperty<Controller, unknown>): void {
  this.bindSuperProperty();
};

ControllerProperty.prototype.didMount = function (this: ControllerProperty<Controller, unknown>): void {
  // hook
};

ControllerProperty.prototype.unmount = function (this: ControllerProperty<Controller, unknown>): void {
  if ((this.propertyFlags & ControllerProperty.MountedFlag) !== 0) {
    this.willUnmount();
    this.setPropertyFlags(this.propertyFlags & ~ControllerProperty.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ControllerProperty.prototype.willUnmount = function (this: ControllerProperty<Controller, unknown>): void {
  // hook
};

ControllerProperty.prototype.onUnmount = function (this: ControllerProperty<Controller, unknown>): void {
  this.unbindSuperProperty();
};

ControllerProperty.prototype.didUnmount = function (this: ControllerProperty<Controller, unknown>): void {
  // hook
};

ControllerProperty.prototype.toString = function (this: ControllerProperty<Controller, unknown>): string {
  return this.name;
};

ControllerProperty.getConstructor = function (type: unknown): ControllerPropertyClass | null {
  if (type === String) {
    return StringControllerProperty;
  } else if (type === Boolean) {
    return BooleanControllerProperty;
  } else if (type === Number) {
    return NumberControllerProperty;
  }
  return null;
};

ControllerProperty.define = function <C extends Controller, T, U, I>(descriptor: ControllerPropertyDescriptor<C, T, U, I>): ControllerPropertyConstructor<C, T, U, I> {
  let _super: ControllerPropertyClass | null | undefined = descriptor.extends;
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
    _super = ControllerProperty.getConstructor(descriptor.type);
  }
  if (_super === null) {
    _super = ControllerProperty;
    if (descriptor.fromAny === void 0 && FromAny.is<T, U>(descriptor.type)) {
      descriptor.fromAny = descriptor.type.fromAny;
    }
  }

  const _constructor = function DecoratedControllerProperty(this: ControllerProperty<C, T, U>, owner: C, propertyName: string | undefined): ControllerProperty<C, T, U> {
    let _this: ControllerProperty<C, T, U> = function ControllerPropertyAccessor(state?: T | U, precedence?: ControllerPrecedence): T | C {
      if (arguments.length === 0) {
        return _this.state;
      } else {
        _this.setState(state!, precedence);
        return _this.owner;
      }
    } as ControllerProperty<C, T, U>;
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
  } as unknown as ControllerPropertyConstructor<C, T, U, I>;

  const _prototype = descriptor as unknown as ControllerProperty<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};

ControllerProperty.MountedFlag = 1 << 0;
ControllerProperty.UpdatedFlag = 1 << 1;
ControllerProperty.OverrideFlag = 1 << 2;
ControllerProperty.InheritedFlag = 1 << 3;
