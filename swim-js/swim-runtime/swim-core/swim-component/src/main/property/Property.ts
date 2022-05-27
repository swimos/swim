// Copyright 2015-2022 Swim.inc
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
import {FastenerOwner, FastenerDescriptor, FastenerClass, Fastener} from "../fastener/Fastener";

/** @public */
export type PropertyValue<P extends Property<any, any, any>> =
  P extends {value: infer T} ? T : never;

/** @public */
export type PropertyValueInit<P extends Property<any, any, any>> =
  P extends {valueInit?: infer U} ? U : never;

/** @public */
export type AnyPropertyValue<P extends Property<any, any, any>> =
  PropertyValue<P> | PropertyValueInit<P>;

/** @public */
export interface PropertyDescriptor<T = unknown, U = T> extends FastenerDescriptor {
  extends?: Proto<Property<any, any, any>> | string | boolean | null;
  valueType?: unknown;
  value?: T | U;
  updateFlags?: number;
}

/** @public */
export type PropertyTemplate<P extends Property<any, any, any>> =
  ThisType<P> &
  PropertyDescriptor<PropertyValue<P>, PropertyValueInit<P>> &
  Partial<Omit<P, keyof PropertyDescriptor>>;

/** @public */
export interface PropertyClass<P extends Property<any, any, any> = Property<any, any, any>> extends FastenerClass<P> {
  /** @override */
  specialize(template: PropertyDescriptor<any, any>): PropertyClass<P>;

  /** @override */
  refine(propertyClass: PropertyClass<any>): void;

  /** @override */
  extend<P2 extends P>(className: string, template: PropertyTemplate<P2>): PropertyClass<P2>;
  extend<P2 extends P>(className: string, template: PropertyTemplate<P2>): PropertyClass<P2>;

  /** @override */
  define<P2 extends P>(className: string, template: PropertyTemplate<P2>): PropertyClass<P2>;
  define<P2 extends P>(className: string, template: PropertyTemplate<P2>): PropertyClass<P2>;

  /** @override */
  <P2 extends P>(template: PropertyTemplate<P2>): PropertyDecorator;
}

/** @public */
export interface Property<O = unknown, T = unknown, U = T> extends Fastener<O> {
  (): T;
  (value: T | U, affinity?: Affinity): O;

  /** @override */
  get fastenerType(): Proto<Property<any, any, any>>;

  /** @internal @override */
  getSuper(): Property<unknown, T> | null;

  /** @internal @override */
  setDerived(derived: boolean, inlet: Property<unknown, T>): void;

  /** @protected @override */
  willDerive(inlet: Property<unknown, T>): void;

  /** @protected @override */
  onDerive(inlet: Property<unknown, T>): void;

  /** @protected @override */
  didDerive(inlet: Property<unknown, T>): void;

  /** @protected @override */
  willUnderive(inlet: Property<unknown, T>): void;

  /** @protected @override */
  onUnderive(inlet: Property<unknown, T>): void;

  /** @protected @override */
  didUnderive(inlet: Property<unknown, T>): void;

  /** @override */
  readonly inlet: Property<unknown, T> | null;

  /** @protected @override */
  willBindInlet(inlet: Property<unknown, T>): void;

  /** @protected @override */
  onBindInlet(inlet: Property<unknown, T>): void;

  /** @protected @override */
  didBindInlet(inlet: Property<unknown, T>): void;

  /** @protected @override */
  willUnbindInlet(inlet: Property<unknown, T>): void;

  /** @protected @override */
  onUnbindInlet(inlet: Property<unknown, T>): void;

  /** @protected @override */
  didUnbindInlet(inlet: Property<unknown, T>): void;

  /** @internal */
  readonly outlets: ReadonlyArray<Property<unknown, T>> | null;

  /** @internal @override */
  attachOutlet(outlet: Property<unknown, T>): void;

  /** @internal @override */
  detachOutlet(outlet: Property<unknown, T>): void;

  getOutletValue(outlet: Property<unknown, T>): T;

  get inletValue(): T | undefined;

  getInletValue(): NonNullable<T>;

  getInletValueOr<E>(elseValue: E): NonNullable<T> | E;

  transformInletValue(inletValue: T): T;

  /** @internal */
  readonly valueType?: unknown; // optional prototype property

  /** @internal */
  readonly valueInit?: U; // for type destructuring

  initValue(): T;

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

  /** @internal */
  readonly updateFlags?: number; // optional prototype property

  /** @internal @protected */
  decohereOutlets(): void;

  /** @internal @protected */
  decohereOutlet(outlet: Property<unknown, T>): void;

  /** @override */
  recohere(t: number): void;

  /** @internal */
  definedValue(value: T): boolean;

  /** @internal */
  equalValues(newValue: T, oldValue: T | undefined): boolean;

  /** @internal */
  fromAny(value: T | U): T;
}

/** @public */
export const Property = (function (_super: typeof Fastener) {
  const Property = _super.extend("Property", {}) as PropertyClass;

  Object.defineProperty(Property.prototype, "fastenerType", {
    value: Property,
    configurable: true,
  });

  Property.prototype.onDerive = function <T>(this: Property<unknown, T>, inlet: Property<unknown, T>): void {
    const inletValue = this.transformInletValue(inlet.getOutletValue(this));
    this.setValue(inletValue, Affinity.Reflexive);
  };

  Property.prototype.onBindInlet = function <T>(this: Property<unknown, T>, inlet: Property<unknown, T>): void {
    (this as Mutable<typeof this>).inlet = inlet;
    _super.prototype.onBindInlet.call(this, inlet);
  };

  Property.prototype.onUnbindInlet = function <T>(this: Property<unknown, T>, inlet: Property<unknown, T>): void {
    _super.prototype.onUnbindInlet.call(this, inlet);
    (this as Mutable<typeof this>).inlet = null;
  };

  Property.prototype.attachOutlet = function <T>(this: Property<unknown, T>, outlet: Property<unknown, T>): void {
    let outlets = this.outlets as Property<unknown, T>[] | null;
    if (outlets === null) {
      outlets = [];
      (this as Mutable<typeof this>).outlets = outlets;
    }
    outlets.push(outlet);
  };

  Property.prototype.detachOutlet = function <T>(this: Property<unknown, T>, outlet: Property<unknown, T>): void {
    const outlets = this.outlets as Property<unknown, T>[] | null;
    if (outlets !== null) {
      const index = outlets.indexOf(outlet);
      if (index >= 0) {
        outlets.splice(index, 1);
      }
    }
  };

  Property.prototype.getOutletValue = function <T>(this: Property<unknown, T>, outlet: Property<unknown, T>): T {
    return this.value;
  };

  Object.defineProperty(Property.prototype, "inletValue", {
    get: function <T>(this: Property<unknown, T>): T | undefined {
      const inlet = this.inlet;
      return inlet !== null ? inlet.getOutletValue(this) : void 0;
    },
    configurable: true,
  });

  Property.prototype.getInletValue = function <T>(this: Property<unknown, T>): NonNullable<T> {
    const inletValue = this.inletValue;
    if (inletValue === void 0 || inletValue === null) {
      let message = inletValue + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "inlet value";
      throw new TypeError(message);
    }
    return inletValue as NonNullable<T>;
  };

  Property.prototype.getInletValueOr = function <T, E>(this: Property<unknown, T>, elseValue: E): NonNullable<T> | E {
    let inletValue: T | E | undefined = this.inletValue;
    if (inletValue === void 0 || inletValue === null) {
      inletValue = elseValue;
    }
    return inletValue as NonNullable<T> | E;
  };

  Property.prototype.transformInletValue = function <T>(this: Property<unknown, T>, inletValue: T): T {
    return inletValue;
  };

  Property.prototype.initValue = function <T>(this: Property<unknown, T>): T {
    return (Object.getPrototypeOf(this) as Property<unknown, T>).value;
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
        this.decohereOutlets();
      } else {
        this.setCoherent(true);
      }
    }
  };

  Property.prototype.willSetValue = function <T>(this: Property<unknown, T>, newValue: T, oldValue: T): void {
    // hook
  };

  Property.prototype.onSetValue = function <T>(this: Property<unknown, T>, newValue: T, oldValue: T): void {
    const updateFlags = this.updateFlags;
    if (updateFlags !== void 0 && FastenerContext.has(this.owner, "requireUpdate")) {
      this.owner.requireUpdate(updateFlags);
    }
  };

  Property.prototype.didSetValue = function <T>(this: Property<unknown, T>, newValue: T, oldValue: T): void {
    // hook
  };

  Property.prototype.decohereOutlets = function (this: Property): void {
    const outlets = this.outlets;
    for (let i = 0, n = outlets !== null ? outlets.length : 0; i < n; i += 1) {
      this.decohereOutlet(outlets![i]!);
    }
  };

  Property.prototype.decohereOutlet = function (this: Property, outlet: Property): void {
    if ((outlet.flags & Fastener.DerivedFlag) === 0 && Math.min(this.flags & Affinity.Mask, Affinity.Intrinsic) >= (outlet.flags & Affinity.Mask)) {
      outlet.setDerived(true, this);
    } else if ((outlet.flags & Fastener.DerivedFlag) !== 0 && (outlet.flags & Fastener.DecoherentFlag) === 0) {
      outlet.setCoherent(false);
      outlet.decohere();
    }
  };

  Property.prototype.recohere = function (this: Property, t: number): void {
    if ((this.flags & Fastener.DerivedFlag) !== 0) {
      const inlet = this.inlet;
      if (inlet !== null) {
        const inletValue = this.transformInletValue(inlet.getOutletValue(this));
        this.setValue(inletValue, Affinity.Reflexive);
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
    return FromAny.fromAny<T, U>(this.valueType, value);
  };

  Property.construct = function <P extends Property<any, any, any>>(property: P | null, owner: FastenerOwner<P>): P {
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
      Object.setPrototypeOf(property, this.prototype);
    }
    property = _super.construct.call(this, property, owner) as P;
    Object.defineProperty(property, "inlet", { // override getter
      value: null,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    (property as Mutable<typeof property>).outlets = null;
    (property as Mutable<typeof property>).value = property.initValue();
    return property;
  };

  Property.refine = function (propertyClass: PropertyClass<any>): void {
    _super.refine.call(this, propertyClass);
    const propertyProtortype = propertyClass.prototype;

    if (Object.prototype.hasOwnProperty.call(propertyProtortype, "value")) {
      Object.defineProperty(propertyProtortype, "value", {
        value: propertyProtortype.fromAny(propertyProtortype.value),
        enumerable: true,
        configurable: true,
      });
    }
  };

  return Property;
})(Fastener);
