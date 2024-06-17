// Copyright 2015-2024 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import type {Mutable} from "@swim/util";
import {Lazy} from "@swim/util";
import {Murmur3} from "@swim/util";
import type {Equivalent} from "@swim/util";
import type {HashCode} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import type {TimingLike} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Objects} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import {Affinity} from "@swim/component";
import type {AnimatorClass} from "@swim/component";
import {Animator} from "@swim/component";

/** @public */
export type FocusLike = Focus | FocusInit | boolean;

/** @public */
export const FocusLike = {
  [Symbol.hasInstance](instance: unknown): instance is FocusLike {
    return instance instanceof Focus
        || FocusInit[Symbol.hasInstance](instance)
        || typeof instance === "boolean";
  },
};

/** @public */
export interface FocusInit {
  /** @internal */
  readonly typeid?: "FocusInit";
  readonly phase: number;
  readonly direction: number;
}

/** @public */
export const FocusInit = {
  [Symbol.hasInstance](instance: unknown): instance is FocusInit {
    return Objects.hasAllKeys<FocusInit>(instance, "phase", "direction");
  },
};

/** @public */
export class Focus implements Interpolate<Focus>, HashCode, Equivalent, Debug {
  constructor(phase: number, direction: number) {
    this.phase = phase;
    this.direction = direction;
  }

  /** @internal */
  declare readonly typeid?: "Focus";

  likeType?(like: FocusInit | boolean): void;

  readonly phase: number;

  withPhase(phase: number): Focus {
    if (phase === this.phase) {
      return this;
    }
    return Focus.create(phase, this.direction);
  }

  readonly direction: number;

  withDirection(direction: number): Focus {
    if (direction === this.direction) {
      return this;
    }
    return Focus.create(this.phase, direction);
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
    if (this.focusing) {
      return this;
    }
    return Focus.focusing(this.phase);
  }

  asUnfocusing(): Focus {
    if (this.unfocusing) {
      return this;
    }
    return Focus.unfocusing(this.phase);
  }

  asToggling(): Focus {
    if (this.direction > 0 || this.phase >= 0.5) {
      return Focus.unfocusing(this.phase);
    } else if (this.direction < 0 || this.phase < 0.5) {
      return Focus.focusing(this.phase);
    }
    return this;
  }

  asToggled(): Focus {
    if (this.direction > 0 || this.phase >= 0.5) {
      return Focus.unfocused();
    } else if (this.direction < 0 || this.phase < 0.5) {
      return Focus.focused();
    }
    return this;
  }

  /** @override */
  interpolateTo(that: Focus): Interpolator<Focus>;
  interpolateTo(that: unknown): Interpolator<Focus> | null;
  interpolateTo(that: unknown): Interpolator<Focus> | null {
    if (that instanceof Focus) {
      return FocusInterpolator(this, that);
    }
    return null;
  }

  /** @override */
  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Focus) {
      return Numbers.equivalent(this.phase, that.phase, epsilon)
          && Numbers.equivalent(this.direction, that.direction, epsilon);
    }
    return false;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Focus) {
      return this.phase === that.phase && this.direction === that.direction;
    }
    return false;
  }

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(Focus),
        Numbers.hash(this.phase)), Numbers.hash(this.direction)));
  }

  /** @override */
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

  /** @override */
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
    }
    return new Focus(phase, direction);
  }

  static fromLike<T extends FocusLike | null | undefined>(value: T): Focus | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Focus) {
      return value as Focus | Uninitable<T>;
    } else if (FocusInit[Symbol.hasInstance](value)) {
      return Focus.fromInit(value);
    } else if (value === true) {
      return Focus.focused();
    } else if (value === false) {
      return Focus.unfocused();
    }
    throw new TypeError("" + value);
  }

  static fromInit(value: FocusInit): Focus {
    return new Focus(value.phase, value.direction);
  }
}

/** @internal */
export const FocusInterpolator = (function (_super: typeof Interpolator) {
  const FocusInterpolator = function (f0: Focus, f1: Focus): Interpolator<Focus> {
    const interpolator = function (u: number): Focus {
      const f0 = interpolator[0];
      const f1 = interpolator[1];
      const phase = f0.phase + u * (f1.phase - f0.phase);
      const direction = u !== 1 ? f0.direction : f1.direction;
      return Focus.create(phase, direction);
    } as Interpolator<Focus>;
    Object.setPrototypeOf(interpolator, FocusInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = f0;
    (interpolator as Mutable<typeof interpolator>)[1] = f1;
    return interpolator;
  } as {
    (f0: Focus, f1: Focus): Interpolator<Focus>;

    /** @internal */
    prototype: Interpolator<Focus>;
  };

  FocusInterpolator.prototype = Object.create(_super.prototype);
  FocusInterpolator.prototype.constructor = FocusInterpolator;

  return FocusInterpolator;
})(Interpolator);

/** @public */
export interface FocusAnimator<R = any, T extends Focus | null | undefined = Focus | null | undefined, I extends any[] = [T]> extends Animator<R, T, I> {
  get phase(): number | undefined;

  getPhase(): number;

  getPhaseOr<E>(elsePhase: E): number | E;

  setPhase(newPhase: number, timingOrAffinity: Affinity | TimingLike | boolean | null | undefined): void;
  setPhase(newPhase: number, timing?: TimingLike | boolean | null, affinity?: Affinity): void;

  get direction(): number;

  setDirection(newDirection: number, timingOrAffinity: Affinity | TimingLike | boolean | null | undefined): void;
  setDirection(newDirection: number, timing?: TimingLike | boolean | null, affinity?: Affinity): void;

  get unfocused(): boolean;

  get focused(): boolean;

  get focusing(): boolean;

  get unfocusing(): boolean;

  focus(timingOrAffinity: Affinity | TimingLike | boolean | null | undefined): void;
  focus(timing?: TimingLike | boolean | null, affinity?: Affinity): void;

  unfocus(timingOrAffinity: Affinity | TimingLike | boolean | null | undefined): void;
  unfocus(timing?: TimingLike | boolean | null, affinity?: Affinity): void;

  toggle(timingOrAffinity: Affinity | TimingLike | boolean | null | undefined): void;
  toggle(timing?: TimingLike | boolean | null, affinity?: Affinity): void;

  /** @protected @override */
  willSetState(newState: T, oldState: T): void;

  /** @override @protected */
  onSetValue(newValue: T, oldValue: T): void;

  /** @protected */
  willFocus(): void;

  /** @protected */
  didFocus(): void;

  /** @protected */
  willUnfocus(): void;

  /** @protected */
  didUnfocus(): void;

  /** @override */
  equalValues(newState: T, oldState: T | undefined): boolean;
}

/** @public */
export const FocusAnimator = (<R, T extends Focus | null | undefined, I extends any[], A extends FocusAnimator<any, any, any>>() => Animator.extend<FocusAnimator<R, T, I>, AnimatorClass<A>>("FocusAnimator", {
  valueType: Focus,

  get phase(): number | undefined {
    const value = this.value;
    return value !== void 0 && value !== null ? value.phase : void 0;
  },

  getPhase(this: FocusAnimator): number {
    return this.getValue().phase;
  },

  getPhaseOr<E>(elsePhase: E): number | E {
    const value = this.value;
    if (value === void 0 || value === null) {
      return elsePhase;
    }
    return value.phase;
  },

  setPhase(newPhase: number, timing?: Affinity | TimingLike | boolean | null, affinity?: Affinity): void {
    const value = this.value;
    if (value === void 0 || value === null) {
      return;
    } else if (typeof timing === "number") {
      affinity = timing;
      timing = void 0;
    }
    this.setState(value.withPhase(newPhase) as T, timing, affinity);
  },

  get direction(): number {
    const value = this.value;
    return value !== void 0 && value !== null ? value.direction : 0;
  },

  setDirection(newDirection: number, timing?: Affinity | TimingLike | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null) {
      return;
    } else if (typeof timing === "number") {
      affinity = timing;
      timing = void 0;
    }
    this.setState(oldValue.withDirection(newDirection) as T, timing, affinity);
  },

  get unfocused(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.unfocused;
  },

  get focused(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.focused;
  },

  get focusing(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.focusing;
  },

  get unfocusing(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.unfocusing;
  },

  focus(timing?: Affinity | TimingLike | boolean | null, affinity?: Affinity): void {
    this.setState(Focus.focused() as T, timing as any, affinity);
  },

  unfocus(timing?: Affinity | TimingLike | boolean | null, affinity?: Affinity): void {
    this.setState(Focus.unfocused() as T, timing as any, affinity);
  },

  toggle(timing?: Affinity | TimingLike | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      this.setState(oldValue.asToggled() as T, timing as any, affinity);
    }
  },

  willSetState(newState: T, oldState: T): void {
    super.willSetState(newState, oldState);
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null && newState !== void 0 && newState !== null) {
      if (newState.focused) {
        this.setValue(oldValue.asFocusing() as T, Affinity.Reflexive);
      } else if (newState.unfocused) {
        this.setValue(oldValue.asUnfocusing() as T, Affinity.Reflexive);
      }
    }
  },

  onSetValue(newValue: T, oldValue: T): void {
    super.onSetValue(newValue, oldValue);
    if (newValue === void 0 || newValue === null || oldValue === void 0 || oldValue === null) {
      return;
    } else if (newValue.focusing && !oldValue.focusing) {
      this.willFocus();
    } else if (newValue.focused && !oldValue.focused) {
      this.didFocus();
    } else if (newValue.unfocusing && !oldValue.unfocusing) {
      this.willUnfocus();
    } else if (newValue.unfocused && !oldValue.unfocused) {
      this.didUnfocus();
    }
  },

  willFocus(this: FocusAnimator): void {
    // hook
  },

  didFocus(this: FocusAnimator): void {
    // hook
  },

  willUnfocus(this: FocusAnimator): void {
    // hook
  },

  didUnfocus(this: FocusAnimator): void {
    // hook
  },

  equalValues(newState: T | undefined, oldState: T | undefined): boolean {
    if (newState !== void 0 && newState !== null) {
      return newState.equals(oldState);
    }
    return newState === oldState;
  },
}))();
