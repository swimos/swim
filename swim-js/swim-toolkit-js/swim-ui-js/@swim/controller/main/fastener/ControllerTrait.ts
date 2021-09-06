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
import {FromAny} from "@swim/util";
import {Model, Trait, TraitObserverType} from "@swim/model";
import {Controller} from "../Controller";

export type ControllerTraitMemberType<C, K extends keyof C> =
  C[K] extends ControllerTrait<any, infer R, any> ? R : never;

export type ControllerTraitMemberInit<C, K extends keyof C> =
  C[K] extends ControllerTrait<any, infer R, infer U> ? R | U : never;

export type ControllerTraitFlags = number;

export interface ControllerTraitInit<R extends Trait, U = never> {
  extends?: ControllerTraitClass;
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

export type ControllerTraitDescriptor<C extends Controller, R extends Trait, U = never, I = {}> = ControllerTraitInit<R, U> & ThisType<ControllerTrait<C, R, U> & I> & Partial<I>;

export interface ControllerTraitConstructor<C extends Controller, R extends Trait, U = never, I = {}> {
  new<O extends C>(owner: O, key: string | undefined, fastenerName: string | undefined): ControllerTrait<O, R, U> & I;
  prototype: Omit<ControllerTrait<any, any>, "key"> & {key?: string | boolean} & I;
}

export interface ControllerTraitClass extends Function {
  readonly prototype: Omit<ControllerTrait<any, any>, "key"> & {key?: string | boolean};
}

export interface ControllerTrait<C extends Controller, R extends Trait, U = never> {
  (): R | null;
  (trait: R | U | null, targetTrait?: Trait | null): C;

  readonly name: string;

  readonly owner: C;

  /** @hidden */
  fastenerFlags: ControllerTraitFlags;

  /** @hidden */
  setFastenerFlags(fastenerFlags: ControllerTraitFlags): void;

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

export const ControllerTrait = function <C extends Controller, R extends Trait, U>(
    this: ControllerTrait<C, R, U> | typeof ControllerTrait,
    owner: C | ControllerTraitDescriptor<C, R, U>,
    key?: string,
    fastenerName?: string,
  ): ControllerTrait<C, R, U> | PropertyDecorator {
  if (this instanceof ControllerTrait) { // constructor
    return ControllerTraitConstructor.call(this as unknown as ControllerTrait<Controller, Trait, unknown>, owner as C, key, fastenerName);
  } else { // decorator factory
    return ControllerTraitDecoratorFactory(owner as ControllerTraitDescriptor<C, R, U>);
  }
} as {
  /** @hidden */
  new<C extends Controller, R extends Trait, U = never>(owner: C, key: string | undefined, fastenerName: string | undefined): ControllerTrait<C, R, U>;

  <C extends Controller, R extends Trait = Trait, U = never, I = {}>(descriptor: {observe: boolean} & ControllerTraitDescriptor<C, R, U, I & TraitObserverType<R>>): PropertyDecorator;
  <C extends Controller, R extends Trait = Trait, U = never, I = {}>(descriptor: ControllerTraitDescriptor<C, R, U, I>): PropertyDecorator;

  /** @hidden */
  prototype: ControllerTrait<any, any>;

  define<C extends Controller, R extends Trait = Trait, U = never, I = {}>(descriptor: {observe: boolean} & ControllerTraitDescriptor<C, R, U, I & TraitObserverType<R>>): ControllerTraitConstructor<C, R, U, I>;
  define<C extends Controller, R extends Trait = Trait, U = never, I = {}>(descriptor: ControllerTraitDescriptor<C, R, U, I>): ControllerTraitConstructor<C, R, U, I>;

  /** @hidden */
  MountedFlag: ControllerTraitFlags;
};
__extends(ControllerTrait, Object);

function ControllerTraitConstructor<C extends Controller, R extends Trait, U>(this: ControllerTrait<C, R, U>, owner: C, key: string | undefined, fastenerName: string | undefined): ControllerTrait<C, R, U> {
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

function ControllerTraitDecoratorFactory<C extends Controller, R extends Trait, U>(descriptor: ControllerTraitDescriptor<C, R, U>): PropertyDecorator {
  return Controller.decorateControllerTrait.bind(Controller, ControllerTrait.define(descriptor as ControllerTraitDescriptor<Controller, Trait>));
}

ControllerTrait.prototype.setFastenerFlags = function (this: ControllerTrait<Controller, Trait>, fastenerFlags: ControllerTraitFlags): void {
  Object.defineProperty(this, "fastenerFlags", {
    value: fastenerFlags,
    enumerable: true,
    configurable: true,
  });
};

ControllerTrait.prototype.getTrait = function <R extends Trait>(this: ControllerTrait<Controller, R>): R {
  const trait = this.trait;
  if (trait === null) {
    throw new TypeError("null " + this.name + " trait");
  }
  return trait;
};

ControllerTrait.prototype.setTrait = function <R extends Trait>(this: ControllerTrait<Controller, R>, newTrait: R | null, targetTrait?: Trait | null): R | null {
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

ControllerTrait.prototype.attachTrait = function <R extends Trait>(this: ControllerTrait<Controller, R>, newTrait: R): void {
  if (this.observe === true) {
    newTrait.addTraitObserver(this as TraitObserverType<R>);
  }
};

ControllerTrait.prototype.detachTrait = function <R extends Trait>(this: ControllerTrait<Controller, R>, oldTrait: R): void {
  if (this.observe === true) {
    oldTrait.removeTraitObserver(this as TraitObserverType<R>);
  }
};

ControllerTrait.prototype.willSetTrait = function <R extends Trait>(this: ControllerTrait<Controller, R>, newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void {
  // hook
};

ControllerTrait.prototype.onSetTrait = function <R extends Trait>(this: ControllerTrait<Controller, R>, newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void {
  // hook
};

ControllerTrait.prototype.didSetTrait = function <R extends Trait>(this: ControllerTrait<Controller, R>, newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void {
  // hook
};

ControllerTrait.prototype.injectTrait = function <R extends Trait>(this: ControllerTrait<Controller, R>, model: Model, trait?: R | null, targetTrait?: Trait | null, key?: string | null): R | null {
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

ControllerTrait.prototype.createTrait = function <R extends Trait, U>(this: ControllerTrait<Controller, R, U>): R | U | null {
  return null;
};

ControllerTrait.prototype.insertTrait = function <R extends Trait>(this: ControllerTrait<Controller, R>, model: Model, trait: R, targetTrait: Trait | null, key: string | undefined): void {
  model.insertTrait(trait, targetTrait, key);
};

ControllerTrait.prototype.removeTrait = function <R extends Trait>(this: ControllerTrait<Controller, R>): R | null {
  const trait = this.trait;
  if (trait !== null) {
    trait.remove();
  }
  return trait;
};

ControllerTrait.prototype.fromAny = function <R extends Trait, U>(this: ControllerTrait<Controller, R, U>, value: R | U): R | null {
  const type = this.type;
  if (FromAny.is<R, U>(type)) {
    return type.fromAny(value);
  } else if (value instanceof Trait) {
    return value;
  }
  return null;
};

ControllerTrait.prototype.isMounted = function (this: ControllerTrait<Controller, Trait>): boolean {
  return (this.fastenerFlags & ControllerTrait.MountedFlag) !== 0;
};

ControllerTrait.prototype.mount = function (this: ControllerTrait<Controller, Trait>): void {
  if ((this.fastenerFlags & ControllerTrait.MountedFlag) === 0) {
    this.willMount();
    this.setFastenerFlags(this.fastenerFlags | ControllerTrait.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ControllerTrait.prototype.willMount = function (this: ControllerTrait<Controller, Trait>): void {
  // hook
};

ControllerTrait.prototype.onMount = function (this: ControllerTrait<Controller, Trait>): void {
  // hook
};

ControllerTrait.prototype.didMount = function (this: ControllerTrait<Controller, Trait>): void {
  // hook
};

ControllerTrait.prototype.unmount = function (this: ControllerTrait<Controller, Trait>): void {
  if ((this.fastenerFlags & ControllerTrait.MountedFlag) !== 0) {
    this.willUnmount();
    this.setFastenerFlags(this.fastenerFlags & ~ControllerTrait.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ControllerTrait.prototype.willUnmount = function (this: ControllerTrait<Controller, Trait>): void {
  // hook
};

ControllerTrait.prototype.onUnmount = function (this: ControllerTrait<Controller, Trait>): void {
  // hook
};

ControllerTrait.prototype.didUnmount = function (this: ControllerTrait<Controller, Trait>): void {
  // hook
};

ControllerTrait.define = function <C extends Controller, R extends Trait, U, I>(descriptor: ControllerTraitDescriptor<C, R, U, I>): ControllerTraitConstructor<C, R, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    _super = ControllerTrait;
  }

  const _constructor = function DecoratedControllerTrait(this: ControllerTrait<C, R, U>, owner: C, key: string | undefined, fastenerName: string | undefined): ControllerTrait<C, R, U> {
    let _this: ControllerTrait<C, R, U> = function ControllerTraitAccessor(trait?: R | null, targetTrait?: Trait | null): R | null | C {
      if (trait === void 0) {
        return _this.trait;
      } else {
        _this.setTrait(trait, targetTrait);
        return _this.owner;
      }
    } as ControllerTrait<C, R, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, key, fastenerName) || _this;
    return _this;
  } as unknown as ControllerTraitConstructor<C, R, U, I>;

  const _prototype = descriptor as unknown as ControllerTrait<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};

ControllerTrait.MountedFlag = 1 << 0;
