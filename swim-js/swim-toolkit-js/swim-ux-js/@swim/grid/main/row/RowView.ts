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

import {Look} from "@swim/theme";
import {ViewContextType, ViewFlags, View, ViewProperty, ViewFastener} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {AnyTableLayout, TableLayout} from "../layout/TableLayout";
import {CellView} from "../cell/CellView";
import type {RowViewObserver} from "./RowViewObserver";

export class RowView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    Object.defineProperty(this, "cellFasteners", {
      value: [],
      enumerable: true,
    });
    this.initRow();
  }

  protected initRow(): void {
    this.addClass("row");
    this.overflowX.setState("hidden", View.Intrinsic);
    this.overflowY.setState("hidden", View.Intrinsic);
  }

  override readonly viewObservers!: ReadonlyArray<RowViewObserver>;

  @ViewProperty({type: TableLayout, state: null, inherit: true})
  readonly layout!: ViewProperty<this, TableLayout | null, AnyTableLayout | null>;

  insertCell(cellView: CellView, targetView: View | null = null): void {
    const cellFasteners = this.cellFasteners as ViewFastener<this, CellView>[];
    let targetIndex = cellFasteners.length;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      if (cellFastener.view === cellView) {
        return;
      } else if (cellFastener.view === targetView) {
        targetIndex = i;
      }
    }
    const cellFastener = this.createCellFastener(cellView);
    cellFasteners.splice(targetIndex, 0, cellFastener);
    cellFastener.setView(cellView, targetView);
    if (this.isMounted()) {
      cellFastener.mount();
    }
  }

  removeCell(cellView: CellView): void {
    const cellFasteners = this.cellFasteners as ViewFastener<this, CellView>[];
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      if (cellFastener.view === cellView) {
        cellFastener.setView(null);
        if (this.isMounted()) {
          cellFastener.unmount();
        }
        cellFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initCell(cellView: CellView, cellFastener: ViewFastener<this, CellView>): void {
    cellView.display.setState("none", View.Intrinsic);
    cellView.position.setState("absolute", View.Intrinsic);
    cellView.left.setState(0, View.Intrinsic);
    cellView.top.setState(0, View.Intrinsic);
    cellView.width.setState(0, View.Intrinsic);
    cellView.height.setState(this.height.state, View.Intrinsic);
  }

  protected attachCell(cellView: CellView, cellFastener: ViewFastener<this, CellView>): void {
    // hook
  }

  protected detachCell(cellView: CellView, cellFastener: ViewFastener<this, CellView>): void {
    // hook
  }

  protected willSetCell(newCellView: CellView | null, oldCellView: CellView | null,
                        targetView: View | null, cellFastener: ViewFastener<this, CellView>): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetCell !== void 0) {
        viewObserver.viewWillSetCell(newCellView, oldCellView, targetView, this);
      }
    }
  }

  protected onSetCell(newCellView: CellView | null, oldCellView: CellView | null,
                      targetView: View | null, cellFastener: ViewFastener<this, CellView>): void {
    if (oldCellView !== null) {
      this.detachCell(oldCellView, cellFastener);
    }
    if (newCellView !== null) {
      this.attachCell(newCellView, cellFastener);
      this.initCell(newCellView, cellFastener);
    }
  }

  protected didSetCell(newCellView: CellView | null, oldCellView: CellView | null,
                       targetView: View | null, cellFastener: ViewFastener<this, CellView>): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetCell !== void 0) {
        viewObserver.viewDidSetCell(newCellView, oldCellView, targetView, this);
      }
    }
  }

  /** @hidden */
  static CellFastener = ViewFastener.define<RowView, CellView>({
    type: CellView,
    child: false,
    willSetView(newCellView: CellView | null, oldCellView: CellView | null, targetView: View | null): void {
      this.owner.willSetCell(newCellView, oldCellView, targetView, this);
    },
    onSetView(newCellView: CellView | null, oldCellView: CellView | null, targetView: View | null): void {
      this.owner.onSetCell(newCellView, oldCellView, targetView, this);
    },
    didSetView(newCellView: CellView | null, oldCellView: CellView | null, targetView: View | null): void {
      this.owner.didSetCell(newCellView, oldCellView, targetView, this);
    },
  });

  protected createCellFastener(cellView: CellView): ViewFastener<this, CellView> {
    return new RowView.CellFastener(this, cellView.key, "cell");
  }

  /** @hidden */
  readonly cellFasteners!: ReadonlyArray<ViewFastener<this, CellView>>;

  /** @hidden */
  protected mountCellFasteners(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      cellFastener.mount();
    }
  }

  /** @hidden */
  protected unmountCellFasteners(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      cellFastener.unmount();
    }
  }

  protected detectCell(view: View): CellView | null {
    return view instanceof CellView ? view : null;
  }

  protected override onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    const cellView = this.detectCell(childView);
    if (cellView !== null) {
      this.insertCell(cellView, targetView);
    }
  }

  protected override onRemoveChildView(childView: View): void {
    super.onRemoveChildView(childView);
    const cellView = this.detectCell(childView);
    if (cellView !== null) {
      this.removeCell(cellView);
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
    type self = this;
    function layoutChildView(this: self, childView: View, displayFlags: ViewFlags,
                             viewContext: ViewContextType<self>): void {
      if (childView instanceof CellView) {
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
    this.mountCellFasteners();
  }

  /** @hidden */
  protected override unmountViewFasteners(): void {
    this.unmountCellFasteners();
    super.unmountViewFasteners();
  }
}
