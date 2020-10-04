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
import {CssContext} from "./CssContext";
import {CssRuleInit, CssRule} from "./CssRule";

export interface MediaRuleInit extends CssRuleInit {
  extends?: MediaRulePrototype;

  css?: string | (() => string);

  initRule?(rule: CSSMediaRule): CSSMediaRule;
}

export type MediaRuleDescriptorInit<V extends CssContext, I = {}> = MediaRuleInit & ThisType<MediaRule<V> & I> & I;

export type MediaRuleDescriptorExtends<V extends CssContext, I = {}> = {extends: MediaRulePrototype | undefined} & MediaRuleDescriptorInit<V, I>;

export type MediaRuleDescriptor<V extends CssContext, I = {}> = MediaRuleDescriptorInit<V, I>;

export type MediaRulePrototype = Function & {prototype: MediaRule<any>};

export type MediaRuleConstructor<V extends CssContext, I = {}> = {
  new(owner: V, ruleName: string | undefined): MediaRule<V> & I;
  prototype: MediaRule<any> & I;
};

export declare abstract class MediaRule<V extends CssContext> {
  /** @hidden */
  _rule: CSSMediaRule;
  /** @hidden */
  _cssRules?: {[ruleName: string]: CssRule<MediaRule<CssContext>> | undefined};

  constructor(owner: V, ruleName: string | undefined);

  get rule(): CSSMediaRule;

  get node(): Node | undefined;

  getRule(index: number): CSSRule | null;

  insertRule(cssText: string, index?: number): number;

  removeRule(index: number): void;

  hasCssRule(ruleName: string): boolean;

  getCssRule(ruleName: string): CssRule<this> | null;

  setCssRule(ruleName: string, cssRule: CssRule<this> | null): void;

  onAnimate(t: number): void;

  animate(animator: Animator): void;

  requireUpdate(updateFlags: number): void;

  /** @hidden */
  initCss?(): string;

  /** @hidden */
  createRule(cssText: string): CSSMediaRule;

  /** @hidden */
  initRule?(rule: CSSMediaRule): CSSMediaRule;

  static define<V extends CssContext, I = {}>(descriptor: MediaRuleDescriptorExtends<V, I>): MediaRuleConstructor<V, I>;
  static define<V extends CssContext>(descriptor: MediaRuleDescriptor<V>): MediaRuleConstructor<V>;
}

export interface MediaRule<V extends CssContext> extends CssRule<V>, CssContext {
}

export function MediaRule<V extends CssContext, I = {}>(descriptor: MediaRuleDescriptorExtends<V, I>): PropertyDecorator;
export function MediaRule<V extends CssContext>(descriptor: MediaRuleDescriptor<V>): PropertyDecorator;

export function MediaRule<V extends CssContext>(
    this: MediaRule<V> | typeof MediaRule,
    owner: V | MediaRuleDescriptor<V>,
    ruleName?: string,
  ): MediaRule<V> | PropertyDecorator {
  if (this instanceof MediaRule) { // constructor
    return MediaRuleConstructor.call(this, owner as V, ruleName);
  } else { // decorator factory
    return MediaRuleDecoratorFactory(owner as MediaRuleDescriptor<V>);
  }
}
__extends(MediaRule, CssRule);
CssRule.Media = MediaRule;

function MediaRuleConstructor<V extends CssContext>(this: MediaRule<V>, owner: V, ruleName: string | undefined): MediaRule<V> {
  const _this: MediaRule<V> = CssRule.call(this, owner, ruleName) || this;
  return _this;
}

function MediaRuleDecoratorFactory<V extends CssContext>(descriptor: MediaRuleDescriptor<V>): PropertyDecorator {
  return CssContext.decorateCssRule.bind(CssContext, MediaRule.define(descriptor as MediaRuleDescriptorExtends<V>));
}

MediaRule.prototype.getRule = function (index: number): CSSRule | null {
  return this._rule.cssRules.item(index);
};

MediaRule.prototype.insertRule = function (cssText: string, index?: number): number {
  return this._rule.insertRule(cssText, index);
};

MediaRule.prototype.removeRule = function (index: number): void {
  this._rule.deleteRule(index);
};

MediaRule.prototype.hasCssRule = function (this: MediaRule<CssContext>, ruleName: string): boolean {
  const cssRules = this._cssRules;
  return cssRules !== void 0 && cssRules[ruleName] !== void 0;
};

MediaRule.prototype.getCssRule = function (this: MediaRule<CssContext>, ruleName: string): CssRule<MediaRule<CssContext>> | null {
  const cssRules = this._cssRules;
  if (cssRules !== void 0) {
    const cssRule = cssRules[ruleName];
    if (cssRule !== void 0) {
      return cssRule as CssRule<MediaRule<CssContext>>;
    }
  }
  return null;
};

MediaRule.prototype.setCssRule = function (this: MediaRule<CssContext>, ruleName: string, cssRule: CssRule<MediaRule<CssContext>> | null): void {
  let cssRules = this._cssRules;
  if (cssRules === void 0) {
    cssRules = {};
    this._cssRules = cssRules;
  }
  if (cssRule !== null) {
    cssRules[ruleName] = cssRule;
  } else {
    delete cssRules[ruleName];
  }
};

MediaRule.prototype.onAnimate = function (this: MediaRule<CssContext>, t: number): void {
  const cssRules = this._cssRules;
  if (cssRules !== void 0) {
    for (const ruleName in cssRules) {
      const cssRule = cssRules[ruleName]!;
      cssRule.onAnimate(t);
    }
  }
};

MediaRule.prototype.animate = function (this: MediaRule<CssContext>, animator: Animator): void {
  return this._owner.animate(animator);
};

MediaRule.prototype.requireUpdate = function (this: MediaRule<CssContext>, updateFlags: number): void {
  return this._owner.requireUpdate(updateFlags);
};

MediaRule.prototype.createRule = function (this: MediaRule<CssContext>, cssText: string): CSSMediaRule {
  const index = this._owner.insertRule(cssText);
  const rule = this._owner.getRule(index);
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

  const _constructor = function CssRuleAccessor(this: MediaRule<V>, owner: V, ruleName: string | undefined): MediaRule<V> {
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
    _this._rule = rule;
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
