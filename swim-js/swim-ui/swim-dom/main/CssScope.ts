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

import type {Mutable} from "@swim/util";
import type {Proto} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Affinity} from "@swim/component";
import type {FastenerDescriptor} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {MoodVector} from "@swim/theme";
import type {ThemeMatrix} from "@swim/theme";

/** @public */
export interface CssScopeDescriptor<R, S extends CSSStyleSheet | CSSRule> extends FastenerDescriptor<R> {
  extends?: Proto<CssScope<any, any>> | boolean | null;
}

/** @public */
export interface CssScopeClass<F extends CssScope<any, any> = CssScope<any, any>> extends FastenerClass<F> {
}

/** @public */
export interface CssScope<R = any, S extends CSSStyleSheet | CSSRule = any> extends Fastener<R> {
  /** @override */
  get descriptorType(): Proto<CssScopeDescriptor<R, S>>;

  /** @override */
  get fastenerType(): Proto<CssScope<any, any>>;

  /** @protected @override */
  onUnbindInlet(inlet: Fastener<any, any, any>): void;

  /** @override */
  get parent(): CssScope<any, any> | null;

  /** @internal */
  readonly outlets: ReadonlySet<Fastener<any, any, any>> | null;

  /** @internal @override */
  attachOutlet(outlet: Fastener<any, any, any>): void;

  /** @internal @override */
  detachOutlet(outlet: Fastener<any, any, any>): void;

  /** @internal @protected */
  decohereOutlets(): void;

  getOutletCss(outlet: Fastener<any, any, any>): CSSStyleSheet | CSSRule | null;

  get inletCss(): CSSStyleSheet | CSSRule | null;

  getInletCss(): CSSStyleSheet | CSSRule;

  transformInletCss(inletCss: CSSStyleSheet | CSSRule | null): S | null;

  readonly css: S | null;

  getCss(): S;

  setCss(css: S | null): S | null;

  attachCss(css: S): S;

  /** @protected */
  initCss(css: S): void;

  /** @protected */
  willAttachCss(css: S): void;

  /** @protected */
  onAttachCss(css: S): void;

  /** @protected */
  didAttachCss(css: S): void;

  detachCss(): S | null;

  /** @protected */
  deinitCss(css: S): void;

  /** @protected */
  willDetachCss(css: S): void;

  /** @protected */
  onDetachCss(css: S): void;

  /** @protected */
  didDetachCss(css: S): void;

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: TimingLike | boolean | null): void;

  /** @override */
  recohere(t: number): void;
}

/** @public */
export const CssScope = (<R, S extends CSSStyleSheet | CSSRule, F extends CssScope<any, any>>() => Fastener.extend<CssScope<R, S>, CssScopeClass<F>>("CssScope", {
  get fastenerType(): Proto<CssScope<any, any>> {
    return CssScope;
  },

  onUnbindInlet(inlet: Fastener<any, any, any>): void {
    super.onUnbindInlet(inlet);
    this.detachCss();
  },

  attachOutlet(outlet: Fastener<any, any, any>): void {
    let outlets = this.outlets as Set<Fastener<any, any, any>> | null;
    if (outlets === null) {
      outlets = new Set<Fastener<any, any, any>>();
      (this as Mutable<typeof this>).outlets = outlets;
    }
    outlets.add(outlet);
  },

  detachOutlet(outlet: Fastener<any, any, any>): void {
    const outlets = this.outlets as Set<Fastener<any, any, any>> | null;
    if (outlets === null) {
      return;
    }
    outlets.delete(outlet);
  },

  decohereOutlets(): void {
    const outlets = this.outlets;
    if (outlets !== null) {
      for (const outlet of outlets) {
        outlet.decohere(this);
      }
    }
  },

  getOutletCss(outlet: Fastener<any, any, any>): CSSStyleSheet | CSSRule | null {
    return this.css;
  },

  get inletCss(): CSSStyleSheet | CSSRule | null {
    const inlet = this.inlet;
    return inlet instanceof CssScope ? inlet.getOutletCss(this) : null;
  },

  getInletCss(): CSSStyleSheet | CSSRule {
    const inletCss = this.inletCss;
    if (inletCss === void 0 || inletCss === null) {
      let message = inletCss + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "inlet css";
      throw new TypeError(message);
    }
    return inletCss;
  },

  transformInletCss(inletCss: CSSStyleSheet | CSSRule | null): S | null {
    return null;
  },

  getCss(): S {
    const css = this.css;
    if (css === null) {
      let message = css + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "css";
      throw new TypeError(message);
    }
    return css;
  },

  setCss(newCss: S  | null): S | null {
    const oldCss = this.css;
    if (oldCss === newCss) {
      this.setCoherent(true);
      return oldCss;
    } else if (oldCss !== null) {
      (this as Mutable<typeof this>).css = null;
      this.willDetachCss(oldCss);
      this.onDetachCss(oldCss);
      this.deinitCss(oldCss);
      this.didDetachCss(oldCss);
    }
    if (newCss !== null) {
      (this as Mutable<typeof this>).css = newCss;
      this.willAttachCss(newCss);
      this.onAttachCss(newCss);
      this.initCss(newCss);
      this.didAttachCss(newCss);
    }
    this.setCoherent(true);
    this.decohereOutlets();
    return oldCss;
  },

  attachCss(newCss: S): S {
    const oldCss = this.css;
    if (oldCss === newCss) {
      return newCss;
    }
    if (oldCss !== null) {
      (this as Mutable<typeof this>).css = null;
      this.willDetachCss(oldCss);
      this.onDetachCss(oldCss);
      this.deinitCss(oldCss);
      this.didDetachCss(oldCss);
    }
    (this as Mutable<typeof this>).css = newCss;
    this.willAttachCss(newCss);
    this.onAttachCss(newCss);
    this.initCss(newCss);
    this.didAttachCss(newCss);
    this.setCoherent(true);
    this.decohereOutlets();
    return newCss;
  },

  initCss(css: S): void {
    // hook
  },

  willAttachCss(css: S): void {
    // hook
  },

  onAttachCss(css: S): void {
    // hook
  },

  didAttachCss(css: S): void {
    // hook
  },

  detachCss(): S | null {
    const oldCss = this.css;
    if (oldCss === null) {
      return oldCss;
    }
    (this as Mutable<typeof this>).css = null;
    this.willDetachCss(oldCss);
    this.onDetachCss(oldCss);
    this.deinitCss(oldCss);
    this.didDetachCss(oldCss);
    this.setCoherent(true);
    this.decohereOutlets();
    return oldCss;
  },

  deinitCss(css: S): void {
    // hook
  },

  willDetachCss(css: S): void {
    // hook
  },

  onDetachCss(css: S): void {
    // hook
  },

  didDetachCss(css: S): void {
    // hook
  },

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: TimingLike | boolean | null): void {
    const outlets = this.outlets;
    if (outlets === null) {
      return;
    }
    for (const outlet of outlets) {
      if (outlet instanceof CssScope) {
        outlet.applyTheme(theme, mood, timing);
      }
    }
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof CssScope) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        const inletCss = inlet.getOutletCss(this);
        if (inletCss !== null && this.css === null) {
          this.setCss(this.transformInletCss(inletCss));
        } else if (inletCss === null && this.css !== null) {
          this.setCss(null);
        } else {
          this.setDerived(false);
        }
      }
    } else {
      this.setDerived(false);
    }
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).outlets = null;
    (fastener as Mutable<typeof fastener>).css = null;
    return fastener;
  },
}))();
