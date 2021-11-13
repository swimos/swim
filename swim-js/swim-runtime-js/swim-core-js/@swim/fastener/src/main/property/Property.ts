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

import {Mutable, Class, Equals, FromAny} from "@swim/util";
import {Affinity} from "../fastener/Affinity";
import {FastenerContext} from "../fastener/FastenerContext";
import {FastenerOwner, FastenerInit, FastenerClass, Fastener} from "../fastener/Fastener";
import {StringProperty} from "./"; // forward import
import {NumberProperty} from "./"; // forward import
import {BooleanProperty} from "./"; // forward import

export type MemberPropertyState<O, K extends keyof O> =
  O[K] extends Property<any, infer T> ? T : never;

export type MemberPropertyStateInit<O, K extends keyof O> =
  O[K] extends Property<any, any, infer U> ? U : never;

export type MemberPropertyInit<O, K extends keyof O> =
  O[K] extends Property<any, infer T, infer U> ? T | U : never;

export type MemberPropertyInitMap<O> =
  {-readonly [K in keyof O as O[K] extends Property ? K : never]?: MemberPropertyInit<O, K>};

export type PropertyState<P extends Property<any, any>> =
  P extends Property<any, infer T> ? T : never;

export type PropertyStateInit<P extends Property<any, any>> =
  P extends Property<any, infer T, infer U> ? T | U : never;

export interface PropertyInit<T = unknown, U = T> extends FastenerInit {
  extends?: {prototype: Property<any, any>} | string | boolean | null;
  type?: unknown;

  state?: T | U;
  updateFlags?: number;

  willInherit?(superFastener: Property<unknown, T>): void;
  didInherit?(superFastener: Property<unknown, T>): void;
  willUninherit?(superFastener: Property<unknown, T>): void;
  didUninherit?(superFastener: Property<unknown, T>): void;

  willBindSuperFastener?(superFastener: Property<unknown, T>): void;
  didBindSuperFastener?(superFastener: Property<unknown, T>): void;
  willUnbindSuperFastener?(superFastener: Property<unknown, T>): void;
  didUnbindSuperFastener?(superFastener: Property<unknown, T>): void;

  willSetState?(newState: T, oldState: T): void;
  didSetState?(newState: T, oldState: T): void;

  initState?(): T | U;
  isDefined?(value: T): boolean;
  equalState?(newState: T, oldState: T | undefined): boolean;
  fromAny?(value: T | U): T;
}

export type PropertyDescriptor<O = unknown, T = unknown, U = T, I = {}> = ThisType<Property<O, T, U> & I> & PropertyInit<T, U> & Partial<I>;

export interface PropertyClass<P extends Property<any, any> = Property<any, any>> extends FastenerClass<P> {
}

export interface PropertyFactory<P extends Property<any, any> = Property<any, any>> extends PropertyClass<P> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): PropertyFactory<P> & I;

  specialize(type: unknown): PropertyFactory | null;

  define<O, T, U = T>(className: string, descriptor: PropertyDescriptor<O, T, U>): PropertyFactory<Property<any, T, U>>;
  define<O, T, U = T, I = {}>(className: string, descriptor: PropertyDescriptor<O, T, U, I>): PropertyFactory<Property<any, T, U> & I>;

  <O, T extends string | undefined = string | undefined, U extends string | undefined = string | undefined>(descriptor: {type: typeof String} & PropertyDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & PropertyDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends boolean | undefined = boolean | undefined, U extends boolean | string | undefined = boolean | string | undefined>(descriptor: {type: typeof Boolean} & PropertyDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T>(descriptor: ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & PropertyDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T>(descriptor: PropertyDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T, I = {}>(descriptor: PropertyDescriptor<O, T, U, I>): PropertyDecorator;
}

export interface Property<O = unknown, T = unknown, U = T> extends Fastener<O> {
  (): T;
  (state: T | U, affinity?: Affinity): O;

  /** @override */
  get familyType(): Class<Property<any, any>> | null;

  /** @internal @override */
  setInherited(inherited: boolean, superFastener: Property<unknown, T>): void;

  /** @protected @override */
  willInherit(superFastener: Property<unknown, T>): void;

  /** @protected @override */
  onInherit(superFastener: Property<unknown, T>): void;

  /** @protected @override */
  didInherit(superFastener: Property<unknown, T>): void;

  /** @protected @override */
  willUninherit(superFastener: Property<unknown, T>): void;

  /** @protected @override */
  onUninherit(superFastener: Property<unknown, T>): void;

  /** @protected @override */
  didUninherit(superFastener: Property<unknown, T>): void;

  /** @override */
  readonly superFastener: Property<unknown, T> | null;

  /** @internal @override */
  getSuperFastener(): Property<unknown, T> | null;

  /** @protected @override */
  willBindSuperFastener(superFastener: Property<unknown, T>): void;

  /** @protected @override */
  onBindSuperFastener(superFastener: Property<unknown, T>): void;

  /** @protected @override */
  didBindSuperFastener(superFastener: Property<unknown, T>): void;

  /** @protected @override */
  willUnbindSuperFastener(superFastener: Property<unknown, T>): void;

  /** @protected @override */
  onUnbindSuperFastener(superFastener: Property<unknown, T>): void;

  /** @protected @override */
  didUnbindSuperFastener(superFastener: Property<unknown, T>): void;

  /** @internal */
  readonly subFasteners: ReadonlyArray<Property<unknown, T>> | null;

  /** @internal @override */
  attachSubFastener(subFastener: Property<unknown, T>): void;

  /** @internal @override */
  detachSubFastener(subFastener: Property<unknown, T>): void;

  get superState(): T | undefined;

  getSuperState(): NonNullable<T>;

  getSuperStateOr<E>(elseState: E): NonNullable<T> | E;

  readonly state: T;

  getState(): NonNullable<T>;

  getStateOr<E>(elseState: E): NonNullable<T> | E;

  setState(newState: T | U, affinity?: Affinity): void;

  /** @protected */
  willSetState(newState: T, oldState: T): void;

  /** @protected */
  onSetState(newState: T, oldState: T): void;

  /** @protected */
  didSetState(newState: T, oldState: T): void;

  /** @internal @protected */
  decohereSubFasteners(): void;

  /** @internal @protected */
  decohereSubFastener(subFastener: Property<unknown, T>): void;

  /** @override */
  recohere(t: number): void;

  get updateFlags(): number | undefined; // optional prototype field

  /** @internal @protected */
  isDefined(value: T): boolean;

  /** @internal @protected */
  equalState(newState: T, oldState: T | undefined): boolean;

  /** @internal @protected */
  fromAny(value: T | U): T;
}

export const Property = (function (_super: typeof Fastener) {
  const Property: PropertyFactory = _super.extend("Property");

  Object.defineProperty(Property.prototype, "familyType", {
    get: function (this: Property): Class<Property<any, any>> | null {
      return Property;
    },
    configurable: true,
  });

  Property.prototype.onInherit = function <T>(this: Property<unknown, T>, superFastener: Property<unknown, T>): void {
    this.setState(superFastener.state, Affinity.Reflexive);
  };

  Property.prototype.onBindSuperFastener = function <T>(this: Property<unknown, T>, superFastener: Property<unknown, T>): void {
    (this as Mutable<typeof this>).superFastener = superFastener;
    _super.prototype.onBindSuperFastener.call(this, superFastener);
  };

  Property.prototype.onUnbindSuperFastener = function <T>(this: Property<unknown, T>, superFastener: Property<unknown, T>): void {
    _super.prototype.onUnbindSuperFastener.call(this, superFastener);
    (this as Mutable<typeof this>).superFastener = null;
  };

  Property.prototype.attachSubFastener = function <T>(this: Property<unknown, T>, subFastener: Property<unknown, T>): void {
    let subFasteners = this.subFasteners as Property<unknown, T>[] | null;
    if (subFasteners === null) {
      subFasteners = [];
      (this as Mutable<typeof this>).subFasteners = subFasteners;
    }
    subFasteners.push(subFastener);
  };

  Property.prototype.detachSubFastener = function <T>(this: Property<unknown, T>, subFastener: Property<unknown, T>): void {
    const subFasteners = this.subFasteners as Property<unknown, T>[] | null;
    if (subFasteners !== null) {
      const index = subFasteners.indexOf(subFastener);
      if (index >= 0) {
        subFasteners.splice(index, 1);
      }
    }
  };

  Object.defineProperty(Property.prototype, "superState", {
    get: function <T>(this: Property<unknown, T>): T | undefined {
      const superFastener = this.superFastener;
      return superFastener !== null ? superFastener.state : void 0;
    },
    configurable: true,
  });

  Property.prototype.getSuperState = function <T>(this: Property<unknown, T>): NonNullable<T> {
    const superState = this.superState;
    if (superState === void 0 || superState === null) {
      let message = superState + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "super state";
      throw new TypeError(message);
    }
    return superState as NonNullable<T>;
  };

  Property.prototype.getSuperStateOr = function <T, E>(this: Property<unknown, T>, elseState: E): NonNullable<T> | E {
    let superState: T | E | undefined = this.superState;
    if (superState === void 0 || superState === null) {
      superState = elseState;
    }
    return superState as NonNullable<T> | E;
  };

  Property.prototype.getState = function <T>(this: Property<unknown, T>): NonNullable<T> {
    const state = this.state;
    if (state === void 0 || state === null) {
      let message = state + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "state";
      throw new TypeError(message);
    }
    return state as NonNullable<T>;
  };

  Property.prototype.getStateOr = function <T, E>(this: Property<unknown, T>, elseState: E): NonNullable<T> | E {
    let state: T | E = this.state;
    if (state === void 0 || state === null) {
      state = elseState;
    }
    return state as NonNullable<T> | E;
  };

  Property.prototype.setState = function <T, U>(this: Property<unknown, T, U>, newState: T | U, affinity?: Affinity): void {
    if (this.minAffinity(affinity)) {
      newState = this.fromAny(newState);
      const oldState = this.state;
      if (!this.equalState(newState, oldState)) {
        this.willSetState(newState, oldState);
        (this as Mutable<typeof this>).state = newState;
        this.onSetState(newState, oldState);
        this.didSetState(newState, oldState);
        this.setCoherent(true);
        this.decohereSubFasteners();
      }
    }
  };

  Property.prototype.willSetState = function <T>(this: Property<unknown, T>, newState: T, oldState: T): void {
    // hook
  };

  Property.prototype.onSetState = function <T>(this: Property<unknown, T>, newState: T, oldState: T): void {
    const updateFlags = this.updateFlags;
    const fastenerContext = this.owner;
    if (updateFlags !== void 0 && FastenerContext.has(fastenerContext, "requireUpdate")) {
      fastenerContext.requireUpdate(updateFlags);
    }
  };

  Property.prototype.didSetState = function <T>(this: Property<unknown, T>, newState: T, oldState: T): void {
    // hook
  };

  Property.prototype.decohereSubFasteners = function (this: Property): void {
    const subFasteners = this.subFasteners;
    for (let i = 0, n = subFasteners !== null ? subFasteners.length : 0; i < n; i += 1) {
      this.decohereSubFastener(subFasteners![i]!);
    }
  };

  Property.prototype.decohereSubFastener = function (this: Property, subFastener: Property): void {
    if (!subFastener.inherited && Math.min(this.affinity, Affinity.Intrinsic) >= subFastener.affinity) {
      subFastener.setInherited(true, this);
    } else if (subFastener.inherited && subFastener.coherent) {
      subFastener.setCoherent(false);
      subFastener.decohere();
    }
  };

  Property.prototype.recohere = function (this: Property, t: number): void {
    if (this.inherited) {
      const superFastener = this.superFastener;
      if (superFastener !== null) {
        this.setState(superFastener.state, Affinity.Reflexive);
      }
    }
  };

  Property.prototype.isDefined = function <T>(this: Property<unknown, T>, value: T): boolean {
    return value !== void 0 && value !== null;
  };

  Property.prototype.equalState = function <T>(this: Property<unknown, T>, newState: T, oldState: T | undefined): boolean {
    return Equals(newState, oldState);
  };

  Property.prototype.fromAny = function <T, U>(this: Property<unknown, T, U>, value: T | U): T {
    return value as T;
  };

  Property.construct = function <P extends Property<any, any>>(propertyClass: {prototype: P}, property: P | null, owner: FastenerOwner<P>): P {
    if (property === null) {
      property = function (state?: PropertyState<P> | PropertyStateInit<P>, affinity?: Affinity): PropertyState<P> | FastenerOwner<P> {
        if (arguments.length === 0) {
          return property!.state;
        } else {
          property!.setState(state!, affinity);
          return property!.owner;
        }
      } as P;
      delete (property as Partial<Mutable<P>>).name; // don't clobber prototype name
      Object.setPrototypeOf(property, propertyClass.prototype);
    }
    property = _super.construct(propertyClass, property, owner) as P;
    Object.defineProperty(property, "superFastener", { // override getter
      value: null,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    (property as Mutable<typeof property>).subFasteners = null;
    (property as Mutable<typeof property>).state = void 0 as unknown as PropertyState<P>;
    return property;
  };

  Property.specialize = function (type: unknown): PropertyFactory | null {
    if (type === String) {
      return StringProperty;
    } else if (type === Number) {
      return NumberProperty;
    } else if (type === Boolean) {
      return BooleanProperty;
    }
    return null;
  };

  Property.define = function <O, T, U>(className: string, descriptor: PropertyDescriptor<O, T, U>): PropertyFactory<Property<any, T, U>> {
    let superClass = descriptor.extends as PropertyFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const state = descriptor.state;
    const initState = descriptor.initState;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.state;
    delete descriptor.initState;

    if (superClass === void 0 || superClass === null) {
      superClass = this.specialize(descriptor.type);
    }
    if (superClass === null) {
      superClass = this;
      if (descriptor.fromAny === void 0 && FromAny.is<T, U>(descriptor.type)) {
        descriptor.fromAny = descriptor.type.fromAny;
      }
    }

    const propertyClass = superClass.extend(className, descriptor);

    propertyClass.construct = function (propertyClass: {prototype: Property<any, any>}, property: Property<O, T, U> | null, owner: O): Property<O, T, U> {
      property = superClass!.construct(propertyClass, property, owner);
      if (affinity !== void 0) {
        property.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        property.initInherits(inherits);
      }
      if (initState !== void 0) {
        (property as Mutable<typeof property>).state = property.fromAny(initState());
      } else if (state !== void 0) {
        (property as Mutable<typeof property>).state = property.fromAny(state);
      }
      return property;
    };

    return propertyClass;
  };

  return Property;
})(Fastener);
