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
import type {Model} from "../Model";
import {Trait} from "../Trait";
import type {TraitObserverType} from "../TraitObserver";

export type TraitFastenerMemberType<R, K extends keyof R> =
  R[K] extends TraitFastener<any, infer S, any> ? S : never;

export type TraitFastenerMemberInit<R, K extends keyof R> =
  R[K] extends TraitFastener<any, infer S, infer U> ? S | U : never;

export type TraitFastenerFlags = number;

export interface TraitFastenerInit<S extends Trait, U = never> {
  extends?: TraitFastenerClass;
  key?: string | boolean;
  type?: unknown;
  sibling?: boolean;
  observe?: boolean;

  willSetTrait?(newTrait: S | null, oldTrait: S | null, targetTrait: Trait | null): void;
  onSetTrait?(newTrait: S | null, oldTrait: S | null, targetTrait: Trait | null): void;
  didSetTrait?(newTrait: S | null, oldTrait: S | null, targetTrait: Trait | null): void;

  parentModel?: Model | null;
  createTrait?(): S | U | null;
  insertTrait?(parentModel: Model, trait: S, targetTrait: Trait | null, key: string | undefined): void;
  fromAny?(value: S | U): S | null;
}

export type TraitFastenerDescriptor<R extends Trait, S extends Trait, U = never, I = {}> = TraitFastenerInit<S, U> & ThisType<TraitFastener<R, S, U> & I> & Partial<I>;

export interface TraitFastenerConstructor<R extends Trait, S extends Trait, U = never, I = {}> {
  new<O extends R>(owner: O, key: string | undefined, fastenerName: string | undefined): TraitFastener<O, S, U> & I;
  prototype: Omit<TraitFastener<any, any>, "key"> & {key?: string | boolean} & I;
}

export interface TraitFastenerClass extends Function {
  readonly prototype: Omit<TraitFastener<any, any>, "key"> & {key?: string | boolean};
}

export interface TraitFastener<R extends Trait, S extends Trait, U = never> {
  (): S | null;
  (trait: S | U | null, targetTrait?: Trait | null): R;

  readonly name: string;

  readonly owner: R;

  /** @hidden */
  fastenerFlags: TraitFastenerFlags;

  /** @hidden */
  setFastenerFlags(fastenerFlags: TraitFastenerFlags): void;

  readonly key: string | undefined;

  readonly trait: S | null;

  getTrait(): S;

  setTrait(newTrait: S | U | null, targetTrait?: Trait | null): S | null;

  /** @hidden */
  doSetTrait(newTrait: S | null, targetTrait: Trait | null): void;

  /** @hidden */
  attachTrait(newTrait: S): void;

  /** @hidden */
  detachTrait(oldTrait: S): void;

  /** @hidden */
  willSetTrait(newTrait: S | null, oldTrait: S | null, targetTrait: Trait | null): void;

  /** @hidden */
  onSetTrait(newTrait: S | null, oldTrait: S | null, targetTrait: Trait | null): void;

  /** @hidden */
  didSetTrait(newTrait: S | null, oldTrait: S | null, targetTrait: Trait | null): void;

  /** @hidden */
  readonly parentModel: Model | null;

  injectTrait(parentModel?: Model | null, trait?: S | U | null, targetTrait?: Trait | null, key?: string | null): S | null;

  createTrait(): S | U | null;

  /** @hidden */
  insertTrait(parentModel: Model, trait: S, targetTrait: Trait | null, key: string | undefined): void;

  removeTrait(): S | null;

  /** @hidden */
  observe?: boolean;

  /** @hidden */
  sibling?: boolean;

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

export const TraitFastener = function <R extends Trait, S extends Trait, U>(
    this: TraitFastener<R, S, U> | typeof TraitFastener,
    owner: R | TraitFastenerDescriptor<R, S, U>,
    key?: string,
    fastenerName?: string,
  ): TraitFastener<R, S, U> | PropertyDecorator {
  if (this instanceof TraitFastener) { // constructor
    return TraitFastenerConstructor.call(this as unknown as TraitFastener<Trait, Trait, unknown>, owner as R, key, fastenerName);
  } else { // decorator factory
    return TraitFastenerDecoratorFactory(owner as TraitFastenerDescriptor<R, S, U>);
  }
} as {
  /** @hidden */
  new<R extends Trait, S extends Trait, U = never>(owner: R, key: string | undefined, fastenerName: string | undefined): TraitFastener<R, S, U>;

  <R extends Trait, S extends Trait = Trait, U = never, I = {}>(descriptor: {observe: boolean} & TraitFastenerDescriptor<R, S, U, I & TraitObserverType<S>>): PropertyDecorator;
  <R extends Trait, S extends Trait = Trait, U = never, I = {}>(descriptor: TraitFastenerDescriptor<R, S, U, I>): PropertyDecorator;

  /** @hidden */
  prototype: TraitFastener<any, any>;

  define<R extends Trait, S extends Trait = Trait, U = never, I = {}>(descriptor: {observe: boolean} & TraitFastenerDescriptor<R, S, U, I & TraitObserverType<S>>): TraitFastenerConstructor<R, S, U, I>;
  define<R extends Trait, S extends Trait = Trait, U = never, I = {}>(descriptor: TraitFastenerDescriptor<R, S, U, I>): TraitFastenerConstructor<R, S, U, I>;

  /** @hidden */
  MountedFlag: TraitFastenerFlags;
};
__extends(TraitFastener, Object);

function TraitFastenerConstructor<R extends Trait, S extends Trait, U>(this: TraitFastener<R, S, U>, owner: R, key: string | undefined, fastenerName: string | undefined): TraitFastener<R, S, U> {
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

function TraitFastenerDecoratorFactory<R extends Trait, S extends Trait, U>(descriptor: TraitFastenerDescriptor<R, S, U>): PropertyDecorator {
  return Trait.decorateTraitFastener.bind(Trait, TraitFastener.define(descriptor as TraitFastenerDescriptor<Trait, Trait>));
}

TraitFastener.prototype.setFastenerFlags = function (this: TraitFastener<Trait, Trait>, fastenerFlags: TraitFastenerFlags): void {
  Object.defineProperty(this, "fastenerFlags", {
    value: fastenerFlags,
    enumerable: true,
    configurable: true,
  });
};

TraitFastener.prototype.getTrait = function <S extends Trait>(this: TraitFastener<Trait, S>): S {
  const trait = this.trait;
  if (trait === null) {
    throw new TypeError("null " + this.name + " trait");
  }
  return trait;
};

TraitFastener.prototype.setTrait = function <S extends Trait>(this: TraitFastener<Trait, S>, newTrait: S | null, targetTrait?: Trait | null): S | null {
  const oldTrait = this.trait;
  if (newTrait !== null) {
    newTrait = this.fromAny(newTrait);
  }
  if (targetTrait === void 0) {
    targetTrait = null;
  }
  let parentModel: Model | null | undefined;
  if (this.sibling === true && (parentModel = this.owner.model, parentModel !== null)) {
    if (newTrait !== null && (newTrait.model !== parentModel || newTrait.key !== this.key)) {
      this.insertTrait(parentModel, newTrait, targetTrait, this.key);
    } else if (newTrait === null && oldTrait !== null) {
      oldTrait.remove();
    }
  }
  this.doSetTrait(newTrait, targetTrait);
  return oldTrait;
};

TraitFastener.prototype.doSetTrait = function <S extends Trait>(this: TraitFastener<Trait, S>, newTrait: S | null, targetTrait: Trait | null): void {
  const oldTrait = this.trait;
  if (oldTrait !== newTrait) {
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
};

TraitFastener.prototype.attachTrait = function <S extends Trait>(this: TraitFastener<Trait, S>, newTrait: S): void {
  if (this.observe === true) {
    newTrait.addTraitObserver(this as TraitObserverType<S>);
  }
};

TraitFastener.prototype.detachTrait = function <S extends Trait>(this: TraitFastener<Trait, S>, oldTrait: S): void {
  if (this.observe === true) {
    oldTrait.removeTraitObserver(this as TraitObserverType<S>);
  }
};

TraitFastener.prototype.willSetTrait = function <S extends Trait>(this: TraitFastener<Trait, S>, newTrait: S | null, oldTrait: S | null, targetTrait: Trait | null): void {
  // hook
};

TraitFastener.prototype.onSetTrait = function <S extends Trait>(this: TraitFastener<Trait, S>, newTrait: S | null, oldTrait: S | null, targetTrait: Trait | null): void {
  // hook
};

TraitFastener.prototype.didSetTrait = function <S extends Trait>(this: TraitFastener<Trait, S>, newTrait: S | null, oldTrait: S | null, targetTrait: Trait | null): void {
  // hook
};

Object.defineProperty(TraitFastener.prototype, "parentModel", {
  get(this: TraitFastener<Trait, Trait>): Model | null {
    return this.owner.model;
  },
  enumerable: true,
  configurable: true,
});

TraitFastener.prototype.injectTrait = function <S extends Trait>(this: TraitFastener<Trait, S>, parentModel?: Model | null, trait?: S | null, targetTrait?: Trait | null, key?: string | null): S | null {
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
      this.doSetTrait(trait, targetTrait);
    }
  }
  if (trait !== null) {
    if (parentModel === void 0 || parentModel === null) {
      parentModel = this.parentModel;
    }
    if (key === void 0) {
      key = this.key;
    } else if (key === null) {
      key = void 0;
    }
    if (parentModel !== null && (trait.model !== parentModel || trait.key !== key)) {
      this.insertTrait(parentModel, trait, targetTrait, key);
    }
    if (this.trait === null) {
      this.doSetTrait(trait, targetTrait);
    }
  }
  return trait;
};

TraitFastener.prototype.createTrait = function <S extends Trait, U>(this: TraitFastener<Trait, S, U>): S | U | null {
  return null;
};

TraitFastener.prototype.insertTrait = function <S extends Trait>(this: TraitFastener<Trait, S>, parentModel: Model, trait: S, targetTrait: Trait | null, key: string | undefined): void {
  parentModel.insertTrait(trait, targetTrait, key);
};

TraitFastener.prototype.removeTrait = function <S extends Trait>(this: TraitFastener<Trait, S>): S | null {
  const trait = this.trait;
  if (trait !== null) {
    trait.remove();
  }
  return trait;
};

TraitFastener.prototype.fromAny = function <S extends Trait, U>(this: TraitFastener<Trait, S, U>, value: S | U): S | null {
  const type = this.type;
  if (FromAny.is<S, U>(type)) {
    return type.fromAny(value);
  } else if (value instanceof Trait) {
    return value;
  }
  return null;
};

TraitFastener.prototype.isMounted = function (this: TraitFastener<Trait, Trait>): boolean {
  return (this.fastenerFlags & TraitFastener.MountedFlag) !== 0;
};

TraitFastener.prototype.mount = function (this: TraitFastener<Trait, Trait>): void {
  if ((this.fastenerFlags & TraitFastener.MountedFlag) === 0) {
    this.willMount();
    this.setFastenerFlags(this.fastenerFlags | TraitFastener.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

TraitFastener.prototype.willMount = function (this: TraitFastener<Trait, Trait>): void {
  // hook
};

TraitFastener.prototype.onMount = function (this: TraitFastener<Trait, Trait>): void {
  // hook
};

TraitFastener.prototype.didMount = function (this: TraitFastener<Trait, Trait>): void {
  // hook
};

TraitFastener.prototype.unmount = function (this: TraitFastener<Trait, Trait>): void {
  if ((this.fastenerFlags & TraitFastener.MountedFlag) !== 0) {
    this.willUnmount();
    this.setFastenerFlags(this.fastenerFlags & ~TraitFastener.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

TraitFastener.prototype.willUnmount = function (this: TraitFastener<Trait, Trait>): void {
  // hook
};

TraitFastener.prototype.onUnmount = function (this: TraitFastener<Trait, Trait>): void {
  // hook
};

TraitFastener.prototype.didUnmount = function (this: TraitFastener<Trait, Trait>): void {
  // hook
};

TraitFastener.define = function <R extends Trait, S extends Trait, U, I>(descriptor: TraitFastenerDescriptor<R, S, U, I>): TraitFastenerConstructor<R, S, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    _super = TraitFastener;
  }

  const _constructor = function DecoratedTraitFastener(this: TraitFastener<R, S>, owner: R, key: string | undefined, fastenerName: string | undefined): TraitFastener<R, S, U> {
    let _this: TraitFastener<R, S, U> = function TraitFastenerAccessor(trait?: S | U | null, targetTrait?: Trait | null): S | null | R {
      if (trait === void 0) {
        return _this.trait;
      } else {
        _this.setTrait(trait, targetTrait);
        return _this.owner;
      }
    } as TraitFastener<R, S, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, key, fastenerName) || _this;
    return _this;
  } as unknown as TraitFastenerConstructor<R, S, U, I>;

  const _prototype = descriptor as unknown as TraitFastener<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (_prototype.sibling === void 0) {
    _prototype.sibling = true;
  }

  return _constructor;
};

TraitFastener.MountedFlag = 1 << 0;
