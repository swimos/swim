// Copyright 2015-2022 Swim.inc
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

import type {Class, Observes} from "@swim/util";
import {Affinity, FastenerClass} from "@swim/component";
import {ViewFlags, View, ViewSet} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {SheetView} from "@swim/sheet";
import {PanelStyle, PanelView} from "../panel/PanelView";
import type {BoardViewObserver} from "./BoardViewObserver";

/** @public */
export class BoardView extends SheetView {
  protected override initSheet(): void {
    super.initSheet();
    this.addClass("board");
  }

  override readonly observerType?: Class<BoardViewObserver>;

  @ViewSet<BoardView["panels"]>({
    viewType: PanelView,
    binds: true,
    observes: true,
    initView(panelView: PanelView): void {
      panelView.position.setState("absolute", Affinity.Intrinsic);
      panelView.visibility.setState("hidden", Affinity.Intrinsic);
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
  static readonly panels: FastenerClass<BoardView["panels"]>;

  protected override processChildren(processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    if ((processFlags & View.NeedsResize) !== 0) {
      this.resizeChildren(processFlags, processChild);
    } else {
      super.processChildren(processFlags, processChild);
    }
  }

  protected resizeChildren(processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    const edgeInsets = this.edgeInsets.value;
    const insetTop = Math.max(this.paddingTop.pxValue(), edgeInsets.insetTop);
    const insetRight = Math.max(this.paddingRight.pxValue(), edgeInsets.insetRight);
    const insetBottom = Math.max(this.paddingBottom.pxValue(), edgeInsets.insetBottom);
    const insetLeft = Math.max(this.paddingLeft.pxValue(), edgeInsets.insetLeft);
    const width = this.width.pxValue() - this.marginLeft.pxValue() - insetLeft - insetRight - this.marginRight.pxValue();
    const height = this.height.pxValue() - this.marginTop.pxValue() - insetTop - insetBottom - this.marginBottom.pxValue();
    const x = insetLeft;
    let y = insetTop;

    type self = this;
    function resizeChild(this: self, child: View, processFlags: ViewFlags): void {
      if (child instanceof PanelView) {
        const panelHeight = Math.max(child.minPanelHeight.value, child.unitHeight.value * height);
        child.left.setState(x, Affinity.Intrinsic);
        child.top.setState(y, Affinity.Intrinsic);
        child.widthBasis.setValue(width - child.marginLeft.pxValue() - child.marginRight.pxValue(), Affinity.Intrinsic);
        child.heightBasis.setValue(panelHeight - child.marginTop.pxValue() - child.marginBottom.pxValue(), Affinity.Intrinsic);
      }
      if (child instanceof HtmlView) {
        child.paddingBottom.setState(child.nextSibling === null ? this.paddingBottom.value : null, Affinity.Transient);
      }
      processChild.call(this, child, processFlags);
      if (child instanceof PanelView) {
        child.visibility.setState(void 0, Affinity.Intrinsic);
        y += child.marginTop.pxValue() + child.height.pxValue() + child.marginBottom.pxValue();
      }
    }
    super.processChildren(processFlags, resizeChild);
  }
}
