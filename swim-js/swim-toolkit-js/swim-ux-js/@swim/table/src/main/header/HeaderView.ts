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

import type {Class} from "@swim/util";
import {Affinity, MemberFastenerClass, Property} from "@swim/fastener";
import {AnyLength, Length} from "@swim/math";
import {AnyExpansion, Expansion} from "@swim/style";
import {Look, ThemeAnimator, ExpansionThemeAnimator, ThemeConstraintAnimator} from "@swim/theme";
import {ViewContextType, ViewFlags, View, ViewSet} from "@swim/view";
import {HtmlViewClass, HtmlView} from "@swim/dom";
import {AnyTableLayout, TableLayout} from "../layout/TableLayout";
import {ColView} from "../col/ColView";
import type {HeaderViewObserver} from "./HeaderViewObserver";

/** @public */
export class HeaderView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initHeader();
  }

  protected initHeader(): void {
    this.addClass("header");
    this.position.setState("relative", Affinity.Intrinsic);
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<HeaderViewObserver>;

  @Property({type: TableLayout, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly layout!: Property<this, TableLayout | null, AnyTableLayout | null>;

  @Property({type: Number, inherits: true, state: 0, updateFlags: View.NeedsLayout})
  readonly depth!: Property<this, number>;

  @ThemeConstraintAnimator({type: Length, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly rowSpacing!: ThemeConstraintAnimator<this, Length | null, AnyLength | null>;

  @ThemeConstraintAnimator({type: Length, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly rowHeight!: ThemeConstraintAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({type: Expansion, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly stretch!: ExpansionThemeAnimator<this, Expansion | null, AnyExpansion | null>;

  getCol(key: string): ColView | null;
  getCol<V extends ColView>(key: string, colViewClass: Class<V>): V | null;
  getCol(key: string, colViewClass?: Class<ColView>): ColView | null {
    if (colViewClass === void 0) {
      colViewClass = ColView;
    }
    const colView = this.getChild(key);
    return colView instanceof colViewClass ? colView : null;
  }

  getOrCreateCol(key: string): ColView;
  getOrCreateCol<V extends ColView>(key: string, colViewClass: HtmlViewClass<V>): V;
  getOrCreateCol(key: string, colViewClass?: HtmlViewClass<ColView>): ColView {
    if (colViewClass === void 0) {
      colViewClass = ColView;
    }
    let colView = this.getChild(key) as ColView | null;
    if (!(colView instanceof colViewClass)) {
      colView = colViewClass.create();
      this.setChild(key, colView);
    }
    return colView;
  }

  setCol(key: string, colView: ColView): void {
    this.setChild(key, colView);
  }

  @ViewSet<HeaderView, ColView>({
    type: ColView,
    binds: true,
    initView(colView: ColView): void {
      colView.display.setState("none", Affinity.Intrinsic);
      colView.position.setState("absolute", Affinity.Intrinsic);
      colView.left.setState(0, Affinity.Intrinsic);
      colView.top.setState(0, Affinity.Intrinsic);
      colView.width.setState(0, Affinity.Intrinsic);
      colView.height.setState(this.owner.height.state, Affinity.Intrinsic);
    },
    willAttachView(colView: ColView, targetView: View | null): void {
      this.owner.callObservers("viewWillAttachCol", colView, targetView, this.owner);
    },
    didDetachView(colView: ColView): void {
      this.owner.callObservers("viewDidDetachCol", colView, this.owner);
    },
  })
  readonly cols!: ViewSet<this, ColView>;
  static readonly cols: MemberFastenerClass<HeaderView, "cols">;

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutHeader();
  }

  protected layoutHeader(): void {
    const rowHeight = this.rowHeight.value;
    if (rowHeight !== null) {
      this.height.setState(rowHeight, Affinity.Intrinsic);
    }
  }

  protected override displayChildren(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     displayChild: (this: this, childView: View, displayFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    if ((displayFlags & View.NeedsLayout) !== 0) {
      this.layoutChildViews(displayFlags, viewContext, displayChild);
    } else {
      super.displayChildren(displayFlags, viewContext, displayChild);
    }
  }

  protected layoutChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                             displayChild: (this: this, childView: View, displayFlags: ViewFlags,
                                            viewContext: ViewContextType<this>) => void): void {
    const layout = this.layout.state;
    const height = this.height.state;
    const stretch = this.stretch.getPhaseOr(1);
    type self = this;
    function layoutChildView(this: self, childView: View, displayFlags: ViewFlags,
                             viewContext: ViewContextType<self>): void {
      if (childView instanceof ColView) {
        const key = childView.key;
        const col = layout !== null && key !== void 0 ? layout.getCol(key) : null;
        if (col !== null) {
          childView.display.setState(!col.hidden ? "flex" : "none", Affinity.Intrinsic);
          childView.left.setState(col.left, Affinity.Intrinsic);
          childView.width.setState(col.width, Affinity.Intrinsic);
          childView.height.setState(height, Affinity.Intrinsic);
          const textColor = col.textColor;
          if (textColor instanceof Look) {
            childView.color.setLook(textColor, Affinity.Intrinsic);
          } else {
            childView.color.setState(textColor, Affinity.Intrinsic);
          }
          if (!col.persistent) {
            childView.opacity.setState(stretch, Affinity.Intrinsic);
          }
        } else {
          childView.display.setState("none", Affinity.Intrinsic);
          childView.left.setState(null, Affinity.Intrinsic);
          childView.width.setState(null, Affinity.Intrinsic);
          childView.height.setState(null, Affinity.Intrinsic);
        }
      }
      displayChild.call(this, childView, displayFlags, viewContext);
    }
    super.displayChildren(displayFlags, viewContext, layoutChildView);
  }
}
