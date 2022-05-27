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

import type {Mutable, Proto, AnyTiming} from "@swim/util";
import {
  FastenerContext,
  FastenerOwner,
  FastenerDescriptor,
  FastenerClass,
  Fastener,
} from "@swim/component";
import type {
  AnyConstraintExpression,
  ConstraintVariable,
  ConstraintProperty,
  ConstraintRelation,
  AnyConstraintStrength,
  Constraint,
  ConstraintScope,
} from "@swim/constraint";
import {Look, Feel, MoodVector, ThemeMatrix, ThemeContext} from "@swim/theme";
import {CssContext} from "./CssContext";

/** @public */
export interface CssRuleDescriptor extends FastenerDescriptor {
  extends?: Proto<CssRule<any>> | string | boolean | null;
  css?: string;
}

/** @public */
export type CssRuleTemplate<F extends CssRule<any>> =
  ThisType<F> &
  CssRuleDescriptor &
  Partial<Omit<F, keyof CssRuleDescriptor>>;

/** @public */
export interface CssRuleClass<F extends CssRule<any> = CssRule<any>> extends FastenerClass<F> {
  /** @override */
  specialize(template: CssRuleDescriptor): CssRuleClass<F>;

  /** @override */
  refine(fastenerClass: CssRuleClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: CssRuleTemplate<F2>): CssRuleClass<F2>;
  extend<F2 extends F>(className: string, template: CssRuleTemplate<F2>): CssRuleClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: CssRuleTemplate<F2>): CssRuleClass<F2>;
  define<F2 extends F>(className: string, template: CssRuleTemplate<F2>): CssRuleClass<F2>;

  /** @override */
  <F2 extends F>(template: CssRuleTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface CssRule<O = unknown> extends Fastener<O>, FastenerContext, ConstraintScope, ThemeContext {
  /** @override */
  get fastenerType(): Proto<CssRule<any>>;

  /** @protected */
  initCss(): string;

  readonly css?: string; // optional prototype property

  /** @internal */
  initRule(): CSSRule | null;

  /** @internal */
  createRule(css: string): CSSRule;

  readonly rule: CSSRule | null;

  /** @internal */
  readonly fasteners: {[fastenerName: string]: Fastener | undefined} | null;

  /** @override */
  hasFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): boolean;

  /** @override */
  getFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Proto<F>): F | null;
  /** @override */
  getFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null;

  /** @override */
  setFastener(fastenerName: string, fastener: Fastener | null): void;

  /** @override */
  getLazyFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Proto<F>): F | null;
  /** @override */
  getLazyFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null;

  /** @override */
  getSuperFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Proto<F>): F | null;
  /** @override */
  getSuperFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null;

  /** @internal @protected */
  mountFasteners(): void;

  /** @internal @protected */
  unmountFasteners(): void;

  /** @override */
  requireUpdate(updateFlags: number): void;

  /** @internal */
  readonly decoherent: ReadonlyArray<Fastener> | null;

  /** @override */
  decohereFastener(fastener: Fastener): void;

  /** @override */
  recohere(t: number): void

  /** @internal @protected */
  recohereFasteners(t: number): void

  /** @override */
  constraint(lhs: AnyConstraintExpression, relation: ConstraintRelation,
             rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint;

  /** @override */
  hasConstraint(constraint: Constraint): boolean;

  /** @override */
  addConstraint(constraint: Constraint): void;

  /** @override */
  removeConstraint(constraint: Constraint): void;

  /** @override */
  constraintVariable(name: string, value?: number, strength?: AnyConstraintStrength): ConstraintProperty<unknown, number>;

  /** @override */
  hasConstraintVariable(variable: ConstraintVariable): boolean;

  /** @override */
  addConstraintVariable(variable: ConstraintVariable): void;

  /** @override */
  removeConstraintVariable(variable: ConstraintVariable): void;

  /** @internal @override */
  setConstraintVariable(constraintVariable: ConstraintVariable, state: number): void;

  /** @override */
  getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined;

  /** @override */
  getLookOr<T, E>(look: Look<T, unknown>, elseValue: E): T | E;
  /** @override */
  getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null, elseValue: E): T | E;

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean): void;

  /** @protected @override */
  willMount(): void;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;

  /** @protected @override */
  didUnmount(): void;
}

/** @public */
export const CssRule = (function (_super: typeof Fastener) {
  const CssRule = _super.extend("CssRule", {}) as CssRuleClass;

  Object.defineProperty(CssRule.prototype, "fastenerType", {
    value: CssRule,
    configurable: true,
  });

  CssRule.prototype.initCss = function (this: CssRule): string {
    let css = (Object.getPrototypeOf(this) as CssRule).css as string | undefined;
    if (css === void 0) {
      css = "";
    }
    return css;
  };

  CssRule.prototype.initRule = function (this: CssRule): CSSRule | null {
    return this.createRule(this.initCss());
  };

  CssRule.prototype.createRule = function (this: CssRule, css: string): CSSRule {
    const cssContext = this.owner;
    if (CssContext.is(cssContext)) {
      const index = cssContext.insertRule(css);
      const rule = cssContext.getRule(index);
      if (rule instanceof CSSRule) {
        return rule;
      } else {
        throw new TypeError("" + rule);
      }
    } else {
      throw new Error("no css context");
    }
  };

  CssRule.prototype.hasFastener = function (this: CssRule, fastenerName: string, fastenerBound?: Proto<Fastener> | null): boolean {
    const fasteners = this.fasteners;
    if (fasteners !== null) {
      const fastener = fasteners[fastenerName];
      if (fastener !== void 0 && (fastenerBound === void 0 || fastenerBound === null || fastener instanceof fastenerBound)) {
        return true;
      }
    }
    return false;
  };

  CssRule.prototype.getFastener = function (this: CssRule, fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null {
    const fasteners = this.fasteners;
    if (fasteners !== null) {
      const fastener = fasteners[fastenerName];
      if (fastener !== void 0 && (fastenerBound === void 0 || fastenerBound === null || fastener instanceof fastenerBound)) {
        return fastener;
      }
    }
    return null;
  };

  CssRule.prototype.setFastener = function (this: CssRule, fastenerName: string, newFastener: Fastener | null): void {
    let fasteners = this.fasteners;
    if (fasteners === null) {
      fasteners = {};
      (this as Mutable<typeof this>).fasteners = fasteners;
    }
    const oldFastener = fasteners[fastenerName];
    if (oldFastener !== void 0 && this.mounted) {
      oldFastener.unmount();
    }
    if (newFastener !== null) {
      fasteners[fastenerName] = newFastener;
      if (this.mounted) {
        newFastener.mount();
      }
    } else {
      delete fasteners[fastenerName];
    }
  };

  CssRule.prototype.getLazyFastener = function (this: CssRule, fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null {
    return FastenerContext.getLazyFastener(this, fastenerName, fastenerBound);
  };

  CssRule.prototype.getSuperFastener = function (this: CssRule, fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null {
    return null;
  };

  CssRule.prototype.mountFasteners = function (this: CssRule): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      fastener.mount();
    }
  };

  CssRule.prototype.unmountFasteners = function (this: CssRule): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      fastener.unmount();
    }
  };

  CssRule.prototype.requireUpdate = function (this: CssRule, updateFlags: number): void {
    const propertyContext = this.owner;
    if (FastenerContext.has(propertyContext, "requireUpdate")) {
      propertyContext.requireUpdate(updateFlags);
    }
  };

  CssRule.prototype.decohereFastener = function (this: CssRule, fastener: Fastener): void {
    let decoherent = this.decoherent as Fastener[];
    if (decoherent === null) {
      decoherent = [];
      (this as Mutable<typeof this>).decoherent = decoherent;
    }
    decoherent.push(fastener);

    if ((this.flags & Fastener.DecoherentFlag) === 0) {
      this.setCoherent(false);
      this.decohere();
    }
  };

  CssRule.prototype.recohereFasteners = function (this: CssRule, t: number): void {
    const decoherent = this.decoherent;
    if (decoherent !== null) {
      const decoherentCount = decoherent.length;
      if (decoherentCount !== 0) {
        (this as Mutable<typeof this>).decoherent = null;
        for (let i = 0; i < decoherentCount; i += 1) {
          const fastener = decoherent[i]!;
          fastener.recohere(t);
        }
      }
    }
  };

  CssRule.prototype.recohere = function (this: CssRule, t: number): void {
    this.recohereFasteners(t);
    if (this.decoherent === null || this.decoherent.length === 0) {
      this.setCoherent(true);
    } else {
      this.setCoherent(false);
      this.decohere();
    }
  };

  CssRule.prototype.constraint = function (this: CssRule<ConstraintScope>, lhs: AnyConstraintExpression, relation: ConstraintRelation,
                                           rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint {
    return this.owner.constraint(lhs, relation, rhs, strength);
  };

  CssRule.prototype.hasConstraint = function (this: CssRule<ConstraintScope>, constraint: Constraint): boolean {
    return this.owner.hasConstraint(constraint);
  };

  CssRule.prototype.addConstraint = function (this: CssRule<ConstraintScope>, constraint: Constraint): void {
    this.owner.addConstraint(constraint);
  };

  CssRule.prototype.removeConstraint = function (this: CssRule<ConstraintScope>, constraint: Constraint): void {
    this.owner.removeConstraint(constraint);
  };

  CssRule.prototype.constraintVariable = function (this: CssRule<ConstraintScope>, name: string, value?: number, strength?: AnyConstraintStrength): ConstraintProperty<unknown, number> {
    return this.owner.constraintVariable(name, value, strength);
  };

  CssRule.prototype.hasConstraintVariable = function (this: CssRule<ConstraintScope>, constraintVariable: ConstraintVariable): boolean {
    return this.owner.hasConstraintVariable(constraintVariable);
  };

  CssRule.prototype.addConstraintVariable = function (this: CssRule<ConstraintScope>, constraintVariable: ConstraintVariable): void {
    this.owner.addConstraintVariable(constraintVariable);
  };

  CssRule.prototype.removeConstraintVariable = function (this: CssRule<ConstraintScope>, constraintVariable: ConstraintVariable): void {
    this.owner.removeConstraintVariable(constraintVariable);
  };

  CssRule.prototype.setConstraintVariable = function (this: CssRule<ConstraintScope>, constraintVariable: ConstraintVariable, state: number): void {
    this.owner.setConstraintVariable(constraintVariable, state);
  };

  CssRule.prototype.getLook = function <T>(this: CssRule, look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined {
    const themeContext = this.owner;
    if (ThemeContext.is(themeContext)) {
      return themeContext.getLook(look, mood);
    } else {
      return void 0;
    }
  };

  CssRule.prototype.getLookOr = function <T, E>(this: CssRule, look: Look<T, unknown>, mood: MoodVector<Feel> | null | E, elseValue?: E): T | E {
    const themeContext = this.owner;
    if (ThemeContext.is(themeContext)) {
      if (arguments.length === 2) {
        return themeContext.getLookOr(look, mood as E);
      } else {
        return themeContext.getLookOr(look, mood as MoodVector<Feel> | null, elseValue!);
      }
    } else if (arguments.length === 2) {
      return mood as E;
    } else {
      return elseValue!;
    }
  };

  CssRule.prototype.applyTheme = function (this: CssRule, theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean | null): void {
    // hook
  };

  CssRule.prototype.willMount = function (this: CssRule): void {
    _super.prototype.willMount.call(this);
    (this as Mutable<typeof this>).rule = this.initRule();
  };

  CssRule.prototype.onMount = function (this: CssRule): void {
    _super.prototype.onMount.call(this);
    this.mountFasteners();
  };

  CssRule.prototype.onUnmount = function (this: CssRule): void {
    this.unmountFasteners();
    _super.prototype.onUnmount.call(this);
  };

  CssRule.prototype.didUnmount = function (this: CssRule): void {
    (this as Mutable<typeof this>).rule = null;
    _super.prototype.didUnmount.call(this);
  };

  CssRule.construct = function <F extends CssRule<any>>(rule: F | null, owner: FastenerOwner<F>): F {
    rule = _super.construct.call(this, rule, owner) as F;
    (rule as Mutable<typeof rule>).fasteners = null;
    (rule as Mutable<typeof rule>).decoherent = null;
    (rule as Mutable<typeof rule>).rule = null;
    FastenerContext.init(rule);
    return rule;
  };

  return CssRule;
})(Fastener);
