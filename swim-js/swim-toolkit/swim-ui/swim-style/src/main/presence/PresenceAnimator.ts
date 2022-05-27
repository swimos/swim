// Copyright 2015-2022 Swim.inc
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

import type {AnyTiming} from "@swim/util";
import {Affinity, AnimatorClass, Animator} from "@swim/component";
import {AnyPresence, Presence} from "./Presence";

/** @public */
export interface PresenceAnimator<O = unknown, T extends Presence | null | undefined = Presence | null | undefined, U extends AnyPresence | null | undefined = AnyPresence | T> extends Animator<O, T, U> {
  get phase(): number | undefined;

  getPhase(): number;

  getPhaseOr<E>(elsePhase: E): number | E;

  setPhase(newPhase: number, timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  setPhase(newPhase: number, timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  get direction(): number;

  setDirection(newDirection: number, timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  setDirection(newDirection: number, timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  get dismissed(): boolean;

  get presented(): boolean;

  get presenting(): boolean;

  get dismissing(): boolean;

  present(timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  present(timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  dismiss(timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  dismiss(timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  toggle(timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  toggle(timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

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

  /** @override */
  fromAny(value: T | U): T;
}

/** @public */
export const PresenceAnimator = (function (_super: typeof Animator) {
  const PresenceAnimator = _super.extend("PresenceAnimator", {
    valueType: Presence,
  }) as AnimatorClass<PresenceAnimator<any, any, any>>;

  Object.defineProperty(PresenceAnimator.prototype, "phase", {
    get(this: PresenceAnimator): number | undefined {
      const value = this.value;
      return value !== void 0 && value !== null ? value.phase : void 0;
    },
    configurable: true,
  });

  PresenceAnimator.prototype.getPhase = function (this: PresenceAnimator): number {
    return this.getValue().phase;
  };

  PresenceAnimator.prototype.getPhaseOr = function <E>(this: PresenceAnimator, elsePhase: E): number | E {
    const value = this.value;
    if (value !== void 0 && value !== null) {
      return value.phase;
    } else {
      return elsePhase;
    }
  };

  PresenceAnimator.prototype.setPhase = function (this: PresenceAnimator, newPhase: number, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      this.setState(oldValue.withPhase(newPhase), timing, affinity);
    }
  };

  Object.defineProperty(PresenceAnimator.prototype, "direction", {
    get(this: PresenceAnimator): number {
      const value = this.value;
      return value !== void 0 && value !== null ? value.direction : 0;
    },
    configurable: true,
  });

  PresenceAnimator.prototype.setDirection = function (this: PresenceAnimator, newDirection: number, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      this.setState(oldValue.withDirection(newDirection), timing, affinity);
    }
  };

  Object.defineProperty(PresenceAnimator.prototype, "dismissed", {
    get(this: PresenceAnimator): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.dismissed;
    },
    configurable: true,
  });

  Object.defineProperty(PresenceAnimator.prototype, "presented", {
    get(this: PresenceAnimator): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.presented;
    },
    configurable: true,
  });

  Object.defineProperty(PresenceAnimator.prototype, "presenting", {
    get(this: PresenceAnimator): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.presenting;
    },
    configurable: true,
  });

  Object.defineProperty(PresenceAnimator.prototype, "dismissing", {
    get(this: PresenceAnimator): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.dismissing;
    },
    configurable: true,
  });

  PresenceAnimator.prototype.present = function (this: PresenceAnimator, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.presented) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      if (timing === void 0 || timing === true) {
        timing = this.transition;
      }
      if (oldValue !== void 0 && oldValue !== null) {
        this.setValue(oldValue.asPresenting(), Affinity.Reflexive);
      }
      this.setState(Presence.presented(), timing, affinity);
    }
  };

  PresenceAnimator.prototype.dismiss = function (this: PresenceAnimator, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.dismissed) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      if (timing === void 0 || timing === true) {
        timing = this.transition;
      }
      if (oldValue !== void 0 && oldValue !== null) {
        this.setValue(oldValue.asDismissing(), Affinity.Reflexive);
      }
      this.setState(Presence.dismissed(), timing, affinity);
    }
  };

  PresenceAnimator.prototype.toggle = function (this: PresenceAnimator, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      if (timing === void 0 || timing === true) {
        timing = this.transition;
      }
      this.setValue(oldValue.asToggling(), Affinity.Reflexive);
      this.setState(oldValue.asToggled(), timing, affinity);
    }
  };

  PresenceAnimator.prototype.onSetValue = function (this: PresenceAnimator, newValue: Presence | null | undefined, oldValue: Presence | null | undefined): void {
    _super.prototype.onSetValue.call(this, newValue, oldValue);
    if (newValue !== void 0 && newValue !== null && oldValue !== void 0 && oldValue !== null) {
      if (newValue.presenting && !oldValue.presenting) {
        this.willPresent();
      } else if (newValue.presented && !oldValue.presented) {
        this.didPresent();
      } else if (newValue.dismissing && !oldValue.dismissing) {
        this.willDismiss();
      } else if (newValue.dismissed && !oldValue.dismissed) {
        this.didDismiss();
      }
    }
  };

  PresenceAnimator.prototype.willPresent = function (this: PresenceAnimator): void {
    // hook
  };

  PresenceAnimator.prototype.didPresent = function (this: PresenceAnimator): void {
    // hook
  };

  PresenceAnimator.prototype.willDismiss = function (this: PresenceAnimator): void {
    // hook
  };

  PresenceAnimator.prototype.didDismiss = function (this: PresenceAnimator): void {
    // hook
  };

  PresenceAnimator.prototype.fromAny = function (this: PresenceAnimator, value: AnyPresence | null | undefined): Presence | null | undefined {
    return value !== void 0 && value !== null ? Presence.fromAny(value) : null;
  };

  PresenceAnimator.prototype.equalValues = function (this: PresenceAnimator, newValue: Presence | null | undefined, oldState: Presence | null | undefined): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldState);
    } else {
      return newValue === oldState;
    }
  };

  return PresenceAnimator;
})(Animator);
