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
import {CssRuleConstructor, CssRule} from "./CssRule";

export interface CssContextClass {
  /** @hidden */
  _cssRuleConstructors?: {[ruleName: string]: CssRuleConstructor<any> | undefined};
}

export interface CssContext extends AnimatorContext {
  getRule(index: number): CSSRule | null;

  insertRule(cssText: string, index?: number): number;

  removeRule(index: number): void;

  hasCssRule(ruleName: string): boolean;

  getCssRule(ruleName: string): CssRule<this> | null;

  setCssRule(ruleName: string, cssRule: CssRule<this> | null): void;

  animate(animator: Animator): void;

  requireUpdate(updateFlags: number): void;
}

/** @hidden */
export const CssContext: {
  getCssRuleConstructor(ruleName: string, contextClass: CssContextClass | null): CssRuleConstructor<any> | null;
  decorateCssRule<V extends CssContext>(constructor: CssRuleConstructor<V>,
                                        contextClass: CssContextClass, ruleName: string): void;
} = {} as any;

CssContext.getCssRuleConstructor = function (ruleName: string, contextClass: CssContextClass | null): CssRuleConstructor<any> | null {
  if (contextClass === null) {
    contextClass = (this as any).prototype as CssContextClass;
  }
  while (contextClass !== null) {
    if (contextClass.hasOwnProperty("_cssRuleConstructors")) {
      const constructor = contextClass._cssRuleConstructors![ruleName];
      if (constructor !== void 0) {
        return constructor;
      }
    }
    contextClass = (contextClass as any).__proto__ as CssContextClass | null;
  }
  return null;
};

CssContext.decorateCssRule = function<V extends CssContext>(constructor: CssRuleConstructor<V>,
                                                            contextClass: CssContextClass, ruleName: string): void {
  if (!contextClass.hasOwnProperty("_cssRuleConstructors")) {
    contextClass._cssRuleConstructors = {};
  }
  contextClass._cssRuleConstructors![ruleName] = constructor;
  Object.defineProperty(contextClass, ruleName, {
    get: function (this: V): CssRule<V> {
      let cssRule = this.getCssRule(ruleName) as CssRule<V> | null;
      if (cssRule === null) {
        cssRule = new constructor(this, ruleName);
        this.setCssRule(ruleName, cssRule);
      }
      return cssRule;
    },
    configurable: true,
    enumerable: true,
  });
};
