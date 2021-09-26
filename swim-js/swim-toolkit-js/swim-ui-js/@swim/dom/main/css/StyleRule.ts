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

import {__extends} from "tslib";
import type {Mutable} from "@swim/util";
import {AnyTiming, Timing} from "@swim/mapping";
import {ToStyleString, ToCssValue} from "@swim/style";
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import type {StyleAnimator} from "../style/StyleAnimator";
import {StyleMapInit, StyleMap} from "../style/StyleMap";
import {CssContext} from "./CssContext";
import {CssRuleInit, CssRule} from "./CssRule";

export interface StyleRuleInit extends CssRuleInit {
  extends?: StyleRuleClass;

  css?: string | (() => string);
  style?: StyleMapInit;

  willSetStyle?(propertyName: string, value: unknown, priority: string | undefined): void;
  onSetStyle?(propertyName: string, value: unknown, priority: string | undefined): void;
  didSetStyle?(propertyName: string, value: unknown, priority: string | undefined): void;

  initRule?(rule: CSSStyleRule): CSSStyleRule;
}

export type StyleRuleDescriptor<V extends CssContext, I = {}> = StyleRuleInit & ThisType<StyleRule<V> & I> & Partial<I>;

export type StyleRuleDescriptorExtends<V extends CssContext, I = {}> = {extends: StyleRuleClass | undefined} & StyleRuleDescriptor<V, I>;

export interface StyleRuleConstructor<V extends CssContext, I = {}> {
  new(owner: V, ruleName: string | undefined): StyleRule<V> & I;
  prototype: StyleRule<any> & I;
}

export interface StyleRuleClass extends Function {
  readonly prototype: StyleRule<any>;
}

export interface StyleRule<V extends CssContext> extends CssRule<V>, StyleMap {
  (property: string): unknown;
  (property: string, value: unknown): V;

  readonly node: Node | null;

  readonly rule: CSSStyleRule;

  readonly selector: string;

  setSelector(selector: string): void;

  getStyle(propertyNames: string | ReadonlyArray<string>): CSSStyleValue | string | undefined;

  setStyle(propertyName: string, value: unknown, priority?: string): this;

  willSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  onSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  didSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  /** @hidden */
  styleAnimators: {[animatorName: string]: StyleAnimator<StyleRule<CssContext>, unknown> | undefined};

  hasStyleAnimator(animatorName: string): boolean;

  getStyleAnimator(animatorName: string): StyleAnimator<this, unknown> | null;

  setStyleAnimator(animatorName: string, animator: StyleAnimator<this, unknown> | null): void;

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean): void;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;

  /** @hidden */
  initCss?(): string;

  /** @hidden */
  createRule(cssText: string): CSSStyleRule;

  /** @hidden */
  initRule?(rule: CSSStyleRule): CSSStyleRule;
}

export const StyleRule = function <V extends CssContext>(
    this: StyleRule<V> | typeof StyleRule,
    owner: V | StyleRuleDescriptor<V>,
    ruleName?: string,
  ): StyleRule<V> | PropertyDecorator {
  if (this instanceof StyleRule) { // constructor
    return StyleRuleConstructor.call(this, owner as V, ruleName) as StyleRule<V>;
  } else { // decorator factory
    return StyleRuleDecoratorFactory(owner as StyleRuleDescriptor<V>);
  }
} as {
  /** @hidden */
  new<V extends CssContext>(owner: V, ruleName: string | undefined): StyleRule<V>;

  <V extends CssContext, I = {}>(descriptor: StyleRuleDescriptorExtends<V, I>): PropertyDecorator;
  <V extends CssContext>(descriptor: StyleRuleDescriptor<V>): PropertyDecorator;

  /** @hidden */
  prototype: StyleRule<any>;

  define<V extends CssContext, I = {}>(descriptor: StyleRuleDescriptorExtends<V, I>): StyleRuleConstructor<V, I>;
  define<V extends CssContext>(descriptor: StyleRuleDescriptor<V>): StyleRuleConstructor<V>;
};
__extends(StyleRule, CssRule);
StyleMap.define(StyleRule.prototype);

function StyleRuleConstructor<V extends CssContext>(this: StyleRule<V>, owner: V, ruleName: string | undefined): StyleRule<V> {
  const _this: StyleRule<V> = (CssRule as Function).call(this, owner, ruleName) || this;
  (_this as Mutable<typeof _this>).styleAnimators = {};
  return _this;
}

function StyleRuleDecoratorFactory<V extends CssContext>(descriptor: StyleRuleDescriptor<V>): PropertyDecorator {
  return CssContext.decorateCssRule.bind(CssContext, StyleRule.define(descriptor as StyleRuleDescriptor<CssContext>));
}

Object.defineProperty(StyleRule.prototype, "node", {
  get: function (this: StyleRule<CssContext>): Node | null {
    return null;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(StyleRule.prototype, "selector", {
  get: function (this: StyleRule<CssContext>): string {
    return this.rule.selectorText;
  },
  enumerable: true,
  configurable: true,
});

StyleRule.prototype.setSelector = function (this: StyleRule<CssContext>, selector: string): void {
  this.rule.selectorText = selector;
};

StyleRule.prototype.getStyle = function (this: StyleRule<CssContext>, propertyNames: string | ReadonlyArray<string>): CSSStyleValue | string | undefined {
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

StyleRule.prototype.setStyle = function (this: StyleRule<CssContext>, propertyName: string,
                                         value: unknown, priority?: string): StyleRule<CssContext> {
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

StyleRule.prototype.willSetStyle = function (this: StyleRule<CssContext>, propertyName: string, value: unknown, priority: string | undefined): void {
  // hook
};

StyleRule.prototype.onSetStyle = function (this: StyleRule<CssContext>, propertyName: string, value: unknown, priority: string | undefined): void {
  // hook
};

StyleRule.prototype.didSetStyle = function (this: StyleRule<CssContext>, propertyName: string, value: unknown, priority: string | undefined): void {
  // hook
};

StyleRule.prototype.hasStyleAnimator = function (this: StyleRule<CssContext>, animatorName: string): boolean {
  return this.styleAnimators[animatorName] !== void 0;
};

StyleRule.prototype.getStyleAnimator = function (this: StyleRule<CssContext>, animatorName: string): StyleAnimator<StyleRule<CssContext>, unknown> | null {
  const styleAnimator = this.styleAnimators[animatorName] as StyleAnimator<StyleRule<CssContext>, unknown> | undefined;
  return styleAnimator !== void 0 ? styleAnimator : null;
};

StyleRule.prototype.setStyleAnimator = function (this: StyleRule<CssContext>, animatorName: string, animator: StyleAnimator<StyleRule<CssContext>, unknown> | null): void {
  const styleAnimators = this.styleAnimators;
  if (animator !== null) {
    styleAnimators[animatorName] = animator;
  } else {
    delete styleAnimators[animatorName];
  }
};

StyleRule.prototype.applyTheme = function (theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean): void {
  if (timing === void 0 || timing === true) {
    timing = theme.getOr(Look.timing, Mood.ambient, false);
  } else {
    timing = Timing.fromAny(timing);
  }
  const styleAnimators = this.styleAnimators;
  for (const animatorName in styleAnimators) {
    const styleAnimator = styleAnimators[animatorName]!;
    styleAnimator.applyTheme(theme, mood, timing as Timing | boolean);
  }
};

StyleRule.prototype.mount = function (): void {
  CssRule.prototype.mount.call(this);
  const styleAnimators = this.styleAnimators;
  for (const animatorName in styleAnimators) {
    const styleAnimator = styleAnimators[animatorName]!;
    styleAnimator.mount();
  }
};

StyleRule.prototype.unmount = function (): void {
  const styleAnimators = this.styleAnimators;
  for (const animatorName in styleAnimators) {
    const styleAnimator = styleAnimators[animatorName]!;
    styleAnimator.unmount();
  }
  CssRule.prototype.unmount.call(this);
};

StyleRule.prototype.createRule = function (this: StyleRule<CssContext>, cssText: string): CSSStyleRule {
  const index = this.owner.insertRule(cssText);
  const rule = this.owner.getRule(index);
  if (rule instanceof CSSStyleRule) {
    return rule;
  } else {
    throw new TypeError("" + rule);
  }
};

StyleRule.define = function <V extends CssContext, I>(descriptor: StyleRuleDescriptor<V, I>): StyleRuleConstructor<V, I> {
  let _super = descriptor.extends;
  let css = descriptor.css;
  const style = descriptor.style;
  delete descriptor.extends;
  delete descriptor.css;
  delete descriptor.style;

  if (_super === void 0) {
    _super = StyleRule;
  }

  const _constructor = function DecoratedStyleRule(this: StyleRule<V>, owner: V, ruleName: string | undefined): StyleRule<V> {
    let _this: StyleRule<V> = function StyleRuleAccessor(property: string, value: unknown): unknown | V {
      if (value === void 0) {
        return _this.getStyle(property);
      } else {
        _this.setStyle(property, value);
        return _this.owner;
      }
    } as StyleRule<V>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, ruleName) || _this;
    let cssText: string;
    if (css !== void 0) {
      cssText = css as string;
    } else if (_this.initCss !== void 0) {
      cssText = _this.initCss();
    } else {
      throw new Error("undefined css");
    }
    let rule = _this.createRule(cssText);
    if (_this.initRule !== void 0) {
      rule = _this.initRule(rule);
    }
    (_this as Mutable<typeof _this>).rule = rule;
    if (style !== void 0) {
      StyleMap.init(_this, style);
    }
    return _this;
  } as unknown as StyleRuleConstructor<V, I>;

  const _prototype = descriptor as unknown as StyleRule<V> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (typeof css === "function") {
    _prototype.initCss = css;
    css = void 0;
  }

  return _constructor;
}
