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

import {Mutable, FromAny} from "@swim/util";
import {Affinity, FastenerOwner, FastenerFlags} from "@swim/component";
import {
  ConstraintId,
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
import {ThemeAnimatorInit, ThemeAnimatorClass, ThemeAnimator} from "./ThemeAnimator";
import {NumberThemeConstraintAnimator} from "./"; // forward import
import {LengthThemeConstraintAnimator} from "./"; // forward import

/** @public */
export interface ThemeConstraintAnimatorInit<T = unknown, U = T> extends ThemeAnimatorInit<T, U> {
  extends?: {prototype: ThemeConstraintAnimator<any, any>} | string | boolean | null;
  constrain?: boolean;
  strength?: AnyConstraintStrength;

  willStartConstraining?(): void;
  didStartConstraining?(): void;
  willStopConstraining?(): void;
  didStopConstraining?(): void;

  toNumber?(value: T): number;
}

/** @public */
export type ThemeConstraintAnimatorDescriptor<O = unknown, T = unknown, U = T, I = {}> = ThisType<ThemeConstraintAnimator<O, T, U> & I> & ThemeConstraintAnimatorInit<T, U> & Partial<I>;

/** @public */
export interface ThemeConstraintAnimatorClass<A extends ThemeConstraintAnimator<any, any> = ThemeConstraintAnimator<any, any>> extends ThemeAnimatorClass<A> {
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
export interface ThemeConstraintAnimatorFactory<A extends ThemeConstraintAnimator<any, any> = ThemeConstraintAnimator<any, any>> extends ThemeConstraintAnimatorClass<A> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ThemeConstraintAnimatorFactory<A> & I;

  specialize(type: unknown): ThemeConstraintAnimatorFactory | null;

  define<O, T, U = T>(className: string, descriptor: ThemeConstraintAnimatorDescriptor<O, T, U>): ThemeConstraintAnimatorFactory<ThemeConstraintAnimator<any, T, U>>;
  define<O, T, U = T, I = {}>(className: string, descriptor: {implements: unknown} & ThemeConstraintAnimatorDescriptor<O, T, U, I>): ThemeConstraintAnimatorFactory<ThemeConstraintAnimator<any, T, U> & I>;

  <O, T extends Length | null | undefined = Length | null | undefined, U extends AnyLength | null | undefined = AnyLength | null | undefined>(descriptor: {type: typeof Length} & ThemeConstraintAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T extends number | null | undefined = number | null | undefined, U extends number | string | null | undefined = number | string | null | undefined>(descriptor: {type: typeof Number} & ThemeConstraintAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T>(descriptor: ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ThemeConstraintAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T>(descriptor: ThemeConstraintAnimatorDescriptor<O, T, U>): PropertyDecorator;
  <O, T, U = T, I = {}>(descriptor: {implements: unknown} & ThemeConstraintAnimatorDescriptor<O, T, U, I>): PropertyDecorator;
}

/** @public */
export interface ThemeConstraintAnimator<O = unknown, T = unknown, U = T> extends ThemeAnimator<O, T, U>, ConstraintVariable {
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

/** @public */
export const ThemeConstraintAnimator = (function (_super: typeof ThemeAnimator) {
  const ThemeConstraintAnimator: ThemeConstraintAnimatorFactory = _super.extend("ThemeConstraintAnimator");

  ThemeConstraintAnimator.prototype.isExternal = function (this: ThemeConstraintAnimator): boolean {
    return true;
  };

  ThemeConstraintAnimator.prototype.isDummy = function (this: ThemeConstraintAnimator): boolean {
    return false;
  };

  ThemeConstraintAnimator.prototype.isInvalid = function (this: ThemeConstraintAnimator): boolean {
    return false;
  };

  ThemeConstraintAnimator.prototype.isConstant = function (this: ThemeConstraintAnimator): boolean {
    return false;
  };

  ThemeConstraintAnimator.prototype.evaluateConstraintVariable = function <T>(this: ThemeConstraintAnimator<unknown, T>): void {
    // hook
  };

  ThemeConstraintAnimator.prototype.updateConstraintSolution = function <T>(this: ThemeConstraintAnimator<unknown, T>, state: number): void {
    if (this.constrained && this.toNumber(this.state) !== state) {
      this.setState(state as unknown as T, Affinity.Reflexive);
    }
  };

  ThemeConstraintAnimator.prototype.setStrength = function (this: ThemeConstraintAnimator, strength: AnyConstraintStrength): void {
    (this as Mutable<typeof this>).strength = ConstraintStrength.fromAny(strength);
  };

  Object.defineProperty(ThemeConstraintAnimator.prototype, "coefficient", {
    get(this: ThemeConstraintAnimator): number {
      return 1;
    },
    configurable: true,
  });

  Object.defineProperty(ThemeConstraintAnimator.prototype, "variable", {
    get(this: ThemeConstraintAnimator): ConstraintVariable {
      return this;
    },
    configurable: true,
  });

  Object.defineProperty(ThemeConstraintAnimator.prototype, "terms", {
    get(this: ThemeConstraintAnimator): ConstraintMap<ConstraintVariable, number> {
      const terms = new ConstraintMap<ConstraintVariable, number>();
      terms.set(this, 1);
      return terms;
    },
    configurable: true,
  });

  Object.defineProperty(ThemeConstraintAnimator.prototype, "constant", {
    get(this: ThemeConstraintAnimator): number {
      return 0;
    },
    configurable: true,
  });

  ThemeConstraintAnimator.prototype.plus = function (this: ThemeConstraintAnimator, that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (this === that) {
      return ConstraintExpression.product(2, this);
    } else {
      return ConstraintExpression.sum(this, that);
    }
  };

  ThemeConstraintAnimator.prototype.negative = function (this: ThemeConstraintAnimator): ConstraintTerm {
    return ConstraintExpression.product(-1, this);
  };

  ThemeConstraintAnimator.prototype.minus = function (this: ThemeConstraintAnimator, that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (this === that) {
      return ConstraintExpression.zero;
    } else {
      return ConstraintExpression.sum(this, that.negative());
    }
  };

  ThemeConstraintAnimator.prototype.times = function (this: ThemeConstraintAnimator, scalar: number): ConstraintExpression {
    return ConstraintExpression.product(scalar, this);
  };

  ThemeConstraintAnimator.prototype.divide = function (this: ThemeConstraintAnimator, scalar: number): ConstraintExpression {
    return ConstraintExpression.product(1 / scalar, this);
  };

  Object.defineProperty(ThemeConstraintAnimator.prototype, "constrained", {
    get(this: ThemeConstraintAnimator): boolean {
      return (this.flags & ThemeConstraintAnimator.ConstrainedFlag) !== 0;
    },
    configurable: true,
  });

  ThemeConstraintAnimator.prototype.constrain = function (this: ThemeConstraintAnimator<unknown, unknown, unknown>, constrained?: boolean): typeof this {
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
  };

  ThemeConstraintAnimator.prototype.addConstraintCondition = function (this: ThemeConstraintAnimator, constraint: Constraint, solver: ConstraintSolver): void {
    (this as Mutable<typeof this>).conditionCount += 1;
    if (!this.constrained && this.conditionCount === 1 && this.mounted) {
      this.startConstraining();
      this.updateConstraintVariable();
    }
  };

  ThemeConstraintAnimator.prototype.removeConstraintCondition = function (this: ThemeConstraintAnimator, constraint: Constraint, solver: ConstraintSolver): void {
    (this as Mutable<typeof this>).conditionCount -= 1;
    if (!this.constrained && this.conditionCount === 0 && this.mounted) {
      this.stopConstraining();
    }
  };

  Object.defineProperty(ThemeConstraintAnimator.prototype, "constraining", {
    get(this: ThemeConstraintAnimator): boolean {
      return (this.flags & ThemeConstraintAnimator.ConstrainingFlag) !== 0;
    },
    configurable: true,
  });

  ThemeConstraintAnimator.prototype.startConstraining = function (this: ThemeConstraintAnimator): void {
    if ((this.flags & ThemeConstraintAnimator.ConstrainingFlag) === 0) {
      this.willStartConstraining();
      this.setFlags(this.flags | ThemeConstraintAnimator.ConstrainingFlag);
      this.onStartConstraining();
      this.didStartConstraining();
    }
  };

  ThemeConstraintAnimator.prototype.willStartConstraining = function (this: ThemeConstraintAnimator): void {
    // hook
  };

  ThemeConstraintAnimator.prototype.onStartConstraining = function (this: ThemeConstraintAnimator): void {
    const constraintScope = this.owner;
    if (ConstraintScope.is(constraintScope)) {
      constraintScope.addConstraintVariable(this);
    }
  };

  ThemeConstraintAnimator.prototype.didStartConstraining = function (this: ThemeConstraintAnimator): void {
    // hook
  };

  ThemeConstraintAnimator.prototype.stopConstraining = function (this: ThemeConstraintAnimator): void {
    if ((this.flags & ThemeConstraintAnimator.ConstrainingFlag) !== 0) {
      this.willStopConstraining();
      this.setFlags(this.flags & ~ThemeConstraintAnimator.ConstrainingFlag);
      this.onStopConstraining();
      this.didStopConstraining();
    }
  };

  ThemeConstraintAnimator.prototype.willStopConstraining = function (this: ThemeConstraintAnimator): void {
    // hook
  };

  ThemeConstraintAnimator.prototype.onStopConstraining = function (this: ThemeConstraintAnimator): void {
    const constraintScope = this.owner;
    if (ConstraintScope.is(constraintScope)) {
      constraintScope.removeConstraintVariable(this);
    }
  };

  ThemeConstraintAnimator.prototype.didStopConstraining = function (this: ThemeConstraintAnimator): void {
    // hook
  };

  ThemeConstraintAnimator.prototype.updateConstraintVariable = function (this: ThemeConstraintAnimator): void {
    const constraintScope = this.owner;
    const value = this.value;
    if (value !== void 0 && ConstraintScope.is(constraintScope)) {
      constraintScope.setConstraintVariable(this, this.toNumber(value));
    }
  };

  ThemeConstraintAnimator.prototype.onSetValue = function <T>(this: ThemeConstraintAnimator<unknown, T>, newValue: T, oldValue: T): void {
    _super.prototype.onSetValue.call(this, newValue, oldValue);
    const constraintScope = this.owner;
    if (this.constraining && ConstraintScope.is(constraintScope)) {
      constraintScope.setConstraintVariable(this, newValue !== void 0 && newValue !== null ? this.toNumber(newValue) : 0);
    }
  };

  ThemeConstraintAnimator.prototype.onMount = function <T>(this: ThemeConstraintAnimator<unknown, T>): void {
    _super.prototype.onMount.call(this);
    if (!this.constrained && this.conditionCount !== 0) {
      this.startConstraining();
    }
  };

  ThemeConstraintAnimator.prototype.onUnmount = function <T>(this: ThemeConstraintAnimator<unknown, T>): void {
    if (!this.constrained && this.conditionCount !== 0) {
      this.stopConstraining();
    }
    _super.prototype.onUnmount.call(this);
  };

  ThemeConstraintAnimator.prototype.fromAny = function <T, U>(this: ThemeConstraintAnimator<unknown, T, U>, value: T | U): T {
    if (typeof value === "string") {
      const number = +value;
      if (isFinite(number)) {
        return number as unknown as T;
      }
    }
    return value as T;
  };

  ThemeConstraintAnimator.prototype.toNumber = function <T>(this: ThemeConstraintAnimator<unknown, T>, value: T): number {
    return value !== void 0 && value !== null ? +value : 0;
  };

  ThemeConstraintAnimator.construct = function <A extends ThemeConstraintAnimator<any, any>>(animatorClass: {prototype: A}, animator: A | null, owner: FastenerOwner<A>): A {
    animator = _super.construct(animatorClass, animator, owner) as A;
    (animator as Mutable<typeof animator>).id = ConstraintId.next();
    (animator as Mutable<typeof animator>).strength = ConstraintStrength.Strong;
    (animator as Mutable<typeof animator>).conditionCount = 0;
    return animator;
  };

  ThemeConstraintAnimator.specialize = function (type: unknown): ThemeConstraintAnimatorFactory | null {
  if (type === Number) {
    return NumberThemeConstraintAnimator;
  } else if (type === Length) {
    return LengthThemeConstraintAnimator;
  }
    return null;
  };

  ThemeConstraintAnimator.define = function <O, T, U>(className: string, descriptor: ThemeConstraintAnimatorDescriptor<O, T, U>): ThemeConstraintAnimatorFactory<ThemeConstraintAnimator<any, T, U>> {
    let superClass = descriptor.extends as ThemeConstraintAnimatorFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const strength = descriptor.strength !== void 0 ? ConstraintStrength.fromAny(descriptor.strength) : void 0;
    const constrain = descriptor.constrain;
    const look = descriptor.look;
    const value = descriptor.value;
    const initValue = descriptor.initValue;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.strength;
    delete descriptor.constrain;
    delete descriptor.look;
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

    const animatorClass = superClass.extend(className, descriptor);

    animatorClass.construct = function (animatorClass: {prototype: ThemeConstraintAnimator<any, any>}, animator: ThemeConstraintAnimator<O, T, U> | null, owner: O): ThemeConstraintAnimator<O, T, U> {
      animator = superClass!.construct(animatorClass, animator, owner);
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
      if (initValue !== void 0) {
        (animator as Mutable<typeof animator>).value = animator.fromAny(initValue());
        (animator as Mutable<typeof animator>).state = animator.value;
      } else if (value !== void 0) {
        (animator as Mutable<typeof animator>).value = animator.fromAny(value);
        (animator as Mutable<typeof animator>).state = animator.value;
      }
      if (constrain === true) {
        animator.constrain();
      }
      return animator;
    };

    return animatorClass;
  };

  (ThemeConstraintAnimator as Mutable<typeof ThemeConstraintAnimator>).ConstrainedFlag = 1 << (_super.FlagShift + 0);
  (ThemeConstraintAnimator as Mutable<typeof ThemeConstraintAnimator>).ConstrainingFlag = 1 << (_super.FlagShift + 1);

  (ThemeConstraintAnimator as Mutable<typeof ThemeConstraintAnimator>).FlagShift = _super.FlagShift + 2;
  (ThemeConstraintAnimator as Mutable<typeof ThemeConstraintAnimator>).FlagMask = (1 << ThemeConstraintAnimator.FlagShift) - 1;

  return ThemeConstraintAnimator;
})(ThemeAnimator);
