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
import {FocusInterpolator} from "./FocusInterpolator";

export type AnyFocus = Focus | FocusInit;

export interface FocusInit {
  readonly phase: number;
  readonly direction: number;
}

export class Focus implements Interpolate<Focus>, HashCode, Equivalent, Debug {
  constructor(phase: number, direction: number) {
    this.phase = phase;
    this.direction = direction;
  }

  readonly phase: number;

  withPhase(phase: number): Focus {
    if (phase !== this.phase) {
      return Focus.create(phase, this.direction);
    } else {
      return this;
    }
  }

  readonly direction: number;

  withDirection(direction: number): Focus {
    if (direction !== this.direction) {
      return Focus.create(this.phase, direction);
    } else {
      return this;
    }
  }

  get unfocused(): boolean {
    return this.phase === 0 && this.direction === 0;
  }

  get focused(): boolean {
    return this.phase === 1 && this.direction === 0;
  }

  get focusing(): boolean {
    return this.direction > 0;
  }

  get unfocusing(): boolean {
    return this.direction < 0;
  }

  asFocusing(): Focus {
    if (!this.focusing) {
      return Focus.focusing(this.phase);
    } else {
      return this;
    }
  }

  asUnfocusing(): Focus {
    if (!this.unfocusing) {
      return Focus.unfocusing(this.phase);
    } else {
      return this;
    }
  }

  asToggling(): Focus {
    if (this.direction > 0 || this.phase >= 0.5) {
      return Focus.unfocusing(this.phase);
    } else if (this.direction < 0 || this.phase < 0.5) {
      return Focus.focusing(this.phase);
    } else {
      return this;
    }
  }

  asToggled(): Focus {
    if (this.direction > 0 || this.phase >= 0.5) {
      return Focus.unfocused();
    } else if (this.direction < 0 || this.phase < 0.5) {
      return Focus.focused();
    } else {
      return this;
    }
  }

  interpolateTo(that: Focus): Interpolator<Focus>;
  interpolateTo(that: unknown): Interpolator<Focus> | null;
  interpolateTo(that: unknown): Interpolator<Focus> | null {
    if (that instanceof Focus) {
      return FocusInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Focus) {
      return Numbers.equivalent(this.phase, that.phase, epsilon)
          && Numbers.equivalent(this.direction, that.direction, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Focus) {
      return this.phase === that.phase && this.direction === that.direction;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(Focus),
        Numbers.hash(this.phase)), Numbers.hash(this.direction)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("Focus").write(46/*'.'*/);
    if (this.phase === 0 && this.direction === 0) {
      output = output.write("unfocused").write(40/*'('*/);
    } else if (this.phase === 1 && this.direction === 0) {
      output = output.write("focused").write(40/*'('*/);
    } else if (this.direction === 1) {
      output = output.write("focusing").write(40/*'('*/);
      if (this.phase !== 0) {
        output = output.debug(this.phase);
      }
    } else if (this.direction === -1) {
      output = output.write("unfocusing").write(40/*'('*/);
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
  static unfocused(): Focus {
    return new Focus(0, 0);
  }

  @Lazy
  static focused(): Focus {
    return new Focus(1, 0);
  }

  static focusing(phase?: number): Focus {
    if (phase === void 0) {
      phase = 0;
    }
    return new Focus(phase, 1);
  }

  static unfocusing(phase?: number): Focus {
    if (phase === void 0) {
      phase = 1;
    }
    return new Focus(phase, -1);
  }

  static create(phase: number, direction?: number): Focus {
    if (direction === void 0) {
      direction = 0;
    }
    if (phase === 0 && direction === 0) {
      return Focus.unfocused();
    } else if (phase === 1 && direction === 0) {
      return Focus.focused();
    } else {
      return new Focus(phase, direction);
    }
  }

  static fromInit(value: FocusInit): Focus {
    return new Focus(value.phase, value.direction);
  }

  static fromAny(value: AnyFocus): Focus {
    if (value === void 0 || value === null || value instanceof Focus) {
      return value;
    } else if (Focus.isInit(value)) {
      return Focus.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @internal */
  static isInit(value: unknown): value is FocusInit {
    if (typeof value === "object" && value !== null) {
      const init = value as FocusInit;
      return typeof init.phase === "number"
          && typeof init.direction === "number";
    }
    return false;
  }

  /** @internal */
  static isAny(value: unknown): value is AnyFocus {
    return value instanceof Focus
        || Focus.isInit(value);
  }
}
