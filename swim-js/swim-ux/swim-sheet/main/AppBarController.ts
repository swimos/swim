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

import {Lazy} from "@swim/util";
import type {Class} from "@swim/util";
import type {Observes} from "@swim/util";
import {Property} from "@swim/component";
import type {Trait} from "@swim/model";
import {Look} from "@swim/theme";
import {Mood} from "@swim/theme";
import type {PositionGestureInput} from "@swim/view";
import {VectorIcon} from "@swim/graphics";
import {Controller} from "@swim/controller";
import type {TraitViewRef} from "@swim/controller";
import {TraitViewControllerRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import {ToolLayout} from "@swim/toolbar";
import {BarLayout} from "@swim/toolbar";
import type {ToolView} from "@swim/toolbar";
import {ToolController} from "@swim/toolbar";
import {ButtonToolView} from "@swim/toolbar";
import {ButtonToolController} from "@swim/toolbar";
import type {BarView} from "@swim/toolbar";
import type {BarControllerObserver} from "@swim/toolbar";
import {BarController} from "@swim/toolbar";
import type {SheetView} from "./SheetView";
import {SheetController} from "./SheetController";

/** @public */
export interface AppBarControllerObserver<C extends AppBarController = AppBarController> extends BarControllerObserver<C> {
  controllerDidPressMenuButton?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidPressActionButton?(input: PositionGestureInput, event: Event | null, controller: C): void;
}

/** @public */
export class AppBarController extends BarController {
  declare readonly observerType?: Class<AppBarControllerObserver>;

  protected override createLayout(): BarLayout | null {
    const tools = new Array<ToolLayout>();

    const menuButtonController = this.menuButton.controller;
    if (menuButtonController !== null) {
      const menuButtonLayout = menuButtonController.layout.value;
      if (menuButtonLayout !== null) {
        tools.push(menuButtonLayout);
      }
      if (menuButtonController.tool.view !== null) {
        this.menuButton.insertView();
      }
    }

    const modeToolControllers = new Array<ToolController>();
    for (const controllerId in this.modeTools.controllers) {
      modeToolControllers.push(this.modeTools.controllers[controllerId]!);
    }
    const modeToolCount = modeToolControllers.length;

    for (let i = 0; i < modeToolCount; i += 1) {
      const modeToolController = modeToolControllers[i]!;
      let modeToolLayout = modeToolController.layout.value;
      if (modeToolLayout !== null) {
        const modeToolKey = "mode" + modeToolController.uid;
        modeToolLayout = modeToolLayout.withKey(modeToolKey);
        modeToolLayout = modeToolLayout.withPresence(void 0, null, null);
        tools.push(modeToolLayout);
        if (modeToolController.tool.view !== null) {
          const targetToolController = i + 1 < modeToolCount ? modeToolControllers[i + 1] : null;
          const targetToolView = targetToolController !== null ? modeToolController.tool.view : null;
          modeToolController.tool.insertView(this.bar.view, void 0, targetToolView, modeToolKey);
        }
      }
    }

    if (modeToolCount !== 0) {
      tools.push(ToolLayout.create("coverPadding", 0, 0, 12));
    }

    const coverLayout = ToolLayout.create("cover", 1, 0, 0, 0);
    tools.push(coverLayout);
    const coverController = this.cover.controller;
    if (coverController !== null) {
      const coverTitleView = coverController.title.insertView(this.bar.view, void 0, void 0, "cover");
      if (coverTitleView !== null) {
        const timing = coverTitleView.getLookOr(Look.timing, Mood.navigating, false);
        coverTitleView.style.color.setIntrinsic(Look.textColor, timing);
        coverTitleView.style.zIndex.setIntrinsic(1);
      }
    }

    const actionButtonController = this.actionButton.controller;
    if (actionButtonController !== null) {
      const actionButtonLayout = actionButtonController.layout.value;
      if (actionButtonLayout !== null) {
        tools.push(actionButtonLayout);
      }
      if (actionButtonController.tool.view !== null) {
        this.actionButton.insertView();
      }
    }

    return BarLayout.create(tools);
  }

  @TraitViewControllerRef({
    controllerType: ToolController,
    binds: true,
    viewKey: "menuButton",
    observes: true,
    get parentView(): BarView | null {
      return this.owner.bar.view;
    },
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, Trait, ToolView> {
      return toolController.tool;
    },
    controllerDidPressToolView(input: PositionGestureInput, event: Event | null): void {
      this.owner.callObservers("controllerDidPressMenuButton", input, event, this.owner);
    },
    createController(): ToolController {
      const toolController = new ButtonToolController();
      const toolLayout = ToolLayout.create(this.viewKey!, 0, 0, 48);
      toolController.layout.set(toolLayout);
      const toolView = toolController.tool.attachView();
      toolView.iconLayout.setIntrinsic({width: 24, height: 24});
      if (this.owner.fullScreen.value) {
        toolView.graphics.setIntrinsic(this.owner.menuIcon);
      } else {
        toolView.graphics.setIntrinsic(this.owner.menuCloseIcon);
      }
      return toolController;
    },
  })
  readonly menuButton!: TraitViewControllerRef<this, Trait, ToolView, ToolController> & Observes<ButtonToolController>;

  @TraitViewControllerRef({
    controllerType: ToolController,
    binds: true,
    viewKey: "actionButton",
    observes: true,
    get parentView(): BarView | null {
      return this.owner.bar.view;
    },
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, Trait, ToolView> {
      return toolController.tool;
    },
    controllerDidPressToolView(input: PositionGestureInput, event: Event | null): void {
      this.owner.callObservers("controllerDidPressActionButton", input, event, this.owner);
    },
    createController(): ToolController {
      const toolController = new ButtonToolController();
      const toolLayout = ToolLayout.create(this.viewKey!, 0, 0, 48);
      toolController.layout.set(toolLayout);
      const toolView = toolController.tool.attachView();
      toolView.iconLayout.setIntrinsic({width: 24, height: 24});
      toolView.graphics.setIntrinsic(this.owner.actionIcon);
      return toolController;
    },
  })
  readonly actionButton!: TraitViewControllerRef<this, Trait, ToolView, ToolController> & Observes<ButtonToolController>;

  @TraitViewControllerRef({
    controllerType: SheetController,
    inherits: true,
    observes: true,
    getTraitViewRef(coverController: SheetController): TraitViewRef<unknown, Trait, SheetView> {
      return coverController.sheet;
    },
    willAttachController(coverController: SheetController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    didDetachController(coverController: SheetController): void {
      if (coverController.back.controller === null && coverController.forward.controller === null) {
        this.owner.requireUpdate(Controller.NeedsAssemble);
      }
    },
    controllerWillAttachTitle(titleController: ToolController, coverController: SheetController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    controllerDidDetachTitle(titleController: ToolController, coverController: SheetController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
  })
  readonly cover!: TraitViewControllerRef<this, Trait, SheetView, SheetController> & Observes<SheetController>;

  @TraitViewControllerSet({
    controllerType: ToolController,
    ordered: true,
    inherits: true,
    observes: true,
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, Trait, ToolView> {
      return toolController.tool;
    },
    willAttachController(toolController: ToolController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    didDetachController(toolController: ToolController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    controllerWillAttachToolView(toolView: ToolView, toolController: ToolController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    controllerDidDetachToolView(toolView: ToolView, toolController: ToolController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
  })
  readonly modeTools!: TraitViewControllerSet<this, Trait, ToolView, ToolController> & Observes<ToolController>;

  @Property({
    valueType: Boolean,
    value: false,
    inherits: true,
    didSetValue(fullScreen: boolean): void {
      const toolView = this.owner.menuButton.view;
      if (toolView instanceof ButtonToolView) {
        if (fullScreen) {
          toolView.graphics.setIntrinsic(this.owner.menuIcon);
        } else {
          toolView.graphics.setIntrinsic(this.owner.menuCloseIcon);
        }
      }
    },
  })
  readonly fullScreen!: Property<this, boolean>;

  get menuIcon(): VectorIcon {
    return AppBarController.menuIcon;
  }

  get menuCloseIcon(): VectorIcon {
    return AppBarController.menuCloseIcon;
  }

  get actionIcon(): VectorIcon {
    return AppBarController.actionIcon;
  }

  /** @internal */
  @Lazy
  static get menuIcon(): VectorIcon {
    return VectorIcon.create(24, 24, "M19,3C20.1,3,21,3.9,21,5L21,19C21,20.1,20.1,21,19,21L5,21C3.9,21,3,20.1,3,19L3,5C3,3.9,3.9,3,5,3L19,3ZM9,5L6,5C5.49,5,5.06,5.39,5.01,5.88L5,6L5,18C5,18.51,5.39,18.94,5.88,18.99L6,19L9,19L9,5ZM18,5L11,5L11,19L18,19C18.51,19,18.94,18.61,18.99,18.12L19,18L19,6C19,5.49,18.61,5.06,18.12,5.01L18,5ZM8,11L8,12L6,12L6,11L8,11ZM8,9L8,10L6,10L6,9L8,9ZM8,7L8,8L6,8L6,7L8,7Z");
  }

  /** @internal */
  @Lazy
  static get menuCloseIcon(): VectorIcon {
    return VectorIcon.create(24, 24, "M19,3C20.1,3,21,3.9,21,5L21,19C21,20.1,20.1,21,19,21L5,21C3.9,21,3,20.1,3,19L3,5C3,3.9,3.9,3,5,3L19,3ZM9,5L6,5C5.49,5,5.06,5.39,5.01,5.88L5,6L5,18C5,18.51,5.39,18.94,5.88,18.99L6,19L9,19L9,5ZM18,5L11,5L11,19L18,19C18.51,19,18.94,18.61,18.99,18.12L19,18L19,6C19,5.49,18.61,5.06,18.12,5.01L18,5ZM8,11L8,12L6,12L6,11L8,11ZM8,9L8,10L6,10L6,9L8,9ZM8,7L8,8L6,8L6,7L8,7Z");
  }

  /** @internal */
  @Lazy
  static get actionIcon(): VectorIcon {
    return VectorIcon.create(24, 24, "M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z");
  }
}
