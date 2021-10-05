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

import {Mutable, AnyTiming, Timing} from "@swim/util";
import type {FastenerOwner} from "@swim/fastener";
import {ToStyleString, ToCssValue} from "@swim/style";
import {Look, Mood, MoodVector, ThemeMatrix, ThemeAnimator} from "@swim/theme";
import {StyleMapInit, StyleMap} from "./StyleMap";
import {CssContext} from "./CssContext";
import {CssRuleInit, CssRuleClass, CssRule} from "./CssRule";

export interface StyleRuleInit extends CssRuleInit {
  style?: StyleMapInit;

  willSetStyle?(propertyName: string, value: unknown, priority: string | undefined): void;
  didSetStyle?(propertyName: string, value: unknown, priority: string | undefined): void;

  initRule?(rule: CSSStyleRule): void;
}

export type StyleRuleDescriptor<O = unknown, I = {}> = ThisType<StyleRule<O> & I> & StyleRuleInit & Partial<I>;

export interface StyleRuleClass<F extends StyleRule<any> = StyleRule<any>> extends CssRuleClass<F> {
  create(this: StyleRuleClass<F>, owner: FastenerOwner<F>, ruleName: string): F;

  construct(ruleClass: StyleRuleClass, rule: F | null, owner: FastenerOwner<F>, ruleName: string): F;

  extend(this: StyleRuleClass<F>, classMembers?: {} | null): StyleRuleClass<F>;

  define<O, I = {}>(descriptor: {extends: StyleRuleClass | null} & StyleRuleDescriptor<O, I>): StyleRuleClass<StyleRule<any> & I>;
  define<O>(descriptor: StyleRuleDescriptor<O>): StyleRuleClass<StyleRule<any>>;

  <O, I = {}>(descriptor: {extends: StyleRuleClass | null} & StyleRuleDescriptor<O, I>): PropertyDecorator;
  <O>(descriptor: StyleRuleDescriptor<O>): PropertyDecorator;
}

export interface StyleRule<O = unknown> extends CssRule<O>, StyleMap {
  (property: string): unknown;
  (property: string, value: unknown): O;

  /** @override */
  readonly rule: CSSStyleRule;

  get selector(): string;

  setSelector(selector: string): void;

  /** @override */
  getStyle(propertyNames: string | ReadonlyArray<string>): CSSStyleValue | string | undefined;

  /** @override */
  setStyle(propertyName: string, value: unknown, priority?: string): this;

  /** @protected */
  willSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  /** @protected */
  onSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  /** @protected */
  didSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  /** @override */
  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean | null): void;

  /** @internal */
  createRule(cssText: string): CSSStyleRule;

  /** @internal */
  initRule?(rule: CSSStyleRule): void;

  /** @internal */
  initCss?(): string;
}

export const StyleRule = (function (_super: typeof CssRule) {
  const StyleRule = _super.extend() as StyleRuleClass;

  Object.defineProperty(StyleRule.prototype, "selector", {
    get: function (this: StyleRule): string {
      return this.rule.selectorText;
    },
    configurable: true,
  });

  StyleRule.prototype.setSelector = function (this: StyleRule, selector: string): void {
    this.rule.selectorText = selector;
  };

  StyleRule.prototype.getStyle = function (this: StyleRule, propertyNames: string | ReadonlyArray<string>): CSSStyleValue | string | undefined {
    if (typeof CSSStyleValue !== "undefined") { // CSS Typed OM support
      const style = this.rule.styleMap;
      if (typeof propertyNames === "string") {
        return style.get(propertyNames);
      } else {
        for (let i = 0, n = propertyNames.length; i < n; i += 1) {
          const value = style.get(propertyNames[i]!);
          if (value !== "") {
            return value;
          }
        }
        return "";
      }
    } else {
      const style = this.rule.style;
      if (typeof propertyNames === "string") {
        return style.getPropertyValue(propertyNames);
      } else {
        for (let i = 0, n = propertyNames.length; i < n; i += 1) {
          const value = style.getPropertyValue(propertyNames[i]!);
          if (value !== "") {
            return value;
          }
        }
        return "";
      }
    }
  };

  StyleRule.prototype.setStyle = function (this: StyleRule, propertyName: string, value: unknown, priority?: string): StyleRule {
    this.willSetStyle(propertyName, value, priority);
    if (typeof CSSStyleValue !== "undefined") { // CSS Typed OM support
      if (value !== void 0 && value !== null) {
        const cssValue = ToCssValue(value);
        if (cssValue !== null) {
          try {
            this.rule.styleMap.set(propertyName, cssValue);
          } catch (e) {
            // swallow
          }
        } else {
          this.rule.style.setProperty(propertyName, ToStyleString(value), priority);
        }
      } else {
        this.rule.styleMap.delete(propertyName);
      }
    } else {
      if (value !== void 0 && value !== null) {
        this.rule.style.setProperty(propertyName, ToStyleString(value), priority);
      } else {
        this.rule.style.removeProperty(propertyName);
      }
    }
    this.onSetStyle(propertyName, value, priority);
    this.didSetStyle(propertyName, value, priority);
    return this;
  };

  StyleRule.prototype.willSetStyle = function (this: StyleRule, propertyName: string, value: unknown, priority: string | undefined): void {
    // hook
  };

  StyleRule.prototype.onSetStyle = function (this: StyleRule, propertyName: string, value: unknown, priority: string | undefined): void {
    // hook
  };

  StyleRule.prototype.didSetStyle = function (this: StyleRule, propertyName: string, value: unknown, priority: string | undefined): void {
    // hook
  };

  StyleRule.prototype.applyTheme = function (theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean | null): void {
    if (timing === void 0 || timing === true) {
      timing = theme.getOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      if (fastener instanceof ThemeAnimator) {
        fastener.applyTheme(theme, mood, timing as Timing | boolean);
      }
    }
  };

  StyleRule.prototype.createRule = function (this: StyleRule, cssText: string): CSSStyleRule {
    const cssContext = this.owner;
    if (CssContext.is(cssContext)) {
      const index = cssContext.insertRule(cssText);
      const rule = cssContext.getRule(index);
      if (rule instanceof CSSStyleRule) {
        return rule;
      } else {
        throw new TypeError("" + rule);
      }
    } else {
      throw new Error("no css context");
    }
  };

  StyleMap.define(StyleRule.prototype);

  StyleRule.construct = function <F extends StyleRule<any>>(ruleClass: StyleRuleClass, rule: F | null, owner: FastenerOwner<F>, ruleName: string): F {
    if (rule === null) {
      rule = function StyleRule(property: string, value: unknown): unknown | FastenerOwner<F> {
        if (value === void 0) {
          return rule!.getStyle(property);
         } else {
          rule!.setStyle(property, value);
          return rule!.owner;
        }
      } as F;
      Object.setPrototypeOf(rule, ruleClass.prototype);
    }
    rule = _super.construct(ruleClass, rule, owner, ruleName) as F;
    return rule;
  };

  StyleRule.define = function <O>(descriptor: StyleRuleDescriptor<O>): StyleRuleClass<StyleRule<any>> {
    let superClass = descriptor.extends as StyleRuleClass | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    let css = descriptor.css;
    const style = descriptor.style;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.css;
    delete descriptor.style;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const ruleClass = superClass.extend(descriptor);

    if (typeof css === "function") {
      ruleClass.prototype.initCss = css;
      css = void 0;
    }

    ruleClass.construct = function (ruleClass: StyleRuleClass, rule: StyleRule<O> | null, owner: O, ruleName: string): StyleRule<O> {
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

      if (style !== void 0) {
        StyleMap.init(rule, style);
      }

      return rule;
    };

    return ruleClass;
  };

  return StyleRule;
})(CssRule);
