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
import {Objects} from "@swim/util";
import type {TimingLike} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import {Affinity} from "@swim/component";
import type {AnimatorClass} from "@swim/component";
import {Animator} from "@swim/component";

/** @public */
export type PresenceLike = Presence | PresenceInit | boolean;

/** @public */
export const PresenceLike = {
  [Symbol.hasInstance](instance: unknown): instance is PresenceLike {
    return instance instanceof Presence
        || PresenceInit[Symbol.hasInstance](instance)
        || typeof instance === "boolean";
  },
};

/** @public */
export interface PresenceInit {
  /** @internal */
  readonly typeid?: "PresenceInit";
  readonly phase: number;
  readonly direction: number;
}

/** @public */
export const PresenceInit = {
  [Symbol.hasInstance](instance: unknown): instance is PresenceInit {
    return Objects.hasAllKeys<PresenceInit>(instance, "phase", "direction");
  },
};

/** @public */
export class Presence implements Interpolate<Presence>, HashCode, Equivalent, Debug {
  constructor(phase: number, direction: number) {
    this.phase = phase;
    this.direction = direction;
  }

  /** @internal */
  declare readonly typeid?: "Presence";

  likeType?(like: PresenceInit | boolean): void;

  readonly phase: number;

  withPhase(phase: number): Presence {
    if (phase === this.phase) {
      return this;
    }
    return Presence.create(phase, this.direction);
  }

  readonly direction: number;

  withDirection(direction: number): Presence {
    if (direction === this.direction) {
      return this;
    }
    return Presence.create(this.phase, direction);
  }

  get dismissed(): boolean {
    return this.phase === 0 && this.direction === 0;
  }

  get presented(): boolean {
    return this.phase === 1 && this.direction === 0;
  }

  get presenting(): boolean {
    return this.direction > 0;
  }

  get dismissing(): boolean {
    return this.direction < 0;
  }

  asPresenting(): Presence {
    if (this.presenting) {
      return this;
    }
    return Presence.presenting(this.phase);
  }

  asDismissing(): Presence {
    if (this.dismissing) {
      return this;
    }
    return Presence.dismissing(this.phase);
  }

  asToggling(): Presence {
    if (this.direction > 0 || this.phase >= 0.5) {
      return Presence.dismissing(this.phase);
    } else if (this.direction < 0 || this.phase < 0.5) {
      return Presence.presenting(this.phase);
    }
    return this;
  }

  asToggled(): Presence {
    if (this.direction > 0 || this.phase >= 0.5) {
      return Presence.dismissed();
    } else if (this.direction < 0 || this.phase < 0.5) {
      return Presence.presented();
    }
    return this;
  }

  /** @override */
  interpolateTo(that: Presence): Interpolator<Presence>;
  interpolateTo(that: unknown): Interpolator<Presence> | null;
  interpolateTo(that: unknown): Interpolator<Presence> | null {
    if (that instanceof Presence) {
      return PresenceInterpolator(this, that);
    }
    return null;
  }

  /** @override */
  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Presence) {
      return Numbers.equivalent(this.phase, that.phase, epsilon)
          && Numbers.equivalent(this.direction, that.direction, epsilon);
    }
    return false;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Presence) {
      return this.phase === that.phase && this.direction === that.direction;
    }
    return false;
  }

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(Presence),
        Numbers.hash(this.phase)), Numbers.hash(this.direction)));
  }

  /** @override */
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

  /** @override */
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
    }
    return new Presence(phase, direction);
  }

  static fromLike<T extends PresenceLike | null | undefined>(value: T): Presence | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Presence) {
      return value as Presence | Uninitable<T>;
    } else if (PresenceInit[Symbol.hasInstance](value)) {
      return Presence.fromInit(value);
    } else if (value === true) {
      return Presence.presented();
    } else if (value === false) {
      return Presence.dismissed();
    }
    throw new TypeError("" + value);
  }

  static fromInit(value: PresenceInit): Presence {
    return new Presence(value.phase, value.direction);
  }
}

/** @internal */
export const PresenceInterpolator = (function (_super: typeof Interpolator) {
  const PresenceInterpolator = function (p0: Presence, p1: Presence): Interpolator<Presence> {
    const interpolator = function (u: number): Presence {
      const p0 = interpolator[0];
      const p1 = interpolator[1];
      const phase = p0.phase + u * (p1.phase - p0.phase);
      const direction = u !== 1 ? p0.direction : p1.direction;
      return Presence.create(phase, direction);
    } as Interpolator<Presence>;
    Object.setPrototypeOf(interpolator, PresenceInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = p0;
    (interpolator as Mutable<typeof interpolator>)[1] = p1;
    return interpolator;
  } as {
    (p0: Presence, p1: Presence): Interpolator<Presence>;

    /** @internal */
    prototype: Interpolator<Presence>;
  };

  PresenceInterpolator.prototype = Object.create(_super.prototype);
  PresenceInterpolator.prototype.constructor = PresenceInterpolator;

  return PresenceInterpolator;
})(Interpolator);

/** @public */
export interface PresenceAnimator<R = any, T extends Presence | null | undefined = Presence | null | undefined, I extends any[] = [T]> extends Animator<R, T, I> {
  get phase(): number | undefined;

  getPhase(): number;

  getPhaseOr<E>(elsePhase: E): number | E;

  setPhase(newPhase: number, timingOrAffinity: Affinity | TimingLike | boolean | null | undefined): void;
  setPhase(newPhase: number, timing?: TimingLike | boolean | null, affinity?: Affinity): void;

  get direction(): number;

  setDirection(newDirection: number, timingOrAffinity: Affinity | TimingLike | boolean | null | undefined): void;
  setDirection(newDirection: number, timing?: TimingLike | boolean | null, affinity?: Affinity): void;

  get dismissed(): boolean;

  get presented(): boolean;

  get presenting(): boolean;

  get dismissing(): boolean;

  present(timingOrAffinity: Affinity | TimingLike | boolean | null | undefined): void;
  present(timing?: TimingLike | boolean | null, affinity?: Affinity): void;

  dismiss(timingOrAffinity: Affinity | TimingLike | boolean | null | undefined): void;
  dismiss(timing?: TimingLike | boolean | null, affinity?: Affinity): void;

  toggle(timingOrAffinity: Affinity | TimingLike | boolean | null | undefined): void;
  toggle(timing?: TimingLike | boolean | null, affinity?: Affinity): void;

  /** @protected @override */
  willSetState(newState: T, oldState: T): void;

  /** @override @protected */
  onSetValue(newValue: T, oldValue: T): void;

  /** @protected */
  willPresent(): void;

  /** @protected */
  didPresent(): void;

  /** @protected */
  willDismiss(): void;

  /** @protected */
  didDismiss(): void;

  /** @override */
  equalValues(newValue: T, oldValue: T | undefined): boolean;
}

/** @public */
export const PresenceAnimator = (<R, T extends Presence | null | undefined, I extends any[], A extends PresenceAnimator<any, any, any>>() => Animator.extend<PresenceAnimator<R, T, I>, AnimatorClass<A>>("PresenceAnimator", {
  valueType: Presence,

  get phase(): number | undefined {
    const value = this.value;
    return value !== void 0 && value !== null ? value.phase : void 0;
  },

  getPhase(): number {
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
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null) {
      return;
    } else if (typeof timing === "number") {
      affinity = timing;
      timing = void 0;
    }
    this.setState(oldValue.withPhase(newPhase) as T, timing, affinity);
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

  get dismissed(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.dismissed;
  },

  get presented(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.presented;
  },

  get presenting(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.presenting;
  },

  get dismissing(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.dismissing;
  },

  present(timing?: Affinity | TimingLike | boolean | null, affinity?: Affinity): void {
    this.setState(Presence.presented() as T, timing as any, affinity);
  },

  dismiss(timing?: Affinity | TimingLike | boolean | null, affinity?: Affinity): void {
    this.setState(Presence.dismissed() as T, timing as any, affinity);
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
      if (newState.presented) {
        this.setValue(oldValue.asPresenting() as T, Affinity.Reflexive);
      } else if (newState.dismissed) {
        this.setValue(oldValue.asDismissing() as T, Affinity.Reflexive);
      }
    }
  },

  onSetValue(newValue: T, oldValue: T): void {
    super.onSetValue(newValue, oldValue);
    if (newValue === void 0 || newValue === null || oldValue === void 0 || oldValue === null) {
      return;
    } else if (newValue.presenting && !oldValue.presenting) {
      this.willPresent();
    } else if (newValue.presented && !oldValue.presented) {
      this.didPresent();
    } else if (newValue.dismissing && !oldValue.dismissing) {
      this.willDismiss();
    } else if (newValue.dismissed && !oldValue.dismissed) {
      this.didDismiss();
    }
  },

  willPresent(): void {
    // hook
  },

  didPresent(): void {
    // hook
  },

  willDismiss(): void {
    // hook
  },

  didDismiss(): void {
    // hook
  },

  equalValues(newValue: T | undefined, oldState: T | undefined): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldState);
    }
    return newValue === oldState;
  },
}))();
