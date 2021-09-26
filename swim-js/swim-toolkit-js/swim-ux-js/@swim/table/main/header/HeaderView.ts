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

import {AnyLength, Length} from "@swim/math";
import {AnyExpansion, Expansion} from "@swim/style";
import {Look} from "@swim/theme";
import {
  ViewContextType,
  ViewFlags,
  ViewClass,
  View,
  ViewProperty,
  ViewAnimator,
  ViewAnimatorConstraint,
  ExpansionViewAnimator,
  ViewFastener,
} from "@swim/view";
import {NodeViewConstructor, HtmlView} from "@swim/dom";
import {AnyTableLayout, TableLayout} from "../layout/TableLayout";
import {ColView} from "../col/ColView";
import type {HeaderViewObserver} from "./HeaderViewObserver";

export class HeaderView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.colFasteners = [];
    this.initHeader();
  }

  protected initHeader(): void {
    this.addClass("header");
    this.position.setState("relative", View.Intrinsic);
    this.overflowX.setState("hidden", View.Intrinsic);
    this.overflowY.setState("hidden", View.Intrinsic);
  }

  override readonly viewObservers!: ReadonlyArray<HeaderViewObserver>;

  @ViewProperty({type: TableLayout, inherit: true, state: null, updateFlags: View.NeedsLayout})
  readonly layout!: ViewProperty<this, TableLayout | null, AnyTableLayout | null>;

  protected didSetDepth(newDepth: number, oldDepth: number): void {
    // hook
  }

  @ViewProperty<HeaderView, number>({
    type: Number,
    inherit: true,
    state: 0,
    updateFlags: View.NeedsLayout,
    didSetState(newDepth: number, oldDepth: number): void {
      this.owner.didSetDepth(newDepth, oldDepth);
    },
  })
  readonly depth!: ViewProperty<this, number>;

  @ViewAnimatorConstraint({type: Length, inherit: true, state: null, updateFlags: View.NeedsLayout})
  readonly rowSpacing!: ViewAnimatorConstraint<this, Length | null, AnyLength | null>;

  @ViewAnimatorConstraint({type: Length, inherit: true, state: null, updateFlags: View.NeedsLayout})
  readonly rowHeight!: ViewAnimatorConstraint<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Expansion, inherit: true, state: null, updateFlags: View.NeedsLayout})
  readonly stretch!: ExpansionViewAnimator<this, Expansion | null, AnyExpansion | null>;

  getCol(key: string): ColView | null;
  getCol<V extends ColView>(key: string, colViewClass: ViewClass<V>): V | null;
  getCol(key: string, colViewClass?: ViewClass<ColView>): ColView | null {
    if (colViewClass === void 0) {
      colViewClass = ColView;
    }
    const colView = this.getChildView(key);
    return colView instanceof colViewClass ? colView : null;
  }

  getOrCreateCol(key: string): ColView;
  getOrCreateCol<V extends ColView>(key: string, colViewConstructor: NodeViewConstructor<V>): V;
  getOrCreateCol(key: string, colViewConstructor?: NodeViewConstructor<ColView>): ColView {
    if (colViewConstructor === void 0) {
      colViewConstructor = ColView;
    }
    let colView = this.getChildView(key) as ColView | null;
    if (!(colView instanceof colViewConstructor)) {
      colView = HtmlView.fromConstructor(colViewConstructor);
      this.setChildView(key, colView);
    }
    return colView;
  }

  setCol(key: string, colView: ColView): void {
    this.setChildView(key, colView);
  }

  insertCol(colView: ColView, targetView: View | null = null): void {
    const colFasteners = this.colFasteners as ViewFastener<this, ColView>[];
    let targetIndex = colFasteners.length;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      if (colFastener.view === colView) {
        return;
      } else if (colFastener.view === targetView) {
        targetIndex = i;
      }
    }
    const colFastener = this.createColFastener(colView);
    colFasteners.splice(targetIndex, 0, colFastener);
    colFastener.setView(colView, targetView);
    if (this.isMounted()) {
      colFastener.mount();
    }
  }

  removeCol(colView: ColView): void {
    const colFasteners = this.colFasteners as ViewFastener<this, ColView>[];
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      if (colFastener.view === colView) {
        colFastener.setView(null);
        if (this.isMounted()) {
          colFastener.unmount();
        }
        colFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initCol(colView: ColView, colFastener: ViewFastener<this, ColView>): void {
    colView.display.setState("none", View.Intrinsic);
    colView.position.setState("absolute", View.Intrinsic);
    colView.left.setState(0, View.Intrinsic);
    colView.top.setState(0, View.Intrinsic);
    colView.width.setState(0, View.Intrinsic);
    colView.height.setState(this.height.state, View.Intrinsic);
  }

  protected attachCol(colView: ColView, colFastener: ViewFastener<this, ColView>): void {
    // hook
  }

  protected detachCol(colView: ColView, colFastener: ViewFastener<this, ColView>): void {
    // hook
  }

  protected willSetCol(newColView: ColView | null, oldColView: ColView | null,
                       targetView: View | null, colFastener: ViewFastener<this, ColView>): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetCol !== void 0) {
        viewObserver.viewWillSetCol(newColView, oldColView, targetView, this);
      }
    }
  }

  protected onSetCol(newColView: ColView | null, oldColView: ColView | null,
                     targetView: View | null, colFastener: ViewFastener<this, ColView>): void {
    if (oldColView !== null) {
      this.detachCol(oldColView, colFastener);
    }
    if (newColView !== null) {
      this.attachCol(newColView, colFastener);
      this.initCol(newColView, colFastener);
    }
  }

  protected didSetCol(newColView: ColView | null, oldColView: ColView | null,
                      targetView: View | null, colFastener: ViewFastener<this, ColView>): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetCol !== void 0) {
        viewObserver.viewDidSetCol(newColView, oldColView, targetView, this);
      }
    }
  }

  /** @hidden */
  static ColFastener = ViewFastener.define<HeaderView, ColView>({
    type: ColView,
    child: false,
    willSetView(newColView: ColView | null, oldColView: ColView | null, targetView: View | null): void {
      this.owner.willSetCol(newColView, oldColView, targetView, this);
    },
    onSetView(newColView: ColView | null, oldColView: ColView | null, targetView: View | null): void {
      this.owner.onSetCol(newColView, oldColView, targetView, this);
    },
    didSetView(newColView: ColView | null, oldColView: ColView | null, targetView: View | null): void {
      this.owner.didSetCol(newColView, oldColView, targetView, this);
    },
  });

  protected createColFastener(colView: ColView): ViewFastener<this, ColView> {
    return new HeaderView.ColFastener(this, colView.key, "col");
  }

  /** @hidden */
  readonly colFasteners: ReadonlyArray<ViewFastener<this, ColView>>;

  /** @hidden */
  protected mountColFasteners(): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      colFastener.mount();
    }
  }

  /** @hidden */
  protected unmountColFasteners(): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      colFastener.unmount();
    }
  }

  protected detectCol(view: View): ColView | null {
    return view instanceof ColView ? view : null;
  }

  protected override onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    const colView = this.detectCol(childView);
    if (colView !== null) {
      this.insertCol(colView, targetView);
    }
  }

  protected override onRemoveChildView(childView: View): void {
    super.onRemoveChildView(childView);
    const colView = this.detectCol(childView);
    if (colView !== null) {
      this.removeCol(colView);
    }
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutHeader();
  }

  protected layoutHeader(): void {
    const rowHeight = this.rowHeight.value;
    if (rowHeight !== null) {
      this.height.setState(rowHeight, View.Intrinsic);
    }
  }

  protected override displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                       displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                          viewContext: ViewContextType<this>) => void): void {
    if ((displayFlags & View.NeedsLayout) !== 0) {
      this.layoutChildViews(displayFlags, viewContext, displayChildView);
    } else {
      super.displayChildViews(displayFlags, viewContext, displayChildView);
    }
  }

  protected layoutChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                             displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
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
          childView.display.setState(!col.hidden ? "flex" : "none", View.Intrinsic);
          childView.left.setState(col.left, View.Intrinsic);
          childView.width.setState(col.width, View.Intrinsic);
          childView.height.setState(height, View.Intrinsic);
          const textColor = col.textColor;
          if (textColor instanceof Look) {
            childView.color.setLook(textColor, View.Intrinsic);
          } else {
            childView.color.setState(textColor, View.Intrinsic);
          }
          if (!col.persistent) {
            childView.opacity.setState(stretch, View.Intrinsic);
          }
        } else {
          childView.display.setState("none", View.Intrinsic);
          childView.left.setState(null, View.Intrinsic);
          childView.width.setState(null, View.Intrinsic);
          childView.height.setState(null, View.Intrinsic);
        }
      }
      displayChildView.call(this, childView, displayFlags, viewContext);
    }
    super.displayChildViews(displayFlags, viewContext, layoutChildView);
  }

  /** @hidden */
  protected override mountViewFasteners(): void {
    super.mountViewFasteners();
    this.mountColFasteners();
  }

  /** @hidden */
  protected override unmountViewFasteners(): void {
    this.unmountColFasteners();
    super.unmountViewFasteners();
  }
}
