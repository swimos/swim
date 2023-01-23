// Copyright 2015-2023 Swim.inc
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

import type {Proto, Mutable} from "@swim/util";
import {
  Affinity,
  FastenerFlags,
  FastenerOwner,
  AnimatorValue,
  AnimatorValueInit,
  AnimatorDescriptor,
  AnimatorClass,
  Animator,
} from "@swim/component";
import {ConstraintId} from "./ConstraintId";
import {ConstraintMap} from "./ConstraintMap";
import {AnyConstraintExpression, ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintTerm} from "./ConstraintTerm";
import type {ConstraintVariable} from "./ConstraintVariable";
import {AnyConstraintStrength, ConstraintStrength} from "./"; // forward import
import type {Constraint} from "./Constraint";
import {ConstraintScope} from "./"; // forward import
import type {ConstraintSolver} from "./ConstraintSolver";

/** @public */
export interface ConstraintAnimatorDescriptor<T = unknown, U = T> extends AnimatorDescriptor<T, U> {
  extends?: Proto<ConstraintAnimator<any, any, any>> | string | boolean | null;
  strength?: AnyConstraintStrength;
  constrained?: boolean;
}

/** @public */
export type ConstraintAnimatorTemplate<A extends ConstraintAnimator<any, any, any>> =
  ThisType<A> &
  ConstraintAnimatorDescriptor<AnimatorValue<A>, AnimatorValueInit<A>> &
  Partial<Omit<A, keyof ConstraintAnimatorDescriptor>>;

/** @public */
export interface ConstraintAnimatorClass<A extends ConstraintAnimator<any, any, any> = ConstraintAnimator<any, any, any>> extends AnimatorClass<A> {
  /** @override */
  specialize(template: ConstraintAnimatorDescriptor<any, any>): ConstraintAnimatorClass<A>;

  /** @override */
  refine(animatorClass: ConstraintAnimatorClass<any>): void;

  /** @override */
  extend<A2 extends A>(className: string, template: ConstraintAnimatorDescriptor<A2>): ConstraintAnimatorClass<A2>;
  extend<A2 extends A>(className: string, template: ConstraintAnimatorDescriptor<A2>): ConstraintAnimatorClass<A2>;

  /** @override */
  define<A2 extends A>(className: string, template: ConstraintAnimatorDescriptor<A2>): ConstraintAnimatorClass<A2>;
  define<A2 extends A>(className: string, template: ConstraintAnimatorDescriptor<A2>): ConstraintAnimatorClass<A2>;

  /** @override */
  <A2 extends A>(template: ConstraintAnimatorDescriptor<A2>): PropertyDecorator;

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
export interface ConstraintAnimator<O = unknown, T = unknown, U = T> extends Animator<O, T, U>, ConstraintVariable {
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

  /** @internal @protected */
  initStrength(): ConstraintStrength;

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
  onSetValue(newValue: T, oldValue: T): void;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;

  /** @internal @protected */
  toNumber(value: T): number;
}

/** @public */
export const ConstraintAnimator = (function (_super: typeof Animator) {
  const ConstraintAnimator = _super.extend("ConstraintAnimator", {}) as ConstraintAnimatorClass;

  ConstraintAnimator.prototype.isExternal = function (this: ConstraintAnimator): boolean {
    return true;
  };

  ConstraintAnimator.prototype.isDummy = function (this: ConstraintAnimator): boolean {
    return false;
  };

  ConstraintAnimator.prototype.isInvalid = function (this: ConstraintAnimator): boolean {
    return false;
  };

  ConstraintAnimator.prototype.isConstant = function (this: ConstraintAnimator): boolean {
    return false;
  };

  ConstraintAnimator.prototype.evaluateConstraintVariable = function <T>(this: ConstraintAnimator<unknown, T>): void {
    // hook
  };

  ConstraintAnimator.prototype.updateConstraintSolution = function <T>(this: ConstraintAnimator<unknown, T>, state: number): void {
    if (this.constrained && this.toNumber(this.state) !== state) {
      this.setState(state as unknown as T, Affinity.Reflexive);
    }
  };

  ConstraintAnimator.prototype.initStrength = function (this: ConstraintAnimator): ConstraintStrength {
    let strength = (Object.getPrototypeOf(this) as ConstraintAnimator).strength as ConstraintStrength | undefined;
    if (strength === void 0) {
      strength = ConstraintStrength.Strong;
    }
    return strength;
  };

  ConstraintAnimator.prototype.setStrength = function (this: ConstraintAnimator, strength: AnyConstraintStrength): void {
    (this as Mutable<typeof this>).strength = ConstraintStrength.fromAny(strength);
  };

  Object.defineProperty(ConstraintAnimator.prototype, "coefficient", {
    value: 1,
    configurable: true,
  });

  Object.defineProperty(ConstraintAnimator.prototype, "variable", {
    get(this: ConstraintAnimator): ConstraintVariable {
      return this;
    },
    configurable: true,
  });

  Object.defineProperty(ConstraintAnimator.prototype, "terms", {
    get(this: ConstraintAnimator): ConstraintMap<ConstraintVariable, number> {
      const terms = new ConstraintMap<ConstraintVariable, number>();
      terms.set(this, 1);
      return terms;
    },
    configurable: true,
  });

  Object.defineProperty(ConstraintAnimator.prototype, "constant", {
    value: 0,
    configurable: true,
  });

  ConstraintAnimator.prototype.plus = function (this: ConstraintAnimator, that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (this === that) {
      return ConstraintExpression.product(2, this);
    } else {
      return ConstraintExpression.sum(this, that);
    }
  };

  ConstraintAnimator.prototype.negative = function (this: ConstraintAnimator): ConstraintTerm {
    return ConstraintExpression.product(-1, this);
  };

  ConstraintAnimator.prototype.minus = function (this: ConstraintAnimator, that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (this === that) {
      return ConstraintExpression.zero;
    } else {
      return ConstraintExpression.sum(this, that.negative());
    }
  };

  ConstraintAnimator.prototype.times = function (this: ConstraintAnimator, scalar: number): ConstraintExpression {
    return ConstraintExpression.product(scalar, this);
  };

  ConstraintAnimator.prototype.divide = function (this: ConstraintAnimator, scalar: number): ConstraintExpression {
    return ConstraintExpression.product(1 / scalar, this);
  };

  Object.defineProperty(ConstraintAnimator.prototype, "constrained", {
    get(this: ConstraintAnimator): boolean {
      return (this.flags & ConstraintAnimator.ConstrainedFlag) !== 0;
    },
    configurable: true,
  });

  ConstraintAnimator.prototype.constrain = function (this: ConstraintAnimator<unknown, unknown, unknown>, constrained?: boolean): typeof this {
    if (constrained === void 0) {
      constrained = true;
    }
    const flags = this.flags;
    if (constrained && (flags & ConstraintAnimator.ConstrainedFlag) === 0) {
      this.setFlags(flags | ConstraintAnimator.ConstrainedFlag);
      if (this.conditionCount !== 0 && this.mounted) {
        this.stopConstraining();
      }
    } else if (!constrained && (flags & ConstraintAnimator.ConstrainedFlag) !== 0) {
      this.setFlags(flags & ~ConstraintAnimator.ConstrainedFlag);
      if (this.conditionCount !== 0 && this.mounted) {
        this.startConstraining();
        this.updateConstraintVariable();
      }
    }
    return this;
  };

  ConstraintAnimator.prototype.addConstraintCondition = function (this: ConstraintAnimator, constraint: Constraint, solver: ConstraintSolver): void {
    (this as Mutable<typeof this>).conditionCount += 1;
    if (!this.constrained && this.conditionCount === 1 && this.mounted) {
      this.startConstraining();
      this.updateConstraintVariable();
    }
  };

  ConstraintAnimator.prototype.removeConstraintCondition = function (this: ConstraintAnimator, constraint: Constraint, solver: ConstraintSolver): void {
    (this as Mutable<typeof this>).conditionCount -= 1;
    if (!this.constrained && this.conditionCount === 0 && this.mounted) {
      this.stopConstraining();
    }
  };

  Object.defineProperty(ConstraintAnimator.prototype, "constraining", {
    get(this: ConstraintAnimator): boolean {
      return (this.flags & ConstraintAnimator.ConstrainingFlag) !== 0;
    },
    configurable: true,
  });

  ConstraintAnimator.prototype.startConstraining = function (this: ConstraintAnimator): void {
    if ((this.flags & ConstraintAnimator.ConstrainingFlag) === 0) {
      this.willStartConstraining();
      this.setFlags(this.flags | ConstraintAnimator.ConstrainingFlag);
      this.onStartConstraining();
      this.didStartConstraining();
    }
  };

  ConstraintAnimator.prototype.willStartConstraining = function (this: ConstraintAnimator): void {
    // hook
  };

  ConstraintAnimator.prototype.onStartConstraining = function (this: ConstraintAnimator): void {
    const constraintScope = this.owner;
    if (ConstraintScope.is(constraintScope)) {
      constraintScope.addConstraintVariable(this);
    }
  };

  ConstraintAnimator.prototype.didStartConstraining = function (this: ConstraintAnimator): void {
    // hook
  };

  ConstraintAnimator.prototype.stopConstraining = function (this: ConstraintAnimator): void {
    if ((this.flags & ConstraintAnimator.ConstrainingFlag) !== 0) {
      this.willStopConstraining();
      this.setFlags(this.flags & ~ConstraintAnimator.ConstrainingFlag);
      this.onStopConstraining();
      this.didStopConstraining();
    }
  };

  ConstraintAnimator.prototype.willStopConstraining = function (this: ConstraintAnimator): void {
    // hook
  };

  ConstraintAnimator.prototype.onStopConstraining = function (this: ConstraintAnimator): void {
    const constraintScope = this.owner;
    if (ConstraintScope.is(constraintScope)) {
      constraintScope.removeConstraintVariable(this);
    }
  };

  ConstraintAnimator.prototype.didStopConstraining = function (this: ConstraintAnimator): void {
    // hook
  };

  ConstraintAnimator.prototype.updateConstraintVariable = function (this: ConstraintAnimator): void {
    const constraintScope = this.owner;
    const value = this.value;
    if (value !== void 0 && ConstraintScope.is(constraintScope)) {
      constraintScope.setConstraintVariable(this, this.toNumber(value));
    }
  };

  ConstraintAnimator.prototype.onSetValue = function <T>(this: ConstraintAnimator<unknown, T>, newValue: T, oldValue: T): void {
    _super.prototype.onSetValue.call(this, newValue, oldValue);
    const constraintScope = this.owner;
    if (this.constraining && ConstraintScope.is(constraintScope)) {
      constraintScope.setConstraintVariable(this, newValue !== void 0 && newValue !== null ? this.toNumber(newValue) : 0);
    }
  };

  ConstraintAnimator.prototype.onMount = function <T>(this: ConstraintAnimator<unknown, T>): void {
    _super.prototype.onMount.call(this);
    if (!this.constrained && this.conditionCount !== 0) {
      this.startConstraining();
    }
  };

  ConstraintAnimator.prototype.onUnmount = function <T>(this: ConstraintAnimator<unknown, T>): void {
    if (!this.constrained && this.conditionCount !== 0) {
      this.stopConstraining();
    }
    _super.prototype.onUnmount.call(this);
  };

  ConstraintAnimator.prototype.toNumber = function <T>(this: ConstraintAnimator<unknown, T>, value: T): number {
    return value !== void 0 && value !== null ? +value : 0;
  };

  ConstraintAnimator.construct = function <A extends ConstraintAnimator<any, any, any>>(animator: A | null, owner: FastenerOwner<A>): A {
    animator = _super.construct.call(this, animator, owner) as A;
    (animator as Mutable<typeof animator>).id = ConstraintId.next();
    (animator as Mutable<typeof animator>).strength = animator.initStrength();
    (animator as Mutable<typeof animator>).conditionCount = 0;
    const flagsInit = animator.flagsInit;
    if (flagsInit !== void 0) {
      animator.constrain((flagsInit & ConstraintAnimator.ConstrainedFlag) !== 0);
    }
    return animator;
  };

  ConstraintAnimator.refine = function (animatorClass: ConstraintAnimatorClass<any>): void {
    _super.refine.call(this, animatorClass);
    const animatorPrototype = animatorClass.prototype;
    let flagsInit = animatorPrototype.flagsInit;

    if (Object.prototype.hasOwnProperty.call(animatorPrototype, "constrained")) {
      if (flagsInit === void 0) {
        flagsInit = 0;
      }
      if (animatorPrototype.constrained) {
        flagsInit |= ConstraintAnimator.ConstrainedFlag;
      } else {
        flagsInit &= ~ConstraintAnimator.ConstrainedFlag;
      }
      delete (animatorPrototype as ConstraintAnimatorDescriptor).constrained;
    }

    if (flagsInit !== void 0) {
      Object.defineProperty(animatorPrototype, "flagsInit", {
        value: flagsInit,
        configurable: true,
      });
    }

    if (Object.prototype.hasOwnProperty.call(animatorPrototype, "strength")) {
      Object.defineProperty(animatorPrototype, "strength", {
        value: animatorPrototype.fromAny(animatorPrototype.strength),
        enumerable: true,
        configurable: true,
      });
    }
  };

  (ConstraintAnimator as Mutable<typeof ConstraintAnimator>).ConstrainedFlag = 1 << (_super.FlagShift + 0);
  (ConstraintAnimator as Mutable<typeof ConstraintAnimator>).ConstrainingFlag = 1 << (_super.FlagShift + 1);

  (ConstraintAnimator as Mutable<typeof ConstraintAnimator>).FlagShift = _super.FlagShift + 2;
  (ConstraintAnimator as Mutable<typeof ConstraintAnimator>).FlagMask = (1 << ConstraintAnimator.FlagShift) - 1;

  return ConstraintAnimator;
})(Animator);
