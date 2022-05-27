// Copyright 2015-2022 Swim.inc
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

import {Proto, AnyTiming, Timing} from "@swim/util";
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {CssContext} from "./CssContext";
import {CssRuleDescriptor, CssRuleClass, CssRule} from "./CssRule";

/** @public */
export interface MediaRuleDescriptor extends CssRuleDescriptor {
  extends?: Proto<MediaRule<any>> | string | boolean | null;
}

/** @public */
export type MediaRuleTemplate<F extends CssRule<any>> =
  ThisType<F> &
  MediaRuleDescriptor &
  Partial<Omit<F, keyof MediaRuleDescriptor>>;

/** @public */
export interface MediaRuleClass<F extends MediaRule<any> = MediaRule<any>> extends CssRuleClass<F> {
  /** @override */
  specialize(template: MediaRuleDescriptor): MediaRuleClass<F>;

  /** @override */
  refine(fastenerClass: MediaRuleClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: MediaRuleTemplate<F2>): MediaRuleClass<F2>;
  extend<F2 extends F>(className: string, template: MediaRuleTemplate<F2>): MediaRuleClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: MediaRuleTemplate<F2>): MediaRuleClass<F2>;
  define<F2 extends F>(className: string, template: MediaRuleTemplate<F2>): MediaRuleClass<F2>;

  /** @override */
  <F2 extends F>(template: MediaRuleTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface MediaRule<O = unknown> extends CssRule<O>, CssContext {
  /** @internal */
  initRule(): CSSMediaRule | null;

  /** @internal */
  createRule(css: string): CSSMediaRule;

  /** @override */
  readonly rule: CSSMediaRule | null;

  /** @override */
  getRule(index: number): CSSRule | null;

  /** @override */
  insertRule(css: string, index?: number): number;

  /** @override */
  removeRule(index: number): void;

  /** @override */
  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean | null): void;
}

/** @public */
export const MediaRule = (function (_super: typeof CssRule) {
  const MediaRule = _super.extend("MediaRule", {}) as MediaRuleClass;

  MediaRule.prototype.createRule = function (this: MediaRule, css: string): CSSMediaRule {
    const cssContext = this.owner;
    if (CssContext.is(cssContext)) {
      const index = cssContext.insertRule(css);
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

  MediaRule.prototype.getRule = function (this: MediaRule, index: number): CSSRule | null {
    const rule = this.rule;
    if (rule !== null) {
      return rule.cssRules.item(index);
    } else {
      throw new Error("no media rule");
    }
  };

  MediaRule.prototype.insertRule = function (this: MediaRule, css: string, index?: number): number {
    const rule = this.rule;
    if (rule !== null) {
      return rule.insertRule(css, index);
    } else {
      throw new Error("no media rule");
    }
  };

  MediaRule.prototype.removeRule = function (this: MediaRule, index: number): void {
    const rule = this.rule;
    if (rule !== null) {
      rule.deleteRule(index);
    } else {
      throw new Error("no media rule");
    }
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

  return MediaRule;
})(CssRule);
