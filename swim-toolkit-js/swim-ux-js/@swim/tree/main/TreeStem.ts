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

import {ViewContextType, ViewFlags, View, ViewScope} from "@swim/view";
import {ViewNodeType, HtmlViewConstructor} from "@swim/dom";
import {ThemedHtmlViewInit, ThemedHtmlView} from "@swim/theme";
import {AnyTreeSeed, TreeSeed} from "./TreeSeed";
import {AnyTreeVein, TreeVein} from "./TreeVein";
import {TreeStemObserver} from "./TreeStemObserver";
import {TreeStemController} from "./TreeStemController";

export type AnyTreeStem = TreeStem | TreeStemInit | HTMLElement;

export interface TreeStemInit extends ThemedHtmlViewInit {
  viewController?: TreeStemController;

  veins?: AnyTreeVein[];
}

export class TreeStem extends ThemedHtmlView {
  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("tree-stem");
    this.position.setAutoState("relative");
    this.height.setAutoState(60);
    this.overflowX.setAutoState("hidden");
    this.overflowY.setAutoState("hidden");
  }

  // @ts-ignore
  declare readonly viewController: TreeStemController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<TreeStemObserver>;

  initView(init: TreeStemInit): void {
    super.initView(init);
    if (init.veins !== void 0) {
      this.addVeins(init.veins);
    }
  }

  addVein(vein: AnyTreeVein, key?: string): TreeVein {
    if (key === void 0 && "key" in vein) {
      key = vein.key;
    }
    vein = TreeVein.fromAny(vein);
    this.appendChildView(vein, key);
    return vein;
  }

  addVeins(veins: ReadonlyArray<AnyTreeVein>): void {
    for (let i = 0, n = veins.length; i < n; i += 1) {
      this.addVein(veins[i]);
    }
  }

  @ViewScope({type: TreeSeed, inherit: true})
  seed: ViewScope<this, TreeSeed | undefined, AnyTreeSeed | undefined>;

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    if (childView instanceof TreeVein) {
      this.onInsertVein(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    if (childView instanceof TreeVein) {
      this.onRemoveVein(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertVein(vein: TreeVein): void {
    vein.position.setAutoState("absolute");
    vein.top.setAutoState(0);
    vein.bottom.setAutoState(0);
  }

  protected onRemoveVein(vein: TreeVein): void {
    // hook
  }

  protected displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                              callback?: (this: this, childView: View) => void): void {
    const needsLayout = (displayFlags & View.NeedsLayout) !== 0;
    const seed = needsLayout ? this.seed.state : void 0;
    const height = needsLayout ? this.height.state : void 0;
    function layoutChildView(this: TreeStem, childView: View): void {
      if (childView instanceof TreeVein) {
        const key = childView.key;
        const root = seed !== void 0 && key !== void 0 ? seed.getRoot(key) : null;
        if (root !== null) {
          childView.display.setAutoState(!root._hidden ? "flex" : "none");
          const left = root._left;
          childView.left.setAutoState(left !== null ? left : void 0);
          const width = root._width;
          childView.width.setAutoState(width !== null ? width : void 0);
          childView.height.setAutoState(height);
        } else {
          childView.display.setAutoState("none");
          childView.left.setAutoState(void 0);
          childView.width.setAutoState(void 0);
          childView.height.setAutoState(void 0);
        }
      }
      if (callback !== void 0) {
        callback.call(this, childView);
      }
    }
    super.displayChildViews(displayFlags, viewContext, needsLayout ? layoutChildView : callback);
  }

  static fromInit(init: TreeStemInit): TreeStem {
    const view = TreeStem.create();
    view.initView(init);
    return view;
  }

  static fromAny<S extends HtmlViewConstructor<InstanceType<S>>>(this: S, value: InstanceType<S> | HTMLElement): InstanceType<S>;
  static fromAny(value: AnyTreeStem): TreeStem;
  static fromAny(value: AnyTreeStem): TreeStem {
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
