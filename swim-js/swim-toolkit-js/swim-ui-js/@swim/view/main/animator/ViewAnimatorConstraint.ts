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

import {__extends} from "tslib";
import {FromAny, Mutable} from "@swim/util";
import type {AnyTiming} from "@swim/mapping";
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
  ConstraintSolver,
} from "@swim/constraint";
import {AnyLength, Length} from "@swim/math";
import {ViewPrecedence, View} from "../View";
import {Animator} from "./Animator";
import {ViewAnimatorInit, ViewAnimator} from "./ViewAnimator";
import {NumberViewAnimatorConstraint} from "../"; // forward import
import {LengthViewAnimatorConstraint} from "../"; // forward import

export interface ViewAnimatorConstraintInit<T, U = never> extends ViewAnimatorInit<T, U> {
  extends?: ViewAnimatorConstraintClass;

  constrain?: boolean;
  strength?: AnyConstraintStrength;
  toNumber?(value: T): number;
}

export type ViewAnimatorConstraintDescriptor<V extends View, T, U = never, I = {}> = ViewAnimatorConstraintInit<T, U> & ThisType<ViewAnimatorConstraint<V, T, U> & I> & Partial<I>;

export type ViewAnimatorConstraintDescriptorExtends<V extends View, T, U = never, I = {}> = {extends: ViewAnimatorConstraintClass | undefined} & ViewAnimatorConstraintDescriptor<V, T, U, I>;

export type ViewAnimatorConstraintDescriptorFromAny<V extends View, T, U = never, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ViewAnimatorConstraintDescriptor<V, T, U, I>;

export interface ViewAnimatorConstraintConstructor<V extends View, T, U = never, I = {}> {
  new(owner: V, animatorName: string | undefined): ViewAnimatorConstraint<V, T, U> & I;
  prototype: ViewAnimatorConstraint<any, any> & I;
}

export interface ViewAnimatorConstraintClass extends Function {
  readonly prototype: ViewAnimatorConstraint<any, any>;
}

export interface ViewAnimatorConstraint<V extends View, T, U = never> extends ViewAnimator<V, T, U | number>, ConstraintVariable {
  readonly id: number;

  /** @hidden */
  isExternal(): boolean;

  /** @hidden */
  isDummy(): boolean;

  /** @hidden */
  isInvalid(): boolean;

  isConstant(): boolean;

  onSetValue(newValue: T, oldValue: T): void;

  evaluateConstraintVariable(): void;

  updateConstraintSolution(value: number): void;

  readonly strength: ConstraintStrength;

  readonly coefficient: number;

  readonly variable: ConstraintVariable | null;

  readonly terms: ConstraintMap<ConstraintVariable, number>;

  readonly constant: number;

  plus(that: AnyConstraintExpression): ConstraintExpression;

  negative(): ConstraintTerm;

  minus(that: AnyConstraintExpression): ConstraintExpression;

  times(scalar: number): ConstraintExpression;

  divide(scalar: number): ConstraintExpression;

  isConstrained(): boolean;

  constrain(constrained?: boolean): this;

  /** @hidden */
  readonly conditionCount: number;

  /** @hidden */
  addConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void;

  /** @hidden */
  removeConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void;

  /** @hidden */
  isConstraining(): boolean;

  /** @hidden */
  startConstraining(): void;

  /** @hidden */
  willStartConstraining(): void;

  /** @hidden */
  onStartConstraining(): void;

  /** @hidden */
  didStartConstraining(): void;

  /** @hidden */
  stopConstraining(): void;

  /** @hidden */
  willStopConstraining(): void;

  /** @hidden */
  onStopConstraining(): void;

  /** @hidden */
  didStopConstraining(): void;

  /** @hidden */
  updateConstraintVariable(): void;

  /** @hidden */
  onMount(): void;

  /** @hidden */
  onUnmount(): void;

  toNumber(value: T): number;
}

export const ViewAnimatorConstraint = function <V extends View, T, U>(
    this: ViewAnimatorConstraint<V, T, U> | typeof ViewAnimatorConstraint,
    owner: V | ViewAnimatorConstraintDescriptor<V, T, U>,
    animatorName?: string,
  ): ViewAnimatorConstraint<V, T, U> | PropertyDecorator {
  if (this instanceof ViewAnimatorConstraint) { // constructor
    return ViewAnimatorConstraintConstructor.call(this as ViewAnimatorConstraint<V, unknown, unknown>, owner as V, animatorName);
  } else { // decorator factory
    return ViewAnimatorConstraintDecoratorFactory(owner as ViewAnimatorConstraintDescriptor<V, T, U>);
  }
} as unknown as {
  new<V extends View, T, U = never>(owner: V, animatorName: string): ViewAnimatorConstraint<V, T, U>;

  <V extends View, T extends Length | null | undefined = Length | null | undefined, U extends AnyLength | null | undefined = AnyLength | null | undefined>(descriptor: {type: typeof Length} & ViewAnimatorConstraintDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T extends number | null | undefined = number | null | undefined, U extends number | string | null | undefined = number | string | null | undefined>(descriptor: {type: typeof Number} & ViewAnimatorConstraintDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T, U = never>(descriptor: ViewAnimatorConstraintDescriptorFromAny<V, T, U>): PropertyDecorator;
  <V extends View, T, U = never, I = {}>(descriptor: ViewAnimatorConstraintDescriptorExtends<V, T, U, I>): PropertyDecorator;
  <V extends View, T, U = never>(descriptor: ViewAnimatorConstraintDescriptor<V, T, U>): PropertyDecorator;

  /** @hidden */
  prototype: ViewAnimatorConstraint<any, any>;

  /** @hidden */
  getClass(type: unknown): ViewAnimatorConstraintClass | null;

  define<V extends View, T, U = never, I = {}>(descriptor: ViewAnimatorConstraintDescriptorExtends<V, T, U, I>): ViewAnimatorConstraintConstructor<V, T, U, I>;
  define<V extends View, T, U = never>(descriptor: ViewAnimatorConstraintDescriptor<V, T, U>): ViewAnimatorConstraintConstructor<V, T, U>;
};
__extends(ViewAnimatorConstraint, ViewAnimator);

function ViewAnimatorConstraintConstructor<V extends View, T, U>(this: ViewAnimatorConstraint<V, T, U>, owner: V, animatorName: string | undefined): ViewAnimatorConstraint<V, T, U> {
  const _this: ViewAnimatorConstraint<V, T, U> = (ViewAnimator as Function).call(this, owner, animatorName) || this;
  (_this as Mutable<typeof _this>).id = ConstraintKey.nextId();
  (_this as Mutable<typeof _this>).strength = ConstraintStrength.Strong;
  (_this as Mutable<typeof _this>).conditionCount = 0;
  return _this;
}

function ViewAnimatorConstraintDecoratorFactory<V extends View, T, U>(descriptor: ViewAnimatorConstraintDescriptor<V, T, U>): PropertyDecorator {
  return View.decorateViewAnimator.bind(ViewAnimatorConstraint, ViewAnimatorConstraint.define(descriptor as ViewAnimatorConstraintDescriptor<View, unknown>));
}

ViewAnimatorConstraint.prototype.isExternal = function (this: ViewAnimatorConstraint<View, unknown>): boolean {
  return true;
};

ViewAnimatorConstraint.prototype.isDummy = function (this: ViewAnimatorConstraint<View, unknown>): boolean {
  return false;
};

ViewAnimatorConstraint.prototype.isInvalid = function (this: ViewAnimatorConstraint<View, unknown>): boolean {
  return false;
};

ViewAnimatorConstraint.prototype.isConstant = function (this: ViewAnimatorConstraint<View, unknown>): boolean {
  return false;
};

ViewAnimatorConstraint.prototype.onSetValue = function <T>(this: ViewAnimatorConstraint<View, T>, newValue: T, oldValue: T): void {
  ViewAnimator.prototype.onSetValue.call(this, newValue, oldValue);
  if (this.isConstraining()) {
    this.owner.setConstraintVariable(this, this.toNumber(newValue));
  }
};

ViewAnimatorConstraint.prototype.evaluateConstraintVariable = function <T>(this: ViewAnimatorConstraint<View, T>): void {
  // nop
};

ViewAnimatorConstraint.prototype.updateConstraintSolution = function <T>(this: ViewAnimatorConstraint<View, T>, newState: number): void {
  if (this.isConstrained() && this.toNumber(this.state) !== newState) {
    Animator.prototype.setState.call(this, this.fromAny(newState));
  }
};

Object.defineProperty(ViewAnimatorConstraint.prototype, "coefficient", {
  get(this: ViewAnimatorConstraint<View, unknown>): number {
    return 1;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewAnimatorConstraint.prototype, "variable", {
  get(this: ViewAnimatorConstraint<View, unknown>): ConstraintVariable {
    return this;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewAnimatorConstraint.prototype, "terms", {
  get(this: ViewAnimatorConstraint<View, unknown>): ConstraintMap<ConstraintVariable, number> {
    const terms = new ConstraintMap<ConstraintVariable, number>();
    terms.set(this, 1);
    return terms;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewAnimatorConstraint.prototype, "constant", {
  get(this: ViewAnimatorConstraint<View, unknown>): number {
    return 0;
  },
  enumerable: true,
  configurable: true,
});

ViewAnimatorConstraint.prototype.plus = function (this: ViewAnimatorConstraint<View, unknown>, that: AnyConstraintExpression): ConstraintExpression {
  that = ConstraintExpression.fromAny(that);
  if (this === that) {
    return ConstraintExpression.product(2, this);
  } else {
    return ConstraintExpression.sum(this, that);
  }
};

ViewAnimatorConstraint.prototype.negative = function (this: ViewAnimatorConstraint<View, unknown>): ConstraintTerm {
  return ConstraintExpression.product(-1, this);
};

ViewAnimatorConstraint.prototype.minus = function (this: ViewAnimatorConstraint<View, unknown>, that: AnyConstraintExpression): ConstraintExpression {
  that = ConstraintExpression.fromAny(that);
  if (this === that) {
    return ConstraintExpression.zero;
  } else {
    return ConstraintExpression.sum(this, that.negative());
  }
};

ViewAnimatorConstraint.prototype.times = function (this: ViewAnimatorConstraint<View, unknown>, scalar: number): ConstraintExpression {
  return ConstraintExpression.product(scalar, this);
};

ViewAnimatorConstraint.prototype.divide = function (this: ViewAnimatorConstraint<View, unknown>, scalar: number): ConstraintExpression {
  return ConstraintExpression.product(1 / scalar, this);
};

ViewAnimatorConstraint.prototype.isConstrained = function (this: ViewAnimatorConstraint<View, unknown>): boolean {
  return (this.animatorFlags & Animator.ConstrainedFlag) !== 0;
};

ViewAnimatorConstraint.prototype.constrain = function (this: ViewAnimatorConstraint<View, unknown>, constrained?: boolean): ViewAnimatorConstraint<View, unknown> {
  if (constrained === void 0) {
    constrained = true;
  }
  const animatorFlags = this.animatorFlags;
  if (constrained && (animatorFlags & Animator.ConstrainedFlag) === 0) {
    this.setAnimatorFlags(animatorFlags | Animator.ConstrainedFlag);
    if (this.conditionCount !== 0 && this.isMounted()) {
      this.stopConstraining();
    }
  } else if (!constrained && (animatorFlags & Animator.ConstrainedFlag) !== 0) {
    this.setAnimatorFlags(animatorFlags & ~Animator.ConstrainedFlag);
    if (this.conditionCount !== 0 && this.isMounted()) {
      this.startConstraining();
      this.updateConstraintVariable();
    }
  }
  return this;
};

ViewAnimatorConstraint.prototype.addConstraintCondition = function (this: ViewAnimatorConstraint<View, unknown>, constraint: Constraint, solver: ConstraintSolver): void {
  (this as Mutable<typeof this>).conditionCount += 1;
  if (!this.isConstrained() && this.conditionCount === 1 && this.isMounted()) {
    this.startConstraining();
    this.updateConstraintVariable();
  }
};

ViewAnimatorConstraint.prototype.removeConstraintCondition = function (this: ViewAnimatorConstraint<View, unknown>, constraint: Constraint, solver: ConstraintSolver): void {
  (this as Mutable<typeof this>).conditionCount -= 1;
  if (!this.isConstrained() && this.conditionCount === 0 && this.isMounted()) {
    this.stopConstraining();
  }
};

ViewAnimatorConstraint.prototype.isConstraining = function (this: ViewAnimatorConstraint<View, unknown>): boolean {
  return (this.animatorFlags & Animator.ConstrainingFlag) !== 0;
};

ViewAnimatorConstraint.prototype.startConstraining = function (this: ViewAnimatorConstraint<View, unknown>): void {
  if ((this.animatorFlags & Animator.ConstrainingFlag) === 0) {
    this.willStartConstraining();
    this.setAnimatorFlags(this.animatorFlags | Animator.ConstrainingFlag);
    this.onStartConstraining();
    this.didStartConstraining();
  }
};

ViewAnimatorConstraint.prototype.willStartConstraining = function (this: ViewAnimatorConstraint<View, unknown>): void {
  // hook
};

ViewAnimatorConstraint.prototype.onStartConstraining = function (this: ViewAnimatorConstraint<View, unknown>): void {
  this.owner.addConstraintVariable(this);
};

ViewAnimatorConstraint.prototype.didStartConstraining = function (this: ViewAnimatorConstraint<View, unknown>): void {
  // hook
};

ViewAnimatorConstraint.prototype.stopConstraining = function (this: ViewAnimatorConstraint<View, unknown>): void {
  if ((this.animatorFlags & Animator.ConstrainingFlag) !== 0) {
    this.willStopConstraining();
    this.setAnimatorFlags(this.animatorFlags & ~Animator.ConstrainingFlag);
    this.onStopConstraining();
    this.didStopConstraining();
  }
};

ViewAnimatorConstraint.prototype.willStopConstraining = function (this: ViewAnimatorConstraint<View, unknown>): void {
  // hook
};

ViewAnimatorConstraint.prototype.onStopConstraining = function (this: ViewAnimatorConstraint<View, unknown>): void {
  this.owner.removeConstraintVariable(this);
};

ViewAnimatorConstraint.prototype.didStopConstraining = function (this: ViewAnimatorConstraint<View, unknown>): void {
  // hook
};

ViewAnimatorConstraint.prototype.updateConstraintVariable = function (this: ViewAnimatorConstraint<View, unknown>): void {
  this.owner.setConstraintVariable(this, this.toNumber(this.value));
};

ViewAnimatorConstraint.prototype.onMount = function <T>(this: ViewAnimatorConstraint<View, T>): void {
  ViewAnimator.prototype.onMount.call(this);
  if (!this.isConstrained() && this.conditionCount !== 0) {
    this.startConstraining();
  }
};

ViewAnimatorConstraint.prototype.onUnmount = function <T>(this: ViewAnimatorConstraint<View, T>): void {
  if (!this.isConstrained() && this.conditionCount !== 0) {
    this.stopConstraining();
  }
  ViewAnimator.prototype.onUnmount.call(this);
};

ViewAnimatorConstraint.getClass = function (type: unknown): ViewAnimatorConstraintClass | null {
  if (type === Number) {
    return NumberViewAnimatorConstraint;
  } else if (type === Length) {
    return LengthViewAnimatorConstraint;
  }
  return null;
};

ViewAnimatorConstraint.define = function <V extends View, T, U, I>(descriptor: ViewAnimatorConstraintDescriptor<V, T, U, I>): ViewAnimatorConstraintConstructor<V, T, U, I> {
  let _super: ViewAnimatorConstraintClass | null | undefined = descriptor.extends;
  const inherit = descriptor.inherit;
  const state = descriptor.state;
  const look = descriptor.look;
  const strength = descriptor.strength !== void 0 ? ConstraintStrength.fromAny(descriptor.strength) : void 0;
  const constrain = descriptor.constrain;
  const precedence = descriptor.precedence;
  const initState = descriptor.initState;
  delete descriptor.extends;
  delete descriptor.inherit;
  delete descriptor.state;
  delete descriptor.look;
  delete descriptor.strength;
  delete descriptor.constrain;
  delete descriptor.precedence;
  delete descriptor.initState;

  if (_super === void 0) {
    _super = ViewAnimatorConstraint.getClass(descriptor.type);
  }
  if (_super === null) {
    _super = ViewAnimatorConstraint;
    if (descriptor.fromAny === void 0 && FromAny.is<T, U>(descriptor.type)) {
      descriptor.fromAny = descriptor.type.fromAny;
    }
  }

  const _constructor = function DecoratedViewAnimatorConstraint(this: ViewAnimatorConstraint<V, T, U>, owner: V, animatorName: string | undefined): ViewAnimatorConstraint<V, T, U> {
    let _this: ViewAnimatorConstraint<V, T, U> = function ViewAnimatorConstraintAccessor(state?: T | U, timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): T | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        if (arguments.length === 2) {
          _this.setState(state!, timing);
        } else {
          _this.setState(state!, timing as AnyTiming | boolean | undefined, precedence);
        }
        return _this.owner;
      }
    } as ViewAnimatorConstraint<V, T, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, animatorName) || _this;
    let ownState: T | undefined;
    if (initState !== void 0) {
      ownState = _this.fromAny(initState());
    } else if (state !== void 0) {
      ownState = _this.fromAny(state);
    }
    if (ownState !== void 0) {
      (_this as Mutable<typeof _this>).ownValue = ownState;
      (_this as Mutable<typeof _this>).ownState = ownState;
    }
    if (look !== void 0) {
      (_this as Mutable<typeof _this>).ownLook = look;
    }
    if (strength !== void 0) {
      (_this as Mutable<typeof _this>).strength = strength;
    }
    if (precedence !== void 0) {
      (_this as Mutable<typeof _this>).precedence = precedence;
    }
    if (inherit !== void 0) {
      (_this as Mutable<typeof _this>).inherit = inherit;
    }
    if (constrain === true) {
      _this.constrain();
    }
    return _this;
  } as unknown as ViewAnimatorConstraintConstructor<V, T, U, I>

  const _prototype = descriptor as unknown as ViewAnimatorConstraint<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};
