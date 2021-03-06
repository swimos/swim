// Copyright 2015-2021 Swim inc.
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

import type {Timing} from "@swim/mapping";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import type {CssRule} from "../css/CssRule";
import {StyleSheetContext, StyleSheet} from "../css/StyleSheet";
import {HtmlViewInit, HtmlView} from "../html/HtmlView";
import type {StyleViewObserver} from "./StyleViewObserver";
import type {StyleViewController} from "./StyleViewController";

export interface StyleViewInit extends HtmlViewInit {
  viewController?: StyleViewController;
}

export class StyleView extends HtmlView implements StyleSheetContext {
  constructor(node: HTMLStyleElement) {
    super(node);
    Object.defineProperty(this, "sheet", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly node!: HTMLStyleElement;

  override readonly viewController!: StyleViewController | null;

  override readonly viewObservers!: ReadonlyArray<StyleViewObserver>;

  override initView(init: StyleViewInit): void {
    super.initView(init);
  }

  readonly sheet!: StyleSheet | null;

  protected createSheet(): StyleSheet | null {
    const stylesheet = this.node.sheet;
    return stylesheet !== null ? new StyleSheet(this, stylesheet) : null;
  }

  hasCssRule(ruleName: string): boolean {
    const sheet = this.sheet;
    return sheet !== null && sheet.hasCssRule(ruleName);
  }

  getCssRule(ruleName: string): CssRule<StyleSheet> | null {
    const sheet = this.sheet;
    return sheet !== null ? sheet.getCssRule(ruleName) : null;
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    const sheet = this.sheet;
    if (sheet !== null) {
      sheet.applyTheme(theme, mood, timing);
    }
  }

  protected override onMount(): void {
    super.onMount();
    const sheet = this.createSheet();
    Object.defineProperty(this, "sheet", {
      value: sheet,
      enumerable: true,
      configurable: true,
    });
    if (sheet !== null) {
      sheet.mount();
    }
  }

  protected override onUnmount(): void {
    const sheet = this.sheet;
    if (sheet !== null) {
      sheet.unmount();
    }
    Object.defineProperty(this, "sheet", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    super.onUnmount();
  }

  /** @hidden */
  static override readonly tag: string = "style";
}

HtmlView.Tag("style")(StyleView, "style");
