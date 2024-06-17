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
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewSet} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {SheetViewObserver} from "@swim/sheet";
import {SheetView} from "@swim/sheet";
import type {PanelStyle} from "./PanelView";
import {PanelView} from "./PanelView";

/** @public */
export interface BoardViewObserver<V extends BoardView = BoardView> extends SheetViewObserver<V> {
  viewWillAttachPanel?(panelView: PanelView, targetView: View | null, view: V): void;

  viewDidDetachPanel?(panelView: PanelView, view: V): void;
}

/** @public */
export class BoardView extends SheetView {
  protected override initSheet(): void {
    super.initSheet();
    this.classList.add("board");
  }

  declare readonly observerType?: Class<BoardViewObserver>;

  @ViewSet({
    viewType: PanelView,
    binds: true,
    observes: true,
    initView(panelView: PanelView): void {
      panelView.style.setIntrinsic({
        position: "absolute",
        visibility: "hidden",
      });
    },
    willAttachView(panelView: PanelView, target: View | null): void {
      this.owner.callObservers("viewWillAttachPanel", panelView, target, this.owner);
    },
    didDetachView(panelView: PanelView): void {
      this.owner.callObservers("viewDidDetachPanel", panelView, this.owner);
    },
    viewDidSetUnitWidth(unitWidth: number, panelView: PanelView): void {
      this.owner.requireUpdate(View.NeedsResize);
    },
    viewDidSetUnitHeight(unitHeight: number, panelView: PanelView): void {
      this.owner.requireUpdate(View.NeedsResize);
    },
    viewDidSetMinPanelHeight(minPanelHeight: number, paneView: PanelView): void {
      this.owner.requireUpdate(View.NeedsResize);
    },
    viewDidSetPanelStyle(panelStyle: PanelStyle, paneView: PanelView): void {
      this.owner.requireUpdate(View.NeedsResize);
    },
  })
  readonly panels!: ViewSet<this, PanelView> & Observes<PanelView>;

  protected override processChildren(processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    if ((processFlags & View.NeedsResize) !== 0) {
      this.resizeChildren(processFlags, processChild);
    } else {
      super.processChildren(processFlags, processChild);
    }
  }

  protected resizeChildren(processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    const edgeInsets = this.edgeInsets.value;
    const insetTop = Math.max(this.style.paddingTop.pxValue(), edgeInsets.insetTop);
    const insetRight = Math.max(this.style.paddingRight.pxValue(), edgeInsets.insetRight);
    const insetBottom = Math.max(this.style.paddingBottom.pxValue(), edgeInsets.insetBottom);
    const insetLeft = Math.max(this.style.paddingLeft.pxValue(), edgeInsets.insetLeft);
    const width = this.style.width.pxValue() - this.style.marginLeft.pxValue() - insetLeft - insetRight - this.style.marginRight.pxValue();
    const height = this.style.height.pxValue() - this.style.marginTop.pxValue() - insetTop - insetBottom - this.style.marginBottom.pxValue();
    const x = insetLeft;
    let y = insetTop;

    type self = this;
    function resizeChild(this: self, child: View, processFlags: ViewFlags): void {
      if (child instanceof PanelView) {
        const panelHeight = Math.max(child.minPanelHeight.value, child.unitHeight.value * height);
        child.setIntrinsic({
          style: {
            left: x,
            top: y,
          },
          widthBasis: width - child.style.marginLeft.pxValue() - child.style.marginRight.pxValue(),
          heightBasis: panelHeight - child.style.marginTop.pxValue() - child.style.marginBottom.pxValue(),
        });
      }
      if (child instanceof HtmlView) {
        child.style.paddingBottom.setState(child.nextSibling === null ? this.style.paddingBottom.value : null, Affinity.Transient);
      }
      processChild.call(this, child, processFlags);
      if (child instanceof PanelView) {
        child.style.visibility.setIntrinsic(void 0);
        y += child.style.marginTop.pxValue() + child.style.height.pxValue() + child.style.marginBottom.pxValue();
      }
    }
    super.processChildren(processFlags, resizeChild);
  }

  static override readonly InsertChildFlags: ViewFlags = View.InsertChildFlags | this.NeedsResize;
  static override readonly RemoveChildFlags: ViewFlags = View.RemoveChildFlags | this.NeedsResize;
}
