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

import {Output, Debug, Format} from "@swim/codec";
import {ConstraintKey} from "./ConstraintKey";
import {ConstraintMap} from "./ConstraintMap";
import {AnyConstraintExpression, ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintTerm} from "./ConstraintTerm";
import type {ConstraintVariable} from "./ConstraintVariable";
import type {ConstraintStrength} from "./ConstraintStrength";
import type {Constraint} from "./Constraint";
import type {ConstraintScope} from "./ConstraintScope";
import type {ConstraintSolver} from "./ConstraintSolver";

export class ConstraintBinding implements ConstraintVariable, Debug {
  constructor(owner: ConstraintScope, name: string, state: number, strength: ConstraintStrength) {
    Object.defineProperty(this, "id", {
      value: ConstraintKey.nextId(),
      enumerable: true,
    });
    Object.defineProperty(this, "owner", {
      value: owner,
      enumerable: true,
    });
    Object.defineProperty(this, "name", {
      value: name,
      enumerable: true,
    });
    Object.defineProperty(this, "state", {
      value: state,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "strength", {
      value: strength,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "constraintFlags", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "conditionCount", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
  }

  readonly id!: number;

  readonly owner!: ConstraintScope;

  readonly name!: string;

  /** @hidden */
  isExternal(): boolean {
    return true;
  }

  /** @hidden */
  isDummy(): boolean {
    return false;
  }

  /** @hidden */
  isInvalid(): boolean {
    return false;
  }

  isConstant(): boolean {
    return false;
  }

  readonly state!: number;

  setState(newState: number): void {
    const oldState = this.state;
    if (oldState !== newState) {
      this.willSetState(newState, oldState);
      Object.defineProperty(this, "state", {
        value: newState,
        enumerable: true,
        configurable: true,
      });
      this.onSetState(newState, oldState);
      this.didSetState(newState, oldState);
    }
  }

  protected willSetState(newState: number, oldState: number): void {
    // hook
  }

  protected onSetState(newState: number, oldState: number): void {
    if (this.isConstraining()) {
      this.owner.setConstraintVariable(this, newState);
    }
  }

  protected didSetState(newState: number, oldState: number): void {
    // hook
  }

  evaluateConstraintVariable(): void {
    // nop
  }

  updateConstraintSolution(newState: number): void {
    if (this.isConstrained()) {
      this.setState(newState);
    }
  }

  readonly strength!: ConstraintStrength;

  get coefficient(): number {
    return 1;
  }

  get variable(): ConstraintVariable {
    return this;
  }

  get terms(): ConstraintMap<ConstraintVariable, number> {
    const terms = new ConstraintMap<ConstraintVariable, number>();
    terms.set(this, 1);
    return terms;
  }

  get constant(): number {
    return 0;
  }

  plus(that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (this === that) {
      return ConstraintExpression.product(2, this);
    } else {
      return ConstraintExpression.sum(this, that);
    }
  }

  negative(): ConstraintTerm {
    return ConstraintExpression.product(-1, this);
  }

  minus(that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (this === that) {
      return ConstraintExpression.zero;
    } else {
      return ConstraintExpression.sum(this, that.negative());
    }
  }

  times(scalar: number): ConstraintExpression {
    return ConstraintExpression.product(scalar, this);
  }

  divide(scalar: number): ConstraintExpression {
    return ConstraintExpression.product(1 / scalar, this);
  }

  /** @hidden */
  readonly constraintFlags!: number;

  /** @hidden */
  setConstraintFlags(constraintFlags: number): void {
    Object.defineProperty(this, "constraintFlags", {
      value: constraintFlags,
      enumerable: true,
      configurable: true,
    });
  }

  isConstrained(): boolean {
    return (this.constraintFlags & ConstraintBinding.ConstrainedFlag) !== 0;
  }

  constrain(constrained: boolean = true): this {
    const constraintFlags = this.constraintFlags;
    if (constrained && (constraintFlags & ConstraintBinding.ConstrainedFlag) === 0) {
      this.setConstraintFlags(constraintFlags | ConstraintBinding.ConstrainedFlag);
      if (this.conditionCount !== 0) {
        this.stopConstraining();
      }
    } else if (!constrained && (constraintFlags & ConstraintBinding.ConstrainedFlag) !== 0) {
      this.setConstraintFlags(constraintFlags & ~ConstraintBinding.ConstrainedFlag);
      if (this.conditionCount !== 0) {
        this.startConstraining();
        this.updateConstraintVariable();
      }
    }
    return this;
  }

  /** @hidden */
  readonly conditionCount!: number;

  /** @hidden */
  addConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void {
    const oldConditionCount = this.conditionCount;
    const newConditionCount = oldConditionCount + 1;
    Object.defineProperty(this, "conditionCount", {
      value: newConditionCount,
      enumerable: true,
      configurable: true,
    });
    if (!this.isConstrained() && oldConditionCount === 0) {
      this.startConstraining();
      this.updateConstraintVariable();
    }
  }

  /** @hidden */
  removeConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void {
    const oldConditionCount = this.conditionCount;
    const newConditionCount = oldConditionCount - 1;
    Object.defineProperty(this, "conditionCount", {
      value: newConditionCount,
      enumerable: true,
      configurable: true,
    });
    if (!this.isConstrained() && newConditionCount === 0) {
      this.stopConstraining();
    }
  }

  /** @hidden */
  isConstraining(): boolean {
    return (this.constraintFlags & ConstraintBinding.ConstrainingFlag) !== 0;
  }

  /** @hidden */
  startConstraining(): void {
    if ((this.constraintFlags & ConstraintBinding.ConstrainingFlag) === 0) {
      this.willStartConstraining();
      this.setConstraintFlags(this.constraintFlags | ConstraintBinding.ConstrainingFlag);
      this.onStartConstraining();
      this.didStartConstraining();
    }
  }

  /** @hidden */
  willStartConstraining(): void {
    // hook
  }

  /** @hidden */
  onStartConstraining(): void {
    this.owner.addConstraintVariable(this);
  }

  /** @hidden */
  didStartConstraining(): void {
    // hook
  }

  /** @hidden */
  stopConstraining(): void {
    if ((this.constraintFlags & ConstraintBinding.ConstrainingFlag) !== 0) {
      this.willStopConstraining();
      this.setConstraintFlags(this.constraintFlags & ~ConstraintBinding.ConstrainingFlag);
      this.onStopConstraining();
      this.didStopConstraining();
    }
  }

  /** @hidden */
  willStopConstraining(): void {
    // hook
  }

  /** @hidden */
  onStopConstraining(): void {
    this.owner.removeConstraintVariable(this);
  }

  /** @hidden */
  didStopConstraining(): void {
    // hook
  }

  updateConstraintVariable(): void {
    const state = this.state;
    if (state !== void 0) {
      this.owner.setConstraintVariable(this, this.state);
    }
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.debug(this.owner).write(46/*'.'*/).write("constraintVariable").write(40/*'('*/)
                   .debug(this.name).write(", ").debug(this.state).write(41/*')'*/);
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  /** @hidden */
  static readonly ConstrainedFlag: number = 1 << 0;
  /** @hidden */
  static readonly ConstrainingFlag: number = 1 << 1;
}
