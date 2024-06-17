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

import type {Proto} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import {FastenerContext} from "@swim/component";
import type {Fastener} from "@swim/component";
import type {ConstraintExpressionLike} from "@swim/constraint";
import type {ConstraintVariable} from "@swim/constraint";
import type {ConstraintProperty} from "@swim/constraint";
import type {ConstraintRelation} from "@swim/constraint";
import type {ConstraintStrengthLike} from "@swim/constraint";
import type {Constraint} from "@swim/constraint";
import {ConstraintScope} from "@swim/constraint";
import {ToStyleString} from "@swim/style";
import {ToCssValue} from "@swim/style";
import {Look} from "@swim/theme";
import type {Feel} from "@swim/theme";
import {Mood} from "@swim/theme";
import type {MoodVector} from "@swim/theme";
import type {ThemeMatrix} from "@swim/theme";
import {ThemeContext} from "@swim/theme";
import type {StyleContext} from "./StyleAnimator";
import {StyleAttribute} from "./StyleAttribute";
import type {CssRuleDescriptor} from "./CssRule";
import type {CssRuleClass} from "./CssRule";
import {CssRule} from "./CssRule";

/** @public */
export interface StyleRuleDescriptor<R> extends CssRuleDescriptor<R, CSSStyleRule> {
  extends?: Proto<StyleRule<any>> | boolean | null;
}

/** @public */
export interface StyleRuleClass<F extends StyleRule<any> = StyleRule> extends CssRuleClass<F> {
}

/** @public */
export interface StyleRule<R = any> extends CssRule<R, CSSStyleRule>, ConstraintScope, ThemeContext, StyleContext {
  /** @override */
  get descriptorType(): Proto<StyleRuleDescriptor<R>>;

  /** @override */
  get fastenerType(): Proto<StyleRule<any>>;

  /** @override */
  transformInletCss(inletCss: CSSStyleSheet | CSSRule | null): CSSStyleRule | null;

  /** @override */
  createRule(inletCss: CSSStyleSheet | CSSGroupingRule): CSSStyleRule | null;

  /** @protected @override */
  onAttachCss(css: CSSStyleRule): void;

  /** @override */
  get selector(): string;

  readonly style: StyleAttribute<this>;

  /** @override */
  getStyle(propertyNames: string | readonly string[]): CSSStyleValue | string | undefined;

  /** @override */
  setStyle(propertyName: string, value: unknown, priority?: string): this;

  /** @protected */
  willSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  /** @protected */
  onSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  /** @protected */
  didSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  /** @override */
  constraint(lhs: ConstraintExpressionLike, relation: ConstraintRelation,
             rhs?: ConstraintExpressionLike, strength?: ConstraintStrengthLike): Constraint;

  /** @override */
  hasConstraint(constraint: Constraint): boolean;

  /** @override */
  addConstraint(constraint: Constraint): void;

  /** @override */
  removeConstraint(constraint: Constraint): void;

  /** @override */
  constraintVariable(name: string, value?: number, strength?: ConstraintStrengthLike): ConstraintProperty<any, number>;

  /** @override */
  hasConstraintVariable(variable: ConstraintVariable): boolean;

  /** @override */
  addConstraintVariable(variable: ConstraintVariable): void;

  /** @override */
  removeConstraintVariable(variable: ConstraintVariable): void;

  /** @internal @override */
  setConstraintVariable(constraintVariable: ConstraintVariable, state: number): void;

  /** @override */
  getLook<T>(look: Look<T>, mood?: MoodVector<Feel> | null): T | undefined;

  /** @override */
  getLookOr<T, E>(look: Look<T>, elseValue: E): T | E;
  /** @override */
  getLookOr<T, E>(look: Look<T>, mood: MoodVector<Feel> | null, elseValue: E): T | E;

  /** @override */
  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: TimingLike | boolean | null): void;

  /** @protected @override */
  didMount(): void;
}

/** @public */
export const StyleRule = (<R, F extends StyleRule<any>>() => CssRule.extend<StyleRule<R>, StyleRuleClass<F>>("StyleRule", {
  get fastenerType(): Proto<StyleRule<any>> {
    return StyleRule;
  },

  selector: "*",

  transformInletCss(inletCss: CSSStyleSheet | CSSRule | null): CSSStyleRule | null {
    if (inletCss !== null) {
      (inletCss as any).RANDOM_MARKER_ID = Math.random();
    }
    if (inletCss instanceof CSSStyleRule) {
      return inletCss;
    } else if (inletCss instanceof CSSStyleSheet || inletCss instanceof CSSGroupingRule) {
      return this.createRule(inletCss);
    }
    return null;
  },

  createRule(inletCss: CSSStyleSheet | CSSGroupingRule): CSSStyleRule | null {
    const index = inletCss.insertRule(this.cssText);
    const rule = inletCss.cssRules.item(index);
    if (!(rule instanceof CSSStyleRule)) {
      throw new TypeError("not a style rule: " + rule);
    }
    return rule;
  },

  onAttachCss(css: CSSStyleRule): void {
    if (this.mounted) {
      this.style.applyStyles();
    }
  },

  getStyle(propertyNames: string | readonly string[]): CSSStyleValue | string | undefined {
    const css = this.css;
    if (css === null) {
      return void 0;
    }
    if (typeof CSSStyleValue !== "undefined") { // CSS Typed OM support
      const style = css.styleMap;
      if (typeof propertyNames === "string") {
        return style.get(propertyNames);
      }
      for (let i = 0; i < propertyNames.length; i += 1) {
        const value = style.get(propertyNames[i]!);
        if (value !== void 0) {
          return value;
        }
      }
      return "";
    }
    const style = css.style;
    if (typeof propertyNames === "string") {
      return style.getPropertyValue(propertyNames);
    }
    for (let i = 0; i < propertyNames.length; i += 1) {
      const value = style.getPropertyValue(propertyNames[i]!);
      if (value.length !== 0) {
        return value;
      }
    }
    return "";
  },

  setStyle(propertyName: string, value: unknown, priority?: string): StyleRule {
    const css = this.css;
    if (css === null) {
      return this;
    }
    this.willSetStyle(propertyName, value, priority);
    if (typeof CSSStyleValue !== "undefined") { // CSS Typed OM support
      if (value !== void 0 && value !== null) {
        const cssValue = ToCssValue(value);
        if (cssValue !== null) {
          try {
            css.styleMap.set(propertyName, cssValue);
          } catch (e) {
            // swallow
          }
        } else {
          css.style.setProperty(propertyName, ToStyleString(value), priority);
        }
      } else {
        try {
          css.styleMap.delete(propertyName);
        } catch (e) {
          // swallow
        }
      }
    } else if (value !== void 0 && value !== null) {
      css.style.setProperty(propertyName, ToStyleString(value), priority);
    } else {
      css.style.removeProperty(propertyName);
    }
    this.onSetStyle(propertyName, value, priority);
    this.didSetStyle(propertyName, value, priority);
    return this;
  },

  willSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    // hook
  },

  onSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    // hook
  },

  didSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    // hook
  },

  constraint(lhs: ConstraintExpressionLike, relation: ConstraintRelation,
             rhs?: ConstraintExpressionLike, strength?: ConstraintStrengthLike): Constraint {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    return this.owner.constraint(lhs, relation, rhs, strength);
  },

  hasConstraint(constraint: Constraint): boolean {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    return this.owner.hasConstraint(constraint);
  },

  addConstraint(constraint: Constraint): void {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    this.owner.addConstraint(constraint);
  },

  removeConstraint(constraint: Constraint): void {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    this.owner.removeConstraint(constraint);
  },

  constraintVariable(name: string, value?: number, strength?: ConstraintStrengthLike): ConstraintProperty<any, number> {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    return this.owner.constraintVariable(name, value, strength);
  },

  hasConstraintVariable(constraintVariable: ConstraintVariable): boolean {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    return this.owner.hasConstraintVariable(constraintVariable);
  },

  addConstraintVariable(constraintVariable: ConstraintVariable): void {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    this.owner.addConstraintVariable(constraintVariable);
  },

  removeConstraintVariable(constraintVariable: ConstraintVariable): void {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    this.owner.removeConstraintVariable(constraintVariable);
  },

  setConstraintVariable(constraintVariable: ConstraintVariable, state: number): void {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    this.owner.setConstraintVariable(constraintVariable, state);
  },

  getLook<T>(look: Look<T>, mood?: MoodVector<Feel> | null): T | undefined {
    if (!ThemeContext[Symbol.hasInstance](this.owner)) {
      return void 0;
    }
    return this.owner.getLook(look, mood);
  },

  getLookOr<T, E>(look: Look<T>, mood: MoodVector<Feel> | null | E, elseValue?: E): T | E {
    if (ThemeContext[Symbol.hasInstance](this.owner)) {
      if (arguments.length === 2) {
        return this.owner.getLookOr(look, mood as E);
      } else {
        return this.owner.getLookOr(look, mood as MoodVector<Feel> | null, elseValue!);
      }
    } else if (arguments.length === 2) {
      return mood as E;
    }
    return elseValue!;
  },

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: TimingLike | boolean | null): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    } else if (timing === void 0 || timing === null || timing === true) {
      timing = theme.getOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromLike(timing);
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!] as Fastener<any, any, any> | undefined;
      if (fastener !== void 0 && "applyTheme" in (fastener as any)) {
        (fastener as any).applyTheme(theme, mood, timing);
      }
    }
    super.applyTheme(theme, mood, timing);
  },

  didMount(): void {
    super.didMount();
    if (this.css !== null) {
      this.style.applyStyles();
    }
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    StyleRule.initFasteners(fastener);
    return fastener;
  },
}))();

StyleRule.defineField("style", [StyleAttribute({})]);
