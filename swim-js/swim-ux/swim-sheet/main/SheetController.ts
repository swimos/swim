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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import {Objects} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Like} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import type {Trait} from "@swim/model";
import {Look} from "@swim/theme";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {ControllerRef} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import {ToolLayout} from "@swim/toolbar";
import type {ToolView} from "@swim/toolbar";
import {TitleToolView} from "@swim/toolbar";
import {ButtonToolView} from "@swim/toolbar";
import {ToolController} from "@swim/toolbar";
import {TitleToolController} from "@swim/toolbar";
import {ButtonToolController} from "@swim/toolbar";
import {SheetView} from "./SheetView";

/** @public */
export interface SheetControllerObserver<C extends SheetController = SheetController> extends ControllerObserver<C> {
  controllerWillAttachSheetTrait?(sheetTrait: Trait, controller: C): void;

  controllerDidDetachSheetTrait?(sheetTrait: Trait, controller: C): void;

  controllerWillAttachSheetView?(sheetView: SheetView, controller: C): void;

  controllerDidDetachSheetView?(sheetView: SheetView, controller: C): void;

  controllerDidScrollSheetView?(sheetView: SheetView, controller: C): void;

  controllerWillAttachBack?(backController: SheetController, controller: C): void;

  controllerDidDetachBack?(backController: SheetController, controller: C): void;

  controllerWillAttachForward?(forwardController: SheetController, controller: C): void;

  controllerDidDetachForward?(forwardController: SheetController, controller: C): void;

  controllerDidSetFullBleed?(fullBleed: boolean, controller: C): void;

  controllerDidSetSearchable?(searchable: boolean, controller: C): void;

  controllerDidSetSearching?(searching: boolean, controller: C): void;

  controllerDidUpdateSearch?(query: string, controller: C): void;

  controllerDidSubmitSearch?(query: string, controller: C): void;

  controllerWillAttachTitle?(titleController: ToolController, controller: C): void;

  controllerDidDetachTitle?(titleController: ToolController, controller: C): void;

  controllerDidPressTitle?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidLongPressTitle?(input: PositionGestureInput, controller: C): void;

  controllerWillAttachHandle?(handleController: ToolController, controller: C): void;

  controllerDidDetachHandle?(handleController: ToolController, controller: C): void;

  controllerDidPressHandle?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidLongPressHandle?(input: PositionGestureInput, controller: C): void;

  controllerWillAttachModeTool?(modeToolController: ToolController, targetToolController: ToolController | null, controller: C): void;

  controllerDidDetachModeTool?(modeToolController: ToolController, controller: C): void;

  controllerWillAttachModeToolView?(modeToolView: ToolView, modeToolController: ToolController, controller: C): void;

  controllerDidDetachModeToolView?(modeToolView: ToolView, modeToolController: ToolController, controller: C): void;

  controllerWillPresentSheetView?(sheetView: SheetView, controller: C): void;

  controllerDidPresentSheetView?(sheetView: SheetView, controller: C): void;

  controllerWillDismissSheetView?(sheetView: SheetView, controller: C): void;

  controllerDidDismissSheetView?(sheetView: SheetView, controller: C): void;
}

/** @public */
export class SheetController extends Controller {
  declare readonly observerType?: Class<SheetControllerObserver>;

  @Property({
    valueType: Boolean,
    value: false,
    didSetValue(fullBleed: boolean): void {
      this.owner.callObservers("controllerDidSetFullBleed", fullBleed, this.owner);
      const sheetView = this.owner.sheet.view;
      if (sheetView !== null) {
        sheetView.fullBleed.setValue(fullBleed, Affinity.Inherited);
      }
    },
  })
  readonly fullBleed!: Property<this, boolean>;

  @Property({
    valueType: Boolean,
    value: false,
    didSetValue(searchable: boolean): void {
      this.owner.callObservers("controllerDidSetSearchable", searchable, this.owner);
    },
  })
  readonly searchable!: Property<this, boolean>;

  @Property({
    valueType: Boolean,
    value: false,
    didSetValue(searching: boolean): void {
      this.owner.callObservers("controllerDidSetSearching", searching, this.owner);
    },
  })
  readonly searching!: Property<this, boolean>;

  updateSearch(query: string, inputView: HtmlView): void {
    // hook
  }

  submitSearch(query: string, inputView: HtmlView): void {
    // hook
  }

  @TraitViewRef({
    willAttachTrait(sheetTrait: Trait): void {
      this.owner.callObservers("controllerWillAttachSheetTrait", sheetTrait, this.owner);
    },
    didDetachTrait(sheetTrait: Trait): void {
      this.owner.callObservers("controllerDidDetachSheetTrait", sheetTrait, this.owner);
    },
    viewType: SheetView,
    observesView: true,
    willAttachView(sheetView: SheetView): void {
      this.owner.callObservers("controllerWillAttachSheetView", sheetView, this.owner);
    },
    didAttachView(sheetView: SheetView): void {
      this.owner.fullBleed.setIntrinsic(sheetView.fullBleed.value);
    },
    didDetachView(sheetView: SheetView): void {
      this.owner.callObservers("controllerDidDetachSheetView", sheetView, this.owner);
    },
    viewDidScroll(sheetView: SheetView): void {
      this.owner.callObservers("controllerDidScrollSheetView", sheetView, this.owner);
    },
    viewDidSetFullBleed(fullBleed: boolean, sheetView: SheetView): void {
      this.owner.fullBleed.setIntrinsic(fullBleed);
    },
    viewWillPresent(sheetView: SheetView): void {
      this.owner.callObservers("controllerWillPresentSheetView", sheetView, this.owner);
    },
    viewDidPresent(sheetView: SheetView): void {
      this.owner.callObservers("controllerDidPresentSheetView", sheetView, this.owner);
    },
    viewWillDismiss(sheetView: SheetView): void {
      this.owner.callObservers("controllerWillDismissSheetView", sheetView, this.owner);
    },
    viewDidDismiss(sheetView: SheetView): void {
      this.owner.callObservers("controllerDidDismissSheetView", sheetView, this.owner);
    },
  })
  readonly sheet!: TraitViewRef<this, Trait, SheetView> & Observes<SheetView>;

  @ControllerRef({
    get controllerType(): typeof SheetController {
      return SheetController;
    },
    binds: false,
    willAttachController(backController: SheetController): void {
      this.owner.callObservers("controllerWillAttachBack", backController, this.owner);
    },
    didDetachController(backController: SheetController): void {
      this.owner.callObservers("controllerDidDetachBack", backController, this.owner);
    },
  })
  readonly back!: ControllerRef<this, SheetController>;

  @ControllerRef({
    get controllerType(): typeof SheetController {
      return SheetController;
    },
    binds: false,
    willAttachController(forwardController: SheetController): void {
      this.owner.callObservers("controllerWillAttachForward", forwardController, this.owner);
    },
    didDetachController(forwardController: SheetController): void {
      this.owner.callObservers("controllerDidDetachForward", forwardController, this.owner);
    },
  })
  readonly forward!: ControllerRef<this, SheetController>;

  @TraitViewControllerRef({
    controllerType: ToolController,
    binds: true,
    observes: true,
    getTraitViewRef(titleController: ToolController): TraitViewRef<unknown, Trait, ToolView> {
      return titleController.tool;
    },
    willAttachController(titleController: ToolController): void {
      this.owner.callObservers("controllerWillAttachTitle", titleController, this.owner);
    },
    didAttachController(titleController: ToolController): void {
      const titleView = titleController.tool.attachView();
      this.attachToolView(titleView, titleController);
    },
    willDetachController(titleController: ToolController): void {
      const titleView = titleController.tool.view;
      if (titleView !== null) {
        this.detachToolView(titleView, titleController);
      }
    },
    didDetachController(titleController: ToolController): void {
      this.owner.callObservers("controllerDidDetachTitle", titleController, this.owner);
    },
    controllerWillAttachToolView(titleView: ToolView, titleController: ToolController): void {
      this.attachToolView(titleView, titleController);
    },
    controllerDidDetachToolView(titleView: ToolView, titleController: ToolController): void {
      this.detachToolView(titleView, titleController);
    },
    attachToolView(titleView: ToolView, titleController: ToolController): void {
      // hook
    },
    detachToolView(titleView: ToolView, titleController: ToolController): void {
      // hook
    },
    controllerDidPressToolView(input: PositionGestureInput, event: Event | null): void {
      this.owner.callObservers("controllerDidPressTitle", input, event, this.owner);
    },
    controllerDidLongPressToolView(input: PositionGestureInput): void {
      this.owner.callObservers("controllerDidLongPressTitle", input, this.owner);
    },
    fromLike(value: ToolController | LikeType<ToolController> | string | undefined): ToolController {
      if (value === void 0 || typeof value === "string") {
        let controller = this.controller;
        if (controller === null) {
          controller = this.createController();
        }
        const view = controller.tool.attachView();
        if (view instanceof TitleToolView) {
          view.content.set(value);
        }
        return controller;
      }
      return super.fromLike(value);
    },
    createController(): ToolController {
      const titleController = TitleToolController.create();
      const titleView = titleController.tool.attachView();
      titleView.style.fontSize.setIntrinsic(14);
      return titleController;
    },
  })
  readonly title!: TraitViewControllerRef<this, Trait, ToolView, Like<ToolController, string | undefined>> & Observes<ToolController> & {
    attachToolView(titleView: ToolView, titleController: ToolController): void,
    detachToolView(titleView: ToolView, titleController: ToolController): void,
  };

  @TraitViewControllerRef({
    controllerType: ToolController,
    binds: true,
    observes: true,
    getTraitViewRef(handleController: ToolController): TraitViewRef<unknown, Trait, ToolView> {
      return handleController.tool;
    },
    init(): void {
      (this as Mutable<typeof this>).active = false;
    },
    initController(handleController: ToolController): void {
      const handleView = this.view;
      if (handleView !== null) {
        this.updateActive(this.active, handleView);
      }
    },
    willAttachController(handleController: ToolController): void {
      this.owner.callObservers("controllerWillAttachHandle", handleController, this.owner);
    },
    didAttachController(handleController: ToolController): void {
      const handleView = handleController.tool.attachView();
      this.attachToolView(handleView, handleController);
    },
    willDetachController(handleController: ToolController): void {
      const handleView = handleController.tool.view;
      if (handleView !== null) {
        this.detachToolView(handleView, handleController);
      }
    },
    didDetachController(handleController: ToolController): void {
      this.owner.callObservers("controllerDidDetachHandle", handleController, this.owner);
    },
    controllerWillAttachToolView(handleView: ToolView, handleController: ToolController): void {
      this.attachToolView(handleView, handleController);
      this.updateActive(this.active, handleView);
    },
    controllerDidDetachToolView(handleView: ToolView, handleController: ToolController): void {
      this.detachToolView(handleView, handleController);
    },
    attachToolView(handleView: ToolView, handleController: ToolController): void {
      // hook
    },
    detachToolView(handleView: ToolView, handleController: ToolController): void {
      // hook
    },
    controllerDidPressToolView(input: PositionGestureInput, event: Event | null): void {
      this.owner.callObservers("controllerDidPressHandle", input, event, this.owner);
    },
    controllerDidLongPressToolView(input: PositionGestureInput): void {
      this.owner.callObservers("controllerDidLongPressHandle", input, this.owner);
    },
    setActive(active: boolean): void {
      (this as Mutable<typeof this>).active = active;
      const handleView = this.view;
      if (handleView !== null) {
        this.updateActive(active, handleView);
      }
    },
    updateActive(active: boolean, handleView: ToolView): void {
      if (handleView instanceof ButtonToolView) {
        const timing = !handleView.inserting ? handleView.getLook(Look.timing) : false;
        if (active) {
          handleView.iconColor.setIntrinsic(Look.accentColor, timing);
        } else {
          handleView.iconColor.setIntrinsic(Look.iconColor, timing);
        }
      }
    },
    setIcon(icon: Graphics | null): void {
      const handleController = this.insertController() as ButtonToolController;
      const handleView = handleController.tool.attachView();
      handleView.graphics.setIntrinsic(icon);
    },
    createController(): ToolController {
      const handleController = ButtonToolController.create();
      const toolLayout = ToolLayout.create("", 0, 0, 36);
      handleController.layout.set(toolLayout);
      const handleView = handleController.tool.attachView();
      handleView.iconLayout.setIntrinsic({width: 24, height: 24});
      return handleController;
    },
  })
  readonly handle!: TraitViewControllerRef<this, Trait, ToolView, ToolController> & Observes<ToolController> & Observes<ButtonToolController> & {
    readonly active: boolean;
    attachToolView(handleView: ToolView, handleController: ToolController): void,
    detachToolView(handleView: ToolView, handleController: ToolController): void,
    setActive(active: boolean): void,
    updateActive(active: boolean, handleView: ToolView): void,
    setIcon(icon: Graphics | null): void,
  };

  @TraitViewControllerSet({
    controllerType: ToolController,
    binds: false,
    ordered: true,
    observes: true,
    getTraitViewRef(modeToolController: ToolController): TraitViewRef<unknown, Trait, ToolView> {
      return modeToolController.tool;
    },
    willAttachController(modeToolController: ToolController): void {
      let targetToolController: ToolController | null | undefined = Objects.getNextValue(this.controllers, modeToolController.uid);
      if (targetToolController === void 0) {
        targetToolController = null;
      }
      this.owner.callObservers("controllerWillAttachModeTool", modeToolController, targetToolController, this.owner);
    },
    didAttachController(modeToolController: ToolController): void {
      const modeToolView = modeToolController.tool.attachView();
      this.attachToolView(modeToolView, modeToolController);
    },
    willDetachController(modeToolController: ToolController): void {
      const modeToolView = modeToolController.tool.view;
      if (modeToolView !== null) {
        this.detachToolView(modeToolView, modeToolController);
      }
    },
    didDetachController(modeToolController: ToolController): void {
      this.owner.callObservers("controllerDidDetachModeTool", modeToolController, this.owner);
    },
    controllerWillAttachToolView(modeToolView: ToolView, modeToolController: ToolController): void {
      this.owner.callObservers("controllerWillAttachModeToolView", modeToolView, modeToolController, this.owner);
      this.attachToolView(modeToolView, modeToolController);
    },
    controllerDidDetachToolView(modeToolView: ToolView, modeToolController: ToolController): void {
      this.detachToolView(modeToolView, modeToolController);
      this.owner.callObservers("controllerDidDetachModeToolView", modeToolView, modeToolController, this.owner);
    },
    attachToolView(modeToolView: ToolView, modeToolController: ToolController): void {
      // hook
    },
    detachToolView(modeToolView: ToolView, modeToolController: ToolController): void {
      // hook
    },
  })
  readonly modeTools!: TraitViewControllerSet<this, Trait, ToolView, ToolController> & Observes<ToolController> & {
    attachToolView(modeToolView: ToolView, modeToolController: ToolController): void,
    detachToolView(modeToolView: ToolView, modeToolController: ToolController): void,
  };
}
