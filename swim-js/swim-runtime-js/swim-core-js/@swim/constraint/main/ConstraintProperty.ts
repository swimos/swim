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

import {Mutable, FromAny} from "@swim/util";
import {Affinity, FastenerOwner, FastenerFlags, PropertyInit, PropertyClass, Property} from "@swim/fastener";
import {ConstraintId} from "./ConstraintId";
import {ConstraintMap} from "./ConstraintMap";
import {AnyConstraintExpression, ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintTerm} from "./ConstraintTerm";
import type {ConstraintVariable} from "./ConstraintVariable";
import {AnyConstraintStrength, ConstraintStrength} from "./"; // forward import
import type {Constraint} from "./Constraint";
import {ConstraintScope} from "./"; // forward import
import type {ConstraintSolver} from "./ConstraintSolver";

export interface ConstraintPropertyInit<T = unknown, U = T> extends PropertyInit<T, U> {
  extends?: {prototype: ConstraintProperty<any, any>} | string | boolean | null;
  constrain?: boolean;
  strength?: AnyConstraintStrength;

  willStartConstraining?(): void;
  didStartConstraining?(): void;
  willStopConstraining?(): void;
  didStopConstraining?(): void;

  toNumber?(value: T): number;
}

export type ConstraintPropertyDescriptor<O = unknown, T = unknown, U = T, I = {}> = ThisType<ConstraintProperty<O, T, U> & I> & ConstraintPropertyInit<T, U> & Partial<I>;

export interface ConstraintPropertyClass<P extends ConstraintProperty<any, any> = ConstraintProperty<any, any>> extends PropertyClass<P> {
  /** @internal */
  readonly ConstrainedFlag: FastenerFlags;
  /** @internal */
  readonly ConstrainingFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

export interface ConstraintPropertyFactory<P extends ConstraintProperty<any, any> = ConstraintProperty<any, any>> extends ConstraintPropertyClass<P> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ConstraintPropertyFactory<P> & I;

  specialize(type: unknown): ConstraintPropertyFactory | null;

  define<O, T, U = T>(className: string, descriptor: ConstraintPropertyDescriptor<O, T, U>): ConstraintPropertyFactory<ConstraintProperty<any, T, U>>;
  define<O, T, U = T, I = {}>(className: string, descriptor: ConstraintPropertyDescriptor<O, T, U, I>): ConstraintPropertyFactory<ConstraintProperty<any, T, U> & I>;

  <O, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & ConstraintPropertyDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T>(descriptor: ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ConstraintPropertyDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T>(descriptor: ConstraintPropertyDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T, I = {}>(descriptor: ConstraintPropertyDescriptor<O, T, U, I>): PropertyDecorator;
}

export interface ConstraintProperty<O = unknown, T = unknown, U = T> extends Property<O, T, U>, ConstraintVariable {
  /** @internal @override */
  readonly id: number;

  /** @internal @override */
  isExternal(): boolean;

  /** @internal @override */
  isDummy(): boolean;

  /** @internal @override */
  isInvalid(): boolean;

  /** @override */
  isConstant(): boolean;

  /** @internal @override */
  evaluateConstraintVariable(): void;

  /** @internal @override */
  updateConstraintSolution(value: number): void;

  /** @override */
  readonly strength: ConstraintStrength;

  setStrength(strength: AnyConstraintStrength): void;

  /** @override */
  get coefficient(): number;

  /** @override */
  get variable(): ConstraintVariable | null;

  /** @override */
  get terms(): ConstraintMap<ConstraintVariable, number>;

  /** @override */
  get constant(): number;

  /** @override */
  plus(that: AnyConstraintExpression): ConstraintExpression;

  /** @override */
  negative(): ConstraintTerm;

  /** @override */
  minus(that: AnyConstraintExpression): ConstraintExpression;

  /** @override */
  times(scalar: number): ConstraintExpression;

  /** @override */
  divide(scalar: number): ConstraintExpression;

  get constrained(): boolean;

  constrain(constrained?: boolean): this;

  /** @internal */
  readonly conditionCount: number;

  /** @internal @override */
  addConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void;

  /** @internal @override */
  removeConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void;

  /** @internal */
  get constraining(): boolean;

  /** @internal */
  startConstraining(): void;

  /** @protected */
  willStartConstraining(): void;

  /** @protected */
  onStartConstraining(): void;

  /** @protected */
  didStartConstraining(): void;

  /** @internal */
  stopConstraining(): void;

  /** @protected */
  willStopConstraining(): void;

  /** @protected */
  onStopConstraining(): void;

  /** @protected */
  didStopConstraining(): void;

  /** @internal */
  updateConstraintVariable(): void;

  /** @protected @override */
  onSetState(newState: T, oldState: T): void;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;

  /** @override */
  fromAny(value: T | U): T;

  /** @internal @protected */
  toNumber(value: T): number;
}

export const ConstraintProperty = (function (_super: typeof Property) {
  const ConstraintProperty: ConstraintPropertyFactory = _super.extend("ConstraintProperty");

  ConstraintProperty.prototype.isExternal = function (this: ConstraintProperty): boolean {
    return true;
  };

  ConstraintProperty.prototype.isDummy = function (this: ConstraintProperty): boolean {
    return false;
  };

  ConstraintProperty.prototype.isInvalid = function (this: ConstraintProperty): boolean {
    return false;
  };

  ConstraintProperty.prototype.isConstant = function (this: ConstraintProperty): boolean {
    return false;
  };

  ConstraintProperty.prototype.evaluateConstraintVariable = function <T>(this: ConstraintProperty<unknown, T>): void {
    // hook
  };

  ConstraintProperty.prototype.updateConstraintSolution = function <T>(this: ConstraintProperty<unknown, T>, state: number): void {
    if (this.constrained && this.toNumber(this.state) !== state) {
      this.setState(state as unknown as T, Affinity.Reflexive);
    }
  };

  ConstraintProperty.prototype.setStrength = function (this: ConstraintProperty, strength: AnyConstraintStrength): void {
    (this as Mutable<typeof this>).strength = ConstraintStrength.fromAny(strength);
  };

  Object.defineProperty(ConstraintProperty.prototype, "coefficient", {
    get(this: ConstraintProperty): number {
      return 1;
    },
    configurable: true,
  });

  Object.defineProperty(ConstraintProperty.prototype, "variable", {
    get(this: ConstraintProperty): ConstraintVariable {
      return this;
    },
    configurable: true,
  });

  Object.defineProperty(ConstraintProperty.prototype, "terms", {
    get(this: ConstraintProperty): ConstraintMap<ConstraintVariable, number> {
      const terms = new ConstraintMap<ConstraintVariable, number>();
      terms.set(this, 1);
      return terms;
    },
    configurable: true,
  });

  Object.defineProperty(ConstraintProperty.prototype, "constant", {
    get(this: ConstraintProperty): number {
      return 0;
    },
    configurable: true,
  });

  ConstraintProperty.prototype.plus = function (this: ConstraintProperty, that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (this === that) {
      return ConstraintExpression.product(2, this);
    } else {
      return ConstraintExpression.sum(this, that);
    }
  };

  ConstraintProperty.prototype.negative = function (this: ConstraintProperty): ConstraintTerm {
    return ConstraintExpression.product(-1, this);
  };

  ConstraintProperty.prototype.minus = function (this: ConstraintProperty, that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (this === that) {
      return ConstraintExpression.zero;
    } else {
      return ConstraintExpression.sum(this, that.negative());
    }
  };

  ConstraintProperty.prototype.times = function (this: ConstraintProperty, scalar: number): ConstraintExpression {
    return ConstraintExpression.product(scalar, this);
  };

  ConstraintProperty.prototype.divide = function (this: ConstraintProperty, scalar: number): ConstraintExpression {
    return ConstraintExpression.product(1 / scalar, this);
  };

  Object.defineProperty(ConstraintProperty.prototype, "constrained", {
    get(this: ConstraintProperty): boolean {
      return (this.flags & ConstraintProperty.ConstrainedFlag) !== 0;
    },
    configurable: true,
  });

  ConstraintProperty.prototype.constrain = function (this: ConstraintProperty<unknown, unknown, unknown>, constrained?: boolean): typeof this {
    if (constrained === void 0) {
      constrained = true;
    }
    const flags = this.flags;
    if (constrained && (flags & ConstraintProperty.ConstrainedFlag) === 0) {
      this.setFlags(flags | ConstraintProperty.ConstrainedFlag);
      if (this.conditionCount !== 0 && this.mounted) {
        this.stopConstraining();
      }
    } else if (!constrained && (flags & ConstraintProperty.ConstrainedFlag) !== 0) {
      this.setFlags(flags & ~ConstraintProperty.ConstrainedFlag);
      if (this.conditionCount !== 0 && this.mounted) {
        this.startConstraining();
        this.updateConstraintVariable();
      }
    }
    return this;
  };

  ConstraintProperty.prototype.addConstraintCondition = function (this: ConstraintProperty, constraint: Constraint, solver: ConstraintSolver): void {
    (this as Mutable<typeof this>).conditionCount += 1;
    if (!this.constrained && this.conditionCount === 1 && this.mounted) {
      this.startConstraining();
      this.updateConstraintVariable();
    }
  };

  ConstraintProperty.prototype.removeConstraintCondition = function (this: ConstraintProperty, constraint: Constraint, solver: ConstraintSolver): void {
    (this as Mutable<typeof this>).conditionCount -= 1;
    if (!this.constrained && this.conditionCount === 0 && this.mounted) {
      this.stopConstraining();
    }
  };

  Object.defineProperty(ConstraintProperty.prototype, "constraining", {
    get(this: ConstraintProperty): boolean {
      return (this.flags & ConstraintProperty.ConstrainingFlag) !== 0;
    },
    configurable: true,
  });

  ConstraintProperty.prototype.startConstraining = function (this: ConstraintProperty): void {
    if ((this.flags & ConstraintProperty.ConstrainingFlag) === 0) {
      this.willStartConstraining();
      this.setFlags(this.flags | ConstraintProperty.ConstrainingFlag);
      this.onStartConstraining();
      this.didStartConstraining();
    }
  };

  ConstraintProperty.prototype.willStartConstraining = function (this: ConstraintProperty): void {
    // hook
  };

  ConstraintProperty.prototype.onStartConstraining = function (this: ConstraintProperty): void {
    const constraintScope = this.owner;
    if (ConstraintScope.is(constraintScope)) {
      constraintScope.addConstraintVariable(this);
    }
  };

  ConstraintProperty.prototype.didStartConstraining = function (this: ConstraintProperty): void {
    // hook
  };

  ConstraintProperty.prototype.stopConstraining = function (this: ConstraintProperty): void {
    if ((this.flags & ConstraintProperty.ConstrainingFlag) !== 0) {
      this.willStopConstraining();
      this.setFlags(this.flags & ~ConstraintProperty.ConstrainingFlag);
      this.onStopConstraining();
      this.didStopConstraining();
    }
  };

  ConstraintProperty.prototype.willStopConstraining = function (this: ConstraintProperty): void {
    // hook
  };

  ConstraintProperty.prototype.onStopConstraining = function (this: ConstraintProperty): void {
    const constraintScope = this.owner;
    if (ConstraintScope.is(constraintScope)) {
      constraintScope.removeConstraintVariable(this);
    }
  };

  ConstraintProperty.prototype.didStopConstraining = function (this: ConstraintProperty): void {
    // hook
  };

  ConstraintProperty.prototype.updateConstraintVariable = function (this: ConstraintProperty): void {
    const constraintScope = this.owner;
    const state = this.state;
    if (state !== void 0 && ConstraintScope.is(constraintScope)) {
      constraintScope.setConstraintVariable(this, this.toNumber(state));
    }
  };

  ConstraintProperty.prototype.onSetState = function <T>(this: ConstraintProperty<unknown, T>, newState: T, oldState: T): void {
    _super.prototype.onSetState.call(this, newState, oldState);
    const constraintScope = this.owner;
    if (this.constraining && ConstraintScope.is(constraintScope)) {
      constraintScope.setConstraintVariable(this, newState !== void 0 && newState !== null ? this.toNumber(newState) : 0);
    }
  };

  ConstraintProperty.prototype.onMount = function <T>(this: ConstraintProperty<unknown, T>): void {
    _super.prototype.onMount.call(this);
    if (!this.constrained && this.conditionCount !== 0) {
      this.startConstraining();
    }
  };

  ConstraintProperty.prototype.onUnmount = function <T>(this: ConstraintProperty<unknown, T>): void {
    if (!this.constrained && this.conditionCount !== 0) {
      this.stopConstraining();
    }
    _super.prototype.onUnmount.call(this);
  };

  ConstraintProperty.prototype.fromAny = function <T, U>(this: ConstraintProperty<unknown, T, U>, value: T | U): T {
    if (typeof value === "string") {
      const number = +value;
      if (isFinite(number)) {
        return number as unknown as T;
      }
    }
    return value as T;
  };

  ConstraintProperty.prototype.toNumber = function <T>(this: ConstraintProperty<unknown, T>, value: T): number {
    return value !== void 0 && value !== null ? +value : 0;
  };

  ConstraintProperty.construct = function <P extends ConstraintProperty<any, any>>(propertyClass: {prototype: P}, property: P | null, owner: FastenerOwner<P>): P {
    property = _super.construct(propertyClass, property, owner) as P;
    (property as Mutable<typeof property>).id = ConstraintId.next();
    (property as Mutable<typeof property>).strength = ConstraintStrength.Strong;
    (property as Mutable<typeof property>).conditionCount = 0;
    return property;
  };

  ConstraintProperty.specialize = function (type: unknown): ConstraintPropertyFactory | null {
    return null;
  };

  ConstraintProperty.define = function <O, T, U>(className: string, descriptor: ConstraintPropertyDescriptor<O, T, U>): ConstraintPropertyFactory<ConstraintProperty<any, T, U>> {
    let superClass = descriptor.extends as ConstraintPropertyFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const strength = descriptor.strength !== void 0 ? ConstraintStrength.fromAny(descriptor.strength) : void 0;
    const constrain = descriptor.constrain;
    const state = descriptor.state;
    const initState = descriptor.initState;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.strength;
    delete descriptor.constrain;
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

    propertyClass.construct = function (propertyClass: {prototype: ConstraintProperty<any, any>}, property: ConstraintProperty<O, T, U> | null, owner: O): ConstraintProperty<O, T, U> {
      property = superClass!.construct(propertyClass, property, owner);
      if (affinity !== void 0) {
        property.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        property.initInherits(inherits);
      }
      if (strength !== void 0) {
        (property as Mutable<typeof property>).strength = strength;
      }
      if (initState !== void 0) {
        (property as Mutable<typeof property>).state = property.fromAny(initState());
      } else if (state !== void 0) {
        (property as Mutable<typeof property>).state = property.fromAny(state);
      }
      if (constrain === true) {
        property.constrain();
      }
      return property;
    };

    return propertyClass;
  };

  (ConstraintProperty as Mutable<typeof ConstraintProperty>).ConstrainedFlag = 1 << (_super.FlagShift + 0);
  (ConstraintProperty as Mutable<typeof ConstraintProperty>).ConstrainingFlag = 1 << (_super.FlagShift + 1);

  (ConstraintProperty as Mutable<typeof ConstraintProperty>).FlagShift = _super.FlagShift + 2;
  (ConstraintProperty as Mutable<typeof ConstraintProperty>).FlagMask = (1 << ConstraintProperty.FlagShift) - 1;

  return ConstraintProperty;
})(Property);
