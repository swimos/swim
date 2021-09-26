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
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {CssContext} from "./CssContext";
import {CssRuleInit, CssRule} from "./CssRule";

export interface MediaRuleInit extends CssRuleInit {
  extends?: MediaRuleClass;

  css?: string | (() => string);

  initRule?(rule: CSSMediaRule): CSSMediaRule;
}

export type MediaRuleDescriptor<V extends CssContext, I = {}> = MediaRuleInit & ThisType<MediaRule<V> & I> & Partial<I>;

export type MediaRuleDescriptorExtends<V extends CssContext, I = {}> = {extends: MediaRuleClass | undefined} & MediaRuleDescriptor<V, I>;

export interface MediaRuleConstructor<V extends CssContext, I = {}> {
  new(owner: V, ruleName: string | undefined): MediaRule<V> & I;
  prototype: MediaRule<any> & I;
}

export interface MediaRuleClass extends Function {
  readonly prototype: MediaRule<any>;
}

export interface MediaRule<V extends CssContext> extends CssRule<V>, CssContext {
  readonly rule: CSSMediaRule;

  readonly node: Node | undefined;

  getRule(index: number): CSSRule | null;

  insertRule(cssText: string, index?: number): number;

  removeRule(index: number): void;

  /** @hidden */
  cssRules: {[ruleName: string]: CssRule<MediaRule<CssContext>> | undefined};

  hasCssRule(ruleName: string): boolean;

  getCssRule(ruleName: string): CssRule<this> | null;

  setCssRule(ruleName: string, cssRule: CssRule<this> | null): void;

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean): void;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;

  /** @hidden */
  initCss?(): string;

  /** @hidden */
  createRule(cssText: string): CSSMediaRule;

  /** @hidden */
  initRule?(rule: CSSMediaRule): CSSMediaRule;
}

export const MediaRule = function <V extends CssContext>(
    this: MediaRule<V> | typeof MediaRule,
    owner: V | MediaRuleDescriptor<V>,
    ruleName?: string,
  ): MediaRule<V> | PropertyDecorator {
  if (this instanceof MediaRule) { // constructor
    return MediaRuleConstructor.call(this, owner as V, ruleName) as MediaRule<V>;
  } else { // decorator factory
    return MediaRuleDecoratorFactory(owner as MediaRuleDescriptor<V>);
  }
} as {
  /** @hidden */
  new<V extends CssContext>(owner: V, ruleName: string | undefined): MediaRule<V>;

  <V extends CssContext, I = {}>(descriptor: MediaRuleDescriptorExtends<V, I>): PropertyDecorator;
  <V extends CssContext>(descriptor: MediaRuleDescriptor<V>): PropertyDecorator;

  /** @hidden */
  prototype: MediaRule<any>;

  define<V extends CssContext, I = {}>(descriptor: MediaRuleDescriptorExtends<V, I>): MediaRuleConstructor<V, I>;
  define<V extends CssContext>(descriptor: MediaRuleDescriptor<V>): MediaRuleConstructor<V>;
};
__extends(MediaRule, CssRule);

function MediaRuleConstructor<V extends CssContext>(this: MediaRule<V>, owner: V, ruleName: string | undefined): MediaRule<V> {
  const _this: MediaRule<V> = (CssRule as Function).call(this, owner, ruleName) || this;
  (_this as Mutable<typeof _this>).cssRules = {};
  return _this;
}

function MediaRuleDecoratorFactory<V extends CssContext>(descriptor: MediaRuleDescriptor<V>): PropertyDecorator {
  return CssContext.decorateCssRule.bind(CssContext, MediaRule.define(descriptor as MediaRuleDescriptor<CssContext>));
}

MediaRule.prototype.getRule = function (this: MediaRule<CssContext>, index: number): CSSRule | null {
  return this.rule.cssRules.item(index);
};

MediaRule.prototype.insertRule = function (this: MediaRule<CssContext>, cssText: string, index?: number): number {
  return this.rule.insertRule(cssText, index);
};

MediaRule.prototype.removeRule = function (this: MediaRule<CssContext>, index: number): void {
  this.rule.deleteRule(index);
};

MediaRule.prototype.hasCssRule = function (this: MediaRule<CssContext>, ruleName: string): boolean {
  return this.cssRules[ruleName] !== void 0;
};

MediaRule.prototype.getCssRule = function (this: MediaRule<CssContext>, ruleName: string): CssRule<MediaRule<CssContext>> | null {
  const cssRule = this.cssRules[ruleName] as CssRule<MediaRule<CssContext>> | undefined;
  return cssRule !== void 0 ? cssRule : null;
};

MediaRule.prototype.setCssRule = function (this: MediaRule<CssContext>, ruleName: string, cssRule: CssRule<MediaRule<CssContext>> | null): void {
  if (cssRule !== null) {
    this.cssRules[ruleName] = cssRule;
  } else {
    delete this.cssRules[ruleName];
  }
};

MediaRule.prototype.applyTheme = function (theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean): void {
  if (timing === void 0 || timing === true) {
    timing = theme.getOr(Look.timing, Mood.ambient, false);
  } else {
    timing = Timing.fromAny(timing);
  }
  const cssRules = this.cssRules;
  for (const ruleName in cssRules) {
    const cssRule = cssRules[ruleName]!;
    cssRule.applyTheme(theme, mood, timing);
  }
};

MediaRule.prototype.mount = function (): void {
  CssRule.prototype.mount.call(this);
  const cssRules = this.cssRules;
  for (const ruleName in cssRules) {
    const cssRule = cssRules[ruleName]!;
    cssRule.mount();
  }
};

MediaRule.prototype.unmount = function (): void {
  const cssRules = this.cssRules;
  for (const ruleName in cssRules) {
    const cssRule = cssRules[ruleName]!;
    cssRule.unmount();
  }
  CssRule.prototype.unmount.call(this);
};

MediaRule.prototype.createRule = function (this: MediaRule<CssContext>, cssText: string): CSSMediaRule {
  const index = this.owner.insertRule(cssText);
  const rule = this.owner.getRule(index);
  if (rule instanceof CSSMediaRule) {
    return rule;
  } else {
    throw new TypeError("" + rule);
  }
};

MediaRule.define = function <V extends CssContext, I>(descriptor: MediaRuleDescriptor<V, I>): MediaRuleConstructor<V, I> {
  let _super = descriptor.extends;
  let css = descriptor.css;
  delete descriptor.extends;
  delete descriptor.css;

  if (_super === void 0) {
    _super = MediaRule;
  }

  const _constructor = function DecoratedMediaRule(this: MediaRule<V>, owner: V, ruleName: string | undefined): MediaRule<V> {
    const _this = _super!.call(this, owner, ruleName) || this;
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
    return _this;
  } as unknown as MediaRuleConstructor<V, I>;

  const _prototype = descriptor as unknown as MediaRule<V> & I;
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
