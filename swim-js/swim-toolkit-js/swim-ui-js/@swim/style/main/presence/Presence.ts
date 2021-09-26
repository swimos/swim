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

import {Equivalent, HashCode, Lazy, Murmur3, Numbers, Constructors} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import type {Interpolate, Interpolator} from "@swim/mapping";
import {PresenceInterpolator} from "./PresenceInterpolator";

export type AnyPresence = Presence | PresenceInit;

export interface PresenceInit {
  readonly phase: number;
  readonly direction: number;
}

export class Presence implements Interpolate<Presence>, HashCode, Equivalent, Debug {
  constructor(phase: number, direction: number) {
    this.phase = phase;
    this.direction = direction;
  }

  readonly phase: number;

  withPhase(phase: number): Presence {
    if (phase !== this.phase) {
      return Presence.create(phase, this.direction);
    } else {
      return this;
    }
  }

  readonly direction: number;

  withDirection(direction: number): Presence {
    if (direction !== this.direction) {
      return Presence.create(this.phase, direction);
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

  isDismissed(): boolean {
    return this.phase === 0 && this.direction === 0;
  }

  isPresented(): boolean {
    return this.phase === 1 && this.direction === 0;
  }

  isPresenting(): boolean {
    return this.direction > 0;
  }

  isDismissing(): boolean {
    return this.direction < 0;
  }

  presenting(): Presence {
    if (!this.isPresenting()) {
      return Presence.presenting(this.phase);
    } else {
      return this;
    }
  }

  dismissing(): Presence {
    if (!this.isDismissing()) {
      return Presence.dismissing(this.phase);
    } else {
      return this;
    }
  }

  toggling(): Presence {
    if (this.direction > 0 || this.phase >= 0.5) {
      return Presence.dismissing(this.phase);
    } else if (this.direction < 0 || this.phase < 0.5) {
      return Presence.presenting(this.phase);
    } else {
      return this;
    }
  }

  toggled(): Presence {
    if (this.direction > 0 || this.phase >= 0.5) {
      return Presence.dismissed();
    } else if (this.direction < 0 || this.phase < 0.5) {
      return Presence.presented();
    } else {
      return this;
    }
  }

  interpolateTo(that: Presence): Interpolator<Presence>;
  interpolateTo(that: unknown): Interpolator<Presence> | null;
  interpolateTo(that: unknown): Interpolator<Presence> | null {
    if (that instanceof Presence) {
      return PresenceInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Presence) {
      return Numbers.equivalent(this.phase, that.phase, epsilon)
          && Numbers.equivalent(this.direction, that.direction, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Presence) {
      return this.phase === that.phase && this.direction === that.direction;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(Presence),
        Numbers.hash(this.phase)), Numbers.hash(this.direction)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("Presence").write(46/*'.'*/);
    if (this.phase === 0 && this.direction === 0) {
      output = output.write("dismissed").write(40/*'('*/);
    } else if (this.phase === 1 && this.direction === 0) {
      output = output.write("presented").write(40/*'('*/);
    } else if (this.direction === 1) {
      output = output.write("presenting").write(40/*'('*/);
      if (this.phase !== 0) {
        output = output.debug(this.phase);
      }
    } else if (this.direction === -1) {
      output = output.write("dismissing").write(40/*'('*/);
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
  static dismissed(): Presence {
    return new Presence(0, 0);
  }

  @Lazy
  static presented(): Presence {
    return new Presence(1, 0);
  }

  static presenting(phase?: number): Presence {
    if (phase === void 0) {
      phase = 0;
    }
    return new Presence(phase, 1);
  }

  static dismissing(phase?: number): Presence {
    if (phase === void 0) {
      phase = 1;
    }
    return new Presence(phase, -1);
  }

  static create(phase: number, direction?: number): Presence {
    if (direction === void 0) {
      direction = 0;
    }
    if (phase === 0 && direction === 0) {
      return Presence.dismissed();
    } else if (phase === 1 && direction === 0) {
      return Presence.presented();
    } else {
      return new Presence(phase, direction);
    }
  }

  static fromInit(value: PresenceInit): Presence {
    return new Presence(value.phase, value.direction);
  }

  static fromAny(value: AnyPresence): Presence {
    if (value === void 0 || value === null || value instanceof Presence) {
      return value;
    } else if (Presence.isInit(value)) {
      return Presence.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isInit(value: unknown): value is PresenceInit {
    if (typeof value === "object" && value !== null) {
      const init = value as PresenceInit;
      return typeof init.phase === "number"
          && typeof init.direction === "number";
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyPresence {
    return value instanceof Presence
        || Presence.isInit(value);
  }
}
