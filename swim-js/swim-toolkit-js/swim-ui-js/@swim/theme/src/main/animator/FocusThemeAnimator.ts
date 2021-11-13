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
import {AnyFocus, Focus} from "@swim/style";
import {Look} from "../look/Look";
import {ThemeContext} from "../theme/ThemeContext";
import {ThemeAnimatorFactory, ThemeAnimator} from "./ThemeAnimator";

export interface FocusThemeAnimatorInit {
  willFocus?(): void;
  didFocus?(): void;
  willUnfocus?(): void;
  didUnfocus?(): void;
}

export interface FocusThemeAnimator<O, T extends Focus | null | undefined = Focus, U extends AnyFocus | null | undefined = AnyFocus> extends ThemeAnimator<O, T, U> {
  get phase(): number | undefined;

  getPhase(): number;

  getPhaseOr<E>(elsePhase: E): number | E;

  setPhase(newPhase: number, timingOrAffinity: Affinity | AnyTiming | boolean | undefined): void;
  setPhase(newPhase: number, timing?: AnyTiming | boolean, affinity?: Affinity): void;

  get direction(): number;

  setDirection(newDirection: number, timingOrAffinity: Affinity | AnyTiming | boolean | undefined): void;
  setDirection(newDirection: number, timing?: AnyTiming | boolean, affinity?: Affinity): void;

  get unfocused(): boolean;

  get focused(): boolean;

  get focusing(): boolean;

  get unfocusing(): boolean;

  focus(timingOrAffinity: Affinity | AnyTiming | boolean | undefined): void;
  focus(timing?: AnyTiming | boolean, affinity?: Affinity): void;

  unfocus(timingOrAffinity: Affinity | AnyTiming | boolean | undefined): void;
  unfocus(timing?: AnyTiming | boolean, affinity?: Affinity): void;

  toggle(timingOrAffinity: Affinity | AnyTiming | boolean | undefined): void;
  toggle(timing?: AnyTiming | boolean, affinity?: Affinity): void;

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
  equalState(newState: T, oldState: T | undefined): boolean;

  /** @override */
  fromAny(value: T | U): T
}

export const FocusThemeAnimator = (function (_super: typeof ThemeAnimator) {
  const FocusThemeAnimator = _super.extend("FocusThemeAnimator") as ThemeAnimatorFactory<FocusThemeAnimator<any, Focus | null | undefined, AnyFocus | null | undefined>>;

  Object.defineProperty(FocusThemeAnimator.prototype, "phase", {
    get(this: FocusThemeAnimator<unknown>): number | undefined {
      const value = this.value;
      return value !== void 0 && value !== null ? value.phase : void 0;
    },
    configurable: true,
  });

  FocusThemeAnimator.prototype.getPhase = function (this: FocusThemeAnimator<unknown>): number {
    return this.getValue().phase;
  };

  FocusThemeAnimator.prototype.getPhaseOr = function <E>(this: FocusThemeAnimator<unknown>, elsePhase: E): number | E {
    const value = this.value;
    if (value !== void 0 && value !== null) {
      return value.phase;
    } else {
      return elsePhase;
    }
  };

  FocusThemeAnimator.prototype.setPhase = function (this: FocusThemeAnimator<unknown>, newPhase: number, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      this.setState(oldValue.withPhase(newPhase), timing, affinity);
    }
  };

  Object.defineProperty(FocusThemeAnimator.prototype, "direction", {
    get(this: FocusThemeAnimator<unknown>): number {
      const value = this.value;
      return value !== void 0 && value !== null ? value.direction : 0;
    },
    configurable: true,
  });

  FocusThemeAnimator.prototype.setDirection = function (this: FocusThemeAnimator<unknown>, newDirection: number, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      this.setState(oldValue.withDirection(newDirection), timing, affinity);
    }
  };

  Object.defineProperty(FocusThemeAnimator.prototype, "unfocused", {
    get(this: FocusThemeAnimator<unknown>): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.unfocused;
    },
    configurable: true,
  });

  Object.defineProperty(FocusThemeAnimator.prototype, "focused", {
    get(this: FocusThemeAnimator<unknown>): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.focused;
    },
    configurable: true,
  });

  Object.defineProperty(FocusThemeAnimator.prototype, "focusing", {
    get(this: FocusThemeAnimator<unknown>): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.focusing;
    },
    configurable: true,
  });

  Object.defineProperty(FocusThemeAnimator.prototype, "unfocusing", {
    get(this: FocusThemeAnimator<unknown>): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.unfocusing;
    },
    configurable: true,
  });

  FocusThemeAnimator.prototype.focus = function (this: FocusThemeAnimator<unknown>, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.focused) {
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
        this.setValue(oldValue.asFocusing(), oldValue);
      }
      this.setState(Focus.focused(), timing, affinity);
    }
  };

  FocusThemeAnimator.prototype.unfocus = function (this: FocusThemeAnimator<unknown>, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.unfocused) {
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
        this.setValue(oldValue.asUnfocusing(), oldValue);
      }
      this.setState(Focus.unfocused(), timing, affinity);
    }
  };

  FocusThemeAnimator.prototype.toggle = function (this: FocusThemeAnimator<unknown>, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
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

  FocusThemeAnimator.prototype.onSetValue = function (this: FocusThemeAnimator<unknown>, newValue: Focus | null | undefined, oldValue: Focus | null | undefined): void {
    _super.prototype.onSetValue.call(this, newValue, oldValue);
    if (newValue !== void 0 && newValue !== null && oldValue !== void 0 && oldValue !== null) {
      if (newValue.focusing && !oldValue.focusing) {
        this.willFocus();
      } else if (newValue.focused && !oldValue.focused) {
        this.didFocus();
      } else if (newValue.unfocusing && !oldValue.unfocusing) {
        this.willUnfocus();
      } else if (newValue.unfocused && !oldValue.unfocused) {
        this.didUnfocus();
      }
    }
  };

  FocusThemeAnimator.prototype.willFocus = function (this: FocusThemeAnimator<unknown>): void {
    // hook
  };

  FocusThemeAnimator.prototype.didFocus = function (this: FocusThemeAnimator<unknown>): void {
    // hook
  };

  FocusThemeAnimator.prototype.willUnfocus = function (this: FocusThemeAnimator<unknown>): void {
    // hook
  };

  FocusThemeAnimator.prototype.didUnfocus = function (this: FocusThemeAnimator<unknown>): void {
    // hook
  };

  FocusThemeAnimator.prototype.fromAny = function (this: FocusThemeAnimator<unknown>, value: AnyFocus | null | undefined): Focus | null | undefined {
    return value !== void 0 && value !== null ? Focus.fromAny(value) : null;
  };

  FocusThemeAnimator.prototype.equalState = function (this: FocusThemeAnimator<unknown>, newState: Focus | null | undefined, oldState: Focus | null | undefined): boolean {
    if (newState !== void 0 && newState !== null) {
      return newState.equals(oldState);
    } else {
      return newState === oldState;
    }
  };

  return FocusThemeAnimator;
})(ThemeAnimator);
