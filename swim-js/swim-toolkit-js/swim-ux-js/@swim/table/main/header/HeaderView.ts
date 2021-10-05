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
import {Affinity, Property} from "@swim/fastener";
import {AnyLength, Length} from "@swim/math";
import {AnyExpansion, Expansion} from "@swim/style";
import {
  Look,
  ThemeAnimator,
  ExpansionThemeAnimator,
  ThemeConstraintAnimator,
} from "@swim/theme";
import {ViewContextType, ViewFlags, View, ViewFastener} from "@swim/view";
import {HtmlViewClass, HtmlView} from "@swim/dom";
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
    this.position.setState("relative", Affinity.Intrinsic);
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<HeaderViewObserver>;

  @Property({type: TableLayout, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly layout!: Property<this, TableLayout | null, AnyTableLayout | null>;

  protected didSetDepth(newDepth: number, oldDepth: number): void {
    // hook
  }

  @Property<HeaderView, number>({
    type: Number,
    inherits: true,
    state: 0,
    updateFlags: View.NeedsLayout,
    didSetState(newDepth: number, oldDepth: number): void {
      this.owner.didSetDepth(newDepth, oldDepth);
    },
  })
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
    if (this.mounted) {
      colFastener.mount();
    }
  }

  removeCol(colView: ColView): void {
    const colFasteners = this.colFasteners as ViewFastener<this, ColView>[];
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      if (colFastener.view === colView) {
        colFastener.setView(null);
        if (this.mounted) {
          colFastener.unmount();
        }
        colFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initCol(colView: ColView, colFastener: ViewFastener<this, ColView>): void {
    colView.display.setState("none", Affinity.Intrinsic);
    colView.position.setState("absolute", Affinity.Intrinsic);
    colView.left.setState(0, Affinity.Intrinsic);
    colView.top.setState(0, Affinity.Intrinsic);
    colView.width.setState(0, Affinity.Intrinsic);
    colView.height.setState(this.height.state, Affinity.Intrinsic);
  }

  protected attachCol(colView: ColView, colFastener: ViewFastener<this, ColView>): void {
    // hook
  }

  protected detachCol(colView: ColView, colFastener: ViewFastener<this, ColView>): void {
    // hook
  }

  protected willSetCol(newColView: ColView | null, oldColView: ColView | null,
                       targetView: View | null, colFastener: ViewFastener<this, ColView>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetCol !== void 0) {
        observer.viewWillSetCol(newColView, oldColView, targetView, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetCol !== void 0) {
        observer.viewDidSetCol(newColView, oldColView, targetView, this);
      }
    }
  }

  /** @internal */
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
    return HeaderView.ColFastener.create(this, colView.key ?? "col");
  }

  /** @internal */
  readonly colFasteners: ReadonlyArray<ViewFastener<this, ColView>>;

  /** @internal */
  protected mountColFasteners(): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      colFastener.mount();
    }
  }

  /** @internal */
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

  protected override onInsertChild(childView: View, targetView: View | null): void {
    super.onInsertChild(childView, targetView);
    const colView = this.detectCol(childView);
    if (colView !== null) {
      this.insertCol(colView, targetView);
    }
  }

  protected override onRemoveChild(childView: View): void {
    super.onRemoveChild(childView);
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

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountColFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountColFasteners();
    super.unmountFasteners();
  }
}
