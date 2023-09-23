// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Proto} from "@swim/util";
import {Equals} from "@swim/util";
import {Objects} from "@swim/util";
import type {LikeType} from "@swim/util";
import {FromLike} from "@swim/util";
import type {Timing} from "@swim/util";
import {Affinity} from "./Affinity";
import {FastenerContext} from "./FastenerContext";
import type {FastenerDescriptor} from "./Fastener";
import type {FastenerClass} from "./Fastener";
import {Fastener} from "./Fastener";

/** @public */
export interface PropertyDescriptor<R, T> extends FastenerDescriptor<R> {
  extends?: Proto<Property<any, any, any>> | boolean | null;
  valueType?: unknown;
  value?: T | LikeType<T>;
  updateFlags?: number;
}

/** @public */
export interface PropertyClass<P extends Property<any, any, any> = Property<any, any, any>> extends FastenerClass<P> {
  tryValue<R, K extends keyof R, F extends R[K] = R[K]>(owner: R, fastenerName: K): F extends {readonly value: infer T} ? T : undefined;

  tryValueOr<R, K extends keyof R, E, F extends R[K] = R[K]>(owner: R, fastenerName: K, elseValue: E): F extends {readonly value: infer T} ? NonNullable<T> | E : E;
}

/** @public */
export interface Property<R = any, T = any, I extends any[] = [T]> extends Fastener<R, T, I> {
  /** @override */
  get descriptorType(): Proto<PropertyDescriptor<R, T>>;

  /** @override */
  get fastenerType(): Proto<Property<any, any, any>>;

  /** @override */
  get parent(): Property<any, I[0], any> | null;

  get inletValue(): I[0] | undefined;

  getInletValue(): NonNullable<I[0]>;

  getInletValueOr<E>(elseValue: E): NonNullable<I[0]> | E;

  /** @internal */
  readonly outlets: ReadonlySet<Fastener<any, any, any>> | null;

  /** @internal @override */
  attachOutlet(outlet: Fastener<any, any, any>): void;

  /** @internal @override */
  detachOutlet(outlet: Fastener<any, any, any>): void;

  /** @internal @protected */
  decohereOutlets(): void;

  getOutletValue(outlet: Fastener<any, any, any>): T;

  get(): T;

  set(newValue: T | LikeType<T> | Fastener<any, I[0], any>): R;

  setIntrinsic(newValue: T | LikeType<T> | Fastener<any, I[0], any>): R;

  get valueType(): unknown | undefined;

  initValue(): T;

  readonly value: T;

  getValue(): NonNullable<T>;

  getValueOr<E>(elseValue: E): NonNullable<T> | E;

  transformValue(value: T): T;

  setValue(newValue: T | LikeType<T>, affinity?: Affinity): void;

  /** @protected */
  willSetValue(newValue: T, oldValue: T): void;

  /** @protected */
  onSetValue(newValue: T, oldValue: T): void;

  /** @protected */
  didSetValue(newValue: T, oldValue: T): void;

  get transition(): Timing | boolean | null;

  get updateFlags(): number | undefined;

  deriveValue(...inletValues: I): T;

  /** @override */
  recohere(t: number): void;

  definedValue(value: T): boolean;

  equalValues(newValue: T, oldValue: T | undefined): boolean;

  fromLike(value: T | LikeType<T>): T;
}

/** @public */
export const Property = (<R, T, I extends any[], P extends Property<any, any, any>>() => Fastener.extend<Property<R, T, I>, PropertyClass<P>>("Property", {
  get fastenerType(): Proto<Property<any, any, any>> {
    return Property;
  },

  get inletValue(): I[0] | undefined {
    const inlet = this.inlet;
    return inlet instanceof Property ? inlet.getOutletValue(this) : void 0;
  },

  getInletValue(): NonNullable<I[0]> {
    const inletValue = this.inletValue;
    if (inletValue === void 0 || inletValue === null) {
      let message = inletValue + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "inlet value";
      throw new TypeError(message);
    }
    return inletValue;
  },

  getInletValueOr<E>(elseValue: E): NonNullable<I[0]> | E {
    const inletValue: I[0] | E | undefined = this.inletValue;
    if (inletValue === void 0 || inletValue === null) {
      return elseValue;
    }
    return inletValue;
  },

  attachOutlet(outlet: Property<any, any, any>): void {
    let outlets = this.outlets as Set<Property<any, any, any>> | null;
    if (outlets === null) {
      outlets = new Set<Property<any, any, any>>();
      (this as Mutable<typeof this>).outlets = outlets;
    }
    outlets.add(outlet);
  },

  detachOutlet(outlet: Property<any, any, any>): void {
    const outlets = this.outlets as Set<Property<any, any, any>> | null;
    if (outlets !== null) {
      outlets.delete(outlet);
    }
  },

  decohereOutlets(): void {
    const outlets = this.outlets;
    if (outlets !== null) {
      for (const outlet of outlets) {
        outlet.decohere(this);
      }
    }
  },

  getOutletValue(outlet: Property<any, any, any>): T {
    return this.value;
  },

  get(): T {
    return this.value;
  },

  set(newValue: T | LikeType<T> | Fastener<any, I[0], any>): R {
    if (newValue instanceof Fastener) {
      this.bindInlet(newValue);
    } else {
      this.setValue(newValue, Affinity.Extrinsic);
    }
    return this.owner;
  },

  setIntrinsic(newValue: T | LikeType<T> | Fastener<any, I[0], any>): R {
    if (newValue instanceof Fastener) {
      this.bindInlet(newValue);
    } else {
      this.setValue(newValue, Affinity.Intrinsic);
    }
    return this.owner;
  },

  valueType: void 0,

  initValue(): T {
    return (Object.getPrototypeOf(this) as Property<any, T, any>).value;
  },

  getValue(): NonNullable<T> {
    const value = this.value;
    if (value === void 0 || value === null) {
      let message = value + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "value";
      throw new TypeError(message);
    }
    return value;
  },

  getValueOr<E>(elseValue: E): NonNullable<T> | E {
    const value: T | E = this.value;
    if (value === void 0 || value === null) {
      return elseValue;
    }
    return value;
  },

  transformValue(value: T): T {
    return value;
  },

  setValue(newValue: T | LikeType<T>, affinity?: Affinity): void {
    if (affinity === void 0) {
      affinity = Affinity.Extrinsic;
    }
    if (!this.minAffinity(affinity)) {
      return;
    }
    newValue = this.fromLike(newValue);
    newValue = this.transformValue(newValue);
    const oldValue = this.value;
    if (this.equalValues(newValue, oldValue)) {
      this.setCoherent(true);
      return;
    }
    this.willSetValue(newValue, oldValue);
    this.incrementVersion();
    (this as Mutable<typeof this>).value = newValue;
    this.onSetValue(newValue, oldValue);
    this.didSetValue(newValue, oldValue);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  willSetValue(newValue: T, oldValue: T): void {
    // hook
  },

  onSetValue(newValue: T, oldValue: T): void {
    const updateFlags = this.updateFlags;
    if (updateFlags !== void 0 && Objects.hasAllKeys<FastenerContext>(this.owner, "requireUpdate")) {
      this.owner.requireUpdate!(updateFlags);
    }
  },

  didSetValue(newValue: T, oldValue: T): void {
    // hook
  },

  get transition(): Timing | boolean | null {
    if (this.derived && this.inlet instanceof Property) {
      return this.inlet.transition;
    }
    return null;
  },

  updateFlags: void 0,

  deriveValue(...inletValues: any[]): T {
    return inletValues[0] as T;
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof Property) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        (this as Mutable<typeof this>).inletVersion = inlet.version;
        const derivedValue = (this as unknown as Property<R, T, [unknown]>).deriveValue(inlet.getOutletValue(this));
        this.setValue(derivedValue, Affinity.Reflexive);
      } else {
        this.setCoherent(true);
      }
    } else if (Array.isArray(inlet)) {
      this.setDerived(true);
      const inletVersions = this.inletVersion as number[];
      const inletValues = new Array<unknown>(inlet.length);
      for (let i = 0; i < inlet.length; i += 1) {
        if (inlet[i] instanceof Property) {
          inletVersions[i] = (inlet[i] as Property).version;
          inletValues[i] = (inlet[i] as Property).getOutletValue(this);
        } else {
          this.setDerived(false);
          this.setCoherent(true);
          return;
        }
      }
      const derivedValue = this.deriveValue(...(inletValues as I));
      this.setValue(derivedValue, Affinity.Reflexive);
    } else {
      this.setDerived(false);
      this.setCoherent(true);
    }
  },

  definedValue(value: T): boolean {
    return value !== void 0 && value !== null;
  },

  equalValues(newValue: T, oldValue: T | undefined): boolean {
    return Equals(newValue, oldValue);
  },

  fromLike(value: T | LikeType<T>): T {
    return FromLike(this.valueType, value);
  },
},
{
  tryValue<R, K extends keyof R, F extends R[K]>(owner: R, fastenerName: K): F extends {readonly value: infer T} ? T : undefined {
    const metaclass = FastenerContext.getMetaclass(owner);
    if (metaclass === null) {
      return void 0 as any;
    }
    const property = metaclass.tryFastener(owner, fastenerName);
    if (!(property instanceof Property)) {
      const propertyClass = metaclass.getFastenerClass(fastenerName) as PropertyClass | null;
      if (propertyClass === null) {
        return void 0 as any;
      }
      return propertyClass.prototype.value;
    }
    return property.value;
  },

  tryValueOr<R, K extends keyof R, E, F extends R[K] = R[K]>(owner: R, fastenerName: K, elseValue: E): F extends {readonly value: infer T} ? NonNullable<T> | E : E {
    let value: (F extends {readonly value: infer T} ? T : undefined) | E = this.tryValue(owner, fastenerName);
    if (value === void 0 || value === null) {
      value = elseValue;
    }
    return value as F extends {readonly value: infer T} ? NonNullable<T> | E : E;
  },

  construct(property: P | null, owner: P extends Fastener<infer R, any, any> ? R : never): P {
    property = super.construct(property, owner) as P;
    (property as Mutable<typeof property>).outlets = null;
    (property as Mutable<typeof property>).value = property.initValue();
    return property;
  },

  refine(propertyClass: FastenerClass<Property<any, any, any>>): void {
    super.refine(propertyClass);
    const propertyPrototype = propertyClass.prototype;

    const valueDescriptor = Object.getOwnPropertyDescriptor(propertyPrototype, "value");
    if (valueDescriptor !== void 0 && "value" in valueDescriptor) {
      valueDescriptor.value = propertyPrototype.fromLike(valueDescriptor.value);
      Object.defineProperty(propertyPrototype, "value", valueDescriptor);
    }
  },
}))();
