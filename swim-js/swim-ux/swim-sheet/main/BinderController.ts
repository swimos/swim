// Copyright 2015-2023 Nstream, inc.
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
import {Objects} from "@swim/util";
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import type {PositionGestureInput} from "@swim/view";
import type {Trait} from "@swim/model";
import type {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import type {ToolController} from "@swim/toolbar";
import type {BarView} from "@swim/toolbar";
import {BarController} from "@swim/toolbar";
import type {SheetView} from "./SheetView";
import type {SheetControllerObserver} from "./SheetController";
import {SheetController} from "./SheetController";
import type {FolioStyle} from "./FolioView";
import {TabBarController} from "./TabBarController";
import type {BinderTabStyle} from "./BinderView";
import {BinderView} from "./BinderView";

/** @public */
export interface BinderControllerObserver<C extends BinderController = BinderController> extends SheetControllerObserver<C> {
  controllerWillAttachBinderTrait?(binderTrait: Trait, controller: C): void;

  controllerDidDetachBinderTrait?(binderTrait: Trait, controller: C): void;

  controllerWillAttachBinderView?(binderView: BinderView, controller: C): void;

  controllerDidDetachBinderView?(binderView: BinderView, controller: C): void;

  controllerDidSetTabStyle(tabStyle: BinderTabStyle, controller: C): void;

  controllerWillAttachTabBar?(tabBarController: BarController, controller: C): void;

  controllerDidDetachTabBar?(tabBarController: BarController, controller: C): void;

  controllerWillAttachTabBarView?(tabBarView: BarView, controller: C): void;

  controllerDidDetachTabBarView?(tabBarView: BarView, controller: C): void;

  controllerWillAttachTab?(tabController: SheetController, controller: C): void;

  controllerDidDetachTab?(tabController: SheetController, controller: C): void;

  controllerWillAttachTabTrait?(tabTrait: Trait, tabController: SheetController, controller: C): void;

  controllerDidDetachTabTrait?(tabTrait: Trait, tabController: SheetController, controller: C): void;

  controllerWillAttachTabView?(tabView: SheetView, tabController: SheetController, controller: C): void;

  controllerDidDetachTabView?(tabView: SheetView, tabController: SheetController, controller: C): void;

  controllerWillAttachTabHandle?(tabHandleController: ToolController, tabController: SheetController, controller: C): void;

  controllerDidDetachTabHandle?(tabHandleController: ToolController, tabController: SheetController, controller: C): void;

  controllerDidPressTabHandle?(input: PositionGestureInput, event: Event | null, tabController: SheetController, controller: C): void;

  controllerDidLongPressTabHandle?(input: PositionGestureInput, tabController: SheetController, controller: C): void;

  controllerWillAttachActive?(activeController: SheetController, controller: C): void;

  controllerDidDetachActive?(activeController: SheetController, controller: C): void;

  controllerWillAttachActiveTrait?(activeTrait: Trait, controller: C): void;

  controllerDidDetachActiveTrait?(activeTrait: Trait, controller: C): void;

  controllerWillAttachActiveView?(activeView: SheetView, controller: C): void;

  controllerDidDetachActiveView?(activeView: SheetView, controller: C): void;
}

/** @public */
export class BinderController extends SheetController {
  declare readonly observerType?: Class<BinderControllerObserver>;

  @Property({
    valueType: String,
    inherits: true,
    didSetValue(folioStyle: FolioStyle | undefined): void {
      if (folioStyle === "stacked") {
        this.owner.tabStyle.setIntrinsic("bottom");
      } else if (folioStyle === "unstacked") {
        this.owner.tabStyle.setIntrinsic("mode");
      }
    },
  })
  readonly folioStyle!: Property<this, FolioStyle | undefined>;

  @Property({
    valueType: String,
    value: "none",
    didSetValue(tabStyle: BinderTabStyle): void {
      const tabBarController = this.owner.tabBar.controller;
      if (tabBarController !== null) {
        this.owner.tabBar.updateTabStyle(tabStyle, tabBarController);
      }
      const tabControllers = this.owner.tabs.controllers;
      for (const controllerId in tabControllers) {
        const tabController = tabControllers[controllerId]!;
        this.owner.tabs.updateTabStyle(tabStyle, tabController);
      }
      this.owner.callObservers("controllerDidSetTabStyle", tabStyle, this.owner);
      const binderView = this.owner.binder.view;
      if (binderView !== null) {
        binderView.tabStyle.setValue(tabStyle, Affinity.Inherited);
      }
    },
  })
  readonly tabStyle!: Property<this, BinderTabStyle>;

  @TraitViewRef({
    willAttachTrait(binderTrait: Trait): void {
      this.owner.callObservers("controllerWillAttachBinderTrait", binderTrait, this.owner);
    },
    didDetachTrait(binderTrait: Trait): void {
      this.owner.callObservers("controllerDidDetachBinderTrait", binderTrait, this.owner);
    },
    viewType: BinderView,
    observesView: true,
    initView(binderView: BinderView): void {
      binderView.tabStyle.setValue(this.owner.tabStyle.value, Affinity.Inherited);
      const tabBarController = this.owner.tabBar.controller;
      if (tabBarController !== null) {
        binderView.tabBar.setView(tabBarController.bar.view);
      }
      const activeController = this.owner.active.controller;
      if (activeController !== null) {
        binderView.active.setView(activeController.sheet.attachView());
      }
    },
    willAttachView(binderView: BinderView): void {
      this.owner.callObservers("controllerWillAttachBinderView", binderView, this.owner);
      if (this.owner.sheet.view === null) {
        this.owner.sheet.setView(binderView);
      }
    },
    didAttachView(binderView: BinderView): void {
      //this.owner.tabStyle.setIntrinsic(binderView.tabStyle.value);
      const activeController = this.owner.active.controller;
      if (activeController !== null) {
        activeController.sheet.removeView();
      }
    },
    willDetachView(binderView: BinderView): void {
      this.owner.active.setController(null);
    },
    didDetachView(binderView: BinderView): void {
      if (this.owner.sheet.view === binderView) {
        this.owner.sheet.detachView();
      }
      this.owner.callObservers("controllerDidDetachBinderView", binderView, this.owner);
    },
    //viewDidSetTabStyle(tabStyle: BinderTabStyle, binderView: BinderView): void {
    //  this.owner.tabStyle.setIntrinsic(tabStyle);
    //},
    viewWillAttachTabBar(tabBarView: BarView): void {
      const tabBarController = this.owner.tabBar.controller;
      if (tabBarController !== null) {
        tabBarController.bar.setView(tabBarView);
      }
    },
    viewDidDetachTabBar(tabBarView: BarView): void {
      const tabBarController = this.owner.tabBar.controller;
      if (tabBarController !== null) {
        tabBarController.bar.setView(null);
      }
    },
  })
  readonly binder!: TraitViewRef<this, Trait, BinderView> & Observes<BinderView>;

  protected didPressTabHandle(input: PositionGestureInput, event: Event | null, tabController: SheetController): void {
    this.callObservers("controllerDidPressTabHandle", input, event, tabController, this);
    if (input.defaultPrevented) {
      return;
    }
    this.active.setController(tabController);
  }

  protected didLongPressTabHandle(input: PositionGestureInput, tabController: SheetController): void {
    this.callObservers("controllerDidLongPressTabHandle", input, tabController, this);
  }

  @TraitViewControllerRef({
    controllerType: BarController,
    binds: true,
    observes: true,
    get parentView(): BinderView | null {
      return this.owner.binder.view;
    },
    getTraitViewRef(tabBarController: BarController): TraitViewRef<unknown, Trait, BarView> {
      return tabBarController.bar;
    },
    initController(tabBarController: BarController): void {
      this.updateTabStyle(this.owner.tabStyle.value, tabBarController);
    },
    willAttachController(tabBarController: BarController): void {
      this.owner.callObservers("controllerWillAttachTabBar", tabBarController, this.owner);
    },
    didAttachController(tabBarController: BarController): void {
      const tabBarView = tabBarController.bar.view;
      if (tabBarView !== null) {
        this.attachTabBarView(tabBarView, tabBarController);
      }
    },
    willDetachController(tabBarController: BarController): void {
      const tabBarView = tabBarController.bar.view;
      if (tabBarView !== null) {
        this.detachTabBarView(tabBarView, tabBarController);
      }
    },
    didDetachController(tabBarController: BarController): void {
      this.owner.callObservers("controllerDidDetachTabBar", tabBarController, this.owner);
    },
    controllerWillAttachBarView(tabBarView: BarView, tabBarController: BarController): void {
      this.owner.callObservers("controllerWillAttachTabBarView", tabBarView, this.owner);
      this.attachTabBarView(tabBarView, tabBarController);
    },
    controllerDidDetachBarView(tabBarView: BarView, tabBarController: BarController): void {
      this.detachTabBarView(tabBarView, tabBarController);
      this.owner.callObservers("controllerDidDetachTabBarView", tabBarView, this.owner);
    },
    attachTabBarView(tabBarView: BarView, tabBarController: BarController): void {
      const binderView = this.owner.binder.view;
      if (binderView !== null && binderView.tabBar.view === null) {
        binderView.tabBar.attachView(tabBarView);
      }
    },
    detachTabBarView(tabBarView: BarView, tabBarController: BarController): void {
      tabBarView.remove();
    },
    controllerDidPressTabHandle(input: PositionGestureInput, event: Event | null, tabController: SheetController): void {
      this.owner.didPressTabHandle(input, event, tabController);
    },
    controllerDidLongPressTabHandle(input: PositionGestureInput, tabController: SheetController): void {
      this.owner.didLongPressTabHandle(input, tabController);
    },
    updateTabStyle(tabStyle: BinderTabStyle, tabBarController: BarController): void {
      if (tabStyle === "bottom") {
        this.insertView();
      } else {
        this.removeView();
      }
    },
    createController(): BarController {
      return new TabBarController();
    },
  })
  readonly tabBar!: TraitViewControllerRef<this, Trait, BarView, BarController> & Observes<TabBarController> & {
    attachTabBarView(tabBarView: BarView, tabBarController: BarController): void,
    detachTabBarView(tabBarView: BarView, tabBarController: BarController): void,
    updateTabStyle(tabStyle: BinderTabStyle, tabBarController: BarController): void,
  };

  setTab(key: string, newTabController: SheetController | null): void {
    const oldTabController = this.getChild(key, SheetController);
    const active = oldTabController === this.active.controller;

    let targetTabController: Controller | null;
    if (oldTabController !== null) {
      targetTabController = oldTabController.getNextSibling(SheetController);
      this.tabs.deleteController(oldTabController);
    } else {
      targetTabController = null;
    }

    if (newTabController !== null) {
      this.tabs.insertController(null, newTabController, targetTabController, key);
      if (active) {
        this.active.setController(newTabController);
      }
    }
  }

  @TraitViewControllerSet({
    controllerType: SheetController,
    binds: false,
    ordered: true,
    observes: true,
    get parentView(): BinderView | null {
      return this.owner.binder.view;
    },
    getTraitViewRef(tabController: SheetController): TraitViewRef<unknown, Trait, SheetView> {
      return tabController.sheet;
    },
    initController(tabController: SheetController): void {
      this.updateTabStyle(this.owner.tabStyle.value, tabController);
    },
    willAttachController(tabController: SheetController): void {
      this.owner.callObservers("controllerWillAttachTab", tabController, this.owner);
    },
    didAttachController(tabController: SheetController): void {
      const tabTrait = tabController.sheet.trait;
      if (tabTrait !== null) {
        this.attachTabTrait(tabTrait, tabController);
      }
      const tabView = tabController.sheet.attachView();
      this.attachTabView(tabView, tabController);
      const tabHandleController = tabController.handle.insertController();
      this.attachTabHandle(tabHandleController, tabController);
      if (this.owner.active.controller === null) {
        this.owner.active.setController(tabController);
      }
    },
    willDetachController(tabController: SheetController): void {
      if (tabController === this.owner.active.controller) {
        this.owner.active.setController(null);
      }
      const tabHandleController = tabController.handle.controller;
      if (tabHandleController !== null) {
        this.detachTabHandle(tabHandleController, tabController);
      }
      const tabView = tabController.sheet.view;
      if (tabView !== null) {
        this.detachTabView(tabView, tabController);
      }
      const tabTrait = tabController.sheet.trait;
      if (tabTrait !== null) {
        this.detachTabTrait(tabTrait, tabController);
      }
    },
    didDetachController(tabController: SheetController): void {
      this.owner.callObservers("controllerDidDetachTab", tabController, this.owner);
    },
    controllerWillAttachSheetTrait(tabTrait: Trait, tabController: SheetController): void {
      this.owner.callObservers("controllerWillAttachTabTrait", tabTrait, tabController, this.owner);
      this.attachTrait(tabTrait, void 0, tabController);
      this.attachTabTrait(tabTrait, tabController);
    },
    controllerDidDetachSheetTrait(tabTrait: Trait, tabController: SheetController): void {
      this.detachTabTrait(tabTrait, tabController);
      this.detachTrait(tabTrait);
      this.owner.callObservers("controllerDidDetachTabTrait", tabTrait, tabController, this.owner);
    },
    attachTabTrait(tabTrait: Trait, tabController: SheetController): void {
      // hook
    },
    detachTabTrait(tabTrait: Trait, tabController: SheetController): void {
      // hook
    },
    controllerWillAttachSheetView(tabView: SheetView, tabController: SheetController): void {
      this.owner.callObservers("controllerWillAttachTabView", tabView, tabController, this.owner);
      this.attachTabView(tabView, tabController);
    },
    controllerDidDetachSheetView(tabView: SheetView, tabController: SheetController): void {
      this.detachTabView(tabView, tabController);
      this.owner.callObservers("controllerDidDetachTabView", tabView, tabController, this.owner);
    },
    attachTabView(tabView: SheetView, tabController: SheetController): void {
      const binderView = this.owner.binder.view;
      if (binderView !== null) {
        binderView.tabs.attachView(tabView);
      }
    },
    detachTabView(tabView: SheetView, tabController: SheetController): void {
      const binderView = this.owner.binder.view;
      if (binderView !== null) {
        binderView.tabs.deleteView(tabView);
      }
    },
    controllerWillAttachHandle(tabHandleController: ToolController, tabController: SheetController): void {
      this.owner.callObservers("controllerWillAttachTabHandle", tabHandleController, tabController, this.owner);
      this.attachTabHandle(tabHandleController, tabController);
    },
    controllerDidDetachHandle(tabHandleController: ToolController, tabController: SheetController): void {
      this.detachTabHandle(tabHandleController, tabController);
      this.owner.callObservers("controllerDidDetachTabHandle", tabHandleController, tabController, this.owner);
    },
    attachTabHandle(tabHandleController: ToolController, tabController: SheetController): void {
      if (this.owner.tabStyle.value === "mode") {
        const targetTabController = Objects.getNextValue(this.controllers, tabController.uid);
        const targetToolController = targetTabController !== void 0 ? targetTabController.handle.controller : null;
        this.owner.modeTools.attachController(tabHandleController, targetToolController);
      }
    },
    detachTabHandle(tabHandleController: ToolController, tabController: SheetController): void {
      if (this.owner.tabStyle.value === "mode") {
        this.owner.modeTools.deleteController(tabHandleController);
      }
      tabHandleController.remove();
    },
    updateTabStyle(tabStyle: BinderTabStyle, tabController: SheetController): void {
      const tabToolController = tabController.handle.controller;
      if (tabToolController === null) {
        return;
      } else if (tabStyle === "mode") {
        const targetTabController = Objects.getNextValue(this.controllers, tabController.uid);
        const targetToolController = targetTabController !== void 0 ? targetTabController.handle.controller : null;
        this.owner.modeTools.attachController(tabToolController, targetToolController);
      } else {
        this.owner.modeTools.detachController(tabToolController);
      }
    },
  })
  readonly tabs!: TraitViewControllerSet<this, Trait, SheetView, SheetController> & Observes<SheetController> & {
    attachTabTrait(tabTrait: Trait, tabController: SheetController): void,
    detachTabTrait(tabTrait: Trait, tabController: SheetController): void,
    attachTabView(tabView: SheetView, tabController: SheetController): void,
    detachTabView(tabView: SheetView, tabController: SheetController): void,
    attachTabHandle(tabHandleController: ToolController, tabController: SheetController): void,
    detachTabHandle(tabHandleController: ToolController, tabController: SheetController): void,
    updateTabStyle(tabStyle: BinderTabStyle, tabController: SheetController): void,
  };

  @TraitViewControllerRef({
    controllerType: SheetController,
    consumed: true,
    binds: false,
    observes: true,
    getTraitViewRef(activeController: SheetController): TraitViewRef<unknown, Trait, SheetView> {
      return activeController.sheet;
    },
    willAttachController(activeController: SheetController): void {
      this.owner.callObservers("controllerWillAttachActive", activeController, this.owner);
    },
    didAttachController(activeController: SheetController): void {
      this.owner.fullBleed.setIntrinsic(activeController.fullBleed.value);
      const activeTrait = activeController.sheet.trait;
      if (activeTrait !== null) {
        this.attachActiveTrait(activeTrait, activeController);
      }
      const activeView = activeController.sheet.attachView();
      if (activeView !== null) {
        this.attachActiveView(activeView, activeController);
      }
      activeController.handle.setActive(true);
    },
    willDetachController(activeController: SheetController): void {
      activeController.handle.setActive(false);
      const activeView = activeController.sheet.view;
      if (activeView !== null) {
        this.detachActiveView(activeView, activeController);
      }
      const activeTrait = activeController.sheet.trait;
      if (activeTrait !== null) {
        this.detachActiveTrait(activeTrait, activeController);
      }
    },
    didDetachController(activeController: SheetController): void {
      this.owner.callObservers("controllerDidDetachActive", activeController, this.owner);
    },
    controllerWillAttachSheetTrait(activeTrait: Trait, activeController: SheetController): void {
      this.owner.callObservers("controllerWillAttachActiveTrait", activeTrait, this.owner);
      this.attachActiveTrait(activeTrait, activeController);
    },
    controllerDidDetachSheetTrait(activeTrait: Trait, activeController: SheetController): void {
      this.detachActiveTrait(activeTrait, activeController);
      this.owner.callObservers("controllerDidDetachActiveTrait", activeTrait, this.owner);
    },
    attachActiveTrait(activeTrait: Trait, activeController: SheetController): void {
      // hook
    },
    detachActiveTrait(activeTrait: Trait, activeController: SheetController): void {
      // hook
    },
    controllerWillAttachSheetView(activeView: SheetView, activeController: SheetController): void {
      this.owner.callObservers("controllerWillAttachActiveView", activeView, this.owner);
      this.attachActiveView(activeView, activeController);
    },
    controllerDidDetachSheetView(activeView: SheetView, activeController: SheetController): void {
      this.detachActiveView(activeView, activeController);
      this.owner.callObservers("controllerDidDetachActiveView", activeView, this.owner);
    },
    attachActiveView(activeView: SheetView, activeController: SheetController): void {
      const binderView = this.owner.binder.view;
      if (binderView !== null) {
        binderView.active.setView(activeView);
      }
    },
    detachActiveView(activeView: SheetView, activeController: SheetController): void {
      const binderView = this.owner.binder.view;
      if (binderView !== null) {
        binderView.active.deleteView();
      }
    },
    controllerDidSetFullBleed(fullBleed: boolean, activeController: SheetController): void {
      this.owner.fullBleed.setIntrinsic(fullBleed);
    },
    controllerDidScrollSheetView(activeView: SheetView, activeController: SheetController): void {
      this.owner.callObservers("controllerDidScrollSheetView", activeView, this.owner);
    },
  })
  readonly active!: TraitViewControllerRef<this, Trait, SheetView, SheetController> & Observes<SheetController> & {
    attachActiveTrait(activeTrait: Trait, activeController: SheetController): void,
    detachActiveTrait(activeTrait: Trait, activeController: SheetController): void,
    attachActiveView(activeView: SheetView, activeController: SheetController): void,
    detachActiveView(activeView: SheetView, activeController: SheetController): void,
  };
}
