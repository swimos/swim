// Copyright 2015-2021 Swim.inc
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

import {Mutable, Proto, Equals, FromAny} from "@swim/util";
import {Affinity} from "../fastener/Affinity";
import {FastenerContext} from "../fastener/FastenerContext";
import {FastenerOwner, FastenerInit, FastenerClass, Fastener} from "../fastener/Fastener";
import {StringProperty} from "./"; // forward import
import {NumberProperty} from "./"; // forward import
import {BooleanProperty} from "./"; // forward import

/** @internal */
export type MemberPropertyValue<O, K extends keyof O> =
  O[K] extends Property<any, infer T> ? T : never;

/** @internal */
export type MemberPropertyValueInit<O, K extends keyof O> =
  O[K] extends Property<any, any, infer U> ? U : never;

/** @internal */
export type MemberPropertyInit<O, K extends keyof O> =
  O[K] extends Property<any, infer T, infer U> ? T | U : never;

/** @internal */
export type MemberPropertyInitMap<O> =
  {-readonly [K in keyof O as O[K] extends Property ? K : never]?: MemberPropertyInit<O, K>};

/** @internal */
export type PropertyValue<P extends Property<any, any>> =
  P extends Property<any, infer T> ? T : never;

/** @internal */
export type PropertyValueInit<P extends Property<any, any>> =
  P extends Property<any, infer T, infer U> ? T | U : never;

/** @public */
export interface PropertyInit<T = unknown, U = T> extends FastenerInit {
  extends?: {prototype: Property<any, any>} | string | boolean | null;
  type?: unknown;

  value?: T | U;
  updateFlags?: number;

  willInherit?(superFastener: Property<unknown, T>): void;
  didInherit?(superFastener: Property<unknown, T>): void;
  willUninherit?(superFastener: Property<unknown, T>): void;
  didUninherit?(superFastener: Property<unknown, T>): void;

  willBindSuperFastener?(superFastener: Property<unknown, T>): void;
  didBindSuperFastener?(superFastener: Property<unknown, T>): void;
  willUnbindSuperFastener?(superFastener: Property<unknown, T>): void;
  didUnbindSuperFastener?(superFastener: Property<unknown, T>): void;

  transformSuperValue?(superValue: T): T;
  transformValue?(value: T): T;

  willSetValue?(newValue: T, oldValue: T): void;
  didSetValue?(newValue: T, oldValue: T): void;

  initValue?(): T | U;
  definedValue?(value: T): boolean;
  equalValues?(newValue: T, oldValue: T | undefined): boolean;
  fromAny?(value: T | U): T;
}

/** @public */
export type PropertyDescriptor<O = unknown, T = unknown, U = T, I = {}> = ThisType<Property<O, T, U> & I> & PropertyInit<T, U> & Partial<I>;

/** @public */
export interface PropertyClass<P extends Property<any, any> = Property<any, any>> extends FastenerClass<P> {
}

/** @public */
export interface PropertyFactory<P extends Property<any, any> = Property<any, any>> extends PropertyClass<P> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): PropertyFactory<P> & I;

  specialize(type: unknown): PropertyFactory | null;

  define<O, T, U = T>(className: string, descriptor: PropertyDescriptor<O, T, U>): PropertyFactory<Property<any, T, U>>;
  define<O, T, U = T, I = {}>(className: string, descriptor: {implements: unknown} & PropertyDescriptor<O, T, U, I>): PropertyFactory<Property<any, T, U> & I>;

  <O, T extends string | undefined = string | undefined, U extends string | undefined = string | undefined>(descriptor: {type: typeof String} & PropertyDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & PropertyDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends boolean | undefined = boolean | undefined, U extends boolean | string | undefined = boolean | string | undefined>(descriptor: {type: typeof Boolean} & PropertyDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T>(descriptor: ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & PropertyDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T>(descriptor: PropertyDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T, I = {}>(descriptor: {implements: unknown} & PropertyDescriptor<O, T, U, I>): PropertyDecorator;
}

/** @public */
export interface Property<O = unknown, T = unknown, U = T> extends Fastener<O> {
  (): T;
  (value: T | U, affinity?: Affinity): O;

  /** @override */
  get fastenerType(): Proto<Property<any, any>>;

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

  get superValue(): T | undefined;

  getSuperValue(): NonNullable<T>;

  getSuperValueOr<E>(elseValue: E): NonNullable<T> | E;

  transformSuperValue(superValue: T): T;

  readonly value: T;

  getValue(): NonNullable<T>;

  getValueOr<E>(elseValue: E): NonNullable<T> | E;

  transformValue(value: T): T;

  setValue(newValue: T | U, affinity?: Affinity): void;

  /** @protected */
  willSetValue(newValue: T, oldValue: T): void;

  /** @protected */
  onSetValue(newValue: T, oldValue: T): void;

  /** @protected */
  didSetValue(newValue: T, oldValue: T): void;

  /** @internal @protected */
  decohereSubFasteners(): void;

  /** @internal @protected */
  decohereSubFastener(subFastener: Property<unknown, T>): void;

  /** @override */
  recohere(t: number): void;

  get updateFlags(): number | undefined; // optional prototype field

  /** @internal */
  definedValue(value: T): boolean;

  /** @internal */
  equalValues(newValue: T, oldValue: T | undefined): boolean;

  /** @internal */
  fromAny(value: T | U): T;
}

/** @public */
export const Property = (function (_super: typeof Fastener) {
  const Property: PropertyFactory = _super.extend("Property");

  Object.defineProperty(Property.prototype, "fastenerType", {
    get: function (this: Property): Proto<Property<any, any>> {
      return Property;
    },
    configurable: true,
  });

  Property.prototype.onInherit = function <T>(this: Property<unknown, T>, superFastener: Property<unknown, T>): void {
    const superValue = this.transformSuperValue(superFastener.value);
    this.setValue(superValue, Affinity.Reflexive);
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

  Object.defineProperty(Property.prototype, "superValue", {
    get: function <T>(this: Property<unknown, T>): T | undefined {
      const superFastener = this.superFastener;
      return superFastener !== null ? superFastener.value : void 0;
    },
    configurable: true,
  });

  Property.prototype.getSuperValue = function <T>(this: Property<unknown, T>): NonNullable<T> {
    const superValue = this.superValue;
    if (superValue === void 0 || superValue === null) {
      let message = superValue + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "super value";
      throw new TypeError(message);
    }
    return superValue as NonNullable<T>;
  };

  Property.prototype.getSuperValueOr = function <T, E>(this: Property<unknown, T>, elseValue: E): NonNullable<T> | E {
    let superValue: T | E | undefined = this.superValue;
    if (superValue === void 0 || superValue === null) {
      superValue = elseValue;
    }
    return superValue as NonNullable<T> | E;
  };

  Property.prototype.transformSuperValue = function <T>(this: Property<unknown, T>, superValue: T): T {
    return superValue;
  };

  Property.prototype.getValue = function <T>(this: Property<unknown, T>): NonNullable<T> {
    const value = this.value;
    if (value === void 0 || value === null) {
      let message = value + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "value";
      throw new TypeError(message);
    }
    return value as NonNullable<T>;
  };

  Property.prototype.getValueOr = function <T, E>(this: Property<unknown, T>, elseValue: E): NonNullable<T> | E {
    let value: T | E = this.value;
    if (value === void 0 || value === null) {
      value = elseValue;
    }
    return value as NonNullable<T> | E;
  };

  Property.prototype.transformValue = function <T>(this: Property<unknown, T>, value: T): T {
    return value;
  };

  Property.prototype.setValue = function <T, U>(this: Property<unknown, T, U>, newValue: T | U, affinity?: Affinity): void {
    if (affinity === void 0) {
      affinity = Affinity.Extrinsic;
    }
    if (this.minAffinity(affinity)) {
      newValue = this.fromAny(newValue);
      newValue = this.transformValue(newValue);
      const oldValue = this.value;
      if (!this.equalValues(newValue, oldValue)) {
        this.willSetValue(newValue, oldValue);
        (this as Mutable<typeof this>).value = newValue;
        this.onSetValue(newValue, oldValue);
        this.didSetValue(newValue, oldValue);
        this.setCoherent(true);
        this.decohereSubFasteners();
      }
    }
  };

  Property.prototype.willSetValue = function <T>(this: Property<unknown, T>, newValue: T, oldValue: T): void {
    // hook
  };

  Property.prototype.onSetValue = function <T>(this: Property<unknown, T>, newValue: T, oldValue: T): void {
    const updateFlags = this.updateFlags;
    const fastenerContext = this.owner;
    if (updateFlags !== void 0 && FastenerContext.has(fastenerContext, "requireUpdate")) {
      fastenerContext.requireUpdate(updateFlags);
    }
  };

  Property.prototype.didSetValue = function <T>(this: Property<unknown, T>, newValue: T, oldValue: T): void {
    // hook
  };

  Property.prototype.decohereSubFasteners = function (this: Property): void {
    const subFasteners = this.subFasteners;
    for (let i = 0, n = subFasteners !== null ? subFasteners.length : 0; i < n; i += 1) {
      this.decohereSubFastener(subFasteners![i]!);
    }
  };

  Property.prototype.decohereSubFastener = function (this: Property, subFastener: Property): void {
    if ((subFastener.flags & Fastener.InheritedFlag) === 0 && Math.min(this.flags & Affinity.Mask, Affinity.Intrinsic) >= (subFastener.flags & Affinity.Mask)) {
      subFastener.setInherited(true, this);
    } else if ((subFastener.flags & Fastener.InheritedFlag) !== 0 && (subFastener.flags & Fastener.DecoherentFlag) === 0) {
      subFastener.setCoherent(false);
      subFastener.decohere();
    }
  };

  Property.prototype.recohere = function (this: Property, t: number): void {
    if ((this.flags & Fastener.InheritedFlag) !== 0) {
      const superFastener = this.superFastener;
      if (superFastener !== null) {
        const superValue = this.transformSuperValue(superFastener.value);
        this.setValue(superValue, Affinity.Reflexive);
      }
    }
  };

  Property.prototype.definedValue = function <T>(this: Property<unknown, T>, value: T): boolean {
    return value !== void 0 && value !== null;
  };

  Property.prototype.equalValues = function <T>(this: Property<unknown, T>, newValue: T, oldValue: T | undefined): boolean {
    return Equals(newValue, oldValue);
  };

  Property.prototype.fromAny = function <T, U>(this: Property<unknown, T, U>, value: T | U): T {
    return value as T;
  };

  Property.construct = function <P extends Property<any, any>>(propertyClass: {prototype: P}, property: P | null, owner: FastenerOwner<P>): P {
    if (property === null) {
      property = function (value?: PropertyValue<P> | PropertyValueInit<P>, affinity?: Affinity): PropertyValue<P> | FastenerOwner<P> {
        if (arguments.length === 0) {
          return property!.value;
        } else {
          property!.setValue(value!, affinity);
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
    (property as Mutable<typeof property>).value = void 0 as unknown as PropertyValue<P>;
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
    const value = descriptor.value;
    const initValue = descriptor.initValue;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.value;
    delete descriptor.initValue;

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
      if (initValue !== void 0) {
        (property as Mutable<typeof property>).value = property.fromAny(initValue());
      } else if (value !== void 0) {
        (property as Mutable<typeof property>).value = property.fromAny(value);
      }
      return property;
    };

    return propertyClass;
  };

  return Property;
})(Fastener);
