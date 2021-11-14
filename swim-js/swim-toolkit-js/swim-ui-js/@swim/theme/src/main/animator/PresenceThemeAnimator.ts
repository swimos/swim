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

import type {AnyTiming} from "@swim/util";
import type {Affinity} from "@swim/fastener";
import {AnyPresence, Presence} from "@swim/style";
import {Look} from "../look/Look";
import {ThemeContext} from "../theme/ThemeContext";
import {ThemeAnimatorFactory, ThemeAnimator} from "./ThemeAnimator";

/** @public */
export interface PresenceThemeAnimatorInit {
  willPresent?(): void;
  didPresent?(): void;
  willDismiss?(): void;
  didDismiss?(): void;
}

/** @public */
export interface PresenceThemeAnimator<O, T extends Presence | null | undefined = Presence, U extends AnyPresence | null | undefined = AnyPresence> extends ThemeAnimator<O, T, U> {
  get phase(): number | undefined;

  getPhase(): number;

  getPhaseOr<E>(elsePhase: E): number | E;

  setPhase(newPhase: number, timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  setPhase(newPhase: number, timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  get direction(): number;

  setDirection(newDirection: number, timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  setDirection(newDirection: number, timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  get modalState(): string | undefined;

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
  equalState(newState: T, oldState: T | undefined): boolean;

  /** @override */
  fromAny(value: T | U): T
}

/** @public */
export const PresenceThemeAnimator = (function (_super: typeof ThemeAnimator) {
  const PresenceThemeAnimator = _super.extend("PresenceThemeAnimator") as ThemeAnimatorFactory<PresenceThemeAnimator<any, Presence | null | undefined, AnyPresence | null | undefined>>;

  Object.defineProperty(PresenceThemeAnimator.prototype, "phase", {
    get(this: PresenceThemeAnimator<unknown>): number | undefined {
      const value = this.value;
      return value !== void 0 && value !== null ? value.phase : void 0;
    },
    configurable: true,
  });

  PresenceThemeAnimator.prototype.getPhase = function (this: PresenceThemeAnimator<unknown>): number {
    return this.getValue().phase;
  };

  PresenceThemeAnimator.prototype.getPhaseOr = function <E>(this: PresenceThemeAnimator<unknown>, elsePhase: E): number | E {
    const value = this.value;
    if (value !== void 0 && value !== null) {
      return value.phase;
    } else {
      return elsePhase;
    }
  };

  PresenceThemeAnimator.prototype.setPhase = function (this: PresenceThemeAnimator<unknown>, newPhase: number, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      this.setState(oldValue.withPhase(newPhase), timing, affinity);
    }
  };

  Object.defineProperty(PresenceThemeAnimator.prototype, "direction", {
    get(this: PresenceThemeAnimator<unknown>): number {
      const value = this.value;
      return value !== void 0 && value !== null ? value.direction : 0;
    },
    configurable: true,
  });

  PresenceThemeAnimator.prototype.setDirection = function (this: PresenceThemeAnimator<unknown>, newDirection: number, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      this.setState(oldValue.withDirection(newDirection), timing, affinity);
    }
  };

  Object.defineProperty(PresenceThemeAnimator.prototype, "modalState", {
    get(this: PresenceThemeAnimator<unknown>): string | undefined {
      const value = this.value;
      return value !== void 0 && value !== null ? value.modalState : void 0;
    },
    configurable: true,
  });

  Object.defineProperty(PresenceThemeAnimator.prototype, "dismissed", {
    get(this: PresenceThemeAnimator<unknown>): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.dismissed;
    },
    configurable: true,
  });

  Object.defineProperty(PresenceThemeAnimator.prototype, "presented", {
    get(this: PresenceThemeAnimator<unknown>): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.presented;
    },
    configurable: true,
  });

  Object.defineProperty(PresenceThemeAnimator.prototype, "presenting", {
    get(this: PresenceThemeAnimator<unknown>): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.presenting;
    },
    configurable: true,
  });

  Object.defineProperty(PresenceThemeAnimator.prototype, "dismissing", {
    get(this: PresenceThemeAnimator<unknown>): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.dismissing;
    },
    configurable: true,
  });

  PresenceThemeAnimator.prototype.present = function (this: PresenceThemeAnimator<unknown>, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.presented) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      if (timing === void 0 || timing === true) {
        const themeContext = this.owner;
        if (this.mounted && ThemeContext.is(themeContext)) {
          timing = themeContext.getLook(Look.timing);
        }
      }
      if (oldValue !== void 0 && oldValue !== null) {
        this.setValue(oldValue.asPresenting(), oldValue);
      }
      this.setState(Presence.presented(), timing, affinity);
    }
  };

  PresenceThemeAnimator.prototype.dismiss = function (this: PresenceThemeAnimator<unknown>, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.dismissed) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      if (timing === void 0 || timing === true) {
        const themeContext = this.owner;
        if (this.mounted && ThemeContext.is(themeContext)) {
          timing = themeContext.getLook(Look.timing);
        }
      }
      if (oldValue !== void 0 && oldValue !== null) {
        this.setValue(oldValue.asDismissing(), oldValue);
      }
      this.setState(Presence.dismissed(), timing, affinity);
    }
  };

  PresenceThemeAnimator.prototype.toggle = function (this: PresenceThemeAnimator<unknown>, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      if (timing === void 0 || timing === true) {
        const themeContext = this.owner;
        if (this.mounted && ThemeContext.is(themeContext)) {
          timing = themeContext.getLook(Look.timing);
        }
      }
      this.setValue(oldValue.asToggling(), oldValue);
      this.setState(oldValue.asToggled(), timing, affinity);
    }
  };

  PresenceThemeAnimator.prototype.onSetValue = function (this: PresenceThemeAnimator<unknown>, newValue: Presence | null | undefined, oldValue: Presence | null | undefined): void {
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

  PresenceThemeAnimator.prototype.willPresent = function (this: PresenceThemeAnimator<unknown>): void {
    // hook
  };

  PresenceThemeAnimator.prototype.didPresent = function (this: PresenceThemeAnimator<unknown>): void {
    // hook
  };

  PresenceThemeAnimator.prototype.willDismiss = function (this: PresenceThemeAnimator<unknown>): void {
    // hook
  };

  PresenceThemeAnimator.prototype.didDismiss = function (this: PresenceThemeAnimator<unknown>): void {
    // hook
  };

  PresenceThemeAnimator.prototype.fromAny = function (this: PresenceThemeAnimator<unknown>, value: AnyPresence | null | undefined): Presence | null | undefined {
    return value !== void 0 && value !== null ? Presence.fromAny(value) : null;
  };

  PresenceThemeAnimator.prototype.equalState = function (this: PresenceThemeAnimator<unknown>, newState: Presence | null | undefined, oldState: Presence | null | undefined): boolean {
    if (newState !== void 0 && newState !== null) {
      return newState.equals(oldState);
    } else {
      return newState === oldState;
    }
  };

  return PresenceThemeAnimator;
})(ThemeAnimator);
