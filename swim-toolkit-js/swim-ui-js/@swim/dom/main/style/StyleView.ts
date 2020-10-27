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

import {CssRule, StyleSheet} from "@swim/style";
import {View} from "@swim/view";
import {ViewNodeType, NodeView} from "../node/NodeView";
import {HtmlViewInit, HtmlView} from "../html/HtmlView";
import {StyleViewObserver} from "./StyleViewObserver";
import {StyleViewController} from "./StyleViewController";

export interface ViewStyle extends HTMLStyleElement {
  view?: StyleView;
}

export interface StyleViewInit extends HtmlViewInit {
  viewController?: StyleViewController;
}

export class StyleView extends HtmlView {
  /** @hidden */
  _sheet: StyleSheet | null;

  constructor(node: HTMLStyleElement) {
    super(node);
    this._sheet = this.createSheet();
  }

  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    node.setAttribute("type", "text/css");
  }

  // @ts-ignore
  declare readonly node: ViewStyle;

  // @ts-ignore
  declare readonly viewController: StyleViewController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<StyleViewObserver>;

  initView(init: StyleViewInit): void {
    super.initView(init);
  }

  get sheet(): StyleSheet | null {
    return this._sheet;
  }

  protected createSheet(): StyleSheet | null {
    const stylesheet = this._node.sheet;
    return stylesheet !== null ? new StyleSheet(this, stylesheet) : null;
  }

  hasCssRule(ruleName: string): boolean {
    const sheet = this._sheet;
    return sheet !== null && sheet.hasCssRule(ruleName);
  }

  getCssRule(ruleName: string): CssRule<StyleSheet> | null {
    const sheet = this._sheet;
    return sheet !== null ? sheet.getCssRule(ruleName) : null;
  }

  /** @hidden */
  updateAnimators(t: number): void {
    this.updateViewAnimators(t);
    if ((this._viewFlags & View.AnimatingFlag) !== 0) {
      this._viewFlags &= ~View.AnimatingFlag;
      this.updateAttributeAnimators(t);
      this.updateStyleAnimators(t);
      this.updateSheetAnimators(t);
    }
  }

  /** @hidden */
  updateSheetAnimators(t: number): void {
    const sheet = this._sheet;
    if (sheet !== null) {
      sheet.onAnimate(t);
    }
  }

  protected onMount(): void {
    super.onMount();
    this._sheet = this.createSheet();
  }

  protected onUnmount(): void {
    this._sheet = null;
    super.onUnmount();
  }

  /** @hidden */
  static readonly tag: string = "style";
}
NodeView.Style = StyleView;

HtmlView.Tag("style")(StyleView, "style");
