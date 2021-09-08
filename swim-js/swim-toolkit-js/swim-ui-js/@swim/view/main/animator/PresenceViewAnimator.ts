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

import type {AnyTiming} from "@swim/mapping";
import {AnyPresence, Presence} from "@swim/style";
import {Look} from "@swim/theme";
import {ViewPrecedence, View} from "../View";
import type {ModalState} from "../modal/Modal";
import {ViewAnimator} from "./ViewAnimator";

export interface PresenceViewAnimatorInit {
  willPresent?(): void;
  didPresent?(): void;
  willDismiss?(): void;
  didDismiss?(): void;
}

export abstract class PresenceViewAnimator<V extends View, T extends Presence | null | undefined = Presence, U extends AnyPresence | null | undefined = AnyPresence> extends ViewAnimator<V, T, U> {
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

  get modalState(): ModalState | undefined {
    const value = this.value;
    return value !== void 0 && value !== null ? value.modalState : void 0;
  }

  isDismissed(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.isDismissed();
  }

  isPresented(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.isPresented();
  }

  isPresenting(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.isPresenting();
  }

  isDismissing(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.isDismissing();
  }

  present(precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  present(timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;
  present(timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.isPresented()) {
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
        this.setValue(oldValue.presenting() as T, oldValue);
      }
      this.setState(Presence.presented() as T, timing, precedence);
    }
  }

  dismiss(precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  dismiss(timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;
  dismiss(timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.isDismissed()) {
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
        this.setValue(oldValue.dismissing() as T, oldValue);
      }
      this.setState(Presence.dismissed() as T, timing, precedence);
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

  protected willPresent(): void {
    // hook
  }

  protected didPresent(): void {
    // hook
  }

  protected willDismiss(): void {
    // hook
  }

  protected didDismiss(): void {
    // hook
  }

  override onSetValue(newValue: T, oldValue: T): void {
    super.onSetValue(newValue, oldValue);
    if (newValue !== void 0 && newValue !== null && oldValue !== void 0 && oldValue !== null) {
      if (newValue.isPresenting() && !oldValue.isPresenting()) {
        this.willPresent();
      } else if (newValue.isPresented() && !oldValue.isPresented()) {
        this.didPresent();
      } else if (newValue.isDismissing() && !oldValue.isDismissing()) {
        this.willDismiss();
      } else if (newValue.isDismissed() && !oldValue.isDismissed()) {
        this.didDismiss();
      }
    }
  }

  override fromAny(value: T | U): T {
    return (value !== void 0 && value !== null ? Presence.fromAny(value) : value) as T;
  }
}
