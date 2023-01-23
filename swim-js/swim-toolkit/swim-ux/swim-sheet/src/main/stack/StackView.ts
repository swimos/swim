// Copyright 2015-2023 Swim.inc
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
import {Affinity, FastenerClass, Property} from "@swim/component";
import type {Length} from "@swim/math";
import {ViewInsets, View, ViewRef, ViewSet} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {BarView} from "@swim/toolbar";
import {SheetView} from "../sheet/SheetView";
import type {StackViewObserver} from "./StackViewObserver";

/** @public */
export class StackView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initStack();
  }

  protected initStack(): void {
    this.addClass("stack");
    this.position.setState("relative", Affinity.Intrinsic);
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<StackViewObserver>;

  @Property({valueType: Number, value: -(1 / 3)})
  readonly backAlign!: Property<this, number>;

  @ViewRef<StackView["navBar"]>({
    viewType: BarView,
    binds: true,
    observes: true,
    initView(navBarView: BarView): void {
      const stackWidth = this.owner.width.cssState;
      navBarView.placement.setValue("top", Affinity.Intrinsic);
      navBarView.position.setState("absolute", Affinity.Intrinsic);
      navBarView.left.setState(0, Affinity.Intrinsic);
      navBarView.top.setState(0, Affinity.Intrinsic);
      navBarView.width.setState(stackWidth, Affinity.Intrinsic);
      navBarView.zIndex.setState(1, Affinity.Intrinsic);
    },
    willAttachView(navBarView: BarView, target: View | null): void {
      this.owner.callObservers("viewWillAttachNavBar", navBarView, target, this.owner);
    },
    didAttachView(navBarView: BarView, target: View | null): void {
      this.owner.edgeInsets.decohereOutlets();
    },
    willDetachView(navBarView: BarView): void {
      this.owner.edgeInsets.decohereOutlets();
    },
    didDetachView(navBarView: BarView): void {
      this.owner.callObservers("viewDidDetachNavBar", navBarView, this.owner);
    },
    viewDidSetBarHeight(barHeight: Length | null): void {
      this.owner.requireUpdate(View.NeedsResize);
    },
    viewDidMount(): void {
      this.owner.edgeInsets.decohereOutlets();
    },
    viewWillUnmount(): void {
      this.owner.edgeInsets.decohereOutlets();
    },
  })
  readonly navBar!: ViewRef<this, BarView> & Observes<BarView>;
  static readonly navBar: FastenerClass<StackView["navBar"]>;

  @ViewSet<StackView["sheets"]>({
    viewType: SheetView,
    binds: true,
    observes: true,
    initView(sheetView: SheetView): void {
      const stackWidth = this.owner.width.cssState;
      const stackHeight = this.owner.height.cssState;

      const navBarView = this.owner.navBar.view;
      const navBarHeight = navBarView !== null && navBarView.mounted
                         ? navBarView.height.cssState : null;

      sheetView.position.setState("absolute", Affinity.Intrinsic);
      sheetView.left.setState(stackWidth, Affinity.Intrinsic);
      sheetView.top.setState(0, Affinity.Intrinsic);
      sheetView.width.setState(stackWidth, Affinity.Intrinsic);
      sheetView.height.setState(stackHeight, Affinity.Intrinsic);
      sheetView.paddingTop.setState(navBarHeight, Affinity.Intrinsic);
      sheetView.boxSizing.setState("border-box", Affinity.Intrinsic);
      sheetView.zIndex.setState(0, Affinity.Intrinsic);
    },
    willAttachView(sheetView: SheetView, target: View | null): void {
      this.owner.callObservers("viewWillAttachSheet", sheetView, target, this.owner);
      const backView = this.owner.front.view;
      if (sheetView !== backView) {
        sheetView.back.setView(backView);
        if (backView !== null) {
          backView.forward.setView(sheetView);
        }
        this.owner.front.setView(sheetView);
      }
    },
    didDetachView(sheetView: SheetView): void {
      const backView = sheetView.back.view;
      const forwardView = sheetView.forward.view;
      if (sheetView === this.owner.front.view) {
        this.owner.front.setView(backView, forwardView);
      }
      if (backView !== null) {
        backView.forward.setView(forwardView);
        sheetView.back.setView(null);
      }
      if (forwardView !== null) {
        sheetView.forward.setView(null);
        forwardView.back.setView(backView);
      }
      this.owner.callObservers("viewDidDetachSheet", sheetView, this.owner);
    },
    viewWillPresent(sheetView: SheetView): void {
      this.owner.callObservers("viewWillPresentSheet", sheetView, this.owner);
    },
    viewDidPresent(sheetView: SheetView): void {
      this.owner.callObservers("viewDidPresentSheet", sheetView, this.owner);
    },
    viewWillDismiss(sheetView: SheetView): void {
      this.owner.callObservers("viewWillDismissSheet", sheetView, this.owner);
      if (sheetView === this.owner.front.view) {
        this.owner.front.setView(null);
        const backView = sheetView.back.view;
        if (backView !== null) {
          this.owner.front.setView(backView, sheetView);
          backView.forward.setView(null);
          sheetView.back.setView(null);
        }
      }
    },
    viewDidDismiss(sheetView: SheetView): void {
      if (sheetView.forward.view !== null) {
        this.removeView(sheetView);
      } else {
        this.deleteView(sheetView);
      }
      this.owner.callObservers("viewDidDismissSheet", sheetView, this.owner);
    },
    viewWillLayout(sheetView: SheetView): void {
      sheetView.layoutSheet();
    },
    detectView(view: View): SheetView | null {
      return view instanceof SheetView && view.forward.view === null ? view : null;
    },
  })
  readonly sheets!: ViewSet<this, SheetView> & Observes<SheetView>;
  static readonly sheets: FastenerClass<StackView["sheets"]>;

  @ViewRef<StackView["front"]>({
    viewType: SheetView,
    binds: false,
    willAttachView(sheetView: SheetView, target: View | null): void {
      this.owner.callObservers("viewWillAttachFront", sheetView, target, this.owner);
      if (sheetView.parent === null) {
        this.owner.insertChild(sheetView, target);
      }
      if (sheetView.forward.view === null) {
        sheetView.sheetAlign.setValue(1, Affinity.Intrinsic);
        sheetView.present(sheetView.back.view !== null);
      } else {
        sheetView.sheetAlign.setValue(this.owner.backAlign.value, Affinity.Intrinsic);
        sheetView.present();
      }
    },
    didDetachView(sheetView: SheetView): void {
      if (sheetView.forward.view !== null) {
        sheetView.sheetAlign.setValue(this.owner.backAlign.value, Affinity.Intrinsic);
        sheetView.dismiss();
      } else {
        sheetView.sheetAlign.setValue(1, Affinity.Intrinsic);
        sheetView.dismiss();
      }
      this.owner.callObservers("viewDidDetachFront", sheetView, this.owner);
    },
  })
  readonly front!: ViewRef<this, SheetView>;
  static readonly front: FastenerClass<StackView["front"]>;

  @Property<StackView["edgeInsets"]>({
    extends: true,
    getOutletValue(outlet: Property<unknown, ViewInsets>): ViewInsets {
      let edgeInsets = this.value;
      if (outlet.owner instanceof SheetView) {
        const navBarView = this.owner.navBar.view;
        if (navBarView !== null && navBarView.mounted) {
          edgeInsets = {
            insetTop: 0,
            insetRight: edgeInsets.insetRight,
            insetBottom: edgeInsets.insetBottom,
            insetLeft: edgeInsets.insetLeft,
          };
        }
      }
      return edgeInsets;
    },
  })
  override readonly edgeInsets!: Property<this, ViewInsets>;

  protected override onResize(): void {
    super.onResize();
    this.resizeStack();
  }

  protected resizeStack(): void {
    const stackWidth = this.width.cssState;
    const stackHeight = this.height.cssState;

    const navBarView = this.navBar.view;
    let navBarHeight: Length | null = null;
    if (navBarView !== null && navBarView.mounted) {
      navBarView.width.setState(stackWidth, Affinity.Intrinsic);
      navBarHeight = navBarView.height.cssState;
    }

    const sheetViews = this.sheets.views;
    for (const viewId in sheetViews) {
      const sheetView = sheetViews[viewId]!;
      sheetView.width.setState(stackWidth, Affinity.Intrinsic);
      sheetView.height.setState(stackHeight, Affinity.Intrinsic);
      sheetView.paddingTop.setState(navBarHeight, Affinity.Intrinsic);
    }
  }
}
