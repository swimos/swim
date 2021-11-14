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

import type {Class, Timing} from "@swim/util";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import type {StyleContext} from "../css/StyleContext";
import {StyleSheet} from "../css/StyleSheet";
import {HtmlViewInit, HtmlView} from "../html/HtmlView";
import type {StyleViewObserver} from "./StyleViewObserver";

/** @public */
export interface StyleViewInit extends HtmlViewInit {
}

/** @public */
export class StyleView extends HtmlView implements StyleContext {
  constructor(node: HTMLStyleElement) {
    super(node);
  }

  override readonly observerType?: Class<StyleViewObserver>;

  override readonly node!: HTMLStyleElement;

  @StyleSheet<StyleView>({
    lazy: false,
    createStylesheet(): CSSStyleSheet {
      return this.owner.node.sheet!;
    },
  })
  readonly sheet!: StyleSheet<this>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    this.sheet.applyTheme(theme, mood, timing);
  }

  override init(init: StyleViewInit): void {
    super.init(init);
  }

  /** @internal */
  static override readonly tag: string = "style";
}
