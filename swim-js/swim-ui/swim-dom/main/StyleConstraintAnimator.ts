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
import type {LikeType} from "@swim/util";
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
import type {LengthUnits} from "@swim/math";
import type {LengthBasis} from "@swim/math";
import {Length} from "@swim/math";
import {PxLength} from "@swim/math";
import {EmLength} from "@swim/math";
import {RemLength} from "@swim/math";
import {PctLength} from "@swim/math";
import type {Look} from "@swim/theme";
import {StyleContext} from "./StyleAnimator";
import type {StyleAnimatorDescriptor} from "./StyleAnimator";
import type {StyleAnimatorClass} from "./StyleAnimator";
import {StyleAnimator} from "./StyleAnimator";

/** @public */
export interface StyleConstraintAnimatorDescriptor<R, T> extends StyleAnimatorDescriptor<R, T> {
  extends?: Proto<StyleConstraintAnimator<any, any, any>> | boolean | null;
  strength?: ConstraintStrengthLike;
  constrained?: boolean;
}

/** @public */
export interface StyleConstraintAnimatorClass<A extends StyleConstraintAnimator<any, any, any> = StyleConstraintAnimator> extends StyleAnimatorClass<A> {
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
export interface StyleConstraintAnimator<R = any, T = any, I extends any[] = [Look<NonNullable<T>> | T]> extends StyleAnimator<R, T, I>, ConstraintVariable {
  /** @override */
  get descriptorType(): Proto<StyleConstraintAnimatorDescriptor<R, T>>;

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

  /** @internal */
  toNumber(value: T): number;
}

/** @public */
export const StyleConstraintAnimator = (<R, T, I extends any[], A extends StyleConstraintAnimator<any, any, any>>() => StyleAnimator.extend<StyleConstraintAnimator<R, T, I>, StyleConstraintAnimatorClass<A>>("StyleConstraintAnimator", {
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

  get constraintValue(): T {
    return this.computedValue;
  },

  evaluateConstraintVariable(): void {
    const constraintScope = this.owner;
    if (!ConstraintScope[Symbol.hasInstance](constraintScope) || this.constrained || !this.constraining) {
      return;
    }
    const value = this.constraintValue;
    if (!this.definedValue(value)) {
      return;
    }
    constraintScope.setConstraintVariable(this, this.toNumber(value));
  },

  updateConstraintSolution(state: number): void {
    if (this.constrained && this.toNumber(this.state) !== state) {
      this.setState(state as unknown as T, Affinity.Reflexive);
    }
  },

  initStrength(): ConstraintStrength {
    let strength = (Object.getPrototypeOf(this) as StyleConstraintAnimator).strength as ConstraintStrength | undefined;
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
    return (this.flags & StyleConstraintAnimator.ConstrainedFlag) !== 0;
  },

  constrain(constrained?: boolean): typeof this {
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
    return (this.flags & StyleConstraintAnimator.ConstrainingFlag) !== 0;
  },

  startConstraining(): void {
    if ((this.flags & StyleConstraintAnimator.ConstrainingFlag) !== 0) {
      return;
    }
    this.willStartConstraining();
    this.setFlags(this.flags | StyleConstraintAnimator.ConstrainingFlag);
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
    if ((this.flags & StyleConstraintAnimator.ConstrainingFlag) === 0) {
      return;
    }
    this.willStopConstraining();
    this.setFlags(this.flags & ~StyleConstraintAnimator.ConstrainingFlag);
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
    if (ConstraintScope[Symbol.hasInstance](constraintScope)) {
      let value = this.value;
      if (!this.definedValue(value)) {
        value = this.constraintValue;
      }
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

  specialize(template: A extends {readonly descriptorType?: Proto<infer D>} ? D : never): FastenerClass<A> {
    let superClass = template.extends as FastenerClass<A> | null | undefined;
    if (superClass === void 0 || superClass === null) {
      const valueType = template.valueType;
      if (valueType === Number) {
        superClass = NumberStyleConstraintAnimator as unknown as FastenerClass<A>;
      } else if (valueType === Length) {
        superClass = LengthStyleConstraintAnimator as unknown as FastenerClass<A>;
      } else {
        superClass = this;
      }
    }
    return superClass;
  },

  refine(animatorClass: FastenerClass<StyleConstraintAnimator<any, any, any>>): void {
    super.refine(animatorClass);
    const animatorPrototype = animatorClass.prototype;

    let flagsInit = animatorPrototype.flagsInit;
    if (Object.prototype.hasOwnProperty.call(animatorPrototype, "constrained")) {
      if (animatorPrototype.constrained) {
        flagsInit |= StyleConstraintAnimator.ConstrainedFlag;
      } else {
        flagsInit &= ~StyleConstraintAnimator.ConstrainedFlag;
      }
      delete (animatorPrototype as StyleConstraintAnimatorDescriptor<any, any>).constrained;
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

  ConstrainedFlag: 1 << (StyleAnimator.FlagShift + 0),
  ConstrainingFlag: 1 << (StyleAnimator.FlagShift + 1),

  FlagShift: StyleAnimator.FlagShift + 2,
  FlagMask: (1 << (StyleAnimator.FlagShift + 2)) - 1,
}))();

/** @public */
export interface NumberStyleConstraintAnimator<R = any, T extends number | undefined = number | undefined, I extends any[] = [Look<NonNullable<T>> | T]> extends StyleConstraintAnimator<R, T, I> {
}

/** @public */
export const NumberStyleConstraintAnimator = (<R, T extends number | undefined, I extends any[], A extends NumberStyleConstraintAnimator<any, any, any>>() => StyleConstraintAnimator.extend<NumberStyleConstraintAnimator<R, T, I>, StyleConstraintAnimatorClass<A>>("NumberStyleConstraintAnimator", {
  valueType: Number,

  toNumber(value: T): number {
    return typeof value === "number" ? value : 0;
  },

  equalValues(newValue: T, oldValue: T): boolean {
    return newValue === oldValue;
  },

  parse(value: string): T {
    const number = +value;
    return isFinite(number) ? number as T : void 0 as T;
  },

  fromCssValue(value: CSSStyleValue): T {
    if (value instanceof CSSNumericValue) {
      return value.to("number").value as T;
    }
    return void 0 as T;
  },

  fromLike(value: T | LikeType<T>): T {
    if (typeof value === "number") {
      return value as T;
    }
    const number = +(value as any);
    return isFinite(number) ? number as T : void 0 as T;
  },
}))();

/** @public */
export interface LengthStyleConstraintAnimator<R = any, T extends Length | null | undefined = Length | null, I extends any[] = [Look<NonNullable<T>> | T]> extends StyleConstraintAnimator<R, T, I>, LengthBasis {
  get units(): LengthUnits | undefined;

  pxValue(basis?: LengthBasis | number, defaultValue?: number): number;

  emValue(basis?: LengthBasis | number, defaultValue?: number): number;

  remValue(basis?: LengthBasis | number, defaultValue?: number): number;

  pctValue(basis?: LengthBasis | number, defaultValue?: number): number;

  pxState(basis?: LengthBasis | number, defaultValue?: number): number;

  emState(basis?: LengthBasis | number, defaultValue?: number): number;

  remState(basis?: LengthBasis | number, defaultValue?: number): number;

  pctState(basis?: LengthBasis | number, defaultValue?: number): number;

  px(basis?: LengthBasis | number, defaultValue?: number): PxLength;

  em(basis?: LengthBasis | number, defaultValue?: number): EmLength;

  rem(basis?: LengthBasis | number, defaultValue?: number): RemLength;

  pct(basis?: LengthBasis | number, defaultValue?: number): PctLength;

  to(units: LengthUnits, basis?: LengthBasis | number, defaultValue?: number): Length;

  /** @override */
  get emUnit(): Node | number | undefined;

  /** @override */
  get remUnit(): number | undefined;

  /** @override */
  get pctUnit(): number | undefined;

  /** @override */
  parse(value: string): T;

  /** @override */
  fromCssValue(value: CSSStyleValue): T;

  /** @override */
  equalValues(newValue: T, oldValue: T | undefined): boolean;

  /** @override */
  fromLike(value: T | LikeType<T>): T;
}

/** @public */
export const LengthStyleConstraintAnimator = (<R, T extends Length | null | undefined, I extends any[], A extends LengthStyleConstraintAnimator<any, any, any>>() => StyleConstraintAnimator.extend<LengthStyleConstraintAnimator<R, T, I>, StyleConstraintAnimatorClass<A>>("LengthStyleConstraintAnimator", {
  valueType: Length,
  value: null as T,

  get units(): LengthUnits | undefined {
    const value = this.cssValue;
    return value !== void 0 && value !== null ? value.units : void 0;
  },

  pxValue(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.pxValue(basis);
  },

  emValue(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.emValue(basis);
  },

  remValue(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.remValue(basis);
  },

  pctValue(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.pctValue(basis);
  },

  pxState(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssState;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.pxValue(basis);
  },

  emState(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssState;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.emValue(basis);
  },

  remState(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssState;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.remValue(basis);
  },

  pctState(basis?: LengthBasis | number, defaultValue?: number): number {
    const value = this.cssState;
    if (value === void 0 || value === null) {
      return defaultValue !== void 0 ? defaultValue : 0;
    } else if (basis === void 0) {
      basis = this;
    }
    return value.pctValue(basis);
  },

  px(basis?: LengthBasis | number, defaultValue?: number): PxLength {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return PxLength.of(defaultValue !== void 0 ? defaultValue : 0);
    } else if (basis === void 0) {
      basis = this;
    }
    return value.px(basis);
  },

  em(basis?: LengthBasis | number, defaultValue?: number): EmLength {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return EmLength.of(defaultValue !== void 0 ? defaultValue : 0);
    } else if (basis === void 0) {
      basis = this;
    }
    return value.em(basis);
  },

  rem(basis?: LengthBasis | number, defaultValue?: number): RemLength {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return RemLength.of(defaultValue !== void 0 ? defaultValue : 0);
    } else if (basis === void 0) {
      basis = this;
    }
    return value.rem(basis);
  },

  pct(basis?: LengthBasis | number, defaultValue?: number): PctLength {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return PctLength.of(defaultValue !== void 0 ? defaultValue : 0);
    } else if (basis === void 0) {
      basis = this;
    }
    return value.pct(basis);
  },

  to(units: LengthUnits, basis?: LengthBasis | number, defaultValue?: number): Length {
    const value = this.cssValue;
    if (value === void 0 || value === null) {
      return Length.of(defaultValue !== void 0 ? defaultValue : 0, units);
    } else if (basis === void 0) {
      basis = this;
    }
    return value.to(units, basis);
  },

  get emUnit(): Node | number | undefined {
    const styleContext = this.owner;
    if (StyleContext[Symbol.hasInstance](styleContext)) {
      const node = styleContext.node;
      if (node !== void 0) {
        return node;
      }
    }
    return 0;
  },

  get remUnit(): number {
    return 0;
  },

  get pctUnit(): number {
    return 0;
  },

  toNumber(value: T): number {
    return value !== void 0 && value !== null ? value.pxValue() : 0;
  },

  equalValues(newValue: T, oldValue: T): boolean {
    return newValue === oldValue;
  },

  parse(value: string): T {
    return Length.parse(value) as T;
  },

  fromCssValue(value: CSSStyleValue): T {
    return Length.fromCssValue(value) as T;
  },

  fromLike(value: T | LikeType<T>): T {
    try {
      return Length.fromLike(value) as T;
    } catch (swallow) {
      return null as T;
    }
  },
}))();
