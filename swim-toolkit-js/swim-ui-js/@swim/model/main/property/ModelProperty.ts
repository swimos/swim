// Copyright 2015-2021 Swim inc.
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
import {ModelFlags, ModelPrecedence, Model} from "../Model";
import {StringModelProperty} from "../"; // forward import
import {BooleanModelProperty} from "../"; // forward import
import {NumberModelProperty} from "../"; // forward import

export type ModelPropertyMemberType<M, K extends keyof M> =
  M[K] extends ModelProperty<any, infer T, any> ? T : never;

export type ModelPropertyMemberInit<M, K extends keyof M> =
  M[K] extends ModelProperty<any, infer T, infer U> ? T | U : never;

export type ModelPropertyMemberKey<M, K extends keyof M> =
  M[K] extends ModelProperty<any, any> ? K : never;

export type ModelPropertyMemberMap<M> = {
  -readonly [K in keyof M as ModelPropertyMemberKey<M, K>]?: ModelPropertyMemberInit<M, K>;
};

export type ModelPropertyFlags = number;

export interface ModelPropertyInit<T, U = never> {
  extends?: ModelPropertyClass;
  type?: unknown;
  inherit?: string | boolean;

  state?: T | U;
  precedence?: ModelPrecedence;
  updateFlags?: ModelFlags;
  willSetState?(newState: T, oldState: T): void;
  didSetState?(newState: T, oldState: T): void;
  equalState?(newState: T, oldState: T): boolean;
  fromAny?(value: T | U): T;
  initState?(): T | U;
}

export type ModelPropertyDescriptor<M extends Model, T, U = never, I = {}> = ModelPropertyInit<T, U> & ThisType<ModelProperty<M, T, U> & I> & Partial<I>;

export type ModelPropertyDescriptorExtends<M extends Model, T, U = never, I = {}> = {extends: ModelPropertyClass | undefined} & ModelPropertyDescriptor<M, T, U, I>;

export type ModelPropertyDescriptorFromAny<M extends Model, T, U = never, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ModelPropertyDescriptor<M, T, U, I>;

export interface ModelPropertyConstructor<M extends Model, T, U = never, I = {}> {
  new(owner: M, propertyName: string | undefined): ModelProperty<M, T, U> & I;
  prototype: ModelProperty<any, any> & I;
}

export interface ModelPropertyClass extends Function {
  readonly prototype: ModelProperty<any, any>;
}

export interface ModelProperty<M extends Model, T, U = never> {
  (): T;
  (state: T | U, precedence?: ModelPrecedence): M;

  readonly name: string;

  readonly owner: M;

  readonly inherit: string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  setInherited(inherited: boolean): void;

  /** @hidden */
  readonly superName: string | undefined;

  readonly superProperty: ModelProperty<Model, T> | null;

  /** @hidden */
  bindSuperProperty(): void;

  /** @hidden */
  unbindSuperProperty(): void;

  /** @hidden */
  readonly subProperties: ModelProperty<Model, T>[] | null;

  /** @hidden */
  addSubProperty(subProperty: ModelProperty<Model, T>): void;

  /** @hidden */
  removeSubProperty(subProperty: ModelProperty<Model, T>): void;

  readonly superState: T | undefined;

  readonly ownState: T;

  readonly state: T;

  getState(): NonNullable<T>;

  getStateOr<E>(elseState: E): NonNullable<T> | E;

  setState(state: T | U, precedence?: ModelPrecedence): void;

  /** @hidden */
  setOwnState(state: T | U): void;

  willSetState(newState: T, oldState: T): void;

  onSetState(newState: T, oldState: T): void;

  didSetState(newState: T, oldState: T): void;

  takesPrecedence(precedence: ModelPrecedence): boolean;

  readonly precedence: ModelPrecedence;

  setPrecedence(precedence: ModelPrecedence): void;

  /** @hidden */
  willSetPrecedence(newPrecedence: ModelPrecedence, oldPrecedence: ModelPrecedence): void;

  /** @hidden */
  onSetPrecedence(newPrecedence: ModelPrecedence, oldPrecedence: ModelPrecedence): void;

  /** @hidden */
  didSetPrecedence(newPrecedence: ModelPrecedence, oldPrecedence: ModelPrecedence): void;

  /** @hidden */
  propertyFlags: ModelPropertyFlags;

  /** @hidden */
  setPropertyFlags(propertyFlags: ModelPropertyFlags): void;

  isUpdated(): boolean;

  readonly updatedState: T | undefined;

  takeUpdatedState(): T | undefined;

  takeState(): T;

  /** @hidden */
  mutate(): void;

  /** @hidden */
  onMutate(): void;

  /** @hidden */
  onMutateInherited(): void;

  /** @hidden */
  updateSubProperties(newState: T, oldState: T): void;

  updateFlags?: ModelFlags;

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

export const ModelProperty = function <M extends Model, T, U>(
    this: ModelProperty<M, T, U> | typeof ModelProperty,
    owner: M | ModelPropertyDescriptor<M, T, U>,
    propertyName?: string,
  ): ModelProperty<M, T, U> | PropertyDecorator {
  if (this instanceof ModelProperty) { // constructor
    return ModelPropertyConstructor.call(this as ModelProperty<Model, unknown, unknown>, owner as M, propertyName);
  } else { // decorator factory
    return ModelPropertyDecoratorFactory(owner as ModelPropertyDescriptor<M, T, U>);
  }
} as {
  /** @hidden */
  new<M extends Model, T, U = never>(owner: M, propertyName: string | undefined): ModelProperty<M, T, U>;

  <M extends Model, T extends string | undefined = string | undefined, U extends string | undefined = string | undefined>(descriptor: {type: typeof String} & ModelPropertyDescriptor<M, T, U>): PropertyDecorator;
  <M extends Model, T extends boolean | undefined = boolean | undefined, U extends boolean | string | undefined = boolean | string | undefined>(descriptor: {type: typeof Boolean} & ModelPropertyDescriptor<M, T, U>): PropertyDecorator;
  <M extends Model, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & ModelPropertyDescriptor<M, T, U>): PropertyDecorator;
  <M extends Model, T, U = never>(descriptor: ModelPropertyDescriptorFromAny<M, T, U>): PropertyDecorator;
  <M extends Model, T, U = never, I = {}>(descriptor: ModelPropertyDescriptorExtends<M, T, U, I>): PropertyDecorator;
  <M extends Model, T, U = never>(descriptor: ModelPropertyDescriptor<M, T, U>): PropertyDecorator;

  /** @hidden */
  prototype: ModelProperty<any, any>;

  /** @hidden */
  getClass(type: unknown): ModelPropertyClass | null;

  define<M extends Model, T, U = never, I = {}>(descriptor: ModelPropertyDescriptorExtends<M, T, U, I>): ModelPropertyConstructor<M, T, U, I>;
  define<M extends Model, T, U = never>(descriptor: ModelPropertyDescriptor<M, T, U>): ModelPropertyConstructor<M, T, U>;

  /** @hidden */
  MountedFlag: ModelPropertyFlags;
  /** @hidden */
  UpdatedFlag: ModelPropertyFlags;
  /** @hidden */
  OverrideFlag: ModelPropertyFlags;
  /** @hidden */
  InheritedFlag: ModelPropertyFlags;
};
__extends(ModelProperty, Object);

function ModelPropertyConstructor<M extends Model, T, U>(this: ModelProperty<M, T, U>, owner: M, propertyName: string | undefined): ModelProperty<M, T, U> {
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
    value: Model.Intrinsic,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "propertyFlags", {
    value: ModelProperty.UpdatedFlag,
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

function ModelPropertyDecoratorFactory<M extends Model, T, U>(descriptor: ModelPropertyDescriptor<M, T, U>): PropertyDecorator {
  return Model.decorateModelProperty.bind(Model, ModelProperty.define(descriptor as ModelPropertyDescriptor<Model, unknown>));
}

ModelProperty.prototype.setInherit = function (this: ModelProperty<Model, unknown>, inherit: string | boolean): void {
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

ModelProperty.prototype.isInherited = function (this: ModelProperty<Model, unknown>): boolean {
  return (this.propertyFlags & ModelProperty.InheritedFlag) !== 0;
};

ModelProperty.prototype.setInherited = function (this: ModelProperty<Model, unknown>, inherited: boolean): void {
  if (inherited && (this.propertyFlags & ModelProperty.InheritedFlag) === 0) {
    const superProperty = this.superProperty;
    if (superProperty !== null && superProperty.precedence >= this.precedence) {
      this.setPropertyFlags(this.propertyFlags & ~ModelProperty.OverrideFlag | ModelProperty.InheritedFlag);
      this.setOwnState(superProperty.state);
      this.mutate();
    }
  } else if (!inherited && (this.propertyFlags & ModelProperty.InheritedFlag) !== 0) {
    const superProperty = this.superProperty;
    if (superProperty !== null && superProperty.precedence < this.precedence) {
      this.setPropertyFlags(this.propertyFlags & ~ModelProperty.InheritedFlag);
    }
  }
};

Object.defineProperty(ModelProperty.prototype, "superName", {
  get: function (this: ModelProperty<Model, unknown>): string | undefined {
    const inherit = this.inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

ModelProperty.prototype.bindSuperProperty = function (this: ModelProperty<Model, unknown>): void {
  const superName = this.superName;
  if (superName !== void 0 && this.isMounted()) {
    let superModel = this.owner.parentModel;
    while (superModel !== null) {
      const superProperty = superModel.getLazyModelProperty(superName);
      if (superProperty !== null) {
        Object.defineProperty(this, "superProperty", {
          value: superProperty,
          enumerable: true,
          configurable: true,
        });
        superProperty.addSubProperty(this);
        if ((this.propertyFlags & ModelProperty.OverrideFlag) === 0 && superProperty.precedence >= this.precedence) {
          this.setPropertyFlags(this.propertyFlags | ModelProperty.InheritedFlag);
          this.setOwnState(superProperty.state);
          this.mutate();
        }
        break;
      }
      superModel = superModel.parentModel;
    }
  }
};

ModelProperty.prototype.unbindSuperProperty = function (this: ModelProperty<Model, unknown>): void {
  const superProperty = this.superProperty;
  if (superProperty !== null) {
    superProperty.removeSubProperty(this);
    Object.defineProperty(this, "superProperty", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    this.setPropertyFlags(this.propertyFlags & ~ModelProperty.InheritedFlag);
  }
};

ModelProperty.prototype.addSubProperty = function <T>(this: ModelProperty<Model, T>, subProperty: ModelProperty<Model, T>): void {
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

ModelProperty.prototype.removeSubProperty = function <T>(this: ModelProperty<Model, T>, subProperty: ModelProperty<Model, T>): void {
  const subProperties = this.subProperties;
  if (subProperties !== null) {
    const index = subProperties.indexOf(subProperty);
    if (index >= 0) {
      subProperties.splice(index, 1);
    }
  }
};

Object.defineProperty(ModelProperty.prototype, "superState", {
  get: function <T>(this: ModelProperty<Model, T>): T | undefined {
    const superProperty = this.superProperty;
    return superProperty !== null ? superProperty.state : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ModelProperty.prototype, "state", {
  get: function <T>(this: ModelProperty<Model, T>): T {
    return this.ownState;
  },
  enumerable: true,
  configurable: true,
});

ModelProperty.prototype.getState = function <T, U>(this: ModelProperty<Model, T, U>): NonNullable<T> {
  const state = this.state;
  if (state === void 0 || state === null) {
    throw new TypeError(state + " " + this.name + " state");
  }
  return state as NonNullable<T>;
};

ModelProperty.prototype.getStateOr = function <T, U, E>(this: ModelProperty<Model, T, U>, elseState: E): NonNullable<T> | E {
  let state: T | E = this.state;
  if (state === void 0 || state === null) {
    state = elseState;
  }
  return state as NonNullable<T> | E;
};

ModelProperty.prototype.setState = function <T, U>(this: ModelProperty<Model, T, U>, newState: T | U, precedence?: ModelPrecedence): void {
  if (precedence === void 0) {
    precedence = Model.Extrinsic;
  }
  if (precedence >= this.precedence) {
    this.setPropertyFlags(this.propertyFlags & ~ModelProperty.InheritedFlag | ModelProperty.OverrideFlag);
    this.setPrecedence(precedence);
    this.setOwnState(newState);
  }
};

ModelProperty.prototype.setOwnState = function <T, U>(this: ModelProperty<Model, T, U>, newState: T | U): void {
  newState = this.fromAny(newState);
  const oldState = this.state;
  if (!this.equalState(newState, oldState)) {
    this.willSetState(newState, oldState);
    Object.defineProperty(this, "ownState", {
      value: newState,
      enumerable: true,
      configurable: true,
    });
    this.setPropertyFlags(this.propertyFlags | ModelProperty.UpdatedFlag);
    this.onSetState(newState, oldState);
    this.updateSubProperties(newState, oldState);
    this.didSetState(newState, oldState);
  }
};

ModelProperty.prototype.willSetState = function <T>(this: ModelProperty<Model, T>, newState: T, oldState: T): void {
  // hook
};

ModelProperty.prototype.onSetState = function <T>(this: ModelProperty<Model, T>, newState: T, oldState: T): void {
  const updateFlags = this.updateFlags;
  if (updateFlags !== void 0) {
    this.owner.requireUpdate(updateFlags);
  }
};

ModelProperty.prototype.didSetState = function <T>(this: ModelProperty<Model, T>, newState: T, oldState: T): void {
  // hook
};

ModelProperty.prototype.takesPrecedence = function (this: ModelProperty<Model, unknown>, precedence: ModelPrecedence): boolean {
  return precedence >= this.precedence;
};

ModelProperty.prototype.setPrecedence = function (this: ModelProperty<Model, unknown>, newPrecedence: ModelPrecedence): void {
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

ModelProperty.prototype.willSetPrecedence = function (this: ModelProperty<Model, unknown>, newPrecedence: ModelPrecedence, oldPrecedence: ModelPrecedence): void {
  // hook
};

ModelProperty.prototype.onSetPrecedence = function (this: ModelProperty<Model, unknown>, newPrecedence: ModelPrecedence, oldPrecedence: ModelPrecedence): void {
  if (newPrecedence > oldPrecedence && (this.propertyFlags & ModelProperty.InheritedFlag) !== 0) {
    const superProperty = this.superProperty;
    if (superProperty !== null && superProperty.precedence < this.precedence) {
      this.setPropertyFlags(this.propertyFlags & ~ModelProperty.InheritedFlag);
    }
  }
};

ModelProperty.prototype.didSetPrecedence = function (this: ModelProperty<Model, unknown>, newPrecedence: ModelPrecedence, oldPrecedence: ModelPrecedence): void {
  // hook
};

ModelProperty.prototype.setPropertyFlags = function (this: ModelProperty<Model, unknown>, propertyFlags: ModelPropertyFlags): void {
  Object.defineProperty(this, "propertyFlags", {
    value: propertyFlags,
    enumerable: true,
    configurable: true,
  });
};

ModelProperty.prototype.isUpdated = function (this: ModelProperty<Model, unknown>): boolean {
  return (this.propertyFlags & ModelProperty.UpdatedFlag) !== 0;
};

Object.defineProperty(ModelProperty.prototype, "updatedState", {
  get: function <T>(this: ModelProperty<Model, T>): T | undefined {
    if ((this.propertyFlags & ModelProperty.UpdatedFlag) !== 0) {
      return this.state;
    } else {
      return void 0;
    }
  },
  enumerable: true,
  configurable: true,
});

ModelProperty.prototype.takeUpdatedState = function <T>(this: ModelProperty<Model, T>): T | undefined {
  const propertyFlags = this.propertyFlags;
  if ((propertyFlags & ModelProperty.UpdatedFlag) !== 0) {
    this.setPropertyFlags(propertyFlags & ~ModelProperty.UpdatedFlag);
    return this.state;
  } else {
    return void 0;
  }
}

ModelProperty.prototype.takeState = function <T>(this: ModelProperty<Model, T>): T {
  this.setPropertyFlags(this.propertyFlags & ~ModelProperty.UpdatedFlag);
  return this.state;
}

ModelProperty.prototype.mutate = function (this: ModelProperty<Model, unknown>): void {
  this.owner.requireUpdate(Model.NeedsMutate);
};

ModelProperty.prototype.onMutate = function (this: ModelProperty<Model, unknown>): void {
  if (this.isInherited()) {
    this.onMutateInherited();
  }
};

ModelProperty.prototype.onMutateInherited = function <T>(this: ModelProperty<Model, T>): void {
  const superProperty = this.superProperty;
  if (superProperty !== null && superProperty.precedence >= this.precedence) {
    this.setOwnState(superProperty.state);
  }
};

ModelProperty.prototype.updateSubProperties = function <T>(this: ModelProperty<Model, T>, newState: T, oldState: T): void {
  const subProperties = this.subProperties;
  for (let i = 0, n = subProperties !== null ? subProperties.length : 0; i < n; i += 1) {
    const subProperty = subProperties![i]!;
    if (subProperty.isInherited()) {
      subProperty.mutate();
    }
  }
};

ModelProperty.prototype.equalState = function <T>(this: ModelProperty<Model, T>, newState: T, oldState: T): boolean {
  return Equals(newState, oldState);
};

ModelProperty.prototype.fromAny = function <T, U>(this: ModelProperty<Model, T, U>, value: T | U): T {
  return value as T;
};

ModelProperty.prototype.isMounted = function (this: ModelProperty<Model, unknown>): boolean {
  return (this.propertyFlags & ModelProperty.MountedFlag) !== 0;
};

ModelProperty.prototype.mount = function (this: ModelProperty<Model, unknown>): void {
  if ((this.propertyFlags & ModelProperty.MountedFlag) === 0) {
    this.willMount();
    this.setPropertyFlags(this.propertyFlags | ModelProperty.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ModelProperty.prototype.willMount = function (this: ModelProperty<Model, unknown>): void {
  // hook
};

ModelProperty.prototype.onMount = function (this: ModelProperty<Model, unknown>): void {
  this.bindSuperProperty();
};

ModelProperty.prototype.didMount = function (this: ModelProperty<Model, unknown>): void {
  // hook
};

ModelProperty.prototype.unmount = function (this: ModelProperty<Model, unknown>): void {
  if ((this.propertyFlags & ModelProperty.MountedFlag) !== 0) {
    this.willUnmount();
    this.setPropertyFlags(this.propertyFlags & ~ModelProperty.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ModelProperty.prototype.willUnmount = function (this: ModelProperty<Model, unknown>): void {
  // hook
};

ModelProperty.prototype.onUnmount = function (this: ModelProperty<Model, unknown>): void {
  this.unbindSuperProperty();
};

ModelProperty.prototype.didUnmount = function (this: ModelProperty<Model, unknown>): void {
  // hook
};

ModelProperty.prototype.toString = function (this: ModelProperty<Model, unknown>): string {
  return this.name;
};

ModelProperty.getClass = function (type: unknown): ModelPropertyClass | null {
  if (type === String) {
    return StringModelProperty;
  } else if (type === Boolean) {
    return BooleanModelProperty;
  } else if (type === Number) {
    return NumberModelProperty;
  }
  return null;
};

ModelProperty.define = function <M extends Model, T, U, I>(descriptor: ModelPropertyDescriptor<M, T, U, I>): ModelPropertyConstructor<M, T, U, I> {
  let _super: ModelPropertyClass | null | undefined = descriptor.extends;
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
    _super = ModelProperty.getClass(descriptor.type);
  }
  if (_super === null) {
    _super = ModelProperty;
    if (descriptor.fromAny === void 0 && FromAny.is<T, U>(descriptor.type)) {
      descriptor.fromAny = descriptor.type.fromAny;
    }
  }

  const _constructor = function DecoratedModelProperty(this: ModelProperty<M, T, U>, owner: M, propertyName: string | undefined): ModelProperty<M, T, U> {
    let _this: ModelProperty<M, T, U> = function ModelPropertyAccessor(state?: T | U, precedence?: ModelPrecedence): T | M {
      if (arguments.length === 0) {
        return _this.state;
      } else {
        _this.setState(state!, precedence);
        return _this.owner;
      }
    } as ModelProperty<M, T, U>;
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
  } as unknown as ModelPropertyConstructor<M, T, U, I>;

  const _prototype = descriptor as unknown as ModelProperty<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};

ModelProperty.MountedFlag = 1 << 0;
ModelProperty.UpdatedFlag = 1 << 1;
ModelProperty.OverrideFlag = 1 << 2;
ModelProperty.InheritedFlag = 1 << 3;
