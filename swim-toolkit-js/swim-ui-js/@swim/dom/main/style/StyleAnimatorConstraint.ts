// Copyright 2015-2021 Swim inc.
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
import {FromAny} from "@swim/util";
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
import {ViewPrecedence, Animator} from "@swim/view";
import {StyleContext} from "./StyleContext";
import {StyleAnimatorInit, StyleAnimator} from "./StyleAnimator";
import {NumberStyleAnimatorConstraint} from "../"; // forward import
import {LengthStyleAnimatorConstraint} from "../"; // forward import

export interface StyleAnimatorConstraintInit<T, U = never> extends StyleAnimatorInit<T, U> {
  extends?: StyleAnimatorConstraintClass;

  constrain?: boolean;
  strength?: AnyConstraintStrength;
  computedValue?: T;
  toNumber?(value: T): number;
}

export type StyleAnimatorConstraintDescriptor<V extends StyleContext, T, U = never, I = {}> = StyleAnimatorConstraintInit<T, U> & ThisType<StyleAnimatorConstraint<V, T, U> & I> & Partial<I>;

export type StyleAnimatorConstraintDescriptorExtends<V extends StyleContext, T, U = never, I = {}> = {extends: StyleAnimatorConstraintClass | undefined} & StyleAnimatorConstraintDescriptor<V, T, U, I>;

export type StyleAnimatorConstraintDescriptorFromAny<V extends StyleContext, T, U = never, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & StyleAnimatorConstraintDescriptor<V, T, U, I>;

export interface StyleAnimatorConstraintConstructor<V extends StyleContext, T, U = never, I = {}> {
  new(owner: V, animatorName: string): StyleAnimatorConstraint<V, T, U> & I;
  prototype: StyleAnimatorConstraint<any, any> & I;
}

export interface StyleAnimatorConstraintClass extends Function {
  readonly prototype: StyleAnimatorConstraint<any, any>;
}

export interface StyleAnimatorConstraint<V extends StyleContext, T, U = never> extends StyleAnimator<V, T, U | number>, ConstraintVariable {
  readonly id: number;

  /** @hidden */
  isExternal(): boolean;

  /** @hidden */
  isDummy(): boolean;

  /** @hidden */
  isInvalid(): boolean;

  isConstant(): boolean;

  readonly computedValue: T;

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

export const StyleAnimatorConstraint = function <V extends StyleContext, T, U>(
    this: StyleAnimatorConstraint<V, T, U> | typeof StyleAnimatorConstraint,
    owner: V | StyleAnimatorConstraintDescriptor<V, T, U>,
    animatorName?: string,
  ): StyleAnimatorConstraint<V, T, U> | PropertyDecorator {
  if (this instanceof StyleAnimatorConstraint) { // constructor
    return StyleAnimatorConstraintConstructor.call(this as StyleAnimatorConstraint<V, unknown, unknown>, owner as V, animatorName!);
  } else { // decorator factory
    return StyleAnimatorConstraintDecoratorFactory(owner as StyleAnimatorConstraintDescriptor<V, T, U>);
  }
} as unknown as {
  new<V extends StyleContext, T, U = never>(owner: V, animatorName: string): StyleAnimatorConstraint<V, T, U>;

  <V extends StyleContext, T extends Length | null | undefined = Length | null | undefined, U extends AnyLength | null | undefined = AnyLength | null | undefined>(descriptor: {type: typeof Length} & StyleAnimatorConstraintDescriptor<V, T, U>): PropertyDecorator;
  <V extends StyleContext, T extends number | null | undefined = number | null | undefined, U extends number | string | null | undefined = number | string | null | undefined>(descriptor: {type: typeof Number} & StyleAnimatorConstraintDescriptor<V, T, U>): PropertyDecorator;
  <V extends StyleContext, T, U = never>(descriptor: StyleAnimatorConstraintDescriptorFromAny<V, T, U>): PropertyDecorator;
  <V extends StyleContext, T, U = never, I = {}>(descriptor: StyleAnimatorConstraintDescriptorExtends<V, T, U, I>): PropertyDecorator;
  <V extends StyleContext, T, U = never>(descriptor: StyleAnimatorConstraintDescriptor<V, T, U>): PropertyDecorator;

  /** @hidden */
  prototype: StyleAnimatorConstraint<any, any>;

  /** @hidden */
  getClass(type: unknown): StyleAnimatorConstraintClass | null;

  define<V extends StyleContext, T, U = never, I = {}>(descriptor: StyleAnimatorConstraintDescriptorExtends<V, T, U, I>): StyleAnimatorConstraintConstructor<V, T, U, I>;
  define<V extends StyleContext, T, U = never>(descriptor: StyleAnimatorConstraintDescriptor<V, T, U>): StyleAnimatorConstraintConstructor<V, T, U>;
};
__extends(StyleAnimatorConstraint, StyleAnimator);

function StyleAnimatorConstraintConstructor<V extends StyleContext, T, U>(this: StyleAnimatorConstraint<V, T, U>, owner: V, animatorName: string): StyleAnimatorConstraint<V, T, U> {
  const _this: StyleAnimatorConstraint<V, T, U> = (StyleAnimator as Function).call(this, owner, animatorName) || this;
  Object.defineProperty(_this, "id", {
    value: ConstraintKey.nextId(),
    enumerable: true,
  });
  Object.defineProperty(_this, "strength", {
    value: ConstraintStrength.Strong,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(_this, "conditionCount", {
    value: 0,
    enumerable: true,
    configurable: true,
  });
  return _this;
}

function StyleAnimatorConstraintDecoratorFactory<V extends StyleContext, T, U>(descriptor: StyleAnimatorConstraintDescriptor<V, T, U>): PropertyDecorator {
  return StyleContext.decorateStyleAnimator.bind(StyleContext, StyleAnimatorConstraint.define(descriptor as StyleAnimatorConstraintDescriptor<StyleContext, unknown>));
}

StyleAnimatorConstraint.prototype.isExternal = function (this: StyleAnimatorConstraint<StyleContext, unknown>): boolean {
  return true;
};

StyleAnimatorConstraint.prototype.isDummy = function (this: StyleAnimatorConstraint<StyleContext, unknown>): boolean {
  return false;
};

StyleAnimatorConstraint.prototype.isInvalid = function (this: StyleAnimatorConstraint<StyleContext, unknown>): boolean {
  return false;
};

StyleAnimatorConstraint.prototype.isConstant = function (this: StyleAnimatorConstraint<StyleContext, unknown>): boolean {
  return false;
};

Object.defineProperty(StyleAnimatorConstraint.prototype, "computedValue", {
  get<T>(this: StyleAnimatorConstraint<StyleContext, T>): T {
    return void 0 as unknown as T;
  },
  enumerable: true,
  configurable: true,
});

StyleAnimatorConstraint.prototype.onSetValue = function <T>(this: StyleAnimatorConstraint<StyleContext, T>, newValue: T, oldValue: T): void {
  StyleAnimator.prototype.onSetValue.call(this, newValue, oldValue);
  if (this.isConstraining()) {
    this.owner.setConstraintVariable(this, this.toNumber(newValue));
  }
};

StyleAnimatorConstraint.prototype.evaluateConstraintVariable = function <T>(this: StyleAnimatorConstraint<StyleContext, T>): void {
  if (!this.isConstrained() && this.isConstraining() && !this.isDefined(this.ownValue)) {
    const value = this.computedValue;
    if (this.isDefined(value)) {
      this.owner.setConstraintVariable(this, this.toNumber(value));
    }
  }
};

StyleAnimatorConstraint.prototype.updateConstraintSolution = function <T>(this: StyleAnimatorConstraint<StyleContext, T>, newState: number): void {
  if (this.isConstrained() && this.toNumber(this.state) !== newState) {
    Animator.prototype.setState.call(this, this.fromAny(newState));
  }
};

Object.defineProperty(StyleAnimatorConstraint.prototype, "coefficient", {
  get(this: StyleAnimatorConstraint<StyleContext, unknown>): number {
    return 1;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(StyleAnimatorConstraint.prototype, "variable", {
  get(this: StyleAnimatorConstraint<StyleContext, unknown>): ConstraintVariable {
    return this;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(StyleAnimatorConstraint.prototype, "terms", {
  get(this: StyleAnimatorConstraint<StyleContext, unknown>): ConstraintMap<ConstraintVariable, number> {
    const terms = new ConstraintMap<ConstraintVariable, number>();
    terms.set(this, 1);
    return terms;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(StyleAnimatorConstraint.prototype, "constant", {
  get(this: StyleAnimatorConstraint<StyleContext, unknown>): number {
    return 0;
  },
  enumerable: true,
  configurable: true,
});

StyleAnimatorConstraint.prototype.plus = function (this: StyleAnimatorConstraint<StyleContext, unknown>, that: AnyConstraintExpression): ConstraintExpression {
  that = ConstraintExpression.fromAny(that);
  if (this === that) {
    return ConstraintExpression.product(2, this);
  } else {
    return ConstraintExpression.sum(this, that);
  }
};

StyleAnimatorConstraint.prototype.negative = function (this: StyleAnimatorConstraint<StyleContext, unknown>): ConstraintTerm {
  return ConstraintExpression.product(-1, this);
};

StyleAnimatorConstraint.prototype.minus = function (this: StyleAnimatorConstraint<StyleContext, unknown>, that: AnyConstraintExpression): ConstraintExpression {
  that = ConstraintExpression.fromAny(that);
  if (this === that) {
    return ConstraintExpression.zero;
  } else {
    return ConstraintExpression.sum(this, that.negative());
  }
};

StyleAnimatorConstraint.prototype.times = function (this: StyleAnimatorConstraint<StyleContext, unknown>, scalar: number): ConstraintExpression {
  return ConstraintExpression.product(scalar, this);
};

StyleAnimatorConstraint.prototype.divide = function (this: StyleAnimatorConstraint<StyleContext, unknown>, scalar: number): ConstraintExpression {
  return ConstraintExpression.product(1 / scalar, this);
};

StyleAnimatorConstraint.prototype.isConstrained = function (this: StyleAnimatorConstraint<StyleContext, unknown>): boolean {
  return (this.animatorFlags & Animator.ConstrainedFlag) !== 0;
};

StyleAnimatorConstraint.prototype.constrain = function (this: StyleAnimatorConstraint<StyleContext, unknown>, constrained?: boolean): StyleAnimatorConstraint<StyleContext, unknown> {
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

StyleAnimatorConstraint.prototype.addConstraintCondition = function (this: StyleAnimatorConstraint<StyleContext, unknown>, constraint: Constraint, solver: ConstraintSolver): void {
  const oldConditionCount = this.conditionCount;
  const newConditionCount = oldConditionCount + 1;
  Object.defineProperty(this, "conditionCount", {
    value: newConditionCount,
    enumerable: true,
    configurable: true,
  });
  if (!this.isConstrained() && oldConditionCount === 0 && this.isMounted()) {
    this.startConstraining();
    this.updateConstraintVariable();
  }
};

StyleAnimatorConstraint.prototype.removeConstraintCondition = function (this: StyleAnimatorConstraint<StyleContext, unknown>, constraint: Constraint, solver: ConstraintSolver): void {
  const oldConditionCount = this.conditionCount;
  const newConditionCount = oldConditionCount - 1;
  Object.defineProperty(this, "conditionCount", {
    value: newConditionCount,
    enumerable: true,
    configurable: true,
  });
  if (!this.isConstrained() && newConditionCount === 0 && this.isMounted()) {
    this.stopConstraining();
  }
};

StyleAnimatorConstraint.prototype.isConstraining = function (this: StyleAnimatorConstraint<StyleContext, unknown>): boolean {
  return (this.animatorFlags & Animator.ConstrainingFlag) !== 0;
};

StyleAnimatorConstraint.prototype.startConstraining = function (this: StyleAnimatorConstraint<StyleContext, unknown>): void {
  if ((this.animatorFlags & Animator.ConstrainingFlag) === 0) {
    this.willStartConstraining();
    this.setAnimatorFlags(this.animatorFlags | Animator.ConstrainingFlag);
    this.onStartConstraining();
    this.didStartConstraining();
  }
};

StyleAnimatorConstraint.prototype.willStartConstraining = function (this: StyleAnimatorConstraint<StyleContext, unknown>): void {
  // hook
};

StyleAnimatorConstraint.prototype.onStartConstraining = function (this: StyleAnimatorConstraint<StyleContext, unknown>): void {
  this.owner.addConstraintVariable(this);
};

StyleAnimatorConstraint.prototype.didStartConstraining = function (this: StyleAnimatorConstraint<StyleContext, unknown>): void {
  // hook
};

StyleAnimatorConstraint.prototype.stopConstraining = function (this: StyleAnimatorConstraint<StyleContext, unknown>): void {
  if ((this.animatorFlags & Animator.ConstrainingFlag) !== 0) {
    this.willStopConstraining();
    this.setAnimatorFlags(this.animatorFlags & ~Animator.ConstrainingFlag);
    this.onStopConstraining();
    this.didStopConstraining();
  }
};

StyleAnimatorConstraint.prototype.willStopConstraining = function (this: StyleAnimatorConstraint<StyleContext, unknown>): void {
  // hook
};

StyleAnimatorConstraint.prototype.onStopConstraining = function (this: StyleAnimatorConstraint<StyleContext, unknown>): void {
  this.owner.removeConstraintVariable(this);
};

StyleAnimatorConstraint.prototype.didStopConstraining = function (this: StyleAnimatorConstraint<StyleContext, unknown>): void {
  // hook
};

StyleAnimatorConstraint.prototype.updateConstraintVariable = function (this: StyleAnimatorConstraint<StyleContext, unknown>): void {
  let value = this.ownValue;
  if (!this.isDefined(value)) {
    value = this.computedValue;
  }
  this.owner.setConstraintVariable(this, this.toNumber(value));
};

StyleAnimatorConstraint.prototype.onMount = function <T>(this: StyleAnimatorConstraint<StyleContext, T>): void {
  StyleAnimator.prototype.onMount.call(this);
  if (!this.isConstrained() && this.conditionCount !== 0) {
    this.startConstraining();
  }
};

StyleAnimatorConstraint.prototype.onUnmount = function <T>(this: StyleAnimatorConstraint<StyleContext, T>): void {
  if (!this.isConstrained() && this.conditionCount !== 0) {
    this.stopConstraining();
  }
  StyleAnimator.prototype.onUnmount.call(this);
};

StyleAnimatorConstraint.getClass = function (type: unknown): StyleAnimatorConstraintClass | null {
  if (type === Number) {
    return NumberStyleAnimatorConstraint;
  } else if (type === Length) {
    return LengthStyleAnimatorConstraint;
  }
  return null;
};

StyleAnimatorConstraint.define = function <V extends StyleContext, T, U, I>(descriptor: StyleAnimatorConstraintDescriptor<V, T, U, I>): StyleAnimatorConstraintConstructor<V, T, U, I> {
  let _super: StyleAnimatorConstraintClass | null | undefined = descriptor.extends;
  const state = descriptor.state;
  const look = descriptor.look;
  const strength = descriptor.strength !== void 0 ? ConstraintStrength.fromAny(descriptor.strength) : void 0;
  const constrain = descriptor.constrain;
  const precedence = descriptor.precedence;
  const initState = descriptor.initState;
  delete descriptor.extends;
  delete descriptor.state;
  delete descriptor.look;
  delete descriptor.strength;
  delete descriptor.constrain;
  delete descriptor.precedence;
  delete descriptor.initState;

  if (_super === void 0) {
    _super = StyleAnimatorConstraint.getClass(descriptor.type);
  }
  if (_super === null) {
    _super = StyleAnimatorConstraint;
    if (descriptor.fromAny === void 0 && FromAny.is<T, U>(descriptor.type)) {
      descriptor.fromAny = descriptor.type.fromAny;
    }
  }

  const _constructor = function DecoratedStyleAnimatorConstraint(this: StyleAnimatorConstraint<V, T, U>, owner: V, animatorName: string): StyleAnimatorConstraint<V, T, U> {
    let _this: StyleAnimatorConstraint<V, T, U> = function StyleAnimatorConstraintAccessor(state?: T | U, timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): T | V {
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
    } as StyleAnimatorConstraint<V, T, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, animatorName) || _this;
    let ownState: T | undefined;
    if (initState !== void 0) {
      ownState = _this.fromAny(initState());
    } else if (state !== void 0) {
      ownState = _this.fromAny(state);
    }
    if (ownState !== void 0) {
      Object.defineProperty(_this, "ownValue", {
        value: ownState,
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(_this, "ownState", {
        value: ownState,
        enumerable: true,
        configurable: true,
      });
    }
    if (look !== void 0) {
      Object.defineProperty(_this, "ownLook", {
        value: look,
        enumerable: true,
        configurable: true,
      });
    }
    if (strength !== void 0) {
      Object.defineProperty(_this, "strength", {
        value: strength,
        enumerable: true,
        configurable: true,
      });
    }
    if (precedence !== void 0) {
      Object.defineProperty(_this, "precedence", {
        value: precedence,
        enumerable: true,
        configurable: true,
      });
    }
    if (constrain === true) {
      _this.constrain();
    }
    return _this;
  } as unknown as StyleAnimatorConstraintConstructor<V, T, U, I>;

  const _prototype = descriptor as unknown as StyleAnimatorConstraint<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};
