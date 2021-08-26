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

import type {Timing} from "@swim/mapping";
import {Look, MoodVector, ThemeMatrix} from "@swim/theme";
import {View, ViewEdgeInsets, ViewProperty, ViewFastener} from "@swim/view";
import {HtmlView} from "@swim/dom";

export class DeckCard extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initCard();
  }

  protected initCard(): void {
    this.addClass("deck-card");
    this.position.setState("relative", View.Intrinsic);
    this.overflowX.setState("auto", View.Intrinsic);
    this.overflowY.setState("auto", View.Intrinsic);
    this.overflowScrolling.setState("touch", View.Intrinsic);
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (this.backgroundColor.takesPrecedence(View.Intrinsic)) {
      this.backgroundColor.setState(theme.getOr(Look.backgroundColor, mood, null), timing, View.Intrinsic);
    }
  }

  @ViewProperty({type: Object, inherit: true, state: null})
  readonly edgeInsets!: ViewProperty<this, ViewEdgeInsets | null>;

  @ViewProperty({type: String})
  readonly cardTitle!: ViewProperty<this, string | undefined>;

  @ViewFastener({type: HtmlView, child: false})
  readonly backItem!: ViewFastener<this, HtmlView>;

  @ViewFastener({type: HtmlView, child: false})
  readonly titleView!: ViewFastener<this, HtmlView>;

  @ViewFastener({type: HtmlView, child: false})
  readonly leftItem!: ViewFastener<this, HtmlView>;

  @ViewFastener({type: HtmlView, child: false})
  readonly rightItem!: ViewFastener<this, HtmlView>;
}
