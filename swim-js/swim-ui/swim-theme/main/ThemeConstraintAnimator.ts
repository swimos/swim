// Copyright 2015-2024 Nstream, inc.
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
import type {ConstraintExpressionLike} from "@swim/constraint";
import {ConstraintExpression} from "@swim/constraint";
import type {ConstraintTerm} from "@swim/constraint";
import type {ConstraintVariable} from "@swim/constraint";
import type {ConstraintStrengthLike} from "@swim/constraint";
import {ConstraintStrength} from "@swim/constraint";
import type {Constraint} from "@swim/constraint";
import {ConstraintScope} from "@swim/constraint";
import type {ConstraintSolver} from "@swim/constraint";
import type {ThemeAnimatorDescriptor} from "./ThemeAnimator";
import type {ThemeAnimatorClass} from "./ThemeAnimator";
import {ThemeAnimator} from "./ThemeAnimator";
import type {Look} from "./Look";

/** @public */
export interface ThemeConstraintAnimatorDescriptor<R, T> extends ThemeAnimatorDescriptor<R, T> {
  extends?: Proto<ThemeConstraintAnimator<any, any, any>> | boolean | null;
  strength?: ConstraintStrengthLike;
  constrained?: boolean;
}

/** @public */
export interface ThemeConstraintAnimatorClass<A extends ThemeConstraintAnimator<any, any, any> = ThemeConstraintAnimator<any, any, any>> extends ThemeAnimatorClass<A> {
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
export interface ThemeConstraintAnimator<R = any, T = any, I extends any[] = [Look<NonNullable<T>> | T]> extends ThemeAnimator<R, T, I>, ConstraintVariable {
  /** @override */
  get descriptorType(): Proto<ThemeConstraintAnimatorDescriptor<R, T>>;

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
export const ThemeConstraintAnimator = (<R, T, I extends any[], A extends ThemeConstraintAnimator<any, any, any>>() => ThemeAnimator.extend<ThemeConstraintAnimator<R, T, I>, ThemeConstraintAnimatorClass<A>>("ThemeConstraintAnimator", {
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

  updateConstraintSolution(state: number): void {
    if (this.constrained && this.toNumber(this.state) !== state) {
      this.setState(state as unknown as T, Affinity.Reflexive);
    }
  },

  initStrength(): ConstraintStrength {
    let strength = (Object.getPrototypeOf(this) as ThemeConstraintAnimator).strength as ConstraintStrength | undefined;
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
    return (this.flags & ThemeConstraintAnimator.ConstrainedFlag) !== 0;
  },

  constrain(constrained?: boolean): typeof this {
    if (constrained === void 0) {
      constrained = true;
    }
    const flags = this.flags;
    if (constrained && (flags & ThemeConstraintAnimator.ConstrainedFlag) === 0) {
      this.setFlags(flags | ThemeConstraintAnimator.ConstrainedFlag);
      if (this.conditionCount !== 0 && this.mounted) {
        this.stopConstraining();
      }
    } else if (!constrained && (flags & ThemeConstraintAnimator.ConstrainedFlag) !== 0) {
      this.setFlags(flags & ~ThemeConstraintAnimator.ConstrainedFlag);
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
    return (this.flags & ThemeConstraintAnimator.ConstrainingFlag) !== 0;
  },

  startConstraining(): void {
    if ((this.flags & ThemeConstraintAnimator.ConstrainingFlag) !== 0) {
      return;
    }
    this.willStartConstraining();
    this.setFlags(this.flags | ThemeConstraintAnimator.ConstrainingFlag);
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
    if ((this.flags & ThemeConstraintAnimator.ConstrainingFlag) === 0) {
      return;
    }
    this.willStopConstraining();
    this.setFlags(this.flags & ~ThemeConstraintAnimator.ConstrainingFlag);
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
  construct(animator: A | null, owner: A extends Fastener<infer R, any, any> ? R : never): A {
    animator = super.construct(animator, owner) as A;
    (animator as Mutable<typeof animator>).strength = animator.initStrength();
    (animator as Mutable<typeof animator>).conditionCount = 0;
    return animator;
  },

  refine(animatorClass: FastenerClass<ThemeConstraintAnimator<any, any, any>>): void {
    super.refine(animatorClass);
    const animatorPrototype = animatorClass.prototype;

    let flagsInit = animatorPrototype.flagsInit;
    if (Object.prototype.hasOwnProperty.call(animatorPrototype, "constrained")) {
      if (animatorPrototype.constrained) {
        flagsInit |= ThemeConstraintAnimator.ConstrainedFlag;
      } else {
        flagsInit &= ~ThemeConstraintAnimator.ConstrainedFlag;
      }
      delete (animatorPrototype as ThemeConstraintAnimatorDescriptor<any, any>).constrained;
    }
    Object.defineProperty(animatorPrototype, "flagsInit", {
      value: flagsInit,
      enumerable: true,
      configurable: true,
    });

    const strengthDescriptor = Object.getOwnPropertyDescriptor(animatorPrototype, "strength");
    if (strengthDescriptor !== void 0 && "value" in strengthDescriptor) {
      strengthDescriptor.value = ConstraintStrength.fromLike(strengthDescriptor.value);
      Object.defineProperty(animatorPrototype, "strength", strengthDescriptor);
    }
  },

  ConstrainedFlag: 1 << (ThemeAnimator.FlagShift + 0),
  ConstrainingFlag: 1 << (ThemeAnimator.FlagShift + 1),

  FlagShift: ThemeAnimator.FlagShift + 2,
  FlagMask: (1 << (ThemeAnimator.FlagShift + 2)) - 1,
}))();
