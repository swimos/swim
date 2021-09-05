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
import {View} from "@swim/view";
import {HtmlViewConstructor, HtmlViewInit, HtmlView} from "@swim/dom";
import type {TreeVeinObserver} from "./TreeVeinObserver";

export type AnyTreeVein = TreeVein | TreeVeinInit | HTMLElement;

export interface TreeVeinInit extends HtmlViewInit {
}

export class TreeVein extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initVein();
  }

  protected initVein(): void {
    this.addClass("tree-vein");
    this.display.setState("none", View.Intrinsic);
    this.alignItems.setState("center", View.Intrinsic);
    this.overflowX.setState("hidden", View.Intrinsic);
    this.overflowY.setState("hidden", View.Intrinsic);
  }

  override readonly viewObservers!: ReadonlyArray<TreeVeinObserver>;

  override initView(init: TreeVeinInit): void {
    super.initView(init);
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    this.color.setState(theme.getOr(Look.neutralColor, mood, null), timing, View.Intrinsic);
  }

  static fromInit(init: TreeVeinInit): TreeVein {
    const view = TreeVein.create();
    view.initView(init);
    return view;
  }

  static override fromAny<S extends HtmlViewConstructor<InstanceType<S>>>(this: S, value: InstanceType<S> | HTMLElement): InstanceType<S>;
  static override fromAny(value: AnyTreeVein): TreeVein;
  static override fromAny(value: AnyTreeVein): TreeVein {
    if (value instanceof this) {
      return value;
    } else if (value instanceof HTMLElement) {
      return this.fromNode(value);
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
