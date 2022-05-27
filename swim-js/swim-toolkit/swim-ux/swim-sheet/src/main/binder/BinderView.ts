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

import type {Class, Instance, Creatable, Observes} from "@swim/util";
import {Affinity, FastenerClass, Property} from "@swim/component";
import type {Length} from "@swim/math";
import {ViewInsets, View, ViewRef, ViewSet} from "@swim/view";
import {BarView} from "@swim/toolbar";
import {SheetView} from "../sheet/SheetView";
import type {BinderViewObserver} from "./BinderViewObserver";

/** @public */
export type BinderTabStyle = "bottom" | "mode" | "none";

/** @public */
export class BinderView extends SheetView {
  constructor(node: HTMLElement) {
    super(node);
    this.initBinder();
  }

  protected initBinder(): void {
    this.addClass("binder");
    this.position.setState("relative", Affinity.Intrinsic);
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<BinderViewObserver>;

  @Property<BinderView["tabStyle"]>({
    valueType: String,
    value: "none",
    updateFlags: View.NeedsResize,
    didSetValue(tabStyle: BinderTabStyle): void {
      this.owner.callObservers("viewDidSetTabStyle", tabStyle, this.owner);
      this.owner.edgeInsets.decohereOutlets();
    },
  })
  readonly tabStyle!: Property<this, BinderTabStyle>;

  @ViewRef<BinderView["tabBar"]>({
    viewType: BarView,
    binds: true,
    observes: true,
    initView(tabBarView: BarView): void {
      const binderWidth = this.owner.width.cssState;
      tabBarView.placement.setValue("bottom", Affinity.Intrinsic);
      tabBarView.position.setState("absolute", Affinity.Intrinsic);
      tabBarView.left.setState(0, Affinity.Intrinsic);
      tabBarView.bottom.setState(0, Affinity.Intrinsic);
      tabBarView.width.setState(binderWidth, Affinity.Intrinsic);
      tabBarView.zIndex.setState(1, Affinity.Intrinsic);
    },
    willAttachView(tabBarView: BarView, targetView: View | null): void {
      this.owner.callObservers("viewWillAttachTabBar", tabBarView, targetView, this.owner);
    },
    didAttachView(navBarView: BarView, target: View | null): void {
      this.owner.edgeInsets.decohereOutlets();
    },
    willDetachView(navBarView: BarView): void {
      this.owner.edgeInsets.decohereOutlets();
    },
    didDetachView(tabBarView: BarView): void {
      this.owner.callObservers("viewDidDetachTabBar", tabBarView, this.owner);
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
  readonly tabBar!: ViewRef<this, BarView> & Observes<BarView>;
  static readonly tabBar: FastenerClass<BinderView["tabBar"]>;

  getTab<F extends Class<SheetView>>(key: string, tabViewClass: F): InstanceType<F> | null;
  getTab(key: string): SheetView | null;
  getTab(key: string, tabViewClass?: Class<SheetView>): SheetView | null {
    if (tabViewClass === void 0) {
      tabViewClass = SheetView;
    }
    const tabView = this.getChild(key);
    return tabView instanceof tabViewClass ? tabView : null;
  }

  getOrCreateTab<F extends Class<Instance<F, SheetView>> & Creatable<Instance<F, SheetView>>>(key: string, tabViewClass: F): InstanceType<F> {
    let tabView = this.getChild(key, tabViewClass);
    if (tabView === null) {
      tabView = tabViewClass.create();
      this.setChild(key, tabView);
    }
    return tabView!;
  }

  setTab(key: string, tabView: SheetView | null): void {
    this.setChild(key, tabView);
  }

  @ViewSet<BinderView["tabs"]>({
    viewType: SheetView,
    binds: false,
    observes: true,
    initView(tabView: SheetView): void {
      const binderWidth = this.owner.width.cssState;
      const binderHeight = this.owner.height.cssState;

      const tabBarView = this.owner.tabBar.view;
      const tabBarHeight = tabBarView !== null && tabBarView.mounted
                         ? tabBarView.height.cssState : null;

      tabView.position.setState("absolute", Affinity.Intrinsic);
      tabView.left.setState(0, Affinity.Intrinsic);
      tabView.top.setState(0, Affinity.Intrinsic);
      tabView.width.setState(binderWidth, Affinity.Intrinsic);
      tabView.height.setState(binderHeight, Affinity.Intrinsic);
      tabView.paddingTop.setState(this.owner.paddingTop.state, Affinity.Intrinsic);
      tabView.paddingBottom.setState(tabBarHeight, Affinity.Intrinsic);
      tabView.boxSizing.setState("border-box", Affinity.Intrinsic);
      tabView.zIndex.setState(0, Affinity.Intrinsic);
    },
    willAttachView(tabView: SheetView, targetView: View | null): void {
      this.owner.callObservers("viewWillAttachTab", tabView, targetView, this.owner);
    },
    willDetachView(tabView: SheetView): void {
      if (tabView === this.owner.active.view) {
        this.owner.active.setView(null);
      }
    },
    didDetachView(tabView: SheetView): void {
      this.owner.callObservers("viewDidDetachTab", tabView, this.owner);
    },
    detectView(view: View): SheetView | null {
      return view instanceof SheetView ? view : null;
    },
  })
  readonly tabs!: ViewSet<this, SheetView> & Observes<SheetView>;
  static readonly tabs: FastenerClass<BinderView["tabs"]>;

  @ViewRef<BinderView["active"]>({
    viewType: SheetView,
    binds: false,
    observes: true,
    willAttachView(tabView: SheetView, targetView: View | null): void {
      this.owner.callObservers("viewWillAttachActive", tabView, targetView, this.owner);
    },
    didAttachView(tabView: SheetView, targetView: View | null): void {
      this.owner.fullBleed.setValue(tabView.fullBleed.value, Affinity.Intrinsic);
      if (tabView.parent === null) {
        this.owner.insertChild(tabView, targetView);
      }
    },
    didDetachView(tabView: SheetView): void {
      this.owner.callObservers("viewDidDetachActive", tabView, this.owner);
    },
    viewDidSetFullBleed(fullBleed: boolean, tabView: SheetView): void {
      this.owner.fullBleed.setValue(fullBleed, Affinity.Intrinsic);
    },
  })
  readonly active!: ViewRef<this, SheetView> & Observes<SheetView>;
  static readonly active: FastenerClass<BinderView["active"]>;

  @Property<BinderView["edgeInsets"]>({
    extends: true,
    getOutletValue(outlet: Property<unknown, ViewInsets>): ViewInsets {
      let edgeInsets = this.value;
      if (outlet.owner instanceof SheetView) {
        const tabBarView = this.owner.tabBar.view;
        if (tabBarView !== null && tabBarView.mounted) {
          edgeInsets = {
            insetTop: edgeInsets.insetTop,
            insetRight: edgeInsets.insetRight,
            insetBottom: 0,
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
    this.resizeBinder();
  }

  protected resizeBinder(): void {
    const binderWidth = this.width.cssState!;
    const binderHeight = this.height.cssState!;
    const paddingLeft = this.paddingLeft.value;
    const paddingRight = this.paddingRight.value;

    const tabBarView = this.tabBar.view;
    let tabBarHeight: Length | null = null;
    if (tabBarView !== null && tabBarView.mounted) {
      let tabBarWidth = binderWidth;
      tabBarHeight = tabBarView.height.cssState;
      if (paddingLeft !== null) {
        tabBarWidth = tabBarWidth.minus(paddingLeft);
      }
      if (paddingRight !== null) {
        tabBarWidth = tabBarWidth.minus(paddingRight);
      }
      tabBarView.left.setState(paddingLeft, Affinity.Intrinsic);
      tabBarView.right.setState(paddingRight, Affinity.Intrinsic);
      tabBarView.width.setState(tabBarWidth, Affinity.Intrinsic);
    }

    const tabViews = this.tabs.views;
    for (const viewId in tabViews) {
      const tabView = tabViews[viewId]!;
      tabView.width.setState(binderWidth, Affinity.Intrinsic);
      tabView.height.setState(binderHeight, Affinity.Intrinsic);
      tabView.paddingTop.setState(this.paddingTop.state, Affinity.Intrinsic);
      tabView.paddingRight.setState(paddingRight, Affinity.Intrinsic);
      tabView.paddingBottom.setState(tabBarHeight, Affinity.Intrinsic);
      tabView.paddingLeft.setState(paddingLeft, Affinity.Intrinsic);
    }
  }
}
