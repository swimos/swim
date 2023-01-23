// Copyright 2015-2023 Swim.inc
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

import {Mutable, Proto, AnyTiming, Timing} from "@swim/util";
import type {FastenerOwner} from "@swim/component";
import {ToStyleString, ToCssValue} from "@swim/style";
import {Look, Mood, MoodVector, ThemeMatrix, ThemeAnimator} from "@swim/theme";
import {StyleAnimator} from "../style/StyleAnimator";
import {StyleMapInit, StyleMap} from "./StyleMap";
import {CssContext} from "./CssContext";
import {CssRuleDescriptor, CssRuleClass, CssRule} from "./CssRule";

/** @public */
export interface StyleRuleDescriptor extends CssRuleDescriptor {
  extends?: Proto<StyleRule<any>> | string | boolean | null;
  style?: StyleMapInit;
}

/** @public */
export type StyleRuleTemplate<F extends StyleRule<any>> =
  ThisType<F> &
  StyleRuleDescriptor &
  Partial<Omit<F, keyof StyleRuleDescriptor>>;

/** @public */
export interface StyleRuleClass<F extends StyleRule<any> = StyleRule<any>> extends CssRuleClass<F> {
  /** @override */
  specialize(template: StyleRuleDescriptor): StyleRuleClass<F>;

  /** @override */
  refine(fastenerClass: StyleRuleClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: StyleRuleTemplate<F2>): StyleRuleClass<F2>;
  extend<F2 extends F>(className: string, template: StyleRuleTemplate<F2>): StyleRuleClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: StyleRuleTemplate<F2>): StyleRuleClass<F2>;
  define<F2 extends F>(className: string, template: StyleRuleTemplate<F2>): StyleRuleClass<F2>;

  /** @override */
  <F2 extends F>(template: StyleRuleTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface StyleRule<O = unknown> extends CssRule<O>, StyleMap {
  (property: string): unknown;
  (property: string, value: unknown): O;

  /** @internal @override */
  initRule(): CSSStyleRule | null;

  /** @internal @override */
  createRule(css: string): CSSStyleRule;

  /** @override */
  readonly rule: CSSStyleRule | null;

  get selector(): string;

  setSelector(selector: string): void;

  /** @protected */
  readonly style?: StyleMapInit; // optional prototype property

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
  applyStyles(): void;

  /** @protected @override */
  onMount(): void;
}

/** @public */
export const StyleRule = (function (_super: typeof CssRule) {
  const StyleRule = _super.extend("StyleRule", {}) as StyleRuleClass;

  StyleRule.prototype.createRule = function (this: StyleRule, css: string): CSSStyleRule {
    const cssContext = this.owner;
    if (CssContext.is(cssContext)) {
      const index = cssContext.insertRule(css);
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

  Object.defineProperty(StyleRule.prototype, "selector", {
    get: function (this: StyleRule): string {
      const rule = this.rule;
      if (rule !== null) {
        return rule.selectorText;
      } else {
        throw new Error("no style rule");
      }
    },
    configurable: true,
  });

  StyleRule.prototype.setSelector = function (this: StyleRule, selector: string): void {
    const rule = this.rule;
    if (rule !== null) {
      rule.selectorText = selector;
    } else {
      throw new Error("no style rule");
    }
  };

  StyleRule.prototype.getStyle = function (this: StyleRule, propertyNames: string | ReadonlyArray<string>): CSSStyleValue | string | undefined {
    const rule = this.rule;
    if (rule !== null) {
      if (typeof CSSStyleValue !== "undefined") { // CSS Typed OM support
        const style = rule.styleMap;
        if (typeof propertyNames === "string") {
          return style.get(propertyNames);
        } else {
          for (let i = 0, n = propertyNames.length; i < n; i += 1) {
            const value = style.get(propertyNames[i]!);
            if (value !== void 0) {
              return value;
            }
          }
          return "";
        }
      } else {
        const style = rule.style;
        if (typeof propertyNames === "string") {
          return style.getPropertyValue(propertyNames);
        } else {
          for (let i = 0, n = propertyNames.length; i < n; i += 1) {
            const value = style.getPropertyValue(propertyNames[i]!);
            if (value.length !== 0) {
              return value;
            }
          }
          return "";
        }
      }
    }
    return void 0;
  };

  StyleRule.prototype.setStyle = function (this: StyleRule, propertyName: string, value: unknown, priority?: string): StyleRule {
    const rule = this.rule;
    if (rule !== null) {
      this.willSetStyle(propertyName, value, priority);
      if (typeof CSSStyleValue !== "undefined") { // CSS Typed OM support
        if (value !== void 0 && value !== null) {
          const cssValue = ToCssValue(value);
          if (cssValue !== null) {
            try {
              rule.styleMap.set(propertyName, cssValue);
            } catch (e) {
              // swallow
            }
          } else {
            rule.style.setProperty(propertyName, ToStyleString(value), priority);
          }
        } else {
          rule.styleMap.delete(propertyName);
        }
      } else {
        if (value !== void 0 && value !== null) {
          rule.style.setProperty(propertyName, ToStyleString(value), priority);
        } else {
          rule.style.removeProperty(propertyName);
        }
      }
      this.onSetStyle(propertyName, value, priority);
      this.didSetStyle(propertyName, value, priority);
    }
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

  StyleRule.prototype.applyTheme = function (this: StyleRule, theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean | null): void {
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

  StyleRule.prototype.applyStyles = function(this: StyleRule): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      if (fastener instanceof StyleAnimator) {
        fastener.applyStyle(fastener.value, fastener.priority);
      }
    }
  };

  StyleRule.prototype.onMount = function (this: StyleRule): void {
    _super.prototype.onMount.call(this);
    this.applyStyles();
  };

  StyleMap.define(StyleRule.prototype);

  StyleRule.construct = function <F extends StyleRule<any>>(rule: F | null, owner: FastenerOwner<F>): F {
    if (rule === null) {
      rule = function (property: string, value: unknown): unknown | FastenerOwner<F> {
        if (value === void 0) {
          return rule!.getStyle(property);
         } else {
          rule!.setStyle(property, value);
          return rule!.owner;
        }
      } as F;
      delete (rule as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(rule, this.prototype);
    }
    rule = _super.construct.call(this, rule, owner) as F;
    if (rule.style !== void 0) {
      StyleMap.init(rule, rule.style);
    }
    return rule;
  };

  return StyleRule;
})(CssRule);
