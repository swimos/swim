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

import type {Mutable, Class, AnyTiming} from "@swim/util";
import {
  FastenerContext,
  FastenerOwner,
  FastenerInit,
  FastenerClass,
  Fastener,
} from "@swim/fastener";
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

export interface CssRuleInit extends FastenerInit {
  css?: string | (() => string);

  initRule?(rule: CSSRule): void;
}

export type CssRuleDescriptor<O = unknown, I = {}> = ThisType<CssRule<O> & I> & CssRuleInit & Partial<I>;

export interface CssRuleClass<F extends CssRule<any> = CssRule<any>> extends FastenerClass<F> {
  create(this: CssRuleClass<F>, owner: FastenerOwner<F>, ruleName: string): F;

  construct(ruleClass: CssRuleClass, rule: F | null, owner: FastenerOwner<F>, ruleName: string): F;

  extend(this: CssRuleClass<F>, classMembers?: {} | null): CssRuleClass<F>;

  define<O, I = {}>(descriptor: {extends: CssRuleClass | null} & CssRuleDescriptor<O, I>): CssRuleClass<CssRule<any> & I>;
  define<O>(descriptor: CssRuleDescriptor<O>): CssRuleClass<CssRule<any>>;

  <O, I = {}>(descriptor: {extends: CssRuleClass | null} & CssRuleDescriptor<O, I>): PropertyDecorator;
  <O>(descriptor: CssRuleDescriptor<O>): PropertyDecorator;
}

export interface CssRule<O = unknown> extends Fastener<O>, FastenerContext, ConstraintScope, ThemeContext {
  /** @override */
  get familyType(): Class<CssRule<any>> | null;

  readonly rule: CSSRule;

  /** @internal */
  readonly fasteners: {[fastenerName: string]: Fastener | undefined} | null;

  /** @override */
  hasFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): boolean;

  /** @override */
  getFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  /** @override */
  getFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;

  /** @override */
  setFastener(fastenerName: string, fastener: Fastener | null): void;

  /** @override */
  getLazyFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  /** @override */
  getLazyFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;

  /** @override */
  getSuperFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  /** @override */
  getSuperFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;
  /** @internal @override */
  getSuperFastener(): Fastener | null;

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
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;

  /** @internal */
  createRule(cssText: string): CSSRule;

  /** @internal */
  initRule?(rule: CSSRule): void;

  /** @internal */
  initCss?(): string;
}

export const CssRule = (function (_super: typeof Fastener) {
  const CssRule = _super.extend() as CssRuleClass;

  Object.defineProperty(CssRule.prototype, "familyType", {
    get: function (this: CssRule): Class<CssRule<any>> | null {
      return CssRule;
    },
    configurable: true,
  });

  CssRule.prototype.hasFastener = function (this: CssRule, fastenerName: string, fastenerBound?: Class<Fastener> | null): boolean {
    const fasteners = this.fasteners;
    if (fasteners !== null) {
      const fastener = fasteners[fastenerName];
      if (fastener !== void 0 && (fastenerBound === void 0 || fastenerBound === null || fastener instanceof fastenerBound)) {
        return true;
      }
    }
    return false;
  };

  CssRule.prototype.getFastener = function (this: CssRule, fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null {
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

  CssRule.prototype.getLazyFastener = function (this: CssRule, fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null {
    return FastenerContext.getLazyFastener(this, fastenerName, fastenerBound);
  };

  CssRule.prototype.getSuperFastener = function (this: CssRule, fastenerName?: string, fastenerBound?: Class<Fastener> | null): Fastener | null {
    if (arguments.length === 0) {
      return _super.prototype.getSuperFastener.call(this);
    } else {
      return null;
    }
  };

  CssRule.prototype.mountFasteners = function (this: CssRule): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      fastener.mount();
    }
    FastenerContext.init(this);
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

    if (this.coherent) {
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

  CssRule.prototype.onMount = function (this: CssRule): void {
    _super.prototype.onMount.call(this);
    this.mountFasteners();
  };

  CssRule.prototype.onUnmount = function (this: CssRule): void {
    this.unmountFasteners();
    _super.prototype.onUnmount.call(this);
  };

  CssRule.prototype.createRule = function (this: CssRule, cssText: string): CSSRule {
    const cssContext = this.owner;
    if (CssContext.is(cssContext)) {
      const index = cssContext.insertRule(cssText);
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

  CssRule.construct = function <F extends CssRule<any>>(ruleClass: CssRuleClass, rule: F | null, owner: FastenerOwner<F>, ruleName: string): F {
    rule = _super.construct(ruleClass, rule, owner, ruleName) as F;
    (rule as Mutable<typeof rule>).fasteners = null;
    (rule as Mutable<typeof rule>).decoherent = null;
    (rule as Mutable<typeof rule>).rule = null as unknown as CSSRule;
    return rule;
  };

  CssRule.define = function <O>(descriptor: CssRuleDescriptor<O>): CssRuleClass<CssRule<any>> {
    let superClass = descriptor.extends as CssRuleClass | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    let css = descriptor.css;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.css;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const ruleClass = superClass.extend(descriptor);

    if (typeof css === "function") {
      ruleClass.prototype.initCss = css;
      css = void 0;
    }

    ruleClass.construct = function (ruleClass: CssRuleClass, rule: CssRule<O> | null, owner: O, ruleName: string): CssRule<O> {
      rule = superClass!.construct(ruleClass, rule, owner, ruleName);

      if (affinity !== void 0) {
        rule.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        rule.initInherits(inherits);
      }

      let cssText: string | undefined;
      if (css !== void 0) {
        cssText = css as string;
      } else if (rule.initCss !== void 0) {
        cssText = rule.initCss();
      } else {
        throw new Error("undefined css");
      }

      (rule as Mutable<typeof rule>).rule = rule.createRule(cssText);
      if (rule.initRule !== void 0) {
        rule.initRule(rule.rule);
      }

      return rule;
    };

    return ruleClass;
  };

  return CssRule;
})(Fastener);
