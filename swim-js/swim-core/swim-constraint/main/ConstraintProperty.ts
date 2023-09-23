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
import {Affinity} from "@swim/component";
import type {FastenerFlags} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import type {Fastener} from "@swim/component";
import type {PropertyDescriptor} from "@swim/component";
import type {PropertyClass} from "@swim/component";
import {Property} from "@swim/component";
import type {ConstraintExpressionLike} from "./ConstraintExpression";
import {ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintTerm} from "./ConstraintTerm";
import type {ConstraintVariable} from "./ConstraintVariable";
import type {ConstraintStrengthLike} from "./Constraint";
import {ConstraintStrength} from "./"; // forward import
import type {Constraint} from "./Constraint";
import {ConstraintScope} from "./"; // forward import
import type {ConstraintSolver} from "./ConstraintSolver";

/** @public */
export interface ConstraintPropertyDescriptor<R, T> extends PropertyDescriptor<R, T> {
  extends?: Proto<ConstraintProperty<any, any, any>> | boolean | null;
  strength?: ConstraintStrengthLike;
  constrained?: boolean;
}

/** @public */
export interface ConstraintPropertyClass<P extends ConstraintProperty<any, any, any> = ConstraintProperty<any, any, any>> extends PropertyClass<P> {
  /** @internal */
  readonly ConstrainedFlag: FastenerFlags;
  /** @internal */
  readonly ConstrainingFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface ConstraintProperty<R = any, T = any, I extends any[] = [T]> extends Property<R, T, I>, ConstraintVariable {
  /** @override */
  get descriptorType(): Proto<ConstraintPropertyDescriptor<R, T>>;

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

  /** @internal @protected */
  initStrength(): ConstraintStrength;

  /** @override */
  readonly strength: ConstraintStrength;

  setStrength(strength: ConstraintStrengthLike): void;

  /** @override */
  get coefficient(): number;

  /** @override */
  get variable(): ConstraintVariable | null;

  /** @override */
  get terms(): ReadonlyMap<ConstraintVariable, number>;

  /** @override */
  get constant(): number;

  /** @override */
  plus(that: ConstraintExpressionLike): ConstraintExpression;

  /** @override */
  negative(): ConstraintTerm;

  /** @override */
  minus(that: ConstraintExpressionLike): ConstraintExpression;

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
  onSetValue(newValue: T, oldValue: T): void;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;

  /** @internal @protected */
  toNumber(value: T): number;
}

/** @public */
export const ConstraintProperty = (<R, T, I extends any[], P extends ConstraintProperty<any, any, any>>() => Property.extend<ConstraintProperty<R, T, I>, ConstraintPropertyClass<P>>("ConstraintProperty", {
  isExternal(): boolean {
    return true;
  },

  isDummy(): boolean {
    return false;
  },

  isInvalid(): boolean {
    return false;
  },

  isConstant(): boolean {
    return false;
  },

  evaluateConstraintVariable(): void {
    // hook
  },

  updateConstraintSolution(value: number): void {
    if (this.constrained && this.toNumber(this.value) !== value) {
      this.setValue(value as unknown as T, Affinity.Reflexive);
    }
  },

  initStrength(): ConstraintStrength {
    let strength = (Object.getPrototypeOf(this) as ConstraintProperty<any, any, any>).strength as ConstraintStrength | undefined;
    if (strength === void 0) {
      strength = ConstraintStrength.Strong;
    }
    return strength;
  },

  setStrength(strength: ConstraintStrengthLike): void {
    (this as Mutable<typeof this>).strength = ConstraintStrength.fromLike(strength);
  },

  get coefficient(): number {
    return 1;
  },

  get variable(): ConstraintVariable {
    return this;
  },

  get terms(): ReadonlyMap<ConstraintVariable, number> {
    const terms = new Map<ConstraintVariable, number>();
    terms.set(this, 1);
    return terms;
  },

  get constant(): number {
    return 0;
  },

  plus(that: ConstraintExpressionLike): ConstraintExpression {
    that = ConstraintExpression.fromLike(that);
    if (this === that) {
      return ConstraintExpression.product(2, this);
    }
    return ConstraintExpression.sum(this, that);
  },

  negative(): ConstraintTerm {
    return ConstraintExpression.product(-1, this);
  },

  minus(that: ConstraintExpressionLike): ConstraintExpression {
    that = ConstraintExpression.fromLike(that);
    if (this === that) {
      return ConstraintExpression.zero();
    }
    return ConstraintExpression.sum(this, that.negative());
  },

  times(scalar: number): ConstraintExpression {
    return ConstraintExpression.product(scalar, this);
  },

  divide(scalar: number): ConstraintExpression {
    return ConstraintExpression.product(1 / scalar, this);
  },

  get constrained(): boolean {
    return (this.flags & ConstraintProperty.ConstrainedFlag) !== 0;
  },

  constrain(constrained?: boolean): typeof this {
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
  },

  addConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void {
    (this as Mutable<typeof this>).conditionCount += 1;
    if (!this.constrained && this.conditionCount === 1 && this.mounted) {
      this.startConstraining();
      this.updateConstraintVariable();
    }
  },

  removeConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void {
    (this as Mutable<typeof this>).conditionCount -= 1;
    if (!this.constrained && this.conditionCount === 0 && this.mounted) {
      this.stopConstraining();
    }
  },

  get constraining(): boolean {
    return (this.flags & ConstraintProperty.ConstrainingFlag) !== 0;
  },

  startConstraining(): void {
    if ((this.flags & ConstraintProperty.ConstrainingFlag) !== 0) {
      return;
    }
    this.willStartConstraining();
    this.setFlags(this.flags | ConstraintProperty.ConstrainingFlag);
    this.onStartConstraining();
    this.didStartConstraining();
  },

  willStartConstraining(): void {
    // hook
  },

  onStartConstraining(): void {
    const constraintScope = this.owner;
    if (ConstraintScope[Symbol.hasInstance](constraintScope)) {
      constraintScope.addConstraintVariable(this);
    }
  },

  didStartConstraining(): void {
    // hook
  },

  stopConstraining(): void {
    if ((this.flags & ConstraintProperty.ConstrainingFlag) === 0) {
      return;
    }
    this.willStopConstraining();
    this.setFlags(this.flags & ~ConstraintProperty.ConstrainingFlag);
    this.onStopConstraining();
    this.didStopConstraining();
  },

  willStopConstraining(): void {
    // hook
  },

  onStopConstraining(): void {
    const constraintScope = this.owner;
    if (ConstraintScope[Symbol.hasInstance](constraintScope)) {
      constraintScope.removeConstraintVariable(this);
    }
  },

  didStopConstraining(): void {
    // hook
  },

  updateConstraintVariable(): void {
    const constraintScope = this.owner;
    const value = this.value;
    if (value !== void 0 && ConstraintScope[Symbol.hasInstance](constraintScope)) {
      constraintScope.setConstraintVariable(this, this.toNumber(value));
    }
  },

  onSetValue(newValue: T, oldValue: T): void {
    super.onSetValue(newValue, oldValue);
    const constraintScope = this.owner;
    if (this.constraining && ConstraintScope[Symbol.hasInstance](constraintScope)) {
      constraintScope.setConstraintVariable(this, newValue !== void 0 && newValue !== null ? this.toNumber(newValue) : 0);
    }
  },

  onMount(): void {
    super.onMount();
    if (!this.constrained && this.conditionCount !== 0) {
      this.startConstraining();
    }
  },

  onUnmount(): void {
    if (!this.constrained && this.conditionCount !== 0) {
      this.stopConstraining();
    }
    super.onUnmount();
  },

  toNumber(value: T): number {
    return value !== void 0 && value !== null ? +value : 0;
  },
},
{
  construct(property: P | null, owner: P extends Fastener<infer R, any, any> ? R : never): P {
    property = super.construct(property, owner) as P;
    (property as Mutable<typeof property>).strength = property.initStrength();
    (property as Mutable<typeof property>).conditionCount = 0;
    return property;
  },

  refine(propertyClass: FastenerClass<ConstraintProperty<any, any, any>>): void {
    super.refine(propertyClass);
    const propertyPrototype = propertyClass.prototype;

    let flagsInit = propertyPrototype.flagsInit;
    if (Object.prototype.hasOwnProperty.call(propertyPrototype, "constrained")) {
      if (propertyPrototype.constrained) {
        flagsInit |= ConstraintProperty.ConstrainedFlag;
      } else {
        flagsInit &= ~ConstraintProperty.ConstrainedFlag;
      }
      delete (propertyPrototype as ConstraintPropertyDescriptor<any, any>).constrained;
    }
    Object.defineProperty(propertyPrototype, "flagsInit", {
      value: flagsInit,
      enumerable: true,
      configurable: true,
    });

    const strengthDescriptor = Object.getOwnPropertyDescriptor(propertyPrototype, "strength");
    if (strengthDescriptor !== void 0 && "value" in strengthDescriptor) {
      strengthDescriptor.value = ConstraintStrength.fromLike(strengthDescriptor.value);
      Object.defineProperty(propertyPrototype, "strength", strengthDescriptor);
    }
  },

  ConstrainedFlag: 1 << (Property.FlagShift + 0),
  ConstrainingFlag: 1 << (Property.FlagShift + 1),

  FlagShift: Property.FlagShift + 2,
  FlagMask: (1 << (Property.FlagShift + 2)) - 1,
}))();
