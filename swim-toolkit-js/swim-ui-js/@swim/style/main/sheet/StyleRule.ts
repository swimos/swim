// Copyright 2015-2020 Swim inc.
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
import {Animator} from "@swim/animate";
import {ToStyleString} from "../value/ToStyleString";
import {ToCssValue} from "../value/ToCssValue";
import {StyleAnimator} from "../animator/StyleAnimator";
import {CssContext} from "./CssContext";
import {StyleMapInit, StyleMap} from "./StyleMap";
import {CssRuleInit, CssRule} from "./CssRule";

export interface StyleRuleInit extends CssRuleInit {
  extends?: StyleRulePrototype;

  css?: string | (() => string);
  style?: StyleMapInit;

  willSetStyle?(propertyName: string, value: unknown, priority: string | undefined): void;
  onSetStyle?(propertyName: string, value: unknown, priority: string | undefined): void;
  didSetStyle?(propertyName: string, value: unknown, priority: string | undefined): void;

  initRule?(rule: CSSStyleRule): CSSStyleRule;
}

export type StyleRuleDescriptorInit<V extends CssContext, I = {}> = StyleRuleInit & ThisType<StyleRule<V> & I> & I;

export type StyleRuleDescriptorExtends<V extends CssContext, I = {}> = {extends: StyleRulePrototype | undefined} & StyleRuleDescriptorInit<V, I>;

export type StyleRuleDescriptor<V extends CssContext, I = {}> = StyleRuleDescriptorInit<V, I>;

export type StyleRulePrototype = Function & {prototype: StyleRule<any>};

export type StyleRuleConstructor<V extends CssContext, I = {}> = {
  new(owner: V, ruleName: string | undefined): StyleRule<V> & I;
  prototype: StyleRule<any> & I;
};

export declare abstract class StyleRule<V extends CssContext> {
  /** @hidden */
  _rule: CSSStyleRule;
  /** @hidden */
  _styleAnimators?: {[animatorName: string]: StyleAnimator<StyleRule<CssContext>, unknown> | undefined};

  constructor(owner: V, ruleName: string | undefined);

  get rule(): CSSStyleRule;

  get node(): Node | undefined;

  selector(): string;
  selector(selector: string): this;

  getStyle(propertyNames: string | ReadonlyArray<string>): CSSStyleValue | string | undefined;

  setStyle(propertyName: string, value: unknown, priority?: string): this;

  willSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  onSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  didSetStyle(propertyName: string, value: unknown, priority: string | undefined): void;

  hasStyleAnimator(animatorName: string): boolean;

  getStyleAnimator(animatorName: string): StyleAnimator<this, unknown> | null;

  setStyleAnimator(animatorName: string, animator: StyleAnimator<this, unknown> | null): void;

  onAnimate(t: number): void;

  animate(animator: Animator): void;

  requireUpdate(updateFlags: number): void;

  /** @hidden */
  initCss?(): string;

  /** @hidden */
  createRule(cssText: string): CSSStyleRule;

  /** @hidden */
  initRule?(rule: CSSStyleRule): CSSStyleRule;

  static define<V extends CssContext, I = {}>(descriptor: StyleRuleDescriptorExtends<V, I>): StyleRuleConstructor<V, I>;
  static define<V extends CssContext>(descriptor: StyleRuleDescriptor<V>): StyleRuleConstructor<V>;
}

export interface StyleRule<V extends CssContext> extends CssRule<V>, StyleMap {
  (property: string): unknown;
  (property: string, value: unknown): V;
}

export function StyleRule<V extends CssContext, I = {}>(descriptor: StyleRuleDescriptorExtends<V, I>): PropertyDecorator;
export function StyleRule<V extends CssContext>(descriptor: StyleRuleDescriptor<V>): PropertyDecorator;

export function StyleRule<V extends CssContext>(
    this: StyleRule<V> | typeof StyleRule,
    owner: V | StyleRuleDescriptor<V>,
    ruleName?: string,
  ): StyleRule<V> | PropertyDecorator {
  if (this instanceof StyleRule) { // constructor
    return StyleRuleConstructor.call(this, owner as V, ruleName);
  } else { // decorator factory
    return StyleRuleDecoratorFactory(owner as StyleRuleDescriptor<V>);
  }
}
__extends(StyleRule, CssRule);
StyleMap.define(StyleRule.prototype);
CssRule.Style = StyleRule;

function StyleRuleConstructor<V extends CssContext>(this: StyleRule<V>, owner: V, ruleName: string | undefined): StyleRule<V> {
  const _this: StyleRule<V> = CssRule.call(this, owner, ruleName) || this;
  return _this;
}

function StyleRuleDecoratorFactory<V extends CssContext>(descriptor: StyleRuleDescriptor<V>): PropertyDecorator {
  return CssContext.decorateCssRule.bind(CssContext, StyleRule.define(descriptor as StyleRuleDescriptorExtends<V>));
}

StyleRule.prototype.selector = function (this: StyleRule<CssContext>, selector?: string): string | StyleRule<CssContext> {
  if (selector === void 0) {
    return this._rule.selectorText;
  } else {
    this._rule.selectorText = selector;
    return this;
  }
} as {(): string; (selector: string): StyleRule<CssContext>};

if (typeof CSSStyleValue !== "undefined") { // CSS Typed OM support
  StyleRule.prototype.getStyle = function (this: StyleRule<CssContext>, propertyNames: string | ReadonlyArray<string>): CSSStyleValue | string | undefined {
    const style = this._rule.styleMap;
    if (typeof propertyNames === "string") {
      return style.get(propertyNames);
    } else {
      for (let i = 0, n = propertyNames.length; i < n; i += 1) {
        const value = style.get(propertyNames[i]);
        if (value !== "") {
          return value;
        }
      }
      return "";
    }
  };
  StyleRule.prototype.setStyle = function (this: StyleRule<CssContext>, propertyName: string,
                                           value: unknown, priority?: string): StyleRule<CssContext> {
    this.willSetStyle(propertyName, value, priority);
    if (value !== void 0) {
      const cssValue = ToCssValue(value);
      if (cssValue !== void 0) {
        try {
          this._rule.styleMap.set(propertyName, cssValue);
        } catch (e) {
          // swallow
        }
      } else {
        this._rule.style.setProperty(propertyName, ToStyleString(value), priority);
      }
    } else {
      this._rule.styleMap.delete(propertyName);
    }
    this.onSetStyle(propertyName, value, priority);
    this.didSetStyle(propertyName, value, priority);
    return this;
  };
} else {
  StyleRule.prototype.getStyle = function (this: StyleRule<CssContext>, propertyNames: string | ReadonlyArray<string>): CSSStyleValue | string | undefined {
    const style = this._rule.style;
    if (typeof propertyNames === "string") {
      return style.getPropertyValue(propertyNames);
    } else {
      for (let i = 0, n = propertyNames.length; i < n; i += 1) {
        const value = style.getPropertyValue(propertyNames[i]);
        if (value !== "") {
          return value;
        }
      }
      return "";
    }
  };
  StyleRule.prototype.setStyle = function (this: StyleRule<CssContext>, propertyName: string, 
                                           value: unknown, priority?: string): StyleRule<CssContext> {
    this.willSetStyle(propertyName, value, priority);
    if (value !== void 0) {
      this._rule.style.setProperty(propertyName, ToStyleString(value), priority);
    } else {
      this._rule.style.removeProperty(propertyName);
    }
    this.onSetStyle(propertyName, value, priority);
    this.didSetStyle(propertyName, value, priority);
    return this;
  };
}

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
  const styleAnimators = this._styleAnimators;
  return styleAnimators !== void 0 && styleAnimators[animatorName] !== void 0;
};

StyleRule.prototype.getStyleAnimator = function (this: StyleRule<CssContext>, animatorName: string): StyleAnimator<StyleRule<CssContext>, unknown> | null {
  const styleAnimators = this._styleAnimators;
  if (styleAnimators !== void 0) {
    const styleAnimator = styleAnimators[animatorName];
    if (styleAnimator !== void 0) {
      return styleAnimator as StyleAnimator<StyleRule<CssContext>, unknown>;
    }
  }
  return null;
};

StyleRule.prototype.setStyleAnimator = function (this: StyleRule<CssContext>, animatorName: string, animator: StyleAnimator<StyleRule<CssContext>, unknown> | null): void {
  let styleAnimators = this._styleAnimators;
  if (styleAnimators === void 0) {
    styleAnimators = {};
    this._styleAnimators = styleAnimators;
  }
  if (animator !== null) {
    styleAnimators[animatorName] = animator;
  } else {
    delete styleAnimators[animatorName];
  }
};

StyleRule.prototype.onAnimate = function (this: StyleRule<CssContext>, t: number): void {
  const styleAnimators = this._styleAnimators;
  if (styleAnimators !== void 0) {
    for (const animatorName in styleAnimators) {
      const animator = styleAnimators[animatorName]!;
      animator.onAnimate(t);
    }
  }
};

StyleRule.prototype.animate = function (this: StyleRule<CssContext>, animator: Animator): void {
  return this._owner.animate(animator);
};

StyleRule.prototype.requireUpdate = function (this: StyleRule<CssContext>, updateFlags: number): void {
  return this._owner.requireUpdate(updateFlags);
};

StyleRule.prototype.createRule = function (this: StyleRule<CssContext>, cssText: string): CSSStyleRule {
  const index = this._owner.insertRule(cssText);
  const rule = this._owner.getRule(index);
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

  const _constructor = function CssRuleAccessor(this: StyleRule<V>, owner: V, ruleName: string | undefined): StyleRule<V> {
    let _this: StyleRule<V> = function accessor(property: string, value: unknown): unknown | V {
      if (value === void 0) {
        return _this.getStyle(property);
      } else {
        _this.setStyle(property, value);
        return _this._owner;
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
    _this._rule = rule;
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
