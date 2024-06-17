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
import type {TimingLike} from "@swim/util";
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import type {Trait} from "@swim/model";
import type {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import type {ToolView} from "@swim/toolbar";
import {ToolController} from "@swim/toolbar";
import {SearchToolController} from "@swim/toolbar";
import type {BarView} from "@swim/toolbar";
import {BarController} from "@swim/toolbar";
import {DrawerView} from "@swim/window";
import type {SheetView} from "./SheetView";
import {SheetController} from "./SheetController";
import {NavBarController} from "./NavBarController";
import type {StackView} from "./StackView";
import type {StackControllerObserver} from "./StackController";
import {StackController} from "./StackController";
import {AppBarController} from "./AppBarController";
import type {FolioStyle} from "./FolioView";
import {FolioView} from "./FolioView";

/** @public */
export interface FolioControllerObserver<C extends FolioController = FolioController> extends StackControllerObserver<C> {
  controllerWillAttachFolioTrait?(folioTrait: Trait, controller: C): void;

  controllerDidDetachFolioTrait?(folioTrait: Trait, controller: C): void;

  controllerWillAttachFolioView?(folioView: FolioView, controller: C): void;

  controllerDidDetachFolioView?(folioView: FolioView, controller: C): void;

  controllerDidSetFolioStyle(folioStyle: FolioStyle | undefined, controller: C): void;

  controllerDidSetFullBleed(fullBleed: boolean, controller: C): void;

  controllerDidSetFullScreen(fullScreen: boolean, controller: C): void;

  controllerWillAttachAppBar?(appBarController: BarController, controller: C): void;

  controllerDidDetachAppBar?(appBarController: BarController, controller: C): void;

  controllerWillAttachAppBarView?(appBarView: BarView, controller: C): void;

  controllerDidDetachAppBarView?(appBarView: BarView, controller: C): void;

  controllerWillAttachDrawerView?(drawerView: DrawerView, controller: C): void;

  controllerDidDetachDrawerView?(drawerView: DrawerView, controller: C): void;

  controllerDidPressMenuButton?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidPressActionButton?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerWillAttachCover?(coverController: SheetController, controller: C): void;

  controllerDidDetachCover?(coverController: SheetController, controller: C): void;

  controllerWillAttachCoverTrait?(coverTrait: Trait, controller: C): void;

  controllerDidDetachCoverTrait?(coverTrait: Trait, controller: C): void;

  controllerWillAttachCoverView?(coverView: SheetView, controller: C): void;

  controllerDidDetachCoverView?(coverView: SheetView, controller: C): void;

  controllerWillAttachCoverModeTool?(modeToolController: ToolController, controller: C): void;

  controllerDidDetachCoverModeTool?(modeToolController: ToolController, controller: C): void;

  controllerWillAttachCoverModeToolView?(modeToolView: ToolView, modeToolController: ToolController, controller: C): void;

  controllerDidDetachCoverModeToolView?(modeToolView: ToolView, modeToolController: ToolController, controller: C): void;
}

/** @public */
export class FolioController extends StackController {
  declare readonly observerType?: Class<FolioControllerObserver>;

  @Property({
    valueType: String,
    didSetValue(folioStyle: FolioStyle | undefined): void {
      const coverController = this.owner.cover.controller;
      if (coverController !== null) {
        if (folioStyle === "stacked") {
          this.owner.sheets.attachController(coverController);
        } else if (folioStyle === "unstacked") {
          if (this.owner.cover.view !== null) {
            this.owner.cover.insertView(this.owner.folio.view);
          }
          this.owner.sheets.detachController(coverController);
        }
      }

      const stackView = this.owner.stack.view;
      if (stackView !== null) {
        this.owner.stack.updateFolioStyle(folioStyle, stackView);
      }
      const navBarController = this.owner.navBar.controller;
      if (navBarController !== null) {
        this.owner.navBar.updateFolioStyle(folioStyle, navBarController);
      }
      const appBarController = this.owner.appBar.controller;
      if (appBarController !== null) {
        this.owner.appBar.updateFolioStyle(folioStyle, appBarController);
      }
      const sheetControllers = this.owner.sheets.controllers;
      for (const controllerId in sheetControllers) {
        const sheetController = sheetControllers[controllerId]!;
        const sheetView = sheetController.sheet.view;
        if (sheetView !== null) {
          this.owner.sheets.updateFolioStyle(folioStyle, sheetView, sheetController);
        }
      }
      this.owner.callObservers("controllerDidSetFolioStyle", folioStyle, this.owner);
      const folioView = this.owner.folio.view;
      if (folioView !== null) {
        folioView.folioStyle.setValue(folioStyle, Affinity.Inherited);
      }
    },
  })
  readonly folioStyle!: Property<this, FolioStyle | undefined>;

  @Property({
    valueType: Boolean,
    value: false,
    didSetValue(fullBleed: boolean): void {
      const drawerView = this.owner.drawer.view;
      if (drawerView !== null) {
        this.owner.drawer.updateFullBleed(fullBleed, drawerView);
      }
      const stackView = this.owner.stack.view;
      if (stackView !== null) {
        this.owner.stack.updateFullBleed(fullBleed, stackView);
      }
      const sheetControllers = this.owner.sheets.controllers;
      for (const controllerId in sheetControllers) {
        const sheetController = sheetControllers[controllerId]!;
        const sheetView = sheetController.sheet.view;
        if (sheetView !== null) {
          this.owner.sheets.updateFullBleed(fullBleed, sheetView, sheetController);
        }
      }
      this.owner.callObservers("controllerDidSetFullBleed", fullBleed, this.owner);
      const folioView = this.owner.folio.view;
      if (folioView !== null) {
        folioView.fullBleed.setValue(fullBleed, Affinity.Inherited);
      }
    },
  })
  readonly fullBleed!: Property<this, boolean>;

  @Property({
    valueType: Boolean,
    value: false,
    didSetValue(fullScreen: boolean): void {
      const drawerView = this.owner.drawer.view;
      if (drawerView !== null) {
        if (fullScreen) {
          drawerView.dismiss();
        } else {
          drawerView.present();
        }
      }
      this.owner.callObservers("controllerDidSetFullScreen", fullScreen, this.owner);
    },
  })
  readonly fullScreen!: Property<this, boolean>;

  @TraitViewRef({
    willAttachTrait(folioTrait: Trait): void {
      this.owner.callObservers("controllerWillAttachFolioTrait", folioTrait, this.owner);
    },
    didDetachTrait(folioTrait: Trait): void {
      this.owner.callObservers("controllerDidDetachFolioTrait", folioTrait, this.owner);
    },
    viewType: FolioView,
    observesView: true,
    initView(folioView: FolioView): void {
      const appBarController = this.owner.appBar.controller;
      if (appBarController !== null) {
        appBarController.bar.attachView();
        if (folioView.appBar.view === null) {
          folioView.appBar.setView(appBarController.bar.view);
        }
      }
      const coverController = this.owner.cover.controller;
      if (coverController !== null) {
        folioView.cover.setView(coverController.sheet.view);
      }
    },
    willAttachView(folioView: FolioView): void {
      this.owner.callObservers("controllerWillAttachFolioView", folioView, this.owner);
    },
    didAttachView(folioView: FolioView): void {
      this.owner.folioStyle.setIntrinsic(folioView.folioStyle.value);
      this.owner.fullBleed.setIntrinsic(folioView.fullBleed.value);
      this.owner.drawer.setView(folioView.drawer.attachView());
      this.owner.stack.setView(folioView.stack.attachView());
    },
    willDetachView(folioView: FolioView): void {
      this.owner.stack.setView(null);
      this.owner.drawer.setView(null);
    },
    didDetachView(folioView: FolioView): void {
      this.owner.callObservers("controllerDidDetachFolioView", folioView, this.owner);
    },
    viewDidSetFolioStyle(folioStyle: FolioStyle | undefined, folioView: FolioView): void {
      this.owner.folioStyle.setIntrinsic(folioStyle);
    },
    viewDidSetFullBleed(fullBleed: boolean, folioView: FolioView): void {
      this.owner.fullBleed.setIntrinsic(fullBleed);
    },
    viewWillAttachDrawer(drawerView: DrawerView): void {
      this.owner.drawer.setView(drawerView);
    },
    viewDidDetachDrawer(drawerView: DrawerView): void {
      this.owner.drawer.setView(null);
    },
    viewWillAttachAppBar(appBarView: BarView): void {
      const appBarController = this.owner.appBar.controller;
      if (appBarController !== null) {
        appBarController.bar.setView(appBarView);
      }
    },
    viewDidDetachAppBar(appBarView: BarView): void {
      const appBarController = this.owner.appBar.controller;
      if (appBarController !== null) {
        appBarController.bar.setView(null);
      }
    },
  })
  readonly folio!: TraitViewRef<this, Trait, FolioView> & Observes<FolioView>;

  @TraitViewRef({
    extends: true,
    didAttachView(stackView: StackView, targetView: View | null): void {
      super.didAttachView(stackView, targetView);
      this.updateFolioStyle(this.owner.folioStyle.value, stackView);
      this.updateFullBleed(this.owner.fullBleed.value, stackView);
    },
    updateFolioStyle(folioStyle: FolioStyle | undefined, stackView: StackView): void {
      // hook
    },
    updateFullBleed(fullBleed: boolean, stackView: StackView): void {
      // hook
    },
  })
  override readonly stack!: TraitViewRef<this, Trait, StackView> & StackController["stack"] & {
    updateFolioStyle(folioStyle: FolioStyle | undefined, stackView: StackView): void;
    updateFullBleed(fullBleed: boolean, stackView: StackView): void;
  };

  @TraitViewControllerSet({
    extends: true,
    attachSheetView(sheetView: SheetView, sheetController: SheetController): void {
      super.attachSheetView(sheetView, sheetController);
      this.updateFolioStyle(this.owner.folioStyle.value, sheetView, sheetController);
      this.updateFullBleed(this.owner.fullBleed.value, sheetView, sheetController);
    },
    updateFolioStyle(folioStyle: FolioStyle | undefined, sheetView: SheetView, sheetController: SheetController): void {
      // hook
    },
    updateFullBleed(fullBleed: boolean, sheetView: SheetView, sheetController: SheetController): void {
      // hook
    },
  })
  override readonly sheets!: TraitViewControllerSet<this, Trait, SheetView, SheetController> & StackController["sheets"] & {
    updateFolioStyle(folioStyle: FolioStyle | undefined, sheetView: SheetView, sheetController: SheetController): void,
    updateFullBleed(fullBleed: boolean, sheetView: SheetView, sheetController: SheetController): void,
  };

  @TraitViewControllerRef({
    extends: true,
    initController(navBarController: BarController): void {
      super.initController(navBarController);
      this.updateFolioStyle(this.owner.folioStyle.value, navBarController);
    },
    updateFolioStyle(folioStyle: FolioStyle | undefined, navBarController: BarController): void {
      // hook
    },
    controllerDidPressSearchButton(input: PositionGestureInput, event: Event | null, navBarController: BarController): void {
      const frontController = this.owner.front.controller;
      if (frontController !== null) {
        frontController.searching.set(true);
      }
      if (navBarController instanceof NavBarController) {
        const searchInputController = navBarController.searchInput.controller;
        if (searchInputController instanceof SearchToolController) {
          const inputView = searchInputController.input.view;
          if (inputView !== null) {
            inputView.node.focus();
          }
        }
      }
    },
    controllerDidUpdateSearch(query: string, inputView: HtmlView, navBarController: BarController): void {
      const frontController = this.owner.front.controller;
      if (frontController !== null) {
        frontController.updateSearch(query, inputView);
      }
    },
    controllerDidSubmitSearch(query: string, inputView: HtmlView, navBarController: BarController): void {
      const frontController = this.owner.front.controller;
      if (frontController !== null) {
        frontController.submitSearch(query, inputView);
      }
    },
    controllerDidCancelSearch(inputView: HtmlView | null, navBarController: BarController): void {
      const frontController = this.owner.front.controller;
      if (frontController !== null) {
        frontController.searching.set(false);
      }
    },
  })
  override readonly navBar!: TraitViewControllerRef<this, Trait, BarView, BarController> & StackController["navBar"] & {
    updateFolioStyle(folioStyle: FolioStyle | undefined, navBarController: BarController): void,
  };

  protected didPressMenuButton(input: PositionGestureInput, event: Event | null): void {
    this.fullScreen.setIntrinsic(!this.fullScreen.value);
    this.callObservers("controllerDidPressMenuButton", input, event, this);
  }

  protected didPressActionButton(input: PositionGestureInput, event: Event | null): void {
    this.callObservers("controllerDidPressActionButton", input, event, this);
  }

  @TraitViewControllerRef({
    controllerType: BarController,
    binds: true,
    observes: true,
    get parentView(): FolioView | null {
      return this.owner.folio.view;
    },
    getTraitViewRef(appBarController: BarController): TraitViewRef<unknown, Trait, BarView> {
      return appBarController.bar;
    },
    initController(appBarController: BarController): void {
      appBarController.bar.attachView();
    },
    willAttachController(appBarController: BarController): void {
      this.owner.callObservers("controllerWillAttachAppBar", appBarController, this.owner);
    },
    didAttachController(appBarController: BarController): void {
      const appBarView = appBarController.bar.view;
      if (appBarView !== null) {
        this.attachAppBarView(appBarView, appBarController);
      }
    },
    willDetachController(appBarController: BarController): void {
      const appBarView = appBarController.bar.view;
      if (appBarView !== null) {
        this.detachAppBarView(appBarView, appBarController);
      }
    },
    didDetachController(appBarController: BarController): void {
      this.owner.callObservers("controllerDidDetachAppBar", appBarController, this.owner);
    },
    controllerWillAttachBarView(appBarView: BarView, appBarController: BarController): void {
      this.owner.callObservers("controllerWillAttachAppBarView", appBarView, this.owner);
      this.attachAppBarView(appBarView, appBarController);
    },
    controllerDidDetachBarView(appBarView: BarView, appBarController: BarController): void {
      this.detachAppBarView(appBarView, appBarController);
      this.owner.callObservers("controllerDidDetachAppBarView", appBarView, this.owner);
    },
    attachAppBarView(appBarView: BarView, appBarController: BarController): void {
      const folioView = this.owner.folio.view;
      if (folioView !== null && folioView.appBar.view === null) {
        folioView.appBar.setView(appBarView);
      }
      const coverView = this.owner.cover.view;
      if (coverView !== null) {
        this.coverViewDidScroll(coverView, appBarController);
      }
    },
    detachAppBarView(appBarView: BarView, appBarController: BarController): void {
      appBarView.remove();
    },
    updateFolioStyle(folioStyle: FolioStyle | undefined, appBarController: BarController): void {
      appBarController.updateLayout();
    },
    coverViewDidScroll(coverView: SheetView, appBarController: BarController): void {
      // hook
    },
    controllerDidPressMenuButton(input: PositionGestureInput, event: Event | null): void {
      this.owner.didPressMenuButton(input, event);
    },
    controllerDidPressActionButton(input: PositionGestureInput, event: Event | null): void {
      this.owner.didPressActionButton(input, event);
    },
    createController(): BarController {
      return new AppBarController();
    },
  })
  readonly appBar!: TraitViewControllerRef<this, Trait, BarView, BarController> & Observes<AppBarController> & {
    attachAppBarView(appBarView: BarView, appBarController: BarController): void,
    detachAppBarView(appBarView: BarView, appBarController: BarController): void,
    updateFolioStyle(folioStyle: FolioStyle | undefined, appBarController: BarController): void,
    coverViewDidScroll(coverView: SheetView, appBarController: BarController): void,
  };

  @ViewRef({
    viewType: DrawerView,
    get parentView(): FolioView | null {
      return this.owner.folio.view;
    },
    willAttachView(drawerView: DrawerView): void {
      this.owner.callObservers("controllerWillAttachDrawerView", drawerView, this.owner);
    },
    didAttachView(drawerView: DrawerView): void {
      this.updateFullBleed(this.owner.fullBleed.value, drawerView);
      if (this.owner.fullScreen.value) {
        drawerView.dismiss();
      } else {
        drawerView.present();
      }
    },
    didDetachView(drawerView: DrawerView): void {
      this.owner.callObservers("controllerDidDetachDrawerView", drawerView, this.owner);
    },
    updateFullBleed(fullBleed: boolean, drawerView: DrawerView): void {
      // hook
    },
  })
  readonly drawer!: ViewRef<this, DrawerView> & {
    updateFullBleed(fullBleed: boolean, drawerView: DrawerView): void,
  };

  @TraitViewControllerRef({
    controllerType: SheetController,
    consumed: true,
    binds: false,
    observes: true,
    getTraitViewRef(coverController: SheetController): TraitViewRef<unknown, Trait, SheetView> {
      return coverController.sheet;
    },
    willAttachController(coverController: SheetController): void {
      this.owner.callObservers("controllerWillAttachCover", coverController, this.owner);
    },
    didAttachController(coverController: SheetController): void {
      this.owner.fullBleed.setIntrinsic(coverController.fullBleed.value);
      const coverTrait = coverController.sheet.trait;
      if (coverTrait !== null) {
        this.attachCoverTrait(coverTrait, coverController);
      }
      const coverView = coverController.sheet.view;
      if (coverView !== null) {
        this.attachCoverView(coverView, coverController);
      }
      const modeToolControllers = coverController.modeTools.controllers;
      for (const controllerId in modeToolControllers) {
        this.owner.modeTools.attachController(modeToolControllers[controllerId]!);
      }
    },
    willDetachController(coverController: SheetController): void {
      const modeToolControllers = coverController.modeTools.controllers;
      for (const controllerId in modeToolControllers) {
        this.owner.modeTools.detachController(modeToolControllers[controllerId]!);
      }
      const coverView = coverController.sheet.view;
      if (coverView !== null) {
        this.detachCoverView(coverView, coverController);
      }
      const coverTrait = coverController.sheet.trait;
      if (coverTrait !== null) {
        this.detachCoverTrait(coverTrait, coverController);
      }
    },
    didDetachController(coverController: SheetController): void {
      this.owner.callObservers("controllerDidDetachCover", coverController, this.owner);
    },
    controllerWillAttachSheetTrait(coverTrait: Trait, coverController: SheetController): void {
      this.owner.callObservers("controllerWillAttachCoverTrait", coverTrait, this.owner);
      this.attachCoverTrait(coverTrait, coverController);
    },
    controllerDidDetachSheetTrait(coverTrait: Trait, coverController: SheetController): void {
      this.detachCoverTrait(coverTrait, coverController);
      this.owner.callObservers("controllerDidDetachCoverTrait", coverTrait, this.owner);
    },
    attachCoverTrait(coverTrait: Trait, coverController: SheetController): void {
      // hook
    },
    detachCoverTrait(coverTrait: Trait, coverController: SheetController): void {
      // hook
    },
    controllerWillAttachSheetView(coverView: SheetView, coverController: SheetController): void {
      this.owner.callObservers("controllerWillAttachCoverView", coverView, this.owner);
      this.attachCoverView(coverView, coverController);
    },
    controllerDidDetachSheetView(coverView: SheetView, coverController: SheetController): void {
      this.detachCoverView(coverView, coverController);
      this.owner.callObservers("controllerDidDetachCoverView", coverView, this.owner);
    },
    attachCoverView(coverView: SheetView, coverController: SheetController): void {
      const folioView = this.owner.folio.view;
      if (folioView !== null) {
        folioView.cover.attachView(coverView);
      }
      const appBarController = this.owner.appBar.controller;
      if (appBarController !== null) {
        this.owner.appBar.coverViewDidScroll(coverView, appBarController);
      }
    },
    detachCoverView(coverView: SheetView, coverController: SheetController): void {
      const folioView = this.owner.folio.view;
      if (folioView !== null) {
        folioView.cover.removeView();
      }
      this.detachController();
    },
    controllerDidSetFullBleed(fullBleed: boolean): void {
      this.owner.fullBleed.setIntrinsic(fullBleed);
    },
    controllerWillAttachModeTool(toolController: ToolController, targetToolController: ToolController | null): void {
      this.owner.modeTools.attachController(toolController, targetToolController);
    },
    controllerDidDetachModeTool(toolController: ToolController): void {
      this.owner.modeTools.detachController(toolController);
    },
    controllerDidScrollSheetView(coverView: SheetView): void {
      const appBarController = this.owner.appBar.controller;
      if (appBarController !== null) {
        this.owner.appBar.coverViewDidScroll(coverView, appBarController);
      }
    },
    present(timing?: TimingLike | boolean | null): SheetView | null {
      const coverController = this.controller;
      const coverView = coverController !== null ? coverController.sheet.view : null;
      if (coverView !== null) {
        if (this.owner.folioStyle.value === "stacked") {
          if (this.owner.sheets.controllers[coverController!.uid] !== void 0) {
            this.owner.sheets.detachController(coverController!);
          }
          this.owner.sheets.attachController(coverController!);
          coverView.present(timing);
        } else {
          this.insertView(this.owner.folio.view);
        }
      }
      return coverView;
    },
  })
  readonly cover!: TraitViewControllerRef<this, Trait, SheetView, SheetController> & Observes<SheetController> & {
    attachCoverTrait(coverTrait: Trait, coverController: SheetController): void;
    detachCoverTrait(coverTrait: Trait, coverController: SheetController): void;
    attachCoverView(coverView: SheetView, coverController: SheetController): void;
    detachCoverView(coverView: SheetView, coverController: SheetController): void;
    present(timing?: TimingLike | boolean | null): SheetView | null;
  };

  @TraitViewControllerSet({
    controllerType: ToolController,
    binds: false,
    ordered: true,
    observes: true,
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, Trait, ToolView> {
      return toolController.tool;
    },
    willAttachController(toolController: ToolController): void {
      this.owner.callObservers("controllerWillAttachCoverModeTool", toolController, this.owner);
    },
    didAttachController(toolController: ToolController): void {
      const toolView = toolController.tool.view;
      if (toolView !== null) {
        this.attachToolView(toolView, toolController);
      }
    },
    willDetachController(toolController: ToolController): void {
      const toolView = toolController.tool.view;
      if (toolView !== null) {
        this.detachToolView(toolView, toolController);
      }
    },
    didDetachController(toolController: ToolController): void {
      this.owner.callObservers("controllerDidDetachCoverModeTool", toolController, this.owner);
    },
    controllerWillAttachToolView(toolView: ToolView, toolController: ToolController): void {
      this.owner.callObservers("controllerWillAttachCoverModeToolView", toolView, toolController, this.owner);
      this.attachToolView(toolView, toolController);
    },
    controllerDidDetachToolView(toolView: ToolView, toolController: ToolController): void {
      this.detachToolView(toolView, toolController);
      this.owner.callObservers("controllerDidDetachCoverModeToolView", toolView, toolController, this.owner);
    },
    attachToolView(toolView: ToolView, toolController: ToolController): void {
      // hook
    },
    detachToolView(toolView: ToolView, toolController: ToolController): void {
      // hook
    },
  })
  readonly modeTools!: TraitViewControllerSet<this, Trait, ToolView, ToolController> & Observes<ToolController> & {
    attachToolView(toolView: ToolView, toolController: ToolController): void,
    detachToolView(toolView: ToolView, toolController: ToolController): void,
  };
}
