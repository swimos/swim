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

import type {Class} from "@swim/util";
import type {StyleContext} from "./StyleAnimator";
import {StyleSheet} from "./StyleSheet";
import type {HtmlViewObserver} from "./HtmlView";
import {HtmlView} from "./HtmlView";

/** @public */
export interface StyleViewObserver<V extends StyleView = StyleView> extends HtmlViewObserver<V> {
}

/** @public */
export class StyleView extends HtmlView implements StyleContext {
  constructor(node: HTMLStyleElement) {
    super(node);
  }

  declare readonly observerType?: Class<StyleViewObserver>;

  declare readonly node: HTMLStyleElement;

  @StyleSheet({})
  readonly sheet!: StyleSheet<this>;

  protected override onMount(): void {
    super.onMount();
    this.sheet.attachCss(this.node.sheet!);
  }

  protected override onUnmount(): void {
    this.sheet.detachCss();
    super.onUnmount();
  }

  /** @internal */
  static override readonly tag: string = "style";
}
