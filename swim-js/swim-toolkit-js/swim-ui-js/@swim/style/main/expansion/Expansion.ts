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

import {
  Lazy,
  Equivalent,
  HashCode,
  Murmur3,
  Numbers,
  Constructors,
  Interpolate,
  Interpolator,
} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import {ExpansionInterpolator} from "./ExpansionInterpolator";

export type AnyExpansion = Expansion | ExpansionInit;

export interface ExpansionInit {
  readonly phase: number;
  readonly direction: number;
}

export class Expansion implements Interpolate<Expansion>, HashCode, Equivalent, Debug {
  constructor(phase: number, direction: number) {
    this.phase = phase;
    this.direction = direction;
  }

  readonly phase: number;

  withPhase(phase: number): Expansion {
    if (phase !== this.phase) {
      return Expansion.create(phase, this.direction);
    } else {
      return this;
    }
  }

  readonly direction: number;

  withDirection(direction: number): Expansion {
    if (direction !== this.direction) {
      return Expansion.create(this.phase, direction);
    } else {
      return this;
    }
  }

  get modalState(): "hidden" | "showing" | "shown" | "hiding" | undefined {
    if (this.phase === 0 && this.direction === 0) {
      return "hidden";
    } else if (this.phase === 1 && this.direction === 0) {
      return "shown";
    } else if (this.direction > 0) {
      return "showing";
    } else if (this.direction < 0) {
      return "hiding";
    } else {
      return void 0;
    }
  }

  isCollapsed(): boolean {
    return this.phase === 0 && this.direction === 0;
  }

  isExpanded(): boolean {
    return this.phase === 1 && this.direction === 0;
  }

  isExpanding(): boolean {
    return this.direction > 0;
  }

  isCollapsing(): boolean {
    return this.direction < 0;
  }

  expanding(): Expansion {
    if (!this.isExpanding()) {
      return Expansion.expanding(this.phase);
    } else {
      return this;
    }
  }

  collapsing(): Expansion {
    if (!this.isCollapsing()) {
      return Expansion.collapsing(this.phase);
    } else {
      return this;
    }
  }

  toggling(): Expansion {
    if (this.direction > 0 || this.phase >= 0.5) {
      return Expansion.collapsing(this.phase);
    } else if (this.direction < 0 || this.phase < 0.5) {
      return Expansion.expanding(this.phase);
    } else {
      return this;
    }
  }

  toggled(): Expansion {
    if (this.direction > 0 || this.phase >= 0.5) {
      return Expansion.collapsed();
    } else if (this.direction < 0 || this.phase < 0.5) {
      return Expansion.expanded();
    } else {
      return this;
    }
  }

  interpolateTo(that: Expansion): Interpolator<Expansion>;
  interpolateTo(that: unknown): Interpolator<Expansion> | null;
  interpolateTo(that: unknown): Interpolator<Expansion> | null {
    if (that instanceof Expansion) {
      return ExpansionInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Expansion) {
      return Numbers.equivalent(this.phase, that.phase, epsilon)
          && Numbers.equivalent(this.direction, that.direction, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Expansion) {
      return this.phase === that.phase && this.direction === that.direction;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(Expansion),
        Numbers.hash(this.phase)), Numbers.hash(this.direction)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("Expansion").write(46/*'.'*/);
    if (this.phase === 0 && this.direction === 0) {
      output = output.write("collapsed").write(40/*'('*/);
    } else if (this.phase === 1 && this.direction === 0) {
      output = output.write("expanded").write(40/*'('*/);
    } else if (this.direction === 1) {
      output = output.write("expanding").write(40/*'('*/);
      if (this.phase !== 0) {
        output = output.debug(this.phase);
      }
    } else if (this.direction === -1) {
      output = output.write("collapsing").write(40/*'('*/);
      if (this.phase !== 1) {
        output = output.debug(this.phase);
      }
    } else {
      output = output.write("create").write(40/*'('*/).debug(this.phase);
      if (this.direction !== 0) {
        output = output.write(", ").debug(this.direction);
      }
    }
    output = output.write(41/*')'*/);
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static collapsed(): Expansion {
    return new Expansion(0, 0);
  }

  @Lazy
  static expanded(): Expansion {
    return new Expansion(1, 0);
  }

  static expanding(phase?: number): Expansion {
    if (phase === void 0) {
      phase = 0;
    }
    return new Expansion(phase, 1);
  }

  static collapsing(phase?: number): Expansion {
    if (phase === void 0) {
      phase = 1;
    }
    return new Expansion(phase, -1);
  }

  static create(phase: number, direction?: number): Expansion {
    if (direction === void 0) {
      direction = 0;
    }
    if (phase === 0 && direction === 0) {
      return Expansion.collapsed();
    } else if (phase === 1 && direction === 0) {
      return Expansion.expanded();
    } else {
      return new Expansion(phase, direction);
    }
  }

  static fromInit(value: ExpansionInit): Expansion {
    return new Expansion(value.phase, value.direction);
  }

  static fromAny(value: AnyExpansion): Expansion {
    if (value === void 0 || value === null || value instanceof Expansion) {
      return value;
    } else if (Expansion.isInit(value)) {
      return Expansion.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isInit(value: unknown): value is ExpansionInit {
    if (typeof value === "object" && value !== null) {
      const init = value as ExpansionInit;
      return typeof init.phase === "number"
          && typeof init.direction === "number";
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyExpansion {
    return value instanceof Expansion
        || Expansion.isInit(value);
  }
}
