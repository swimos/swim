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
import {Length} from "@swim/math";
import {ViewPrecedence, View} from "../View";
import {ViewPropertyInit, ViewProperty} from "./ViewProperty";
import {NumberViewPropertyConstraint} from "../"; // forward import
import {LengthViewPropertyConstraint} from "../"; // forward import

export interface ViewPropertyConstraintInit<T, U = never> extends ViewPropertyInit<T, U> {
  extends?: ViewPropertyConstraintClass;

  constrain?: boolean;
  strength?: AnyConstraintStrength;
  toNumber?(value: T): number;
}

export type ViewPropertyConstraintDescriptor<V extends View, T, U = never, I = {}> = ViewPropertyConstraintInit<T, U> & ThisType<ViewPropertyConstraint<V, T, U> & I> & Partial<I>;

export type ViewPropertyConstraintDescriptorExtends<V extends View, T, U = never, I = {}> = {extends: ViewPropertyConstraintClass | undefined} & ViewPropertyConstraintDescriptor<V, T, U, I>;

export type ViewPropertyConstraintDescriptorFromAny<V extends View, T, U = never, I = {}> = ({type: FromAny<T, U>} | {fromAny(value: T | U): T}) & ViewPropertyConstraintDescriptor<V, T, U, I>;

export interface ViewPropertyConstraintConstructor<V extends View, T, U = never, I = {}> {
  new(owner: V, propertyName: string | undefined): ViewPropertyConstraint<V, T, U> & I;
  prototype: ViewPropertyConstraint<any, any> & I;
}

export interface ViewPropertyConstraintClass extends Function {
  readonly prototype: ViewPropertyConstraint<any, any>;
}

export interface ViewPropertyConstraint<V extends View, T, U = never> extends ViewProperty<V, T, U | number>, ConstraintVariable {
  readonly id: number;

  /** @hidden */
  isExternal(): boolean;

  /** @hidden */
  isDummy(): boolean;

  /** @hidden */
  isInvalid(): boolean;

  isConstant(): boolean;

  onSetState(newState: T, oldState: T): void;

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

export const ViewPropertyConstraint = function <V extends View, T, U>(
    this: ViewPropertyConstraint<V, T, U> | typeof ViewPropertyConstraint,
    owner: V | ViewPropertyConstraintDescriptor<V, T, U>,
    propertyName?: string,
  ): ViewPropertyConstraint<V, T, U> | PropertyDecorator {
  if (this instanceof ViewPropertyConstraint) { // constructor
    return ViewPropertyConstraintConstructor.call(this as ViewPropertyConstraint<View, unknown, unknown>, owner as V, propertyName);
  } else { // decorator factory
    return ViewPropertyConstraintDecoratorFactory(owner as ViewPropertyConstraintDescriptor<V, T, U>);
  }
} as unknown as {
  new<V extends View, T, U = never>(owner: V, propertyName: string | undefined): ViewPropertyConstraint<V, T, U>;

  <V extends View, T extends number | null | undefined = number | null | undefined, U extends number | string | null | undefined = number | string | null | undefined>(descriptor: {type: typeof Number} & ViewPropertyConstraintDescriptor<V, T, U>): PropertyDecorator;
  <V extends View, T, U = never>(descriptor: ViewPropertyConstraintDescriptorFromAny<V, T, U>): PropertyDecorator;
  <V extends View, T, U = never, I = {}>(descriptor: ViewPropertyConstraintDescriptorExtends<V, T, U, I>): PropertyDecorator;
  <V extends View, T, U = never>(descriptor: ViewPropertyConstraintDescriptor<V, T, U>): PropertyDecorator;

  /** @hidden */
  prototype: ViewPropertyConstraint<any, any>;

  /** @hidden */
  getClass(type: unknown): ViewPropertyConstraintClass | null;

  define<V extends View, T, U = never, I = {}>(descriptor: ViewPropertyConstraintDescriptorExtends<V, T, U, I>): ViewPropertyConstraintConstructor<V, T, U, I>;
  define<V extends View, T, U = never>(descriptor: ViewPropertyConstraintDescriptor<V, T, U>): ViewPropertyConstraintConstructor<V, T, U>;
};
__extends(ViewPropertyConstraint, ViewProperty);

function ViewPropertyConstraintConstructor<V extends View, T, U>(this: ViewPropertyConstraint<V, T, U>, owner: V, propertyName: string | undefined): ViewPropertyConstraint<V, T, U> {
  const _this: ViewPropertyConstraint<V, T, U> = (ViewProperty as Function).call(this, owner, propertyName) || this;
  (_this as Mutable<typeof _this>).id = ConstraintKey.nextId();
  (_this as Mutable<typeof _this>).strength = ConstraintStrength.Strong;
  (_this as Mutable<typeof _this>).conditionCount = 0;
  return _this;
}

function ViewPropertyConstraintDecoratorFactory<V extends View, T, U>(descriptor: ViewPropertyConstraintDescriptor<V, T, U>): PropertyDecorator {
  return View.decorateViewProperty.bind(View, ViewPropertyConstraint.define(descriptor as ViewPropertyConstraintDescriptor<View, unknown>));
}

ViewPropertyConstraint.prototype.isExternal = function (this: ViewPropertyConstraint<View, unknown>): boolean {
  return true;
};

ViewPropertyConstraint.prototype.isDummy = function (this: ViewPropertyConstraint<View, unknown>): boolean {
  return false;
};

ViewPropertyConstraint.prototype.isInvalid = function (this: ViewPropertyConstraint<View, unknown>): boolean {
  return false;
};

ViewPropertyConstraint.prototype.isConstant = function (this: ViewPropertyConstraint<View, unknown>): boolean {
  return false;
};

ViewPropertyConstraint.prototype.onSetState = function <T>(this: ViewPropertyConstraint<View, T>, newState: T, oldState: T): void {
  ViewProperty.prototype.onSetState.call(this, newState, oldState);
  if (this.isConstraining()) {
    this.owner.setConstraintVariable(this, newState !== void 0 ? this.toNumber(newState) : 0);
  }
};

ViewPropertyConstraint.prototype.evaluateConstraintVariable = function <T>(this: ViewPropertyConstraint<View, T>): void {
  // nop
};

ViewPropertyConstraint.prototype.updateConstraintSolution = function <T>(this: ViewPropertyConstraint<View, T>, newState: number): void {
  if (this.isConstrained() && this.toNumber(this.state) !== newState) {
    this.setOwnState(newState);
  }
};

Object.defineProperty(ViewPropertyConstraint.prototype, "coefficient", {
  get(this: ViewPropertyConstraint<View, unknown>): number {
    return 1;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewPropertyConstraint.prototype, "variable", {
  get(this: ViewPropertyConstraint<View, unknown>): ConstraintVariable {
    return this;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewPropertyConstraint.prototype, "terms", {
  get(this: ViewPropertyConstraint<View, unknown>): ConstraintMap<ConstraintVariable, number> {
    const terms = new ConstraintMap<ConstraintVariable, number>();
    terms.set(this, 1);
    return terms;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewPropertyConstraint.prototype, "constant", {
  get(this: ViewPropertyConstraint<View, unknown>): number {
    return 0;
  },
  enumerable: true,
  configurable: true,
});

ViewPropertyConstraint.prototype.plus = function (this: ViewPropertyConstraint<View, unknown>, that: AnyConstraintExpression): ConstraintExpression {
  that = ConstraintExpression.fromAny(that);
  if (this === that) {
    return ConstraintExpression.product(2, this);
  } else {
    return ConstraintExpression.sum(this, that);
  }
};

ViewPropertyConstraint.prototype.negative = function (this: ViewPropertyConstraint<View, unknown>): ConstraintTerm {
  return ConstraintExpression.product(-1, this);
};

ViewPropertyConstraint.prototype.minus = function (this: ViewPropertyConstraint<View, unknown>, that: AnyConstraintExpression): ConstraintExpression {
  that = ConstraintExpression.fromAny(that);
  if (this === that) {
    return ConstraintExpression.zero;
  } else {
    return ConstraintExpression.sum(this, that.negative());
  }
};

ViewPropertyConstraint.prototype.times = function (this: ViewPropertyConstraint<View, unknown>, scalar: number): ConstraintExpression {
  return ConstraintExpression.product(scalar, this);
};

ViewPropertyConstraint.prototype.divide = function (this: ViewPropertyConstraint<View, unknown>, scalar: number): ConstraintExpression {
  return ConstraintExpression.product(1 / scalar, this);
};

ViewPropertyConstraint.prototype.isConstrained = function (this: ViewPropertyConstraint<View, unknown>): boolean {
  return (this.propertyFlags & ViewProperty.ConstrainedFlag) !== 0;
};

ViewPropertyConstraint.prototype.constrain = function (this: ViewPropertyConstraint<View, unknown>, constrained?: boolean): ViewPropertyConstraint<View, unknown> {
  if (constrained === void 0) {
    constrained = true;
  }
  const propertyFlags = this.propertyFlags;
  if (constrained && (propertyFlags & ViewProperty.ConstrainedFlag) === 0) {
    this.setPropertyFlags(propertyFlags | ViewProperty.ConstrainedFlag);
    if (this.conditionCount !== 0 && this.isMounted()) {
      this.stopConstraining();
    }
  } else if (!constrained && (propertyFlags & ViewProperty.ConstrainedFlag) !== 0) {
    this.setPropertyFlags(propertyFlags & ~ViewProperty.ConstrainedFlag);
    if (this.conditionCount !== 0 && this.isMounted()) {
      this.startConstraining();
      this.updateConstraintVariable();
    }
  }
  return this;
};

ViewPropertyConstraint.prototype.addConstraintCondition = function (this: ViewPropertyConstraint<View, unknown>, constraint: Constraint, solver: ConstraintSolver): void {
  (this as Mutable<typeof this>).conditionCount += 1;
  if (!this.isConstrained() && this.conditionCount === 1 && this.isMounted()) {
    this.startConstraining();
    this.updateConstraintVariable();
  }
};

ViewPropertyConstraint.prototype.removeConstraintCondition = function (this: ViewPropertyConstraint<View, unknown>, constraint: Constraint, solver: ConstraintSolver): void {
  (this as Mutable<typeof this>).conditionCount -= 1;
  if (!this.isConstrained() && this.conditionCount === 0 && this.isMounted()) {
    this.stopConstraining();
  }
};

ViewPropertyConstraint.prototype.isConstraining = function (this: ViewPropertyConstraint<View, unknown>): boolean {
  return (this.propertyFlags & ViewProperty.ConstrainingFlag) !== 0;
};

ViewPropertyConstraint.prototype.startConstraining = function (this: ViewPropertyConstraint<View, unknown>): void {
  if ((this.propertyFlags & ViewProperty.ConstrainingFlag) === 0) {
    this.willStartConstraining();
    this.setPropertyFlags(this.propertyFlags | ViewProperty.ConstrainingFlag);
    this.onStartConstraining();
    this.didStartConstraining();
  }
};

ViewPropertyConstraint.prototype.willStartConstraining = function (this: ViewPropertyConstraint<View, unknown>): void {
  // hook
};

ViewPropertyConstraint.prototype.onStartConstraining = function (this: ViewPropertyConstraint<View, unknown>): void {
  this.owner.addConstraintVariable(this);
};

ViewPropertyConstraint.prototype.didStartConstraining = function (this: ViewPropertyConstraint<View, unknown>): void {
  // hook
};

ViewPropertyConstraint.prototype.stopConstraining = function (this: ViewPropertyConstraint<View, unknown>): void {
  if ((this.propertyFlags & ViewProperty.ConstrainingFlag) !== 0) {
    this.willStopConstraining();
    this.setPropertyFlags(this.propertyFlags & ~ViewProperty.ConstrainingFlag);
    this.onStopConstraining();
    this.didStopConstraining();
  }
};

ViewPropertyConstraint.prototype.willStopConstraining = function (this: ViewPropertyConstraint<View, unknown>): void {
  // hook
};

ViewPropertyConstraint.prototype.onStopConstraining = function (this: ViewPropertyConstraint<View, unknown>): void {
  this.owner.removeConstraintVariable(this);
};

ViewPropertyConstraint.prototype.didStopConstraining = function (this: ViewPropertyConstraint<View, unknown>): void {
  // hook
};

ViewPropertyConstraint.prototype.updateConstraintVariable = function (this: ViewPropertyConstraint<View, unknown>): void {
  const state = this.state;
  if (state !== void 0) {
    this.owner.setConstraintVariable(this, this.toNumber(state));
  }
};

ViewPropertyConstraint.prototype.onMount = function <T>(this: ViewPropertyConstraint<View, T>): void {
  ViewProperty.prototype.onMount.call(this);
  if (!this.isConstrained() && this.conditionCount !== 0) {
    this.startConstraining();
  }
};

ViewPropertyConstraint.prototype.onUnmount = function <T>(this: ViewPropertyConstraint<View, T>): void {
  if (!this.isConstrained() && this.conditionCount !== 0) {
    this.stopConstraining();
  }
  ViewProperty.prototype.onUnmount.call(this);
};

ViewPropertyConstraint.getClass = function (type: unknown): ViewPropertyConstraintClass | null {
  if (type === Number) {
    return NumberViewPropertyConstraint;
  } else if (type === Length) {
    return LengthViewPropertyConstraint;
  }
  return null;
};

ViewPropertyConstraint.define = function <V extends View, T, U, I>(descriptor: ViewPropertyConstraintDescriptor<V, T, U, I>): ViewPropertyConstraintConstructor<V, T, U, I> {
  let _super: ViewPropertyConstraintClass | null | undefined = descriptor.extends;
  const inherit = descriptor.inherit;
  const state = descriptor.state;
  const strength = descriptor.strength !== void 0 ? ConstraintStrength.fromAny(descriptor.strength) : void 0;
  const constrain = descriptor.constrain;
  const precedence = descriptor.precedence;
  const initState = descriptor.initState;
  delete descriptor.extends;
  delete descriptor.inherit;
  delete descriptor.state;
  delete descriptor.strength;
  delete descriptor.constrain;
  delete descriptor.precedence;
  delete descriptor.initState;

  if (_super === void 0) {
    _super = ViewPropertyConstraint.getClass(descriptor.type);
  }
  if (_super === null) {
    _super = ViewPropertyConstraint;
    if (descriptor.fromAny === void 0 && FromAny.is<T, U>(descriptor.type)) {
      descriptor.fromAny = descriptor.type.fromAny;
    }
  }

  const _constructor = function DecoratedViewPropertyConstraint(this: ViewPropertyConstraint<V, T, U>, owner: V, propertyName: string | undefined): ViewPropertyConstraint<V, T, U> {
    let _this: ViewPropertyConstraint<V, T, U> = function ViewPropertyConstraintAccessor(state?: T | U, precedence?: ViewPrecedence): T | V {
      if (arguments.length === 0) {
        return _this.state;
      } else {
        _this.setState(state!, precedence);
        return _this.owner;
      }
    } as ViewPropertyConstraint<V, T, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, propertyName) || _this;
    let ownState: T | undefined;
    if (initState !== void 0) {
      ownState = _this.fromAny(initState());
    } else if (state !== void 0) {
      ownState = _this.fromAny(state);
    }
    if (ownState !== void 0) {
      (_this as Mutable<typeof _this>).ownState = ownState;
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
  } as unknown as ViewPropertyConstraintConstructor<V, T, U, I>;

  const _prototype = descriptor as unknown as ViewPropertyConstraint<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};
