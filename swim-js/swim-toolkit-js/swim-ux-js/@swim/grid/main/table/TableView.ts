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

import {AnyLength, Length, R2Box} from "@swim/math";
import {Look} from "@swim/theme";
import {ViewContextType, ViewFlags, View, ViewEdgeInsets, ViewProperty, ViewFastener} from "@swim/view";
import {HtmlView, HtmlViewController} from "@swim/dom";
import {AnyTableLayout, TableLayout} from "../layout/TableLayout";
import {RowView} from "../row/RowView";
import type {TableViewObserver} from "./TableViewObserver";

export class TableView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    Object.defineProperty(this, "rowFasteners", {
      value: [],
      enumerable: true,
    });
    Object.defineProperty(this, "visibleViews", {
      value: [],
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "visibleFrame", {
      value: new R2Box(0, 0, window.innerWidth, window.innerHeight),
      enumerable: true,
      configurable: true,
    });
    this.initTable();
  }

  protected initTable(): void {
    this.addClass("table");
  }

  override readonly viewController!: HtmlViewController & TableViewObserver | null;

  override readonly viewObservers!: ReadonlyArray<TableViewObserver>;

  @ViewProperty({type: TableLayout, state: null, updateFlags: View.NeedsLayout})
  readonly layout!: ViewProperty<this, TableLayout | null, AnyTableLayout | null>;

  @ViewProperty({type: Length, state: Length.zero()})
  readonly rowSpacing!: ViewProperty<this, Length, AnyLength>;

  @ViewProperty({type: Length, state: Length.px(24)})
  readonly rowHeight!: ViewProperty<this, Length, AnyLength>;

  @ViewProperty({type: Object, inherit: true, state: null})
  readonly edgeInsets!: ViewProperty<this, ViewEdgeInsets | null>;

  insertRow(rowView: RowView, targetView: View | null = null): void {
    const rowFasteners = this.rowFasteners as ViewFastener<this, RowView>[];
    let targetIndex = rowFasteners.length;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      if (rowFastener.view === rowView) {
        return;
      } else if (rowFastener.view === targetView) {
        targetIndex = i;
      }
    }
    const rowFastener = this.createRowFastener(rowView);
    rowFasteners.splice(targetIndex, 0, rowFastener);
    rowFastener.setView(rowView, targetView);
    if (this.isMounted()) {
      rowFastener.mount();
    }
  }

  removeRow(rowView: RowView): void {
    const rowFasteners = this.rowFasteners as ViewFastener<this, RowView>[];
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      if (rowFastener.view === rowView) {
        rowFastener.setView(null);
        if (this.isMounted()) {
          rowFastener.unmount();
        }
        rowFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initRow(rowView: RowView, rowFastener: ViewFastener<this, RowView>): void {
    rowView.display.setState("none", View.Intrinsic);
    rowView.position.setState("absolute", View.Intrinsic);
    rowView.left.setState(0, View.Intrinsic);
    rowView.top.setState(null, View.Intrinsic);
    const layout = this.layout.state;
    rowView.width.setState(layout !== null ? layout.width : null, View.Intrinsic);
    rowView.height.setState(this.rowHeight.getState(), View.Intrinsic);
    rowView.opacity.setState(0, View.Intrinsic);
    rowView.setCulled(true);
  }

  protected attachRow(rowView: RowView, rowFastener: ViewFastener<this, RowView>): void {
    // hook
  }

  protected detachRow(rowView: RowView, rowFastener: ViewFastener<this, RowView>): void {
    // hook
  }

  protected willSetRow(newRowView: RowView | null, oldRowView: RowView | null,
                       targetView: View | null, rowFastener: ViewFastener<this, RowView>): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetRow !== void 0) {
      viewController.viewWillSetRow(newRowView, oldRowView, targetView, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetRow !== void 0) {
        viewObserver.viewWillSetRow(newRowView, oldRowView, targetView, this);
      }
    }
  }

  protected onSetRow(newRowView: RowView | null, oldRowView: RowView | null,
                     targetView: View | null, rowFastener: ViewFastener<this, RowView>): void {
    if (oldRowView !== null) {
      this.detachRow(oldRowView, rowFastener);
    }
    if (newRowView !== null) {
      this.attachRow(newRowView, rowFastener);
      this.initRow(newRowView, rowFastener);
    }
  }

  protected didSetRow(newRowView: RowView | null, oldRowView: RowView | null,
                      targetView: View | null, rowFastener: ViewFastener<this, RowView>): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetRow !== void 0) {
        viewObserver.viewDidSetRow(newRowView, oldRowView, targetView, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetRow !== void 0) {
      viewController.viewDidSetRow(newRowView, oldRowView, targetView, this);
    }
  }

  /** @hidden */
  static RowFastener = ViewFastener.define<TableView, RowView>({
    type: RowView,
    child: false,
    willSetView(newRowView: RowView | null, oldRowView: RowView | null, targetView: View | null): void {
      this.owner.willSetRow(newRowView, oldRowView, targetView, this);
    },
    onSetView(newRowView: RowView | null, oldRowView: RowView | null, targetView: View | null): void {
      this.owner.onSetRow(newRowView, oldRowView, targetView, this);
    },
    didSetView(newRowView: RowView | null, oldRowView: RowView | null, targetView: View | null): void {
      this.owner.didSetRow(newRowView, oldRowView, targetView, this);
    },
  });

  protected createRowFastener(rowView: RowView): ViewFastener<this, RowView> {
    return new TableView.RowFastener(this, rowView.key, "row");
  }

  /** @hidden */
  readonly rowFasteners!: ReadonlyArray<ViewFastener<this, RowView>>;

  /** @hidden */
  protected mountRowFasteners(): void {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      rowFastener.mount();
    }
  }

  /** @hidden */
  protected unmountRowFasteners(): void {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      rowFastener.unmount();
    }
  }

  protected detectRow(view: View): RowView | null {
    return view instanceof RowView ? view : null;
  }

  protected override onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    const rowView = this.detectRow(childView);
    if (rowView !== null) {
      this.insertRow(rowView, targetView);
    }
  }

  protected override onRemoveChildView(childView: View): void {
    super.onRemoveChildView(childView);
    const rowView = this.detectRow(childView);
    if (rowView !== null) {
      this.removeRow(rowView);
    }
  }

  /** @hidden */
  readonly visibleViews!: ReadonlyArray<View>;

  /** @hidden */
  readonly visibleFrame!: R2Box;

  protected detectVisibleFrame(): R2Box {
    const xBleed = 0;
    const yBleed = 64;
    const bounds = this.node.getBoundingClientRect();
    const xMin = -bounds.x - xBleed;
    const yMin = -bounds.y - yBleed;
    const xMax = window.innerWidth - bounds.x + xBleed;
    const yMax = window.innerHeight - bounds.y + yBleed;
    return new R2Box(xMin, yMin, xMax, yMax);
  }

  override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((processFlags & View.NeedsResize) !== 0) {
      processFlags |= View.NeedsScroll;
    }
    return processFlags;
  }

  protected override onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.resizeTable();
  }

  protected resizeTable(): void {
    const oldLayout = this.layout.state;
    if (oldLayout !== null) {
      let width: Length | number | null = this.width.state;
      width = width instanceof Length ? width.pxValue() : this.node.offsetWidth;
      const edgeInsets = this.edgeInsets.state;
      let paddingLeft: Length | number | null = this.paddingLeft.state;
      paddingLeft = paddingLeft instanceof Length ? paddingLeft.pxValue(width) : 0;
      let paddingRight: Length | number | null = this.paddingRight.state;
      paddingRight = paddingRight instanceof Length ? paddingRight.pxValue(width) : 0;
      let left = edgeInsets !== null ? edgeInsets.insetLeft : 0;
      left += paddingLeft;
      let right = edgeInsets !== null ? edgeInsets.insetRight : 0;
      right += paddingRight;
      const newLayout = oldLayout.resized(width, left, right);
      this.layout.setState(newLayout);
    }
  }

  protected processVisibleViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                                processChildView: (this: this, childView: View, processFlags: ViewFlags,
                                                   viewContext: ViewContextType<this>) => void): void {
    const visibleViews = this.visibleViews;
    let i = 0;
    while (i < visibleViews.length) {
      const childView = visibleViews[i]!;
      processChildView.call(this, childView, processFlags, viewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  protected override processChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                                       processChildView: (this: this, childView: View, processFlags: ViewFlags,
                                                          viewContext: ViewContextType<this>) => void): void {
    if (!this.isCulled()) {
      if ((processFlags & View.NeedsScroll) !== 0) {
        this.scrollChildViews(processFlags, viewContext, processChildView);
      } else {
        this.processVisibleViews(processFlags, viewContext, processChildView);
      }
    }
  }

  protected scrollChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                             processChildView: (this: this, childView: View, processFlags: ViewFlags,
                                                viewContext: ViewContextType<this>) => void): void {
    const visibleViews = this.visibleViews as View[];
    visibleViews.length = 0;

    const visibleFrame = this.detectVisibleFrame();
    Object.defineProperty(this, "visibleFrame", {
      value: visibleFrame,
      enumerable: true,
      configurable: true,
    });

    type self = this;
    function scrollChildView(this: self, childView: View, processFlags: ViewFlags,
                             viewContext: ViewContextType<self>): void {
      let isVisible: boolean;
      if (childView instanceof HtmlView) {
        const top = childView.top.state;
        const height = childView.height.state;
        if (top instanceof Length && height instanceof Length) {
          const yMin0 = visibleFrame.yMin;
          const yMax0 = visibleFrame.yMax;
          const yMin1 = top.pxValue();
          const yMax1 = yMin1 + height.pxValue();
          isVisible = yMin0 <= yMax1 && yMin1 <= yMax0;
          childView.display.setState(isVisible ? "flex" : "none", View.Intrinsic);
          childView.setCulled(!isVisible);
        } else {
          isVisible = true;
        }
      } else {
        isVisible = true;
      }
      if (isVisible) {
        visibleViews.push(childView);
        processChildView.call(this, childView, processFlags, viewContext);
      }
    }
    super.processChildViews(processFlags, viewContext, scrollChildView);
  }

  protected displayVisibleViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                   viewContext: ViewContextType<this>) => void): void {
    const visibleViews = this.visibleViews;
    let i = 0;
    while (i < visibleViews.length) {
      const childView = visibleViews[i]!;
      displayChildView.call(this, childView, displayFlags, viewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  protected override displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                       displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                          viewContext: ViewContextType<this>) => void): void {
    if ((displayFlags & View.NeedsLayout) !== 0) {
      this.layoutChildViews(displayFlags, viewContext, displayChildView);
    } else {
      this.displayVisibleViews(displayFlags, viewContext, displayChildView);
    }
  }

  protected layoutChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                             displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                viewContext: ViewContextType<this>) => void): void {
    this.resizeTable();
    const layout = this.layout.state;
    const width = layout !== null ? layout.width : null;

    const rowHeight = this.rowHeight.getState();
    const rowSpacing = this.rowSpacing.getState();

    const ySpacing = rowSpacing.pxValue(rowHeight.pxValue());
    let y = ySpacing;

    const visibleViews = this.visibleViews as View[];
    visibleViews.length = 0;

    const visibleFrame = this.detectVisibleFrame();
    Object.defineProperty(this, "visibleFrame", {
      value: visibleFrame,
      enumerable: true,
      configurable: true,
    });

    const timing = this.getLook(Look.timing);

    type self = this;
    function layoutChildView(this: self, childView: View, displayFlags: ViewFlags,
                             viewContext: ViewContextType<self>): void {
      if (childView instanceof RowView) {
        childView.top.setState(y, timing, View.Intrinsic);
        childView.width.setState(width, View.Intrinsic);
        childView.height.setState(rowHeight, timing, View.Intrinsic);
        childView.opacity.setState(1, timing, View.Intrinsic);
      }
      let isVisible: boolean;
      if (childView instanceof HtmlView) {
        const top = childView.top.state;
        const height = childView.height.state;
        if (top instanceof Length && height instanceof Length) {
          const yMin0 = visibleFrame.yMin;
          const yMax0 = visibleFrame.yMax;
          const yMin1 = top.pxValue();
          const yMax1 = yMin1 + height.pxValue();
          isVisible = yMin0 <= yMax1 && yMin1 <= yMax0;
        } else {
          isVisible = true;
        }
        childView.display.setState(isVisible ? "flex" : "none", View.Intrinsic);
        childView.setCulled(!isVisible);
      } else {
        isVisible = true;
      }
      if (isVisible) {
        visibleViews.push(childView);
      }
      displayChildView.call(this, childView, displayFlags, viewContext);
      if (childView instanceof RowView) {
        let height: Length | number | null = childView.height.state;
        height = height instanceof Length ? height.pxValue() : childView.node.offsetHeight;
        y += height + ySpacing;
      }
    }
    super.displayChildViews(displayFlags, viewContext, layoutChildView);

    this.height.setState(y, View.Intrinsic);
  }

  /** @hidden */
  protected override mountViewFasteners(): void {
    super.mountViewFasteners();
    this.mountRowFasteners();
  }

  /** @hidden */
  protected override unmountViewFasteners(): void {
    this.unmountRowFasteners();
    super.unmountViewFasteners();
  }
}
