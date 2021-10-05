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
import {Affinity, FastenerOwner, FastenerFlags, AnimatorInit, AnimatorClass, Animator} from "@swim/fastener";
import {ConstraintKey} from "./ConstraintKey";
import {ConstraintMap} from "./ConstraintMap";
import {AnyConstraintExpression, ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintTerm} from "./ConstraintTerm";
import type {ConstraintVariable} from "./ConstraintVariable";
import {AnyConstraintStrength, ConstraintStrength} from "./"; // forward import
import type {Constraint} from "./Constraint";
import {ConstraintScope} from "./"; // forward import
import type {ConstraintSolver} from "./ConstraintSolver";

export interface ConstraintAnimatorInit<T = unknown, U = never> extends AnimatorInit<T, U> {
  constrain?: boolean;
  strength?: AnyConstraintStrength;

  willStartConstraining?(): void;
  didStartConstraining?(): void;
  willStopConstraining?(): void;
  didStopConstraining?(): void;

  toNumber?(value: T): number;
}

export type ConstraintAnimatorDescriptor<O = unknown, T = unknown, U = never, I = {}> = ThisType<ConstraintAnimator<O, T, U> & I> & ConstraintAnimatorInit<T, U> & Partial<I>;

export interface ConstraintAnimatorClass<A extends ConstraintAnimator<any, any> = ConstraintAnimator<any, any, any>> extends AnimatorClass<A> {
  create(this: ConstraintAnimatorClass<A>, owner: FastenerOwner<A>, animatorName: string): A;

  construct(animatorClass: ConstraintAnimatorClass, animator: A | null, owner: FastenerOwner<A>, animatorName: string): A;

  specialize(type: unknown): ConstraintAnimatorClass | null;

  extend(this: ConstraintAnimatorClass<A>, classMembers?: {} | null): ConstraintAnimatorClass<A>;

  define<O, T, U = never, I = {}>(descriptor: {extends: ConstraintAnimatorClass | null} & ConstraintAnimatorDescriptor<O, T, U, I>): ConstraintAnimatorClass<ConstraintAnimator<any, T, U> & I>;
  define<O, T, U = never>(descriptor: ConstraintAnimatorDescriptor<O, T, U>): ConstraintAnimatorClass<ConstraintAnimator<any, T, U>>;

  <O, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & ConstraintAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = never>(descriptor: ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ConstraintAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = never, I = {}>(descriptor: {extends: ConstraintAnimatorClass | null} & ConstraintAnimatorDescriptor<O, T, U, I>): PropertyDecorator;
  <O, T, U = never>(descriptor: ConstraintAnimatorDescriptor<O, T, U>): PropertyDecorator;

  /** @internal */
  readonly ConstrainedFlag: FastenerFlags;
  /** @internal */
  readonly ConstrainingFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

export interface ConstraintAnimator<O = unknown, T = unknown, U = never> extends Animator<O, T, U>, ConstraintVariable {
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
  onSetValue(newValue: T, oldValue: T): void;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;

  /** @override */
  fromAny(value: T | U): T;

  /** @internal @protected */
  toNumber(value: T): number;
}

export const ConstraintAnimator = (function (_super: typeof Animator) {
  const ConstraintAnimator = _super.extend() as ConstraintAnimatorClass;

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

  ConstraintAnimator.prototype.setStrength = function (this: ConstraintAnimator, strength: AnyConstraintStrength): void {
    (this as Mutable<typeof this>).strength = ConstraintStrength.fromAny(strength);
  };

  Object.defineProperty(ConstraintAnimator.prototype, "coefficient", {
    get(this: ConstraintAnimator): number {
      return 1;
    },
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
    get(this: ConstraintAnimator): number {
      return 0;
    },
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

  ConstraintAnimator.prototype.fromAny = function <T, U>(this: ConstraintAnimator<unknown, T, U>, value: T | U): T {
    if (typeof value === "string") {
      const number = +value;
      if (isFinite(number)) {
        return number as unknown as T;
      }
    }
    return value as T;
  };

  ConstraintAnimator.prototype.toNumber = function <T>(this: ConstraintAnimator<unknown, T>, value: T): number {
    return value !== void 0 && value !== null ? +value : 0;
  };

  ConstraintAnimator.construct = function <A extends ConstraintAnimator<any, any, any>>(animatorClass: ConstraintAnimatorClass, animator: A | null, owner: FastenerOwner<A>, animatorName: string): A {
    animator = _super.construct(animatorClass, animator, owner, animatorName) as A;
    (animator as Mutable<typeof animator>).id = ConstraintKey.nextId();
    (animator as Mutable<typeof animator>).strength = ConstraintStrength.Strong;
    (animator as Mutable<typeof animator>).conditionCount = 0;
    return animator;
  };

  ConstraintAnimator.specialize = function (type: unknown): ConstraintAnimatorClass | null {
    return null;
  };

  ConstraintAnimator.define = function <O, T, U>(descriptor: ConstraintAnimatorDescriptor<O, T, U>): ConstraintAnimatorClass<ConstraintAnimator<any, T, U>> {
    let superClass = descriptor.extends as ConstraintAnimatorClass | null | undefined;
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

    const animatorClass = superClass.extend(descriptor);

    animatorClass.construct = function (animatorClass: ConstraintAnimatorClass, animator: ConstraintAnimator<O, T, U> | null, owner: O, animatorName: string): ConstraintAnimator<O, T, U> {
      animator = superClass!.construct(animatorClass, animator, owner, animatorName);
      if (affinity !== void 0) {
        animator.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        animator.initInherits(inherits);
      }
      if (strength !== void 0) {
        (animator as Mutable<typeof animator>).strength = strength;
      }
      if (initState !== void 0) {
        (animator as Mutable<typeof animator>).state = animator.fromAny(initState());
        (animator as Mutable<typeof animator>).value = animator.state;
      } else if (state !== void 0) {
        (animator as Mutable<typeof animator>).state = animator.fromAny(state);
        (animator as Mutable<typeof animator>).value = animator.state;
      }
      if (constrain === true) {
        animator.constrain();
      }
      return animator;
    };

    return animatorClass;
  };

  (ConstraintAnimator as Mutable<typeof ConstraintAnimator>).ConstrainedFlag = 1 << (_super.FlagShift + 0);
  (ConstraintAnimator as Mutable<typeof ConstraintAnimator>).ConstrainingFlag = 1 << (_super.FlagShift + 1);

  (ConstraintAnimator as Mutable<typeof ConstraintAnimator>).FlagShift = _super.FlagShift + 2;
  (ConstraintAnimator as Mutable<typeof ConstraintAnimator>).FlagMask = (1 << ConstraintAnimator.FlagShift) - 1;

  return ConstraintAnimator;
})(Animator);
