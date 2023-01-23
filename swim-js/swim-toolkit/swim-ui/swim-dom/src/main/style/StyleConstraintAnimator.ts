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

import type {Mutable, Proto} from "@swim/util";
import {
  Affinity,
  FastenerFlags,
  FastenerOwner,
  AnimatorValue,
  AnimatorValueInit,
} from "@swim/component";
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
import {Length} from "@swim/math";
import {StyleAnimatorDescriptor, StyleAnimatorClass, StyleAnimator} from "./StyleAnimator";
import {NumberStyleConstraintAnimator} from "./"; // forward import
import {LengthStyleConstraintAnimator} from "./"; // forward import

/** @public */
export interface StyleConstraintAnimatorDescriptor<T = unknown, U = T> extends StyleAnimatorDescriptor<T, U> {
  extends?: Proto<StyleConstraintAnimator<any, any, any>> | string | boolean | null;
  strength?: AnyConstraintStrength;
  constrained?: boolean;
}

/** @public */
export type StyleConstraintAnimatorTemplate<A extends StyleConstraintAnimator<any, any, any>> =
  ThisType<A> &
  StyleConstraintAnimatorDescriptor<AnimatorValue<A>, AnimatorValueInit<A>> &
  Partial<Omit<A, keyof StyleConstraintAnimatorDescriptor>>;

/** @public */
export interface StyleConstraintAnimatorClass<A extends StyleConstraintAnimator<any, any> = StyleConstraintAnimator<any, any, any>> extends StyleAnimatorClass<A> {
  /** @override */
  specialize(template: StyleConstraintAnimatorDescriptor<any, any>): StyleConstraintAnimatorClass<A>;

  /** @override */
  refine(animatorClass: StyleConstraintAnimatorClass<any>): void;

  /** @override */
  extend<A2 extends A>(className: string, template: StyleConstraintAnimatorTemplate<A2>): StyleConstraintAnimatorClass<A2>;
  extend<A2 extends A>(className: string, template: StyleConstraintAnimatorTemplate<A2>): StyleConstraintAnimatorClass<A2>;

  /** @override */
  define<A2 extends A>(className: string, template: StyleConstraintAnimatorTemplate<A2>): StyleConstraintAnimatorClass<A2>;
  define<A2 extends A>(className: string, template: StyleConstraintAnimatorTemplate<A2>): StyleConstraintAnimatorClass<A2>;

  /** @override */
  <A2 extends A>(template: StyleConstraintAnimatorTemplate<A2>): PropertyDecorator;

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
export interface StyleConstraintAnimator<O = unknown, T = unknown, U = T> extends StyleAnimator<O, T, U>, ConstraintVariable {
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

  /** @internal */
  get constraintValue(): T;

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

  /** @internal */
  toNumber(value: T): number;
}

/** @public */
export const StyleConstraintAnimator = (function (_super: typeof StyleAnimator) {
  const StyleConstraintAnimator = _super.extend("StyleConstraintAnimator", {}) as StyleConstraintAnimatorClass;

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

  Object.defineProperty(StyleConstraintAnimator.prototype, "constraintValue", {
    get<T>(this: StyleConstraintAnimator<unknown, T>): T {
      return this.computedValue;
    },
    configurable: true,
  });

  StyleConstraintAnimator.prototype.evaluateConstraintVariable = function <T>(this: StyleConstraintAnimator<unknown, T>): void {
    const constraintScope = this.owner;
    if (ConstraintScope.is(constraintScope) && !this.constrained && this.constraining) {
      const value = this.constraintValue;
      if (this.definedValue(value)) {
        constraintScope.setConstraintVariable(this, this.toNumber(value));
      }
    }
  };

  StyleConstraintAnimator.prototype.updateConstraintSolution = function <T>(this: StyleConstraintAnimator<unknown, T>, state: number): void {
    if (this.constrained && this.toNumber(this.state) !== state) {
      this.setState(state as unknown as T, Affinity.Reflexive);
    }
  };

  StyleConstraintAnimator.prototype.initStrength = function (this: StyleConstraintAnimator): ConstraintStrength {
    let strength = (Object.getPrototypeOf(this) as StyleConstraintAnimator).strength as ConstraintStrength | undefined;
    if (strength === void 0) {
      strength = ConstraintStrength.Strong;
    }
    return strength;
  };

  StyleConstraintAnimator.prototype.setStrength = function (this: StyleConstraintAnimator, strength: AnyConstraintStrength): void {
    (this as Mutable<typeof this>).strength = ConstraintStrength.fromAny(strength);
  };

  Object.defineProperty(StyleConstraintAnimator.prototype, "coefficient", {
    value: 1,
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
    value: 0,
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
      if (!this.definedValue(value)) {
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

  StyleConstraintAnimator.prototype.toNumber = function <T>(this: StyleConstraintAnimator<unknown, T>, value: T): number {
    return value !== void 0 && value !== null ? +value : 0;
  };

  StyleConstraintAnimator.construct = function <A extends StyleConstraintAnimator<any, any>>(animator: A | null, owner: FastenerOwner<A>): A {
    animator = _super.construct.call(this, animator, owner) as A;
    (animator as Mutable<typeof animator>).id = ConstraintId.next();
    (animator as Mutable<typeof animator>).strength = animator.initStrength();
    (animator as Mutable<typeof animator>).conditionCount = 0;
    const flagsInit = animator.flagsInit;
    if (flagsInit !== void 0) {
      animator.constrain((flagsInit & StyleConstraintAnimator.ConstrainedFlag) !== 0);
    }
    return animator;
  };

  StyleConstraintAnimator.specialize = function (template: StyleConstraintAnimatorDescriptor<any, any>): StyleConstraintAnimatorClass {
    let superClass = template.extends as StyleConstraintAnimatorClass | null | undefined;
    if (superClass === void 0 || superClass === null) {
      const valueType = template.valueType;
      if (valueType === Number) {
        superClass = NumberStyleConstraintAnimator;
      } else if (valueType === Length) {
        superClass = LengthStyleConstraintAnimator;
      } else {
        superClass = this;
      }
    }
    return superClass
  };

  StyleConstraintAnimator.refine = function (animatorClass: StyleConstraintAnimatorClass<any>): void {
    _super.refine.call(this, animatorClass);
    const animatorPrototype = animatorClass.prototype;
    let flagsInit = animatorPrototype.flagsInit;

    if (Object.prototype.hasOwnProperty.call(animatorPrototype, "constrained")) {
      if (flagsInit === void 0) {
        flagsInit = 0;
      }
      if (animatorPrototype.constrained) {
        flagsInit |= StyleConstraintAnimator.ConstrainedFlag;
      } else {
        flagsInit &= ~StyleConstraintAnimator.ConstrainedFlag;
      }
      delete (animatorPrototype as StyleConstraintAnimatorDescriptor).constrained;
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

  (StyleConstraintAnimator as Mutable<typeof StyleConstraintAnimator>).ConstrainedFlag = 1 << (_super.FlagShift + 0);
  (StyleConstraintAnimator as Mutable<typeof StyleConstraintAnimator>).ConstrainingFlag = 1 << (_super.FlagShift + 1);

  (StyleConstraintAnimator as Mutable<typeof StyleConstraintAnimator>).FlagShift = _super.FlagShift + 2;
  (StyleConstraintAnimator as Mutable<typeof StyleConstraintAnimator>).FlagMask = (1 << StyleConstraintAnimator.FlagShift) - 1;

  return StyleConstraintAnimator;
})(StyleAnimator);
