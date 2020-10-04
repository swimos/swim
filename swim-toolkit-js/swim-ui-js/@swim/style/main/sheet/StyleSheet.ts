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

import {AnimatorContext, Animator} from "@swim/animate";
import {CssContextClass, CssContext} from "./CssContext";
import {CssRule} from "./CssRule";

export class StyleSheet implements CssContext {
  /** @hidden */
  readonly _owner: AnimatorContext;
  /** @hidden */
  readonly _stylesheet: CSSStyleSheet;
  /** @hidden */
  _cssRules?: {[ruleName: string]: CssRule<StyleSheet> | undefined};

  constructor(owner: AnimatorContext, stylesheet?: CSSStyleSheet) {
    this._owner = owner;
    this._stylesheet = stylesheet !== void 0 ? stylesheet : this.createStylesheet();
  }

  get owner(): AnimatorContext {
    return this._owner;
  }

  get stylesheet(): CSSStyleSheet {
    return this._stylesheet;
  }

  protected createStylesheet(): CSSStyleSheet {
    return new CSSStyleSheet();
  }

  getRule(index: number): CSSRule | null {
    return this._stylesheet.cssRules.item(index);
  }

  insertRule(cssText: string, index?: number): number {
    return this._stylesheet.insertRule(cssText, index);
  }

  removeRule(index: number): void {
    this._stylesheet.deleteRule(index);
  }

  hasCssRule(ruleName: string): boolean {
    const cssRules = this._cssRules;
    return cssRules !== void 0 && cssRules[ruleName] !== void 0;
  }

  getCssRule(ruleName: string): CssRule<this> | null {
    const cssRules = this._cssRules;
    if (cssRules !== void 0) {
      const cssRule = cssRules[ruleName];
      if (cssRule !== void 0) {
        return cssRule as CssRule<this>;
      }
    }
    return null;
  }

  setCssRule(ruleName: string, cssRule: CssRule<this> | null): void {
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
  }

  /** @hidden */
  getLazyCssRule(ruleName: string): CssRule<this> | null {
    let cssRule = this.getCssRule(ruleName);
    if (cssRule === null) {
      const contextClass = (this as any).__proto__ as CssContextClass;
      const constructor = CssContext.getCssRuleConstructor(ruleName, contextClass);
      if (constructor !== null) {
        cssRule = new constructor(this, ruleName);
        this.setCssRule(ruleName, cssRule);
      }
    }
    return cssRule;
  }

  onAnimate(t: number): void {
    const cssRules = this._cssRules;
    if (cssRules !== void 0) {
      for (const ruleName in cssRules) {
        const cssRule = cssRules[ruleName]!;
        cssRule.onAnimate(t);
      }
    }
  }

  animate(animator: Animator): void {
    this._owner.animate(animator);
  }

  requireUpdate(updateFlags: number): void {
    if (typeof (this._owner as any).requireUpdate === "function") {
      (this._owner as any).requireUpdate(updateFlags);
    }
  }
}
