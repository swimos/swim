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
export interface StyleSheetDescriptor<R> extends CssScopeDescriptor<R, CSSStyleSheet> {
  extends?: Proto<StyleSheet<any>> | boolean | null;
}

/** @public */
export interface StyleSheetClass<F extends StyleSheet<any> = StyleSheet> extends CssScopeClass<F> {
}

/** @public */
export interface StyleSheet<R = any> extends CssScope<R, CSSStyleSheet> {
  /** @override */
  get descriptorType(): Proto<StyleSheetDescriptor<R>>;

  /** @override */
  get fastenerType(): Proto<StyleSheet<any>>;

  /** @override */
  transformInletCss(inletCss: CSSStyleSheet | CSSRule | null): CSSStyleSheet | null;
}

/** @public */
export const StyleSheet = (<R, F extends StyleSheet<any>>() => CssScope.extend<StyleSheet<R>, StyleSheetClass<F>>("StyleSheet", {
  get fastenerType(): Proto<StyleSheet<any>> {
    return StyleSheet;
  },

  transformInletCss(inletCss: CSSStyleSheet | CSSRule | null): CSSStyleSheet | null {
    if (inletCss instanceof CSSStyleSheet) {
      return inletCss;
    }
    return null;
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    return fastener;
  },
}))();
