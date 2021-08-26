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
import {MoodVector, ThemeMatrix} from "@swim/theme";
import {ViewFlags, ViewPrecedence, View} from "../View";
import {StringViewProperty} from "../"; // forward import
import {BooleanViewProperty} from "../"; // forward import
import {NumberViewProperty} from "../"; // forward import

export type ViewPropertyMemberType<V, K extends keyof V> =
  V[K] extends ViewProperty<any, infer T, any> ? T : never;

export type ViewPropertyMemberInit<V, K extends keyof V> =
  V[K] extends ViewProperty<any, infer T, infer U> ? T | U : never;

export type ViewPropertyMemberKey<V, K extends keyof V> =
  V[K] extends ViewProperty<any, any> ? K : never;

export type ViewPropertyMemberMap<V> = {
  -readonly [K in keyof V as ViewPropertyMemberKey<V, K>]?: ViewPropertyMemberInit<V, K>;
};

export type ViewPropertyFlags = number;

export interface ViewPropertyInit<T, U = never> {
  extends?: ViewPropertyClass;
  type?: unknown;
  inherit?: string | boolean;

  state?: T | U;
  precedence?: ViewPrecedence;
  updateFlags?: ViewFlags;
  willSetState?(newState: T, oldState: T): void;
  didSetState?(newState: T, oldState: T): void;
  equalState?(newState: T, oldState: T): boolean;
  fromAny?(value: T | U): T;
  initState?(): T | U;
}

export type ViewPropertyDescriptor<V extends View, T, U = never, I = {}> = ViewPropertyInit<T, U> & ThisType<ViewProperty<V, T, U> & I> & Partial<I>;

export type ViewPropertyDescriptorExtends<V extends View, T, U = never, I = {}> = {extends: ViewPropertyClass | undefined} & ViewPropertyDescriptor<V, T, U, I>;

export type ViewPropertyDescriptorFromAny<V extends View, T, U = never, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ViewPropertyDescriptor<V, T, U, I>;

export interface ViewPropertyConstructor<V extends View, T, U = never, I = {}> {
  new(owner: V, propertyName: string | undefined): ViewProperty<V, T, U> & I;
  prototype: ViewProperty<any, any> & I;
}

export interface ViewPropertyClass extends Function {
  readonly prototype: ViewProperty<any, any>;
}

export interface ViewProperty<V extends View, T, U = never> {
  (): T;
  (state: T | U, precedence?: ViewPrecedence): V;

  readonly name: string;

  readonly owner: V;

  readonly inherit: string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  setInherited(inherited: boolean): void;

  /** @hidden */
  readonly superName: string | undefined;

  readonly superProperty: ViewProperty<View, T> | null;

  /** @hidden */
  bindSuperProperty(): void;

  /** @hidden */
  unbindSuperProperty(): void;

  /** @hidden */
  readonly subProperties: ViewProperty<View, T>[] | null;

  /** @hidden */
  addSubProperty(subProperty: ViewProperty<View, T>): void;

  /** @hidden */
  removeSubProperty(subProperty: ViewProperty<View, T>): void;

  readonly superState: T | undefined;

  readonly ownState: T;

  readonly state: T;

  getState(): NonNullable<T>;

  getStateOr<E>(elseState: E): NonNullable<T> | E;

  setState(state: T | U, precedence?: ViewFlags): void;

  /** @hidden */
  setOwnState(state: T | U): void;

  willSetState(newState: T, oldState: T): void;

  onSetState(newState: T, oldState: T): void;

  didSetState(newState: T, oldState: T): void;

  takesPrecedence(precedence: ViewPrecedence): boolean;

  readonly precedence: ViewPrecedence;

  setPrecedence(precedence: ViewPrecedence): void;

  /** @hidden */
  willSetPrecedence(newPrecedence: ViewPrecedence, oldPrecedence: ViewPrecedence): void;

  /** @hidden */
  onSetPrecedence(newPrecedence: ViewPrecedence, oldPrecedence: ViewPrecedence): void;

  /** @hidden */
  didSetPrecedence(newPrecedence: ViewPrecedence, oldPrecedence: ViewPrecedence): void;

  /** @hidden */
  propertyFlags: ViewPropertyFlags;

  /** @hidden */
  setPropertyFlags(propertyFlags: ViewPropertyFlags): void;

  isUpdated(): boolean;

  readonly updatedState: T | undefined;

  takeUpdatedState(): T | undefined;

  takeState(): T;

  /** @hidden */
  change(): void;

  /** @hidden */
  onChange(): void;

  /** @hidden */
  onChangeInherited(): void;

  /** @hidden */
  updateSubProperties(newState: T, oldState: T): void;

  updateFlags?: ViewFlags;

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

export const ViewProperty = function <V extends View, T, U>(
    this: ViewProperty<V, T, U> | typeof ViewProperty,
    owner: V | ViewPropertyDescriptor<V, T, U>,
    propertyName?: string,
  ): ViewProperty<V, T, U> | PropertyDecorator {
  if (this instanceof ViewProperty) { // constructor
    return ViewPropertyConstructor.call(this as ViewProperty<View, unknown, unknown>, owner as V, propertyName);
  } else { // decorator factory
    return ViewPropertyDecoratorFactory(owner as ViewPropertyDescriptor<V, T, U>);
  }
} as {
  /** @hidden */
  new<V extends View, T, U = never>(owner: V, propertyName: string | undefined): ViewProperty<V, T, U>;

  <V extends View, T extends string | undefined = string | undefined, U extends string | undefined = string | undefined>(descriptor: {type: typeof String} & ViewPropertyDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T extends boolean | undefined = boolean | undefined, U extends boolean | string | undefined = boolean | string | undefined>(descriptor: {type: typeof Boolean} & ViewPropertyDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & ViewPropertyDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T, U = never>(descriptor: ViewPropertyDescriptorFromAny<V, T, U>): PropertyDecorator;
  <V extends View, T, U = never, I = {}>(descriptor: ViewPropertyDescriptorExtends<V, T, U, I>): PropertyDecorator;
  <V extends View, T, U = never>(descriptor: ViewPropertyDescriptor<V, T, U>): PropertyDecorator;

  /** @hidden */
  prototype: ViewProperty<any, any>;

  /** @hidden */
  getClass(type: unknown): ViewPropertyClass | null;

  define<V extends View, T, U = never, I = {}>(descriptor: ViewPropertyDescriptorExtends<V, T, U, I>): ViewPropertyConstructor<V, T, U, I>;
  define<V extends View, T, U = never>(descriptor: ViewPropertyDescriptor<V, T, U>): ViewPropertyConstructor<V, T, U>;

  /** @hidden */
  MountedFlag: ViewPropertyFlags;
  /** @hidden */
  UpdatedFlag: ViewPropertyFlags;
  /** @hidden */
  OverrideFlag: ViewPropertyFlags;
  /** @hidden */
  InheritedFlag: ViewPropertyFlags;
  /** @hidden */
  ConstrainedFlag: ViewPropertyFlags;
  /** @hidden */
  ConstrainingFlag: ViewPropertyFlags;
};
__extends(ViewProperty, Object);

function ViewPropertyConstructor<V extends View, T, U>(this: ViewProperty<V, T, U>, owner: V, propertyName: string | undefined): ViewProperty<V, T, U> {
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
    value: View.Intrinsic,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "propertyFlags", {
    value: ViewProperty.UpdatedFlag,
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

function ViewPropertyDecoratorFactory<V extends View, T, U>(descriptor: ViewPropertyDescriptor<V, T, U>): PropertyDecorator {
  return View.decorateViewProperty.bind(View, ViewProperty.define(descriptor as ViewPropertyDescriptor<View, unknown>));
}

ViewProperty.prototype.setInherit = function (this: ViewProperty<View, unknown>, inherit: string | boolean): void {
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

ViewProperty.prototype.isInherited = function (this: ViewProperty<View, unknown>): boolean {
  return (this.propertyFlags & ViewProperty.InheritedFlag) !== 0;
};

ViewProperty.prototype.setInherited = function (this: ViewProperty<View, unknown>, inherited: boolean): void {
  if (inherited && (this.propertyFlags & ViewProperty.InheritedFlag) === 0) {
    const superProperty = this.superProperty;
    if (superProperty !== null && superProperty.precedence >= this.precedence) {
      this.setPropertyFlags(this.propertyFlags & ~ViewProperty.OverrideFlag | ViewProperty.InheritedFlag);
      this.setOwnState(superProperty.state);
      this.change();
    }
  } else if (!inherited && (this.propertyFlags & ViewProperty.InheritedFlag) !== 0) {
    const superProperty = this.superProperty;
    if (superProperty !== null && superProperty.precedence < this.precedence) {
      this.setPropertyFlags(this.propertyFlags & ~ViewProperty.InheritedFlag);
    }
  }
};

Object.defineProperty(ViewProperty.prototype, "superName", {
  get: function (this: ViewProperty<View, unknown>): string | undefined {
    const inherit = this.inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

ViewProperty.prototype.bindSuperProperty = function (this: ViewProperty<View, unknown>): void {
  const superName = this.superName;
  if (superName !== void 0 && this.isMounted()) {
    let superView = this.owner.parentView;
    while (superView !== null) {
      const superProperty = superView.getLazyViewProperty(superName);
      if (superProperty !== null) {
        Object.defineProperty(this, "superProperty", {
          value: superProperty,
          enumerable: true,
          configurable: true,
        });
        superProperty.addSubProperty(this);
        if ((this.propertyFlags & ViewProperty.OverrideFlag) === 0 && superProperty.precedence >= this.precedence) {
          this.setPropertyFlags(this.propertyFlags | ViewProperty.InheritedFlag);
          this.setOwnState(superProperty.state);
          this.change();
        }
        break;
      }
      superView = superView.parentView;
    }
  }
};

ViewProperty.prototype.unbindSuperProperty = function (this: ViewProperty<View, unknown>): void {
  const superProperty = this.superProperty;
  if (superProperty !== null) {
    superProperty.removeSubProperty(this);
    Object.defineProperty(this, "superProperty", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    this.setPropertyFlags(this.propertyFlags & ~ViewProperty.InheritedFlag);
  }
};

ViewProperty.prototype.addSubProperty = function <T>(this: ViewProperty<View, T>, subProperty: ViewProperty<View, T>): void {
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

ViewProperty.prototype.removeSubProperty = function <T>(this: ViewProperty<View, T>, subProperty: ViewProperty<View, T>): void {
  const subProperties = this.subProperties;
  if (subProperties !== null) {
    const index = subProperties.indexOf(subProperty);
    if (index >= 0) {
      subProperties.splice(index, 1);
    }
  }
};

Object.defineProperty(ViewProperty.prototype, "superState", {
  get: function <T>(this: ViewProperty<View, T>): T | undefined {
    const superProperty = this.superProperty;
    return superProperty !== null ? superProperty.state : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewProperty.prototype, "state", {
  get: function <T>(this: ViewProperty<View, T>): T {
    return this.ownState;
  },
  enumerable: true,
  configurable: true,
});

ViewProperty.prototype.getState = function <T, U>(this: ViewProperty<View, T, U>): NonNullable<T> {
  const state = this.state;
  if (state === void 0 || state === null) {
    throw new TypeError(state + " " + this.name + " state");
  }
  return state as NonNullable<T>;
};

ViewProperty.prototype.getStateOr = function <T, U, E>(this: ViewProperty<View, T, U>, elseState: E): NonNullable<T> | E {
  let state: T | E = this.state;
  if (state === void 0 || state === null) {
    state = elseState;
  }
  return state as NonNullable<T> | E;
};

ViewProperty.prototype.setState = function <T, U>(this: ViewProperty<View, T, U>, newState: T | U, precedence?: ViewPrecedence): void {
  if (precedence === void 0) {
    precedence = View.Extrinsic;
  }
  if (precedence >= this.precedence) {
    this.setPropertyFlags(this.propertyFlags & ~ViewProperty.InheritedFlag | ViewProperty.OverrideFlag);
    this.setPrecedence(precedence);
    this.setOwnState(newState);
  }
};

ViewProperty.prototype.setOwnState = function <T, U>(this: ViewProperty<View, T, U>, newState: T | U): void {
  newState = this.fromAny(newState);
  const oldState = this.state;
  if (!this.equalState(newState, oldState)) {
    this.willSetState(newState, oldState);
    Object.defineProperty(this, "ownState", {
      value: newState,
      enumerable: true,
      configurable: true,
    });
    this.setPropertyFlags(this.propertyFlags | ViewProperty.UpdatedFlag);
    this.onSetState(newState, oldState);
    this.updateSubProperties(newState, oldState);
    this.didSetState(newState, oldState);
  }
};

ViewProperty.prototype.willSetState = function <T>(this: ViewProperty<View, T>, newState: T, oldState: T): void {
  // hook
};

ViewProperty.prototype.onSetState = function <T>(this: ViewProperty<View, T>, newState: T, oldState: T): void {
  const updateFlags = this.updateFlags;
  if (updateFlags !== void 0) {
    this.owner.requireUpdate(updateFlags);
  }
};

ViewProperty.prototype.didSetState = function <T>(this: ViewProperty<View, T>, newState: T, oldState: T): void {
  // hook
};

ViewProperty.prototype.takesPrecedence = function (this: ViewProperty<View, unknown>, precedence: ViewPrecedence): boolean {
  return precedence >= this.precedence;
};

ViewProperty.prototype.setPrecedence = function (this: ViewProperty<View, unknown>, newPrecedence: ViewPrecedence): void {
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

ViewProperty.prototype.willSetPrecedence = function (this: ViewProperty<View, unknown>, newPrecedence: ViewPrecedence, oldPrecedence: ViewPrecedence): void {
  // hook
};

ViewProperty.prototype.onSetPrecedence = function (this: ViewProperty<View, unknown>, newPrecedence: ViewPrecedence, oldPrecedence: ViewPrecedence): void {
  if (newPrecedence > oldPrecedence && (this.propertyFlags & ViewProperty.InheritedFlag) !== 0) {
    const superProperty = this.superProperty;
    if (superProperty !== null && superProperty.precedence < this.precedence) {
      this.setPropertyFlags(this.propertyFlags & ~ViewProperty.InheritedFlag);
    }
  }
};

ViewProperty.prototype.didSetPrecedence = function (this: ViewProperty<View, unknown>, newPrecedence: ViewPrecedence, oldPrecedence: ViewPrecedence): void {
  // hook
};

ViewProperty.prototype.setPropertyFlags = function (this: ViewProperty<View, unknown>, propertyFlags: ViewPropertyFlags): void {
  Object.defineProperty(this, "propertyFlags", {
    value: propertyFlags,
    enumerable: true,
    configurable: true,
  });
};

ViewProperty.prototype.isUpdated = function (this: ViewProperty<View, unknown>): boolean {
  return (this.propertyFlags & ViewProperty.UpdatedFlag) !== 0;
};

Object.defineProperty(ViewProperty.prototype, "updatedState", {
  get: function <T>(this: ViewProperty<View, T>): T | undefined {
    if ((this.propertyFlags & ViewProperty.UpdatedFlag) !== 0) {
      return this.state;
    } else {
      return void 0;
    }
  },
  enumerable: true,
  configurable: true,
});

ViewProperty.prototype.takeUpdatedState = function <T>(this: ViewProperty<View, T>): T | undefined {
  const propertyFlags = this.propertyFlags;
  if ((propertyFlags & ViewProperty.UpdatedFlag) !== 0) {
    this.setPropertyFlags(propertyFlags & ~ViewProperty.UpdatedFlag);
    return this.state;
  } else {
    return void 0;
  }
}

ViewProperty.prototype.takeState = function <T>(this: ViewProperty<View, T>): T {
  this.setPropertyFlags(this.propertyFlags & ~ViewProperty.UpdatedFlag);
  return this.state;
}

ViewProperty.prototype.change = function (this: ViewProperty<View, unknown>): void {
  this.owner.requireUpdate(View.NeedsChange);
};

ViewProperty.prototype.onChange = function (this: ViewProperty<View, unknown>): void {
  if (this.isInherited()) {
    this.onChangeInherited();
  }
};

ViewProperty.prototype.onChangeInherited = function (this: ViewProperty<View, unknown>): void {
  const superProperty = this.superProperty;
  if (superProperty !== null && superProperty.precedence >= this.precedence) {
    this.setOwnState(superProperty.state);
  }
};

ViewProperty.prototype.updateSubProperties = function <T>(this: ViewProperty<View, T>, newState: T, oldState: T): void {
  const subProperties = this.subProperties;
  for (let i = 0, n = subProperties !== null ? subProperties.length : 0; i < n; i += 1) {
    const subProperty = subProperties![i]!;
    if (subProperty.isInherited()) {
      subProperty.change();
    }
  }
};

ViewProperty.prototype.equalState = function <T>(this: ViewProperty<View, T>, newState: T, oldState: T): boolean {
  return Equals(newState, oldState);
};

ViewProperty.prototype.fromAny = function <T, U>(this: ViewProperty<View, T, U>, value: T | U): T {
  return value as T;
};

ViewProperty.prototype.isMounted = function (this: ViewProperty<View, unknown>): boolean {
  return (this.propertyFlags & ViewProperty.MountedFlag) !== 0;
};

ViewProperty.prototype.mount = function (this: ViewProperty<View, unknown>): void {
  if ((this.propertyFlags & ViewProperty.MountedFlag) === 0) {
    this.willMount();
    this.setPropertyFlags(this.propertyFlags | ViewProperty.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ViewProperty.prototype.willMount = function (this: ViewProperty<View, unknown>): void {
  // hook
};

ViewProperty.prototype.onMount = function (this: ViewProperty<View, unknown>): void {
  this.bindSuperProperty();
};

ViewProperty.prototype.didMount = function (this: ViewProperty<View, unknown>): void {
  // hook
};

ViewProperty.prototype.unmount = function (this: ViewProperty<View, unknown>): void {
  if ((this.propertyFlags & ViewProperty.MountedFlag) !== 0) {
    this.willUnmount();
    this.setPropertyFlags(this.propertyFlags & ~ViewProperty.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ViewProperty.prototype.willUnmount = function (this: ViewProperty<View, unknown>): void {
  // hook
};

ViewProperty.prototype.onUnmount = function (this: ViewProperty<View, unknown>): void {
  this.unbindSuperProperty();
};

ViewProperty.prototype.didUnmount = function (this: ViewProperty<View, unknown>): void {
  // hook
};

ViewProperty.prototype.toString = function (this: ViewProperty<View, unknown>): string {
  return this.name;
};

ViewProperty.getClass = function (type: unknown): ViewPropertyClass | null {
  if (type === String) {
    return StringViewProperty;
  } else if (type === Boolean) {
    return BooleanViewProperty;
  } else if (type === Number) {
    return NumberViewProperty;
  }
  return null;
};

ViewProperty.define = function <V extends View, T, U, I>(descriptor: ViewPropertyDescriptor<V, T, U, I>): ViewPropertyConstructor<V, T, U, I> {
  let _super: ViewPropertyClass | null | undefined = descriptor.extends;
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
    _super = ViewProperty.getClass(descriptor.type);
  }
  if (_super === null) {
    _super = ViewProperty;
    if (descriptor.fromAny === void 0 && FromAny.is<T, U>(descriptor.type)) {
      descriptor.fromAny = descriptor.type.fromAny;
    }
  }

  const _constructor = function DecoratedViewProperty(this: ViewProperty<V, T, U>, owner: V, propertyName: string | undefined): ViewProperty<V, T, U> {
    let _this: ViewProperty<V, T, U> = function ViewPropertyAccessor(state?: T | U, precedence?: ViewPrecedence): T | V {
      if (arguments.length === 0) {
        return _this.state;
      } else {
        _this.setState(state!, precedence);
        return _this.owner;
      }
    } as ViewProperty<V, T, U>;
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
  } as unknown as ViewPropertyConstructor<V, T, U, I>;

  const _prototype = descriptor as unknown as ViewProperty<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};

ViewProperty.MountedFlag = 1 << 0;
ViewProperty.UpdatedFlag = 1 << 1;
ViewProperty.OverrideFlag = 1 << 2;
ViewProperty.InheritedFlag = 1 << 3;
ViewProperty.ConstrainedFlag = 1 << 4;
ViewProperty.ConstrainingFlag = 1 << 5;

ViewProperty({extends: void 0, type: MoodVector, state: null, inherit: true})(View.prototype, "mood");
ViewProperty({extends: void 0, type: ThemeMatrix, state: null, inherit: true})(View.prototype, "theme");
