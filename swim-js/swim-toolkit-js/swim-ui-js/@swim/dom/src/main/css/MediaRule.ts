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
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {CssContext} from "./CssContext";
import {CssRuleInit, CssRuleClass, CssRule} from "./CssRule";

/** @public */
export interface MediaRuleInit extends CssRuleInit {
  extends?: {prototype: MediaRule<any>} | string | boolean | null;

  initRule?(rule: CSSMediaRule): void;
}

/** @public */
export type MediaRuleDescriptor<O = unknown, I = {}> = ThisType<MediaRule<O> & I> & MediaRuleInit & Partial<I>;

/** @public */
export interface MediaRuleClass<F extends MediaRule<any> = MediaRule<any>> extends CssRuleClass<F> {
}

/** @public */
export interface MediaRuleFactory<F extends MediaRule<any> = MediaRule<any>> extends MediaRuleClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): MediaRuleFactory<F> & I;

  define<O>(className: string, descriptor: MediaRuleDescriptor<O>): MediaRuleFactory<MediaRule<any>>;
  define<O, I = {}>(className: string, descriptor: MediaRuleDescriptor<O, I>): MediaRuleFactory<MediaRule<any> & I>;

  <O>(descriptor: MediaRuleDescriptor<O>): PropertyDecorator;
  <O, I = {}>(descriptor: MediaRuleDescriptor<O, I>): PropertyDecorator;
}

/** @public */
export interface MediaRule<O = unknown> extends CssRule<O>, CssContext {
  /** @override */
  readonly rule: CSSMediaRule;

  /** @override */
  getRule(index: number): CSSRule | null;

  /** @override */
  insertRule(cssText: string, index?: number): number;

  /** @override */
  removeRule(index: number): void;

  /** @override */
  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean | null): void;

  /** @internal */
  createRule(cssText: string): CSSMediaRule;

  /** @internal */
  initRule?(rule: CSSMediaRule): void;

  /** @internal */
  initCss?(): string;
}

/** @public */
export const MediaRule = (function (_super: typeof CssRule) {
  const MediaRule: MediaRuleFactory = _super.extend("MediaRule");

  MediaRule.prototype.getRule = function (this: MediaRule, index: number): CSSRule | null {
    return this.rule.cssRules.item(index);
  };

  MediaRule.prototype.insertRule = function (this: MediaRule, cssText: string, index?: number): number {
    return this.rule.insertRule(cssText, index);
  };

  MediaRule.prototype.removeRule = function (this: MediaRule, index: number): void {
    this.rule.deleteRule(index);
  };

  MediaRule.prototype.applyTheme = function (theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean | null): void {
    if (timing === void 0 || timing === true) {
      timing = theme.getOr(Look.timing, Mood.ambient, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      if (fastener instanceof CssRule) {
        fastener.applyTheme(theme, mood, timing);
      }
    }
  };

  MediaRule.prototype.createRule = function (this: MediaRule, cssText: string): CSSMediaRule {
    const cssContext = this.owner;
    if (CssContext.is(cssContext)) {
      const index = cssContext.insertRule(cssText);
      const rule = cssContext.getRule(index);
      if (rule instanceof CSSMediaRule) {
        return rule;
      } else {
        throw new TypeError("" + rule);
      }
    } else {
      throw new Error("no css context");
    }
  };

  MediaRule.construct = function <F extends MediaRule<any>>(ruleClass: {prototype: F}, rule: F | null, owner: FastenerOwner<F>): F {
    rule = _super.construct(ruleClass, rule, owner) as F;
    return rule;
  };

  MediaRule.define = function <O>(className: string, descriptor: MediaRuleDescriptor<O>): MediaRuleFactory<MediaRule<any>> {
    let superClass = descriptor.extends as MediaRuleFactory | null | undefined;
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

    const ruleClass = superClass.extend(className, descriptor);

    if (typeof css === "function") {
      ruleClass.prototype.initCss = css;
      css = void 0;
    }

    ruleClass.construct = function (ruleClass: {prototype: MediaRule<any>}, rule: MediaRule<O> | null, owner: O): MediaRule<O> {
      rule = superClass!.construct(ruleClass, rule, owner);

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

  return MediaRule;
})(CssRule);
