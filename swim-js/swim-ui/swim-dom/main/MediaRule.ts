// Copyright 2015-2023 Nstream, inc.
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
import type {Fastener} from "@swim/component";
import type {CssRuleDescriptor} from "./CssRule";
import type {CssRuleClass} from "./CssRule";
import {CssRule} from "./CssRule";

/** @public */
export interface MediaRuleDescriptor<R> extends CssRuleDescriptor<R, CSSMediaRule> {
  extends?: Proto<MediaRule<any>> | boolean | null;
}

/** @public */
export interface MediaRuleClass<F extends MediaRule<any> = MediaRule> extends CssRuleClass<F> {
}

/** @public */
export interface MediaRule<R = any> extends CssRule<R, CSSMediaRule> {
  /** @override */
  get descriptorType(): Proto<MediaRuleDescriptor<R>>;

  /** @override */
  get fastenerType(): Proto<MediaRule<any>>;

  get selector(): string;

  /** @override */
  transformInletCss(inletCss: CSSStyleSheet | CSSRule | null): CSSMediaRule | null;

  /** @override */
  createRule(inletCss: CSSStyleSheet | CSSGroupingRule): CSSMediaRule | null;
}

/** @public */
export const MediaRule = (<R, F extends MediaRule<any>>() => CssRule.extend<MediaRule<R>, MediaRuleClass<F>>("MediaRule", {
  get fastenerType(): Proto<MediaRule<any>> {
    return MediaRule;
  },

  selector: "@media",

  transformInletCss(inletCss: CSSStyleSheet | CSSRule | null): CSSMediaRule | null {
    if (inletCss instanceof CSSMediaRule) {
      return inletCss;
    } else if (inletCss instanceof CSSStyleSheet || inletCss instanceof CSSGroupingRule) {
      return this.createRule(inletCss);
    }
    return null;
  },

  createRule(inletCss: CSSStyleSheet | CSSGroupingRule): CSSMediaRule | null {
    const index = inletCss.insertRule(this.cssText);
    const rule = inletCss.cssRules.item(index);
    if (!(rule instanceof CSSMediaRule)) {
      throw new TypeError("not a media rule: " + rule);
    }
    return rule;
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    return fastener;
  },
}))();
