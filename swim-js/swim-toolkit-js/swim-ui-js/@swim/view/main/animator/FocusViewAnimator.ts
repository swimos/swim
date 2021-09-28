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
import {AnyFocus, Focus} from "@swim/style";
import {Look} from "@swim/theme";
import {ViewPrecedence, View} from "../View";
import {ViewAnimator} from "./ViewAnimator";

export interface FocusViewAnimatorInit {
  willFocus?(): void;
  didFocus?(): void;
  willUnfocus?(): void;
  didUnfocus?(): void;
}

export abstract class FocusViewAnimator<V extends View, T extends Focus | null | undefined = Focus, U extends AnyFocus | null | undefined = AnyFocus> extends ViewAnimator<V, T, U> {
  get phase(): number | undefined {
    const value = this.value;
    return value !== void 0 && value !== null ? value.phase : void 0;
  }

  getPhase(): number {
    return this.getValue().phase;
  }

  getPhaseOr<E>(elsePhase: E): number | E {
    const value = this.value;
    if (value !== void 0 && value !== null) {
      return value.phase;
    } else {
      return elsePhase;
    }
  }

  setPhase(newPhase: number, precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  setPhase(newPhase: number, timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;
  setPhase(newPhase: number, timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      if (typeof timing === "number") {
        precedence = timing;
        timing = void 0;
      } else if (precedence === void 0) {
        precedence = View.Extrinsic;
      }
      this.setState(oldValue.withPhase(newPhase) as T, timing, precedence);
    }
  }

  get direction(): number {
    const value = this.value;
    return value !== void 0 && value !== null ? value.direction : 0;
  }

  setDirection(newDirection: number, precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  setDirection(newDirection: number, timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;
  setDirection(newDirection: number, timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      if (typeof timing === "number") {
        precedence = timing;
        timing = void 0;
      } else if (precedence === void 0) {
        precedence = View.Extrinsic;
      }
      this.setState(oldValue.withDirection(newDirection) as T, timing, precedence);
    }
  }

  isUnfocused(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.isUnfocused();
  }

  isFocused(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.isFocused();
  }

  isFocusing(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.isFocusing();
  }

  isUnfocusing(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.isUnfocusing();
  }

  focus(precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  focus(timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;
  focus(timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.isFocused()) {
      if (typeof timing === "number") {
        precedence = timing;
        timing = void 0;
      } else if (precedence === void 0) {
        precedence = View.Extrinsic;
      }
      if (timing === void 0 || timing === true) {
        timing = this.owner.getLookOr(Look.timing, false);
      }
      if (oldValue !== void 0 && oldValue !== null) {
        this.setValue(oldValue.focusing() as T, oldValue);
      }
      this.setState(Focus.focused() as T, timing, precedence);
    }
  }

  unfocus(precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  unfocus(timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;
  unfocus(timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.isUnfocused()) {
      if (typeof timing === "number") {
        precedence = timing;
        timing = void 0;
      } else if (precedence === void 0) {
        precedence = View.Extrinsic;
      }
      if (timing === void 0 || timing === true) {
        timing = this.owner.getLookOr(Look.timing, false);
      }
      if (oldValue !== void 0 && oldValue !== null) {
        this.setValue(oldValue.unfocusing() as T, oldValue);
      }
      this.setState(Focus.unfocused() as T, timing, precedence);
    }
  }

  toggle(precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  toggle(timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;
  toggle(timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      if (typeof timing === "number") {
        precedence = timing;
        timing = void 0;
      } else if (precedence === void 0) {
        precedence = View.Extrinsic;
      }
      if (timing === void 0 || timing === true) {
        timing = this.owner.getLookOr(Look.timing, false);
      }
      this.setValue(oldValue.toggling() as T, oldValue);
      this.setState(oldValue.toggled() as T, timing, precedence);
    }
  }

  protected willFocus(): void {
    // hook
  }

  protected didFocus(): void {
    // hook
  }

  protected willUnfocus(): void {
    // hook
  }

  protected didUnfocus(): void {
    // hook
  }

  override onSetValue(newValue: T, oldValue: T): void {
    super.onSetValue(newValue, oldValue);
    if (newValue !== void 0 && newValue !== null && oldValue !== void 0 && oldValue !== null) {
      if (newValue.isFocusing() && !oldValue.isFocusing()) {
        this.willFocus();
      } else if (newValue.isFocused() && !oldValue.isFocused()) {
        this.didFocus();
      } else if (newValue.isUnfocusing() && !oldValue.isUnfocusing()) {
        this.willUnfocus();
      } else if (newValue.isUnfocused() && !oldValue.isUnfocused()) {
        this.didUnfocus();
      }
    }
  }

  override fromAny(value: T | U): T {
    return (value !== void 0 && value !== null ? Focus.fromAny(value) : value) as T;
  }
}
