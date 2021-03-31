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
import {Equals, FromAny} from "@swim/util";
import {ModelFlags, ModelPrecedence, Model} from "../Model";
import {Trait} from "../Trait";
import {
  ModelPropertyFlags,
  ModelPropertyDescriptorExtends,
  ModelPropertyDescriptor,
  ModelPropertyConstructor,
  ModelProperty,
} from "./ModelProperty";
import {StringTraitProperty} from "../"; // forward import
import {BooleanTraitProperty} from "../"; // forward import
import {NumberTraitProperty} from "../"; // forward import

export type TraitPropertyMemberType<R, K extends keyof R> =
  R[K] extends TraitProperty<any, infer T, any> ? T : never;

export type TraitPropertyMemberInit<R, K extends keyof R> =
  R[K] extends TraitProperty<any, infer T, infer U> ? T | U : never;

export type TraitPropertyMemberKey<R, K extends keyof R> =
  R[K] extends TraitProperty<any, any> ? K : never;

export type TraitPropertyMemberMap<R> = {
  -readonly [K in keyof R as TraitPropertyMemberKey<R, K>]?: TraitPropertyMemberInit<R, K>;
};

export interface TraitPropertyInit<T, U = never> {
  extends?: TraitPropertyClass;
  type?: unknown;
  inherit?: string | boolean;

  state?: T | U;
  precedence?: ModelPrecedence;
  updateFlags?: ModelFlags;
  willSetState?(newState: T, oldState: T): void;
  didSetState?(newState: T, oldState: T): void;
  fromAny?(value: T | U): T;
  initState?(): T | U;

  /** @hidden */
  modelProperty?: ModelPropertyDescriptorExtends<Model, T> | ModelPropertyDescriptor<Model, T>;
  /** @hidden */
  modelPropertyConstructor?: ModelPropertyConstructor<Model, T>;
  /** @hidden */
  createModelProperty?(): ModelProperty<Model, T>;
}

export type TraitPropertyDescriptor<R extends Trait, T, U = never, I = {}> = TraitPropertyInit<T, U> & ThisType<TraitProperty<R, T, U> & I> & Partial<I>;

export type TraitPropertyDescriptorExtends<R extends Trait, T, U = never, I = {}> = {extends: TraitPropertyClass | undefined} & TraitPropertyDescriptor<R, T, U, I>;

export type TraitPropertyDescriptorFromAny<R extends Trait, T, U = never, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & TraitPropertyDescriptor<R, T, U, I>;

export interface TraitPropertyConstructor<R extends Trait, T, U = never, I = {}> {
  new(owner: R, propertyName: string | undefined): TraitProperty<R, T, U> & I;
  prototype: TraitProperty<any, any> & I;
}

export interface TraitPropertyClass extends Function {
  readonly prototype: TraitProperty<any, any>;
}

export interface TraitProperty<R extends Trait, T, U = never> {
  (): T;
  (state: T | U, precedence?: ModelPrecedence): R;

  readonly name: string;

  readonly owner: R;

  readonly modelProperty: ModelProperty<Model, T> | null;

  /** @hidden */
  modelPropertyConstructor?: ModelPropertyConstructor<Model, T>;

  /** @hidden */
  createModelProperty(): ModelProperty<Model, T>;

  /** @hidden */
  bindModelProperty(): void;

  /** @hidden */
  unbindModelProperty(): void;

  readonly inherit: string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  setInherited(inherited: boolean): void;

  /** @hidden */
  readonly superName: string | undefined;

  readonly superProperty: ModelProperty<Model, T> | null;

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

  isPrecedent(precedence: ModelPrecedence): boolean;

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
  attach(): void;

  /** @hidden */
  detach(): void;

  updateFlags?: ModelFlags;

  fromAny(value: T | U): T;

  toString(): string;
}

export const TraitProperty = function <R extends Trait, T, U>(
    this: TraitProperty<R, T, U> | typeof TraitProperty,
    owner: R | TraitPropertyDescriptor<R, T, U>,
    propertyName?: string,
  ): TraitProperty<R, T, U> | PropertyDecorator {
  if (this instanceof TraitProperty) { // constructor
    return TraitPropertyConstructor.call(this as TraitProperty<Trait, unknown, unknown>, owner as R, propertyName);
  } else { // decorator factory
    return TraitPropertyDecoratorFactory(owner as TraitPropertyDescriptor<R, T, U>);
  }
} as {
  /** @hidden */
  new<R extends Trait, T, U = never>(owner: R, propertyName: string | undefined): TraitProperty<R, T, U>;

  <R extends Trait, T extends string | undefined = string | undefined, U extends string | undefined = string | undefined>(descriptor: {type: typeof String} & TraitPropertyDescriptor<R, T, U>): PropertyDecorator;
  <R extends Trait, T extends boolean | undefined = boolean | undefined, U extends boolean | string | undefined = boolean | string | undefined>(descriptor: {type: typeof Boolean} & TraitPropertyDescriptor<R, T, U>): PropertyDecorator;
  <R extends Trait, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & TraitPropertyDescriptor<R, T, U>): PropertyDecorator;
  <R extends Trait, T, U = never>(descriptor: TraitPropertyDescriptorFromAny<R, T, U>): PropertyDecorator;
  <R extends Trait, T, U = never, I = {}>(descriptor: TraitPropertyDescriptorExtends<R, T, U, I>): PropertyDecorator;
  <R extends Trait, T, U = never>(descriptor: TraitPropertyDescriptor<R, T, U>): PropertyDecorator;

  /** @hidden */
  prototype: TraitProperty<any, any>;

  /** @hidden */
  getClass(type: unknown): TraitPropertyClass | null;

  define<R extends Trait, T, U = never, I = {}>(descriptor: TraitPropertyDescriptorExtends<R, T, U, I>): TraitPropertyConstructor<R, T, U, I>;
  define<R extends Trait, T, U = never>(descriptor: TraitPropertyDescriptor<R, T, U>): TraitPropertyConstructor<R, T, U>;
}
__extends(TraitProperty, Object);

function TraitPropertyConstructor<R extends Trait, T, U>(this: TraitProperty<R, T, U>, owner: R, propertyName: string | undefined): TraitProperty<R, T, U> {
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
  Object.defineProperty(this, "modelProperty", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "inherit", {
    value: false,
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

function TraitPropertyDecoratorFactory<R extends Trait, T, U>(descriptor: TraitPropertyDescriptor<R, T, U>): PropertyDecorator {
  return Trait.decorateTraitProperty.bind(Trait, TraitProperty.define(descriptor as TraitPropertyDescriptor<Trait, unknown>));
}

TraitProperty.prototype.createModelProperty = function <T, U>(this: TraitProperty<Trait, T, U>): ModelProperty<Model, T> {
  const modelPropertyConstructor = this.modelPropertyConstructor;
  if (modelPropertyConstructor !== void 0) {
    const model = this.owner.model;
    if (model !== null) {
      const modelProperty = new modelPropertyConstructor(model, this.name);
      Object.defineProperty(modelProperty, "inherit", {
        value: this.inherit,
        enumerable: true,
        configurable: true,
      });
      modelProperty.setPropertyFlags(this.propertyFlags);
      Object.defineProperty(modelProperty, "ownState", {
        value: this.state,
        enumerable: true,
        configurable: true,
      });
      return modelProperty;
    } else {
      throw new Error("no model");
    }
  } else {
    throw new Error("no model property constructor");
  }
};

TraitProperty.prototype.bindModelProperty = function (this: TraitProperty<Trait, unknown>): void {
  const model = this.owner.model;
  if (model !== null) {
    let modelProperty = model.getLazyModelProperty(this.name);
    if (modelProperty === null) {
      modelProperty = this.createModelProperty();
      model.setModelProperty(this.name, modelProperty);
    }
    Object.defineProperty(this, "modelProperty", {
      value: modelProperty,
      enumerable: true,
      configurable: true,
    });
    modelProperty.addTraitProperty(this);
    Object.defineProperty(this, "inherit", {
      value: modelProperty.inherit,
      enumerable: true,
      configurable: true,
    });
    this.setPropertyFlags(modelProperty.propertyFlags);
    Object.defineProperty(this, "ownState", {
      value: modelProperty.state,
      enumerable: true,
      configurable: true,
    });
  }
};

TraitProperty.prototype.unbindModelProperty = function (this: TraitProperty<Trait, unknown>): void {
  const modelProperty = this.modelProperty;
  if (modelProperty !== null) {
    modelProperty.removeTraitProperty(this);
    Object.defineProperty(this, "modelProperty", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }
};

TraitProperty.prototype.setInherit = function (this: TraitProperty<Trait, unknown>, inherit: string | boolean): void {
  const modelProperty = this.modelProperty;
  if (modelProperty !== null) {
    modelProperty.setInherit(inherit);
  } else if (this.inherit !== inherit) {
    Object.defineProperty(this, "inherit", {
      value: inherit,
      enumerable: true,
      configurable: true,
    });
  }
};

TraitProperty.prototype.isInherited = function (this: TraitProperty<Trait, unknown>): boolean {
  return (this.propertyFlags & ModelProperty.InheritedFlag) !== 0;
};

TraitProperty.prototype.setInherited = function (this: TraitProperty<Trait, unknown>, inherited: boolean): void {
  const modelProperty = this.modelProperty;
  if (modelProperty !== null) {
    modelProperty.setInherited(inherited);
  } else if (inherited && (this.propertyFlags & ModelProperty.InheritedFlag) === 0) {
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

Object.defineProperty(TraitProperty.prototype, "superName", {
  get: function (this: TraitProperty<Trait, unknown>): string | undefined {
    const modelProperty = this.modelProperty;
    return modelProperty !== null ? modelProperty.superName : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(TraitProperty.prototype, "superProperty", {
  get: function (this: TraitProperty<Trait, unknown>): ModelProperty<Model, unknown> | null {
    const modelProperty = this.modelProperty;
    return modelProperty !== null ? modelProperty.superProperty : null;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(TraitProperty.prototype, "superState", {
  get: function <T>(this: TraitProperty<Trait, T>): T | undefined {
    const modelProperty = this.modelProperty;
    return modelProperty !== null ? modelProperty.superState : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(TraitProperty.prototype, "state", {
  get: function <T>(this: TraitProperty<Trait, T>): T {
    return this.ownState;
  },
  enumerable: true,
  configurable: true,
});

TraitProperty.prototype.getState = function <T, U>(this: TraitProperty<Trait, T, U>): NonNullable<T> {
  const state = this.state;
  if (state === void 0 || state === null) {
    throw new TypeError(state + " " + this.name + " state");
  }
  return state as NonNullable<T>;
};

TraitProperty.prototype.getStateOr = function <T, U, E>(this: TraitProperty<Trait, T, U>, elseState: E): NonNullable<T> | E {
  let state: T | E = this.state;
  if (state === void 0 || state === null) {
    state = elseState;
  }
  return state as NonNullable<T> | E;
};

TraitProperty.prototype.setState = function <T, U>(this: TraitProperty<Trait, T, U>, newState: T | U, precedence?: ModelPrecedence): void {
  if (precedence === void 0) {
    precedence = Model.Extrinsic;
  }
  const modelProperty = this.modelProperty;
  if (modelProperty !== null) {
    newState = this.fromAny(newState);
    modelProperty.setState(newState, precedence);
  } else if (precedence >= this.precedence) {
    this.setPropertyFlags(this.propertyFlags & ~ModelProperty.InheritedFlag | ModelProperty.OverrideFlag);
    this.setPrecedence(precedence);
    this.setOwnState(newState);
  }
};

TraitProperty.prototype.setOwnState = function <T, U>(this: TraitProperty<Trait, T, U>, newState: T | U): void {
  newState = this.fromAny(newState);
  const modelProperty = this.modelProperty;
  if (modelProperty !== null) {
    modelProperty.setOwnState(newState);
  } else {
    const oldState = this.state;
    if (!Equals(newState, oldState)) {
      this.willSetState(newState, oldState);
      Object.defineProperty(this, "ownState", {
        value: newState,
        enumerable: true,
        configurable: true,
      });
      this.setPropertyFlags(this.propertyFlags | ModelProperty.UpdatedFlag);
      this.onSetState(newState, oldState);
      this.didSetState(newState, oldState);
    }
  }
};

TraitProperty.prototype.willSetState = function <T>(this: TraitProperty<Trait, T>, newState: T, oldState: T): void {
  // hook
};

TraitProperty.prototype.onSetState = function <T>(this: TraitProperty<Trait, T>, newState: T, oldState: T): void {
  const updateFlags = this.updateFlags;
  if (updateFlags !== void 0) {
    this.owner.requireUpdate(updateFlags);
  }
};

TraitProperty.prototype.didSetState = function <T>(this: TraitProperty<Trait, T>, newState: T, oldState: T): void {
  // hook
};

TraitProperty.prototype.isPrecedent = function (this: TraitProperty<Trait, unknown>, precedence: ModelPrecedence): boolean {
  return precedence >= this.precedence;
};

TraitProperty.prototype.setPrecedence = function (this: TraitProperty<Trait, unknown>, newPrecedence: ModelPrecedence): void {
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

TraitProperty.prototype.willSetPrecedence = function (this: TraitProperty<Trait, unknown>, newPrecedence: ModelPrecedence, oldPrecedence: ModelPrecedence): void {
  // hook
};

TraitProperty.prototype.onSetPrecedence = function (this: TraitProperty<Trait, unknown>, newPrecedence: ModelPrecedence, oldPrecedence: ModelPrecedence): void {
  if (newPrecedence > oldPrecedence && (this.propertyFlags & ModelProperty.InheritedFlag) !== 0) {
    const superProperty = this.superProperty;
    if (superProperty !== null && superProperty.precedence < this.precedence) {
      this.setPropertyFlags(this.propertyFlags & ~ModelProperty.InheritedFlag);
    }
  }
};

TraitProperty.prototype.didSetPrecedence = function (this: TraitProperty<Trait, unknown>, newPrecedence: ModelPrecedence, oldPrecedence: ModelPrecedence): void {
  // hook
};

TraitProperty.prototype.setPropertyFlags = function (this: TraitProperty<Trait, unknown>, propertyFlags: ModelPropertyFlags): void {
  Object.defineProperty(this, "propertyFlags", {
    value: propertyFlags,
    enumerable: true,
    configurable: true,
  });
};

TraitProperty.prototype.isUpdated = function (this: TraitProperty<Trait, unknown>): boolean {
  return (this.propertyFlags & ModelProperty.UpdatedFlag) !== 0;
};

Object.defineProperty(TraitProperty.prototype, "updatedState", {
  get: function <T>(this: TraitProperty<Trait, T>): T | undefined {
    if ((this.propertyFlags & ModelProperty.UpdatedFlag) !== 0) {
      return this.state;
    } else {
      return void 0;
    }
  },
  enumerable: true,
  configurable: true,
});

TraitProperty.prototype.takeUpdatedState = function <T>(this: TraitProperty<Trait, T>): T | undefined {
  const propertyFlags = this.propertyFlags;
  if ((propertyFlags & ModelProperty.UpdatedFlag) !== 0) {
    this.setPropertyFlags(propertyFlags & ~ModelProperty.UpdatedFlag);
    return this.state;
  } else {
    return void 0;
  }
}

TraitProperty.prototype.takeState = function <T>(this: TraitProperty<Trait, T>): T {
  this.setPropertyFlags(this.propertyFlags & ~ModelProperty.UpdatedFlag);
  return this.state;
}

TraitProperty.prototype.mutate = function (this: TraitProperty<Trait, unknown>): void {
  this.owner.requireUpdate(Model.NeedsMutate);
};

TraitProperty.prototype.attach = function (this: TraitProperty<Trait, unknown>): void {
  this.bindModelProperty();
};

TraitProperty.prototype.detach = function (this: TraitProperty<Trait, unknown>): void {
  this.unbindModelProperty();
};

TraitProperty.prototype.fromAny = function <T, U>(this: TraitProperty<Trait, T, U>, value: T | U): T {
  return value as T;
};

TraitProperty.prototype.toString = function (this: TraitProperty<Trait, unknown>): string {
  return this.name;
};

TraitProperty.getClass = function (type: unknown): TraitPropertyClass | null {
  if (type === String) {
    return StringTraitProperty;
  } else if (type === Boolean) {
    return BooleanTraitProperty;
  } else if (type === Number) {
    return NumberTraitProperty;
  }
  return null;
};

TraitProperty.define = function <R extends Trait, T, U, I>(descriptor: TraitPropertyDescriptor<R, T, U, I>): TraitPropertyConstructor<R, T, U, I> {
  let _super: TraitPropertyClass | null | undefined = descriptor.extends;
  const type = descriptor.type;
  const inherit = descriptor.inherit;
  const state = descriptor.state;
  const precedence = descriptor.precedence;
  const initState = descriptor.initState;
  let modelProperty = descriptor.modelProperty;
  delete descriptor.extends;
  delete descriptor.inherit;
  delete descriptor.state;
  delete descriptor.precedence;
  delete descriptor.initState;
  delete descriptor.modelProperty;

  if (_super === void 0) {
    _super = TraitProperty.getClass(type);
  }
  if (_super === null) {
    _super = TraitProperty;
    if (descriptor.fromAny === void 0 && FromAny.is<T, U>(type)) {
      descriptor.fromAny = type.fromAny;
    }
  }

  const _constructor = function DecoratedTraitProperty(this: TraitProperty<R, T, U>, owner: R, propertyName: string | undefined): TraitProperty<R, T, U> {
    let _this: TraitProperty<R, T, U> = function TraitPropertyAccessor(state?: T | U, precedence?: ModelPrecedence): T | R {
      if (arguments.length === 0) {
        return _this.state;
      } else {
        _this.setState(state!, precedence);
        return _this.owner;
      }
    } as TraitProperty<R, T, U>;
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
  } as unknown as TraitPropertyConstructor<R, T, U, I>;

  const _prototype = descriptor as unknown as TraitProperty<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (_prototype.modelPropertyConstructor === void 0) {
    if (modelProperty === void 0) {
      modelProperty = {
        extends: void 0,
        type,
        inherit,
        state: state as T,
      };
    }
    _prototype.modelPropertyConstructor = ModelProperty.define(modelProperty as ModelPropertyDescriptor<Model, T>);
  }

  return _constructor;
};
