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
import {CssContext} from "./CssContext";
import {
  StyleRuleDescriptorExtends,
  StyleRuleDescriptor,
  StyleRuleConstructor,
  StyleRule,
} from "./StyleRule";
import {
  MediaRuleDescriptorExtends,
  MediaRuleDescriptor,
  MediaRuleConstructor,
  MediaRule,
} from "./MediaRule";

export type CssRuleType = "style" | "media";

export interface CssRuleInit {
  extends?: CssRulePrototype;

  css?: string | (() => string | undefined);

  initRule?(rule: CSSRule): CSSRule;
}

export type CssRuleDescriptorInit<V extends CssContext, I = {}> = CssRuleInit & ThisType<CssRule<V> & I> & I;

export type CssRuleDescriptorExtends<V extends CssContext, I = {}> = {extends: CssRulePrototype | undefined} & CssRuleDescriptorInit<V, I>;

export type CssRuleDescriptor<V extends CssContext, I = {}> = {type?: CssRuleType} & CssRuleDescriptorInit<V, I>;

export type CssRulePrototype = Function & {prototype: CssRule<any>};

export type CssRuleConstructor<V extends CssContext, I = {}> = {
  new(owner: V, ruleName: string | undefined): CssRule<V> & I;
  prototype: CssRule<any> & I;
};

export declare abstract class CssRule<V extends CssContext> {
  /** @hidden */
  _owner: V;
  /** @hidden */
  _rule: CSSRule;

  constructor(owner: V, ruleName: string | undefined);

  get name(): string | undefined;

  get owner(): V;

  get rule(): CSSRule;

  onAnimate(t: number): void;

  /** @hidden */
  initCss?(): string | undefined;

  /** @hidden */
  createRule(cssText?: string): CSSRule;

  /** @hidden */
  initRule?(rule: CSSRule): CSSRule;

  static define<V extends CssContext, I = {}>(descriptor: {type: "style"} & StyleRuleDescriptorExtends<V, I>): StyleRuleConstructor<V, I>;
  static define<V extends CssContext>(descriptor: {type: "style"} & StyleRuleDescriptor<V>): StyleRuleConstructor<V>;

  static define<V extends CssContext, I = {}>(descriptor: {type: "media"} & MediaRuleDescriptorExtends<V, I>): MediaRuleConstructor<V, I>;
  static define<V extends CssContext>(descriptor: {type: "media"} & MediaRuleDescriptor<V>): MediaRuleConstructor<V>;

  static define<V extends CssContext, I = {}>(descriptor: CssRuleDescriptorExtends<V, I>): CssRuleConstructor<V, I>;
  static define<V extends CssContext>(descriptor: CssRuleDescriptor<V>): CssRuleConstructor<V>;

  // Forward type declarations
  /** @hidden */
  static Style: typeof StyleRule; // defined by StyleRule
  /** @hidden */
  static Media: typeof MediaRule; // defined by MediaRule
}

export interface CssRule<V extends CssContext> {
}

export function CssRule<V extends CssContext, I = {}>(descriptor: {type: "style"} & StyleRuleDescriptorExtends<V, I>): PropertyDecorator;
export function CssRule<V extends CssContext>(descriptor: {type: "style"} & StyleRuleDescriptor<V>): PropertyDecorator;

export function CssRule<V extends CssContext, I = {}>(descriptor: {type: "media"} & MediaRuleDescriptorExtends<V, I>): PropertyDecorator;
export function CssRule<V extends CssContext>(descriptor: {type: "media"} & MediaRuleDescriptor<V>): PropertyDecorator;

export function CssRule<V extends CssContext, I = {}>(descriptor: CssRuleDescriptorExtends<V, I>): PropertyDecorator;
export function CssRule<V extends CssContext>(descriptor: CssRuleDescriptor<V>): PropertyDecorator;

export function CssRule<V extends CssContext>(
    this: CssRule<V> | typeof CssRule,
    owner: V | CssRuleDescriptor<V>,
    ruleName?: string,
  ): CssRule<V> | PropertyDecorator {
  if (this instanceof CssRule) { // constructor
    return CssRuleConstructor.call(this, owner as V, ruleName);
  } else { // decorator factory
    return CssRuleDecoratorFactory(owner as CssRuleDescriptor<V>);
  }
}
__extends(CssRule, Object);

function CssRuleConstructor<V extends CssContext>(this: CssRule<V>, owner: V, ruleName: string | undefined): CssRule<V> {
  if (ruleName !== void 0) {
    Object.defineProperty(this, "name", {
      value: ruleName,
      enumerable: true,
      configurable: true,
    });
  }
  this._owner = owner;
  return this;
}

function CssRuleDecoratorFactory<V extends CssContext>(descriptor: CssRuleDescriptor<V>): PropertyDecorator {
  return CssContext.decorateCssRule.bind(CssContext, CssRule.define(descriptor));
}

Object.defineProperty(CssRule.prototype, "owner", {
  get: function <V extends CssContext>(this: CssRule<V>): V {
    return this._owner;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(CssRule.prototype, "rule", {
  get: function (this: CssRule<CssContext>): CSSRule {
    return this._rule;
  },
  enumerable: true,
  configurable: true,
});

CssRule.prototype.onAnimate = function (this: CssRule<CssContext>, t: number): void {
  // hook
};

CssRule.prototype.createRule = function (this: CssRule<CssContext>, cssText?: string): CSSRule {
  if (cssText !== void 0) {
    const index = this._owner.insertRule(cssText);
    const rule = this._owner.getRule(index);
    if (rule instanceof CSSRule) {
      return rule;
    } else {
      throw new TypeError("" + rule);
    }
  } else {
    throw new Error("undefined css");
  }
};

CssRule.define = function <V extends CssContext, I>(descriptor: CssRuleDescriptor<V, I>): CssRuleConstructor<V, I> {
  const type = descriptor.type;
  delete (descriptor as {type?: string}).type;
  if (type === void 0 || type === "style") {
    return CssRule.Style.define(descriptor as unknown as StyleRuleDescriptor<V>) as unknown as CssRuleConstructor<V, I>;
  } else if (type === "media") {
    return CssRule.Media.define(descriptor as unknown as MediaRuleDescriptor<V>) as unknown as CssRuleConstructor<V, I>;
  } else {
    let _super = descriptor.extends;
    let css = descriptor.css;
    delete descriptor.extends;
    delete descriptor.css;

    if (_super === void 0) {
      _super = CssRule;
    }

    const _constructor = function CssRuleAccessor(this: CssRule<V>, owner: V, ruleName: string | undefined): CssRule<V> {
      const _this: CssRule<V> = _super!.call(this, owner, ruleName) || this;
      let cssText: string | undefined;
      if (css !== void 0) {
        cssText = css as string;
      } else if (_this.initCss !== void 0) {
        cssText = _this.initCss();
      }
      let rule = _this.createRule(cssText);
      if (_this.initRule !== void 0) {
        rule = _this.initRule(rule);
      }
      _this._rule = rule;
      return _this;
    } as unknown as CssRuleConstructor<V, I>;

    const _prototype = descriptor as unknown as CssRule<V> & I;
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
};
