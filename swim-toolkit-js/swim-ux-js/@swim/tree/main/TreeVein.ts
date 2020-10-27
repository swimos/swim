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

import {Transition} from "@swim/transition";
import {ViewNodeType, HtmlViewConstructor} from "@swim/dom";
import {Look, MoodVector, ThemeMatrix, ThemedHtmlViewInit, ThemedHtmlView} from "@swim/theme";
import {TreeVeinObserver} from "./TreeVeinObserver";
import {TreeVeinController} from "./TreeVeinController";

export type AnyTreeVein = TreeVein | TreeVeinInit | HTMLElement;

export interface TreeVeinInit extends ThemedHtmlViewInit {
  viewController?: TreeVeinController;
}

export class TreeVein extends ThemedHtmlView {
  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("tree-vein");
    this.display.setAutoState("none");
    this.alignItems.setAutoState("center");
    this.overflowX.setAutoState("hidden");
    this.overflowY.setAutoState("hidden");
  }

  // @ts-ignore
  declare readonly viewController: TreeVeinController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<TreeVeinObserver>;

  initView(init: TreeVeinInit): void {
    super.initView(init);
  }

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                         transition: Transition<any> | null): void {
    super.onApplyTheme(theme, mood, transition);
    this.color.setAutoState(theme.inner(mood, Look.neutralColor), transition);
  }

  static fromInit(init: TreeVeinInit): TreeVein {
    const view = TreeVein.create();
    view.initView(init);
    return view;
  }

  static fromAny<S extends HtmlViewConstructor<InstanceType<S>>>(this: S, value: InstanceType<S> | HTMLElement): InstanceType<S>;
  static fromAny(value: AnyTreeVein): TreeVein;
  static fromAny(value: AnyTreeVein): TreeVein {
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
