// Copyright 2015-2024 Nstream, inc.
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
import type {CssScopeDescriptor} from "./CssScope";
import type {CssScopeClass} from "./CssScope";
import {CssScope} from "./CssScope";

/** @public */
export interface CssRuleDescriptor<R, S extends CSSRule> extends CssScopeDescriptor<R, S> {
  extends?: Proto<CssRule<any, any>> | boolean | null;
}

/** @public */
export interface CssRuleClass<F extends CssRule<any, any> = CssRule> extends CssScopeClass<F> {
}

/** @public */
export interface CssRule<R = any, S extends CSSRule = any> extends CssScope<R, S> {
  /** @override */
  get descriptorType(): Proto<CssRuleDescriptor<R, S>>;

  /** @override */
  get fastenerType(): Proto<CssRule<any, any>>;

  get selector(): string;

  get cssText(): string;

  /** @override */
  transformInletCss(inletCss: CSSStyleSheet | CSSRule | null): S | null;

  createRule(inletCss: CSSStyleSheet | CSSGroupingRule): S | null;
}

/** @public */
export const CssRule = (<R, S extends CSSRule, F extends CssRule<any, any>>() => CssScope.extend<CssRule<R, S>, CssRuleClass<F>>("CssRule", {
  get fastenerType(): Proto<CssRule<any, any>> {
    return CssRule;
  },

  selector: "*",

  get cssText(): string {
    return this.selector + " {}";
  },

  transformInletCss(inletCss: CSSStyleSheet | CSSRule | null): S | null {
    if (inletCss instanceof CSSStyleSheet || inletCss instanceof CSSGroupingRule) {
      return this.createRule(inletCss);
    }
    return null;
  },

  createRule(inletCss: CSSStyleSheet | CSSGroupingRule): S | null {
    const index = inletCss.insertRule(this.cssText);
    return inletCss.cssRules.item(index) as S;
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    return fastener;
  },
}))();
