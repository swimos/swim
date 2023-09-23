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
import type {Observes} from "@swim/util";
import type {Trait} from "@swim/model";
import type {PositionGestureInput} from "@swim/view";
import {Property} from "@swim/component";
import {Controller} from "@swim/controller";
import type {TraitViewRef} from "@swim/controller";
import {TraitViewControllerRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import {ToolLayout} from "@swim/toolbar";
import {BarLayout} from "@swim/toolbar";
import type {ToolController} from "@swim/toolbar";
import type {BarControllerObserver} from "@swim/toolbar";
import {BarController} from "@swim/toolbar";
import type {SheetView} from "./SheetView";
import {SheetController} from "./SheetController";
import type {BinderTabStyle} from "./BinderView";

/** @public */
export interface TabBarControllerObserver<C extends TabBarController = TabBarController> extends BarControllerObserver<C> {
  controllerDidPressTabHandle?(input: PositionGestureInput, event: Event | null, tabController: SheetController, controller: C): void;

  controllerDidLongPressTabHandle?(input: PositionGestureInput, tabController: SheetController, controller: C): void;
}

/** @public */
export class TabBarController extends BarController {
  declare readonly observerType?: Class<TabBarControllerObserver>;

  protected override createLayout(): BarLayout | null {
    const tools = new Array<ToolLayout>();
    tools.push(ToolLayout.create("leftPadding", 0.5, 0, 0, 0));

    const tabControllers = new Array<SheetController>();
    for (const controllerId in this.tabs.controllers) {
      tabControllers.push(this.tabs.controllers[controllerId]!);
    }
    if (this.tabStyle.value === "bottom") {
      for (let i = 0, n = tabControllers.length; i < n; i += 1) {
        const tabController = tabControllers[i]!;
        const tabHandleView = tabController.handle.attachView();
        const tabKey = "tab" + tabHandleView.uid;
        const tabHandleLayout = ToolLayout.create(tabKey, 1, 0, 0, 0.5);
        tools.push(tabHandleLayout);
        const targetTabController = i + 1 < n ? tabControllers[i + 1] : null;
        const targetToolView = targetTabController !== null ? tabController.handle.view : null;
        tabController.handle.insertView(this.bar.view, void 0, targetToolView, tabKey);
      }
    }

    tools.push(ToolLayout.create("rightPadding", 0.5, 0, 0, 1));
    return BarLayout.create(tools);
  }

  @TraitViewControllerSet({
    controllerType: SheetController,
    ordered: true,
    inherits: true,
    observes: true,
    getTraitViewRef(tabController: SheetController): TraitViewRef<unknown, Trait, SheetView> {
      return tabController.sheet;
    },
    willAttachController(tabController: SheetController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    didDetachController(tabController: SheetController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    controllerWillAttachHandle(tabHandleController: ToolController, tabController: SheetController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    controllerDidDetachHandle(tabHandleController: ToolController, tabController: SheetController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    controllerDidPressHandle(input: PositionGestureInput, event: Event | null, tabController: SheetController): void {
      this.owner.callObservers("controllerDidPressTabHandle", input, event, tabController, this.owner);
    },
    controllerDidLongPressHandle(input: PositionGestureInput, tabController: SheetController): void {
      this.owner.callObservers("controllerDidLongPressTabHandle", input, tabController, this.owner);
    },
  })
  readonly tabs!: TraitViewControllerSet<this, Trait, SheetView, SheetController> & Observes<SheetController>;

  @TraitViewControllerRef({
    controllerType: SheetController,
    inherits: true,
    observes: true,
    getTraitViewRef(activeController: SheetController): TraitViewRef<unknown, Trait, SheetView> {
      return activeController.sheet;
    },
    willAttachController(activeController: SheetController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    didDetachController(activeController: SheetController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    controllerWillAttachHandle(tabHandleController: ToolController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    controllerDidDetachHandle(tabHandleController: ToolController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
  })
  readonly active!: TraitViewControllerRef<this, Trait, SheetView, SheetController> & Observes<SheetController>;

  @Property({
    valueType: String,
    value: "none",
    inherits: true,
    didSetValue(tabStyle: BinderTabStyle): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
  })
  readonly tabStyle!: Property<this, BinderTabStyle>;
}
