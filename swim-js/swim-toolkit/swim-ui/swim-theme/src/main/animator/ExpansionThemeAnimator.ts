// Copyright 2015-2021 Swim.inc
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
import {Affinity} from "@swim/component";
import {AnyExpansion, Expansion} from "@swim/style";
import {Look} from "../look/Look";
import {ThemeContext} from "../theme/ThemeContext";
import {ThemeAnimatorFactory, ThemeAnimator} from "./ThemeAnimator";

/** @public */
export interface ExpansionThemeAnimatorInit {
  willExpand?(): void;
  didExpand?(): void;
  willCollapse?(): void;
  didCollapse?(): void;
}

/** @public */
export interface ExpansionThemeAnimator<O = unknown, T extends Expansion | null | undefined = Expansion, U extends AnyExpansion | null | undefined = AnyExpansion> extends ThemeAnimator<O, T, U> {
  get phase(): number | undefined;

  getPhase(): number;

  getPhaseOr<E>(elsePhase: E): number | E;

  setPhase(newPhase: number, timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  setPhase(newPhase: number, timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  get direction(): number;

  setDirection(newDirection: number, timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  setDirection(newDirection: number, timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  get modalState(): string | undefined;

  get collapsed(): boolean;

  get expanded(): boolean;

  get expanding(): boolean;

  get collapsing(): boolean;

  expand(timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  expand(timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  collapse(timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  collapse(timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  toggle(timingOrAffinity: Affinity | AnyTiming | boolean | null | undefined): void;
  toggle(timing?: AnyTiming | boolean | null, affinity?: Affinity): void;

  /** @override @protected */
  onSetValue(newValue: T, oldValue: T): void;

  /** @protected */
  willExpand(): void;

  /** @protected */
  didExpand(): void;

  /** @protected */
  willCollapse(): void;

  /** @protected */
  didCollapse(): void;

  /** @override */
  (newValue: T, oldValue: T | undefined): boolean;

  /** @override */
  fromAny(value: T | U): T
}

/** @public */
export const ExpansionThemeAnimator = (function (_super: typeof ThemeAnimator) {
  const ExpansionThemeAnimator = _super.extend("ExpansionThemeAnimator") as ThemeAnimatorFactory<ExpansionThemeAnimator<any, Expansion | null | undefined, AnyExpansion | null | undefined>>;

  Object.defineProperty(ExpansionThemeAnimator.prototype, "phase", {
    get(this: ExpansionThemeAnimator): number | undefined {
      const value = this.value;
      return value !== void 0 && value !== null ? value.phase : void 0;
    },
    configurable: true,
  });

  ExpansionThemeAnimator.prototype.getPhase = function (this: ExpansionThemeAnimator): number {
    return this.getValue().phase;
  };

  ExpansionThemeAnimator.prototype.getPhaseOr = function <E>(this: ExpansionThemeAnimator, elsePhase: E): number | E {
    const value = this.value;
    if (value !== void 0 && value !== null) {
      return value.phase;
    } else {
      return elsePhase;
    }
  };

  ExpansionThemeAnimator.prototype.setPhase = function (this: ExpansionThemeAnimator, newPhase: number, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      this.setState(oldValue.withPhase(newPhase), timing, affinity);
    }
  };

  Object.defineProperty(ExpansionThemeAnimator.prototype, "direction", {
    get(this: ExpansionThemeAnimator): number {
      const value = this.value;
      return value !== void 0 && value !== null ? value.direction : 0;
    },
    configurable: true,
  });

  ExpansionThemeAnimator.prototype.setDirection = function (this: ExpansionThemeAnimator, newDirection: number, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue !== void 0 && oldValue !== null) {
      if (typeof timing === "number") {
        affinity = timing;
        timing = void 0;
      }
      this.setState(oldValue.withDirection(newDirection), timing, affinity);
    }
  };

  Object.defineProperty(ExpansionThemeAnimator.prototype, "modalState", {
    get(this: ExpansionThemeAnimator): string | undefined {
      const value = this.value;
      return value !== void 0 && value !== null ? value.modalState : void 0;
    },
    configurable: true,
  });

  Object.defineProperty(ExpansionThemeAnimator.prototype, "collapsed", {
    get(this: ExpansionThemeAnimator): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.collapsed;
    },
    configurable: true,
  });

  Object.defineProperty(ExpansionThemeAnimator.prototype, "expanded", {
    get(this: ExpansionThemeAnimator): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.expanded;
    },
    configurable: true,
  });

  Object.defineProperty(ExpansionThemeAnimator.prototype, "expanding", {
    get(this: ExpansionThemeAnimator): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.expanding;
    },
    configurable: true,
  });

  Object.defineProperty(ExpansionThemeAnimator.prototype, "collapsing", {
    get(this: ExpansionThemeAnimator): boolean {
      const value = this.value;
      return value !== void 0 && value !== null && value.collapsing;
    },
    configurable: true,
  });

  ExpansionThemeAnimator.prototype.expand = function (this: ExpansionThemeAnimator, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.expanded) {
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
        this.setValue(oldValue.asExpanding(), Affinity.Reflexive);
      }
      this.setState(Expansion.expanded(), timing, affinity);
    }
  };

  ExpansionThemeAnimator.prototype.collapse = function (this: ExpansionThemeAnimator, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
    const oldValue = this.value;
    if (oldValue === void 0 || oldValue === null || !oldValue.collapsed) {
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
        this.setValue(oldValue.asCollapsing(), Affinity.Reflexive);
      }
      this.setState(Expansion.collapsed(), timing, affinity);
    }
  };

  ExpansionThemeAnimator.prototype.toggle = function (this: ExpansionThemeAnimator, timing?: Affinity | AnyTiming | boolean | null, affinity?: Affinity): void {
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
      this.setValue(oldValue.asToggling(), Affinity.Reflexive);
      this.setState(oldValue.asToggled(), timing, affinity);
    }
  };

  ExpansionThemeAnimator.prototype.onSetValue = function (this: ExpansionThemeAnimator, newValue: Expansion | null | undefined, oldValue: Expansion | null | undefined): void {
    _super.prototype.onSetValue.call(this, newValue, oldValue);
    if (newValue !== void 0 && newValue !== null && oldValue !== void 0 && oldValue !== null) {
      if (newValue.expanding && !oldValue.expanding) {
        this.willExpand();
      } else if (newValue.expanded && !oldValue.expanded) {
        this.didExpand();
      } else if (newValue.collapsing && !oldValue.collapsing) {
        this.willCollapse();
      } else if (newValue.collapsed && !oldValue.collapsed) {
        this.didCollapse();
      }
    }
  };

  ExpansionThemeAnimator.prototype.willExpand = function (this: ExpansionThemeAnimator): void {
    // hook
  };

  ExpansionThemeAnimator.prototype.didExpand = function (this: ExpansionThemeAnimator): void {
    // hook
  };

  ExpansionThemeAnimator.prototype.willCollapse = function (this: ExpansionThemeAnimator): void {
    // hook
  };

  ExpansionThemeAnimator.prototype.didCollapse = function (this: ExpansionThemeAnimator): void {
    // hook
  };

  ExpansionThemeAnimator.prototype.fromAny = function (this: ExpansionThemeAnimator, value: AnyExpansion | null | undefined): Expansion | null | undefined {
    return value !== void 0 && value !== null ? Expansion.fromAny(value) : null;
  };

  ExpansionThemeAnimator.prototype.equalValues = function (this: ExpansionThemeAnimator, newValue: Expansion | null | undefined, oldValue: Expansion | null | undefined): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldValue);
    } else {
      return newValue === oldValue;
    }
  };

  return ExpansionThemeAnimator;
})(ThemeAnimator);