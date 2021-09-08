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
import {AnyExpansion, Expansion} from "@swim/style";
import {Look} from "@swim/theme";
import {ViewPrecedence, View} from "../View";
import type {ModalState} from "../modal/Modal";
import {ViewAnimator} from "./ViewAnimator";

export interface ExpansionViewAnimatorInit {
  willExpand?(): void;
  didExpand?(): void;
  willCollapse?(): void;
  didCollapse?(): void;
}

export abstract class ExpansionViewAnimator<V extends View, T extends Expansion | null | undefined = Expansion, U extends AnyExpansion | null | undefined = AnyExpansion> extends ViewAnimator<V, T, U> {
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

  isCollapsed(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.isCollapsed();
  }

  isExpanded(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.isExpanded();
  }

  isExpanding(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.isExpanding();
  }

  isCollapsing(): boolean {
    const value = this.value;
    return value !== void 0 && value !== null && value.isCollapsing();
  }

  expand(precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  expand(timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;
  expand(timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.isExpanded()) {
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
        this.setValue(oldValue.expanding() as T, oldValue);
      }
      this.setState(Expansion.expanded() as T, timing, precedence);
    }
  }

  collapse(precedenceOrTiming: ViewPrecedence | AnyTiming | boolean | undefined): void;
  collapse(timing?: AnyTiming | boolean, precedence?: ViewPrecedence): void;
  collapse(timing?: ViewPrecedence | AnyTiming | boolean, precedence?: ViewPrecedence): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.isCollapsed()) {
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
        this.setValue(oldValue.collapsing() as T, oldValue);
      }
      this.setState(Expansion.collapsed() as T, timing, precedence);
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

  protected willExpand(): void {
    // hook
  }

  protected didExpand(): void {
    // hook
  }

  protected willCollapse(): void {
    // hook
  }

  protected didCollapse(): void {
    // hook
  }

  override onSetValue(newValue: T, oldValue: T): void {
    super.onSetValue(newValue, oldValue);
    if (newValue !== void 0 && newValue !== null && oldValue !== void 0 && oldValue !== null) {
      if (newValue.isExpanding() && !oldValue.isExpanding()) {
        this.willExpand();
      } else if (newValue.isExpanded() && !oldValue.isExpanded()) {
        this.didExpand();
      } else if (newValue.isCollapsing() && !oldValue.isCollapsing()) {
        this.willCollapse();
      } else if (newValue.isCollapsed() && !oldValue.isCollapsed()) {
        this.didCollapse();
      }
    }
  }

  override fromAny(value: T | U): T {
    return (value !== void 0 && value !== null ? Expansion.fromAny(value) : value) as T;
  }
}
