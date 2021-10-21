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
import {Affinity, FastenerOwner, FastenerFlags} from "@swim/fastener";
import {
  ConstraintKey,
  ConstraintMap,
  AnyConstraintExpression,
  ConstraintExpression,
  ConstraintTerm,
  ConstraintVariable,
  AnyConstraintStrength,
  ConstraintStrength,
  Constraint,
  ConstraintScope,
  ConstraintSolver,
} from "@swim/constraint";
import {AnyLength, Length} from "@swim/math";
import {StyleAnimatorInit, StyleAnimator} from "./StyleAnimator";
import {NumberStyleConstraintAnimator} from "./"; // forward import
import {LengthStyleConstraintAnimator} from "./"; // forward import

export interface StyleConstraintAnimatorInit<T = unknown, U = never> extends StyleAnimatorInit<T, U> {
  constrain?: boolean;
  strength?: AnyConstraintStrength;

  willStartConstraining?(): void;
  didStartConstraining?(): void;
  willStopConstraining?(): void;
  didStopConstraining?(): void;

  constraintValue?: T;
  toNumber?(value: T): number;
}

export type StyleConstraintAnimatorDescriptor<V = unknown, T = unknown, U = never, I = {}> = ThisType<StyleConstraintAnimator<V, T, U> & I> & StyleConstraintAnimatorInit<T, U> & Partial<I>;

export interface StyleConstraintAnimatorClass<A extends StyleConstraintAnimator<any, any> = StyleConstraintAnimator<any, any, any>> {
  /** @internal */
  prototype: A;

  create(owner: FastenerOwner<A>, animatorName: string): A;

  construct(animatorClass: {prototype: A}, animator: A | null, owner: FastenerOwner<A>, animatorName: string): A;

  specialize(type: unknown): StyleConstraintAnimatorClass | null;

  extend<I = {}>(classMembers?: Partial<I> | null): StyleConstraintAnimatorClass<A> & I;

  define<V, T, U = never>(descriptor: StyleConstraintAnimatorDescriptor<V, T, U>): StyleConstraintAnimatorClass<StyleConstraintAnimator<any, T, U>>;
  define<V, T, U = never, I = {}>(descriptor: StyleConstraintAnimatorDescriptor<V, T, U, I>): StyleConstraintAnimatorClass<StyleConstraintAnimator<any, T, U> & I>;

  <V, T extends Length | null | undefined = Length | null | undefined, U extends AnyLength | null | undefined = AnyLength | null | undefined>(descriptor: {type: typeof Length} & StyleConstraintAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V, T extends number | undefined = number | undefined, U extends number | string | undefined = number | string | undefined>(descriptor: {type: typeof Number} & StyleConstraintAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V, T, U = never>(descriptor: ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & StyleConstraintAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V, T, U = never>(descriptor: StyleConstraintAnimatorDescriptor<V, T, U>): PropertyDecorator;
  <V, T, U = never, I = {}>(descriptor: StyleConstraintAnimatorDescriptor<V, T, U, I>): PropertyDecorator;

  /** @internal */
  readonly ConstrainedFlag: FastenerFlags;
  /** @internal */
  readonly ConstrainingFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

export interface StyleConstraintAnimator<V = unknown, T = unknown, U = never> extends StyleAnimator<V, T, U>, ConstraintVariable {
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

  /** @internal @protected */
  readonly constraintValue?: T;
}

export const StyleConstraintAnimator = (function (_super: typeof StyleAnimator) {
  const StyleConstraintAnimator: StyleConstraintAnimatorClass = _super.extend();

  StyleConstraintAnimator.prototype.isExternal = function (this: StyleConstraintAnimator): boolean {
    return true;
  };

  StyleConstraintAnimator.prototype.isDummy = function (this: StyleConstraintAnimator): boolean {
    return false;
  };

  StyleConstraintAnimator.prototype.isInvalid = function (this: StyleConstraintAnimator): boolean {
    return false;
  };

  StyleConstraintAnimator.prototype.isConstant = function (this: StyleConstraintAnimator): boolean {
    return false;
  };

  StyleConstraintAnimator.prototype.evaluateConstraintVariable = function <T>(this: StyleConstraintAnimator<unknown, T>): void {
    const constraintScope = this.owner;
    if (ConstraintScope.is(constraintScope) && !this.constrained && this.constraining && !this.isDefined(this.value)) {
      const value = this.constraintValue;
      if (value !== void 0 && this.isDefined(value)) {
        constraintScope.setConstraintVariable(this, this.toNumber(value));
      }
    }
  };

  StyleConstraintAnimator.prototype.updateConstraintSolution = function <T>(this: StyleConstraintAnimator<unknown, T>, state: number): void {
    if (this.constrained && this.toNumber(this.state) !== state) {
      this.setState(state as unknown as T, Affinity.Reflexive);
    }
  };

  StyleConstraintAnimator.prototype.setStrength = function (this: StyleConstraintAnimator, strength: AnyConstraintStrength): void {
    (this as Mutable<typeof this>).strength = ConstraintStrength.fromAny(strength);
  };

  Object.defineProperty(StyleConstraintAnimator.prototype, "coefficient", {
    get(this: StyleConstraintAnimator): number {
      return 1;
    },
    configurable: true,
  });

  Object.defineProperty(StyleConstraintAnimator.prototype, "variable", {
    get(this: StyleConstraintAnimator): ConstraintVariable {
      return this;
    },
    configurable: true,
  });

  Object.defineProperty(StyleConstraintAnimator.prototype, "terms", {
    get(this: StyleConstraintAnimator): ConstraintMap<ConstraintVariable, number> {
      const terms = new ConstraintMap<ConstraintVariable, number>();
      terms.set(this, 1);
      return terms;
    },
    configurable: true,
  });

  Object.defineProperty(StyleConstraintAnimator.prototype, "constant", {
    get(this: StyleConstraintAnimator): number {
      return 0;
    },
    configurable: true,
  });

  StyleConstraintAnimator.prototype.plus = function (this: StyleConstraintAnimator, that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (this === that) {
      return ConstraintExpression.product(2, this);
    } else {
      return ConstraintExpression.sum(this, that);
    }
  };

  StyleConstraintAnimator.prototype.negative = function (this: StyleConstraintAnimator): ConstraintTerm {
    return ConstraintExpression.product(-1, this);
  };

  StyleConstraintAnimator.prototype.minus = function (this: StyleConstraintAnimator, that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (this === that) {
      return ConstraintExpression.zero;
    } else {
      return ConstraintExpression.sum(this, that.negative());
    }
  };

  StyleConstraintAnimator.prototype.times = function (this: StyleConstraintAnimator, scalar: number): ConstraintExpression {
    return ConstraintExpression.product(scalar, this);
  };

  StyleConstraintAnimator.prototype.divide = function (this: StyleConstraintAnimator, scalar: number): ConstraintExpression {
    return ConstraintExpression.product(1 / scalar, this);
  };

  Object.defineProperty(StyleConstraintAnimator.prototype, "constrained", {
    get(this: StyleConstraintAnimator): boolean {
      return (this.flags & StyleConstraintAnimator.ConstrainedFlag) !== 0;
    },
    configurable: true,
  });

  StyleConstraintAnimator.prototype.constrain = function (this: StyleConstraintAnimator<unknown, unknown, unknown>, constrained?: boolean): typeof this {
    if (constrained === void 0) {
      constrained = true;
    }
    const flags = this.flags;
    if (constrained && (flags & StyleConstraintAnimator.ConstrainedFlag) === 0) {
      this.setFlags(flags | StyleConstraintAnimator.ConstrainedFlag);
      if (this.conditionCount !== 0 && this.mounted) {
        this.stopConstraining();
      }
    } else if (!constrained && (flags & StyleConstraintAnimator.ConstrainedFlag) !== 0) {
      this.setFlags(flags & ~StyleConstraintAnimator.ConstrainedFlag);
      if (this.conditionCount !== 0 && this.mounted) {
        this.startConstraining();
        this.updateConstraintVariable();
      }
    }
    return this;
  };

  StyleConstraintAnimator.prototype.addConstraintCondition = function (this: StyleConstraintAnimator, constraint: Constraint, solver: ConstraintSolver): void {
    (this as Mutable<typeof this>).conditionCount += 1;
    if (!this.constrained && this.conditionCount === 1 && this.mounted) {
      this.startConstraining();
      this.updateConstraintVariable();
    }
  };

  StyleConstraintAnimator.prototype.removeConstraintCondition = function (this: StyleConstraintAnimator, constraint: Constraint, solver: ConstraintSolver): void {
    (this as Mutable<typeof this>).conditionCount -= 1;
    if (!this.constrained && this.conditionCount === 0 && this.mounted) {
      this.stopConstraining();
    }
  };

  Object.defineProperty(StyleConstraintAnimator.prototype, "constraining", {
    get(this: StyleConstraintAnimator): boolean {
      return (this.flags & StyleConstraintAnimator.ConstrainingFlag) !== 0;
    },
    configurable: true,
  });

  StyleConstraintAnimator.prototype.startConstraining = function (this: StyleConstraintAnimator): void {
    if ((this.flags & StyleConstraintAnimator.ConstrainingFlag) === 0) {
      this.willStartConstraining();
      this.setFlags(this.flags | StyleConstraintAnimator.ConstrainingFlag);
      this.onStartConstraining();
      this.didStartConstraining();
    }
  };

  StyleConstraintAnimator.prototype.willStartConstraining = function (this: StyleConstraintAnimator): void {
    // hook
  };

  StyleConstraintAnimator.prototype.onStartConstraining = function (this: StyleConstraintAnimator): void {
    const constraintScope = this.owner;
    if (ConstraintScope.is(constraintScope)) {
      constraintScope.addConstraintVariable(this);
    }
  };

  StyleConstraintAnimator.prototype.didStartConstraining = function (this: StyleConstraintAnimator): void {
    // hook
  };

  StyleConstraintAnimator.prototype.stopConstraining = function (this: StyleConstraintAnimator): void {
    if ((this.flags & StyleConstraintAnimator.ConstrainingFlag) !== 0) {
      this.willStopConstraining();
      this.setFlags(this.flags & ~StyleConstraintAnimator.ConstrainingFlag);
      this.onStopConstraining();
      this.didStopConstraining();
    }
  };

  StyleConstraintAnimator.prototype.willStopConstraining = function (this: StyleConstraintAnimator): void {
    // hook
  };

  StyleConstraintAnimator.prototype.onStopConstraining = function (this: StyleConstraintAnimator): void {
    const constraintScope = this.owner;
    if (ConstraintScope.is(constraintScope)) {
      constraintScope.removeConstraintVariable(this);
    }
  };

  StyleConstraintAnimator.prototype.didStopConstraining = function (this: StyleConstraintAnimator): void {
    // hook
  };

  StyleConstraintAnimator.prototype.updateConstraintVariable = function (this: StyleConstraintAnimator): void {
    const constraintScope = this.owner;
    if (ConstraintScope.is(constraintScope)) {
      let value = this.value;
      if (!this.isDefined(value)) {
        value = this.constraintValue;
      }
      constraintScope.setConstraintVariable(this, this.toNumber(value));
    }
  };

  StyleConstraintAnimator.prototype.onSetValue = function <T>(this: StyleConstraintAnimator<unknown, T>, newValue: T, oldValue: T): void {
    _super.prototype.onSetValue.call(this, newValue, oldValue);
    const constraintScope = this.owner;
    if (this.constraining && ConstraintScope.is(constraintScope)) {
      constraintScope.setConstraintVariable(this, newValue !== void 0 && newValue !== null ? this.toNumber(newValue) : 0);
    }
  };

  StyleConstraintAnimator.prototype.onMount = function <T>(this: StyleConstraintAnimator<unknown, T>): void {
    _super.prototype.onMount.call(this);
    if (!this.constrained && this.conditionCount !== 0) {
      this.startConstraining();
    }
  };

  StyleConstraintAnimator.prototype.onUnmount = function <T>(this: StyleConstraintAnimator<unknown, T>): void {
    if (!this.constrained && this.conditionCount !== 0) {
      this.stopConstraining();
    }
    _super.prototype.onUnmount.call(this);
  };

  StyleConstraintAnimator.prototype.fromAny = function <T, U>(this: StyleConstraintAnimator<unknown, T, U>, value: T | U): T {
    if (typeof value === "string") {
      const number = +value;
      if (isFinite(number)) {
        return number as unknown as T;
      }
    }
    return value as T;
  };

  StyleConstraintAnimator.prototype.toNumber = function <T>(this: StyleConstraintAnimator<unknown, T>, value: T): number {
    return value !== void 0 && value !== null ? +value : 0;
  };

  StyleConstraintAnimator.construct = function <A extends StyleConstraintAnimator<any, any, any>>(animatorClass: {prototype: A}, animator: A | null, owner: FastenerOwner<A>, animatorName: string): A {
    animator = _super.construct(animatorClass, animator, owner, animatorName) as A;
    (animator as Mutable<typeof animator>).id = ConstraintKey.nextId();
    (animator as Mutable<typeof animator>).strength = ConstraintStrength.Strong;
    (animator as Mutable<typeof animator>).conditionCount = 0;
    return animator;
  };

  StyleConstraintAnimator.specialize = function (type: unknown): StyleConstraintAnimatorClass | null {
    if (type === Number) {
      return NumberStyleConstraintAnimator;
    } else if (type === Length) {
      return LengthStyleConstraintAnimator;
    }
    return null;
  };

  StyleConstraintAnimator.define = function <V, T, U>(descriptor: StyleConstraintAnimatorDescriptor<V, T, U>): StyleConstraintAnimatorClass<StyleConstraintAnimator<any, T, U>> {
    let superClass = descriptor.extends as StyleConstraintAnimatorClass | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const strength = descriptor.strength !== void 0 ? ConstraintStrength.fromAny(descriptor.strength) : void 0;
    const constrain = descriptor.constrain;
    const look = descriptor.look;
    const state = descriptor.state;
    const initState = descriptor.initState;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.strength;
    delete descriptor.constrain;
    delete descriptor.look;
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

    animatorClass.construct = function (animatorClass: {prototype: StyleConstraintAnimator<any, any, any>}, animator: StyleConstraintAnimator<V, T, U> | null, owner: V, animatorName: string): StyleConstraintAnimator<V, T, U> {
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
      if (look !== void 0) {
        (animator as Mutable<typeof animator>).look = look;
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

  (StyleConstraintAnimator as Mutable<typeof StyleConstraintAnimator>).ConstrainedFlag = 1 << (_super.FlagShift + 0);
  (StyleConstraintAnimator as Mutable<typeof StyleConstraintAnimator>).ConstrainingFlag = 1 << (_super.FlagShift + 1);

  (StyleConstraintAnimator as Mutable<typeof StyleConstraintAnimator>).FlagShift = _super.FlagShift + 2;
  (StyleConstraintAnimator as Mutable<typeof StyleConstraintAnimator>).FlagMask = (1 << StyleConstraintAnimator.FlagShift) - 1;

  return StyleConstraintAnimator;
})(StyleAnimator);
