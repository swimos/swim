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

import {Mutable, Class, Objects, Observes} from "@swim/util";
import {Affinity, FastenerClass, Property} from "@swim/component";
import type {Trait} from "@swim/model";
import {Look} from "@swim/theme";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import {
  Controller,
  ControllerRef,
  TraitViewRef,
  TraitViewControllerRef,
  TraitViewControllerSet,
} from "@swim/controller";
import {
  ToolLayout,
  ToolView,
  ButtonToolView,
  ToolController,
  TitleToolController,
  ButtonToolController,
} from "@swim/toolbar";
import {SheetView} from "./SheetView";
import type {SheetControllerObserver} from "./SheetControllerObserver";

/** @public */
export class SheetController extends Controller {
  override readonly observerType?: Class<SheetControllerObserver>;

  @Property<SheetController["fullBleed"]>({
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

  @Property<SheetController["searchable"]>({
    valueType: Boolean,
    value: false,
    didSetValue(searchable: boolean): void {
      this.owner.callObservers("controllerDidSetSearchable", searchable, this.owner);
    },
  })
  readonly searchable!: Property<this, boolean>;

  @Property<SheetController["searching"]>({
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

  @TraitViewRef<SheetController["sheet"]>({
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
      this.owner.fullBleed.setValue(sheetView.fullBleed.value, Affinity.Intrinsic);
    },
    didDetachView(sheetView: SheetView): void {
      this.owner.callObservers("controllerDidDetachSheetView", sheetView, this.owner);
    },
    viewDidScroll(sheetView: SheetView): void {
      this.owner.callObservers("controllerDidScrollSheetView", sheetView, this.owner);
    },
    viewWillAttachBack(backView: SheetView): void {
      this.owner.callObservers("controllerWillAttachBackView", backView, this.owner);
    },
    viewDidDetachBack(backView: SheetView): void {
      this.owner.callObservers("controllerDidDetachBackView", backView, this.owner);
    },
    viewWillAttachForward(forwardView: SheetView): void {
      this.owner.callObservers("controllerWillAttachForwardView", forwardView, this.owner);
    },
    viewDidDetachForward(forwardView: SheetView): void {
      this.owner.callObservers("controllerDidDetachForwardView", forwardView, this.owner);
    },
    viewDidSetFullBleed(fullBleed: boolean, sheetView: SheetView): void {
      this.owner.fullBleed.setValue(fullBleed, Affinity.Intrinsic);
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
  static readonly sheet: FastenerClass<SheetController["sheet"]>;

  @ControllerRef<SheetController["back"]>({
    controllerType: SheetController,
    binds: false,
    willAttachController(backController: SheetController): void {
      this.owner.callObservers("controllerWillAttachBack", backController, this.owner);
    },
    didDetachController(backController: SheetController): void {
      this.owner.callObservers("controllerDidDetachBack", backController, this.owner);
    },
  })
  readonly back!: ControllerRef<this, SheetController>;
  static readonly back: FastenerClass<SheetController["back"]>;

  @ControllerRef<SheetController["forward"]>({
    controllerType: SheetController,
    binds: false,
    willAttachController(forwardController: SheetController): void {
      this.owner.callObservers("controllerWillAttachForward", forwardController, this.owner);
    },
    didDetachController(forwardController: SheetController): void {
      this.owner.callObservers("controllerDidDetachForward", forwardController, this.owner);
    },
  })
  readonly forward!: ControllerRef<this, SheetController>;
  static readonly forward: FastenerClass<SheetController["forward"]>;

  @TraitViewControllerRef<SheetController["title"]>({
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
      const titleView = titleController.tool.view;
      if (titleView !== null) {
        this.attachToolView(titleView, titleController);
      }
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
    setText(title: string | undefined): ToolView {
      let titleController = this.controller as TitleToolController | null;
      if (titleController === null) {
        titleController = this.createController() as TitleToolController;
        this.setController(titleController);
      }
      const titleView = titleController.tool.attachView();
      titleView.content.setText(title);
      return titleView;
    },
    createController(): ToolController {
      const titleController = TitleToolController.create();
      const titleView = titleController.tool.attachView();
      titleView.fontSize.setState(14, Affinity.Intrinsic);
      return titleController;
    },
  })
  readonly title!: TraitViewControllerRef<this, Trait, ToolView, ToolController> & Observes<ToolController> & {
    attachToolView(titleView: ToolView, titleController: ToolController): void,
    detachToolView(titleView: ToolView, titleController: ToolController): void,
    setText(title: string | undefined): ToolView,
  };
  static readonly title: FastenerClass<SheetController["title"]>;

  @TraitViewControllerRef<SheetController["handle"]>({
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
      const handleView = handleController.tool.view;
      if (handleView !== null) {
        this.attachToolView(handleView, handleController);
      }
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
          handleView.iconColor.setLook(Look.accentColor, timing, Affinity.Intrinsic);
        } else {
          handleView.iconColor.setLook(Look.iconColor, timing, Affinity.Intrinsic);
        }
      }
    },
    setIcon(icon: Graphics | null): void {
      let handleController = this.controller as ButtonToolController | null;
      if (handleController === null) {
        handleController = this.createController() as ButtonToolController;
        this.setController(handleController);
      }
      const handleView = handleController.tool.attachView();
      handleView.graphics.setState(icon, Affinity.Intrinsic);
    },
    createController(): ToolController {
      const handleController = ButtonToolController.create();
      const toolLayout = ToolLayout.create("", 0, 0, 36);
      handleController.layout.setValue(toolLayout);
      const handleView = handleController.tool.attachView();
      handleView.iconWidth.setState(24, Affinity.Intrinsic);
      handleView.iconHeight.setState(24, Affinity.Intrinsic);
      return handleController;
    },
  })
  readonly handle!: TraitViewControllerRef<this, Trait, ToolView, ToolController> & Observes<ToolController & ButtonToolController> & {
    readonly active: boolean;
    attachToolView(handleView: ToolView, handleController: ToolController): void,
    detachToolView(handleView: ToolView, handleController: ToolController): void,
    setActive(active: boolean): void,
    updateActive(active: boolean, handleView: ToolView): void,
    setIcon(icon: Graphics | null): void,
  };
  static readonly handle: FastenerClass<SheetController["handle"]>;

  @TraitViewControllerSet<SheetController["modeTools"]>({
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
      const modeToolView = modeToolController.tool.view;
      if (modeToolView !== null) {
        this.attachToolView(modeToolView, modeToolController);
      }
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
  static readonly modeTools: FastenerClass<SheetController["modeTools"]>;
}
