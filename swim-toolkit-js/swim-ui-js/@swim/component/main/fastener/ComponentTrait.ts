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
import {FromAny} from "@swim/util";
import {Model, Trait, TraitObserverType} from "@swim/model";
import {Component} from "../Component";

export type ComponentTraitMemberType<C, K extends keyof C> =
  C[K] extends ComponentTrait<any, infer R, any> ? R : never;

export type ComponentTraitMemberInit<C, K extends keyof C> =
  C[K] extends ComponentTrait<any, infer R, infer U> ? R | U : never;

export type ComponentTraitFlags = number;

export interface ComponentTraitInit<R extends Trait, U = never> {
  extends?: ComponentTraitClass;
  key?: string | boolean;
  type?: unknown;
  observe?: boolean;

  willSetTrait?(newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void;
  onSetTrait?(newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void;
  didSetTrait?(newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void;

  createTrait?(): R | U | null;
  insertTrait?(model: Model, trait: R, targetTrait: Trait | null, key: string | undefined): void;
  fromAny?(value: R | U): R | null;
}

export type ComponentTraitDescriptor<C extends Component, R extends Trait, U = never, I = {}> = ComponentTraitInit<R, U> & ThisType<ComponentTrait<C, R, U> & I> & Partial<I>;

export interface ComponentTraitConstructor<C extends Component, R extends Trait, U = never, I = {}> {
  new<O extends C>(owner: O, key: string | undefined, fastenerName: string | undefined): ComponentTrait<O, R, U> & I;
  prototype: Omit<ComponentTrait<any, any>, "key"> & {key?: string | boolean} & I;
}

export interface ComponentTraitClass extends Function {
  readonly prototype: Omit<ComponentTrait<any, any>, "key"> & {key?: string | boolean};
}

export interface ComponentTrait<C extends Component, R extends Trait, U = never> {
  (): R | null;
  (trait: R | U | null, targetTrait?: Trait | null): C;

  readonly name: string;

  readonly owner: C;

  /** @hidden */
  fastenerFlags: ComponentTraitFlags;

  /** @hidden */
  setFastenerFlags(fastenerFlags: ComponentTraitFlags): void;

  readonly key: string | undefined;

  readonly trait: R | null;

  getTrait(): R;

  setTrait(newTrait: R | U | null, targetTrait?: Trait | null): R | null;

  /** @hidden */
  attachTrait(newTrait: R): void;

  /** @hidden */
  detachTrait(oldTrait: R): void;

  /** @hidden */
  willSetTrait(newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void;

  /** @hidden */
  onSetTrait(newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void;

  /** @hidden */
  didSetTrait(newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void;

  injectTrait(model: Model, trait?: R | U | null, targetTrait?: Trait | null, key?: string | null): R | null;

  createTrait(): R | U | null;

  /** @hidden */
  insertTrait(model: Model, trait: R, targetTrait: Trait | null, key: string | undefined): void;

  removeTrait(): R | null;

  /** @hidden */
  observe?: boolean;

  /** @hidden */
  readonly type?: unknown;

  fromAny(value: R | U): R | null;

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

export const ComponentTrait = function <C extends Component, R extends Trait, U>(
    this: ComponentTrait<C, R, U> | typeof ComponentTrait,
    owner: C | ComponentTraitDescriptor<C, R, U>,
    key?: string,
    fastenerName?: string,
  ): ComponentTrait<C, R, U> | PropertyDecorator {
  if (this instanceof ComponentTrait) { // constructor
    return ComponentTraitConstructor.call(this as unknown as ComponentTrait<Component, Trait, unknown>, owner as C, key, fastenerName);
  } else { // decorator factory
    return ComponentTraitDecoratorFactory(owner as ComponentTraitDescriptor<C, R, U>);
  }
} as {
  /** @hidden */
  new<C extends Component, R extends Trait, U = never>(owner: C, key: string | undefined, fastenerName: string | undefined): ComponentTrait<C, R, U>;

  <C extends Component, R extends Trait = Trait, U = never, I = {}>(descriptor: {observe: boolean} & ComponentTraitDescriptor<C, R, U, I & TraitObserverType<R>>): PropertyDecorator;
  <C extends Component, R extends Trait = Trait, U = never, I = {}>(descriptor: ComponentTraitDescriptor<C, R, U, I>): PropertyDecorator;

  /** @hidden */
  prototype: ComponentTrait<any, any>;

  define<C extends Component, R extends Trait = Trait, U = never, I = {}>(descriptor: {observe: boolean} & ComponentTraitDescriptor<C, R, U, I & TraitObserverType<R>>): ComponentTraitConstructor<C, R, U, I>;
  define<C extends Component, R extends Trait = Trait, U = never, I = {}>(descriptor: ComponentTraitDescriptor<C, R, U, I>): ComponentTraitConstructor<C, R, U, I>;

  /** @hidden */
  MountedFlag: ComponentTraitFlags;
};
__extends(ComponentTrait, Object);

function ComponentTraitConstructor<C extends Component, R extends Trait, U>(this: ComponentTrait<C, R, U>, owner: C, key: string | undefined, fastenerName: string | undefined): ComponentTrait<C, R, U> {
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
  Object.defineProperty(this, "trait", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  return this;
}

function ComponentTraitDecoratorFactory<C extends Component, R extends Trait, U>(descriptor: ComponentTraitDescriptor<C, R, U>): PropertyDecorator {
  return Component.decorateComponentTrait.bind(Component, ComponentTrait.define(descriptor as ComponentTraitDescriptor<Component, Trait>));
}

ComponentTrait.prototype.setFastenerFlags = function (this: ComponentTrait<Component, Trait>, fastenerFlags: ComponentTraitFlags): void {
  Object.defineProperty(this, "fastenerFlags", {
    value: fastenerFlags,
    enumerable: true,
    configurable: true,
  });
};

ComponentTrait.prototype.getTrait = function <R extends Trait>(this: ComponentTrait<Component, R>): R {
  const trait = this.trait;
  if (trait === null) {
    throw new TypeError("null " + this.name + " trait");
  }
  return trait;
};

ComponentTrait.prototype.setTrait = function <R extends Trait>(this: ComponentTrait<Component, R>, newTrait: R | null, targetTrait?: Trait | null): R | null {
  const oldTrait = this.trait;
  if (newTrait !== null) {
    newTrait = this.fromAny(newTrait);
  }
  if (oldTrait !== newTrait) {
    if (targetTrait === void 0) {
      targetTrait = null;
    }
    this.willSetTrait(newTrait, oldTrait, targetTrait);
    if (oldTrait !== null) {
      this.detachTrait(oldTrait);
    }
    Object.defineProperty(this, "trait", {
      value: newTrait,
      enumerable: true,
      configurable: true,
    });
    if (newTrait !== null) {
      this.attachTrait(newTrait);
    }
    this.onSetTrait(newTrait, oldTrait, targetTrait);
    this.didSetTrait(newTrait, oldTrait, targetTrait);
  }
  return oldTrait;
};

ComponentTrait.prototype.attachTrait = function <R extends Trait>(this: ComponentTrait<Component, R>, newTrait: R): void {
  if (this.observe === true) {
    newTrait.addTraitObserver(this as TraitObserverType<R>);
  }
};

ComponentTrait.prototype.detachTrait = function <R extends Trait>(this: ComponentTrait<Component, R>, oldTrait: R): void {
  if (this.observe === true) {
    oldTrait.removeTraitObserver(this as TraitObserverType<R>);
  }
};

ComponentTrait.prototype.willSetTrait = function <R extends Trait>(this: ComponentTrait<Component, R>, newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void {
  // hook
};

ComponentTrait.prototype.onSetTrait = function <R extends Trait>(this: ComponentTrait<Component, R>, newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void {
  // hook
};

ComponentTrait.prototype.didSetTrait = function <R extends Trait>(this: ComponentTrait<Component, R>, newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void {
  // hook
};

ComponentTrait.prototype.injectTrait = function <R extends Trait>(this: ComponentTrait<Component, R>, model: Model, trait?: R | null, targetTrait?: Trait | null, key?: string | null): R | null {
  if (targetTrait === void 0) {
    targetTrait = null;
  }
  if (trait === void 0 || trait === null) {
    trait = this.trait;
    if (trait === null) {
      trait = this.createTrait();
    }
  } else {
    trait = this.fromAny(trait);
    if (trait !== null) {
      this.setTrait(trait, targetTrait);
    }
  }
  if (trait !== null) {
    if (key === void 0) {
      key = this.key;
    } else if (key === null) {
      key = void 0;
    }
    if (trait.model !== model || trait.key !== key) {
      this.insertTrait(model, trait, targetTrait, key);
    }
    if (this.trait === null) {
      this.setTrait(trait, targetTrait);
    }
  }
  return trait;
};

ComponentTrait.prototype.createTrait = function <R extends Trait, U>(this: ComponentTrait<Component, R, U>): R | U | null {
  return null;
};

ComponentTrait.prototype.insertTrait = function <R extends Trait>(this: ComponentTrait<Component, R>, model: Model, trait: R, targetTrait: Trait | null, key: string | undefined): void {
  model.insertTrait(trait, targetTrait, key);
};

ComponentTrait.prototype.removeTrait = function <R extends Trait>(this: ComponentTrait<Component, R>): R | null {
  const trait = this.trait;
  if (trait !== null) {
    trait.remove();
  }
  return trait;
};

ComponentTrait.prototype.fromAny = function <R extends Trait, U>(this: ComponentTrait<Component, R, U>, value: R | U): R | null {
  const type = this.type;
  if (FromAny.is<R, U>(type)) {
    return type.fromAny(value);
  } else if (value instanceof Trait) {
    return value;
  }
  return null;
};

ComponentTrait.prototype.isMounted = function (this: ComponentTrait<Component, Trait>): boolean {
  return (this.fastenerFlags & ComponentTrait.MountedFlag) !== 0;
};

ComponentTrait.prototype.mount = function (this: ComponentTrait<Component, Trait>): void {
  if ((this.fastenerFlags & ComponentTrait.MountedFlag) === 0) {
    this.willMount();
    this.setFastenerFlags(this.fastenerFlags | ComponentTrait.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ComponentTrait.prototype.willMount = function (this: ComponentTrait<Component, Trait>): void {
  // hook
};

ComponentTrait.prototype.onMount = function (this: ComponentTrait<Component, Trait>): void {
  // hook
};

ComponentTrait.prototype.didMount = function (this: ComponentTrait<Component, Trait>): void {
  // hook
};

ComponentTrait.prototype.unmount = function (this: ComponentTrait<Component, Trait>): void {
  if ((this.fastenerFlags & ComponentTrait.MountedFlag) !== 0) {
    this.willUnmount();
    this.setFastenerFlags(this.fastenerFlags & ~ComponentTrait.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ComponentTrait.prototype.willUnmount = function (this: ComponentTrait<Component, Trait>): void {
  // hook
};

ComponentTrait.prototype.onUnmount = function (this: ComponentTrait<Component, Trait>): void {
  // hook
};

ComponentTrait.prototype.didUnmount = function (this: ComponentTrait<Component, Trait>): void {
  // hook
};

ComponentTrait.define = function <C extends Component, R extends Trait, U, I>(descriptor: ComponentTraitDescriptor<C, R, U, I>): ComponentTraitConstructor<C, R, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    _super = ComponentTrait;
  }

  const _constructor = function DecoratedComponentTrait(this: ComponentTrait<C, R, U>, owner: C, key: string | undefined, fastenerName: string | undefined): ComponentTrait<C, R, U> {
    let _this: ComponentTrait<C, R, U> = function ComponentTraitAccessor(trait?: R | null, targetTrait?: Trait | null): R | null | C {
      if (trait === void 0) {
        return _this.trait;
      } else {
        _this.setTrait(trait, targetTrait);
        return _this.owner;
      }
    } as ComponentTrait<C, R, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, key, fastenerName) || _this;
    return _this;
  } as unknown as ComponentTraitConstructor<C, R, U, I>;

  const _prototype = descriptor as unknown as ComponentTrait<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};

ComponentTrait.MountedFlag = 1 << 0;
