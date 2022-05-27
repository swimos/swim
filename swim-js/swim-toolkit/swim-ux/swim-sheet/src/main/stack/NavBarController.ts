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

import {Class, Lazy, Observes} from "@swim/util";
import {Affinity, FastenerClass, Property} from "@swim/component";
import type {Trait} from "@swim/model";
import {Presence} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import {VectorIcon} from "@swim/graphics";
import {Controller, TraitViewRef, TraitViewControllerRef} from "@swim/controller";
import {
  ToolLayout,
  BarLayout,
  ToolView,
  SearchToolView,
  ToolController,
  TitleToolController,
  ButtonToolController,
  SearchToolController,
  BarView,
  BarController,
} from "@swim/toolbar";
import type {SheetView} from "../sheet/SheetView";
import {SheetController} from "../sheet/SheetController";
import type {NavBarControllerObserver} from "./NavBarControllerObserver";

/** @public */
export class NavBarController extends BarController {
  override readonly observerType?: Class<NavBarControllerObserver>;

  @Property({valueType: Boolean, value: true, updateFlags: Controller.NeedsAssemble})
  readonly showBackTitle!: Property<this, boolean>;

  protected override createLayout(): BarLayout | null {
    const frontController = this.front.controller;
    if (frontController === null || !frontController.searching.value) {
      return this.createNavLayout();
    } else {
      return this.createSearchLayout();
    }
  }

  protected createNavLayout(): BarLayout | null {
    const tools = new Array<ToolLayout>();

    const frontController = this.front.controller;
    const frontKey = frontController !== null ? "title" + frontController.uid : "";
    const backController = frontController !== null ? frontController.back.controller : null;
    const backKey = backController !== null ? "title" + backController.uid : void 0;
    const showBackTitle = this.showBackTitle.value;

    if (frontController === null || backController === null) {
      const closeButtonController = this.closeButton.controller;
      if (closeButtonController !== null) {
        const closeButtonLayout = closeButtonController.layout.value;
        if (closeButtonLayout !== null) {
          tools.push(closeButtonLayout);
        }
        const closeButtonView = closeButtonController.tool.view;
        if (closeButtonView !== null) {
          this.closeButton.insertView();
          closeButtonView.zIndex.setState(2, Affinity.Intrinsic);
        }
      }
    } else {
      const backButtonController = this.backButton.controller;
      if (backButtonController !== null) {
        let backButtonLayout = backButtonController.layout.value;
        if (backButtonLayout !== null) {
          if (showBackTitle) {
            backButtonLayout = backButtonLayout.withOverlap(backKey).withOverpad(16);
          }
          tools.push(backButtonLayout);
        }
        const backButtonView = this.backButton.insertView();
        backButtonView.zIndex.setState(2, Affinity.Intrinsic);
      }
    }

    if (showBackTitle) {
      if (backController !== null) {
        const backTitleLayout = ToolLayout.create(backKey!, 0, 0, 0, 0, -1, -1);
        tools.push(backTitleLayout);
        const backTitleView = backController.title.insertView(this.bar.view, void 0, void 0, backKey);
        if (backTitleView !== null) {
          const timing = backTitleView.getLookOr(Look.timing, Mood.navigating, false);
          backTitleView.color.setLook(Look.accentColor, timing, Affinity.Intrinsic);
          backTitleView.zIndex.setState(3, Affinity.Intrinsic);
          backTitleView.pointerEvents.setState("none", Affinity.Intrinsic);
        }
      }
      const frontTitleLayout = ToolLayout.create(frontKey, 1, 0, 0, 0.5, 1, 1);
      tools.push(frontTitleLayout);
      if (frontController !== null) {
        const frontTitleView = frontController.title.insertView(this.bar.view, void 0, void 0, frontKey);
        if (frontTitleView !== null) {
          const timing = frontTitleView.getLookOr(Look.timing, Mood.navigating, false);
          frontTitleView.color.setLook(Look.textColor, timing, Affinity.Intrinsic);
          frontTitleView.zIndex.setState(1, Affinity.Intrinsic);
          frontTitleView.pointerEvents.setState("auto", Affinity.Intrinsic);
        }
      }
    } else {
      const barView = this.bar.view;
      const oldBarLayout = barView !== null ? barView.layout.value : null;
      const oldBackLayout = oldBarLayout !== null && backKey !== void 0 ? oldBarLayout.getTool(backKey) : null;
      if (backController !== null && oldBackLayout !== null) {
        const backTitleLayout = ToolLayout.create(backKey!, 0, 0, 0, 0, -1, -1).withPresence(Presence.dismissed());
        tools.push(backTitleLayout);
      }
      let frontTitleLayout: ToolLayout;
      if (oldBackLayout === null) {
        frontTitleLayout = ToolLayout.create(frontKey, 1, 0, 0, 0.5, 0, 1);
      } else {
        frontTitleLayout = ToolLayout.create(frontKey, 1, 0, 0, 0.5, 1, 1);
      }
      tools.push(frontTitleLayout);
      if (frontController !== null) {
        const frontTitleView = frontController.title.insertView(this.bar.view, void 0, void 0, frontKey);
        if (frontTitleView !== null) {
          const timing = frontTitleView.getLookOr(Look.timing, Mood.navigating, false);
          frontTitleView.color.setLook(Look.textColor, timing, Affinity.Intrinsic);
          frontTitleView.zIndex.setState(1, Affinity.Intrinsic);
          frontTitleView.pointerEvents.setState("auto", Affinity.Intrinsic);
        }
      }
    }

    const searchButtonController = this.searchButton.controller;
    if (searchButtonController !== null) {
      const searchable = frontController !== null && frontController.searchable.value;
      let searchButtonLayout = searchButtonController.layout.value;
      if (searchButtonLayout !== null) {
        if (!searchable) {
          searchButtonLayout = searchButtonLayout.withKey("");
        }
        tools.push(searchButtonLayout);
      }
      if (searchable) {
        this.searchButton.insertView();
      }
    }

    return BarLayout.create(tools);
  }

  protected createSearchLayout(): BarLayout | null {
    const tools = new Array<ToolLayout>();

    const searchInputController = this.searchInput.controller;
    if (searchInputController !== null) {
      const searchInputLayout = searchInputController.layout.value;
      if (searchInputLayout !== null) {
        tools.push(searchInputLayout);
      }
      this.searchInput.insertView();
    }

    const cancelSearchController = this.cancelSearch.controller;
    if (cancelSearchController !== null) {
      const cancelSearchLayout = cancelSearchController.layout.value;
      if (cancelSearchLayout !== null) {
        tools.push(cancelSearchLayout);
      }
      if (cancelSearchController.tool.view !== null) {
        this.cancelSearch.insertView();
      }
    }

    return BarLayout.create(tools);
  }

  @TraitViewControllerRef<NavBarController["closeButton"]>({
    controllerType: ToolController,
    binds: true,
    viewKey: "closeButton",
    observes: true,
    get parentView(): BarView | null {
      return this.owner.bar.view;
    },
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, Trait, ToolView> {
      return toolController.tool;
    },
    controllerDidPressToolView(input: PositionGestureInput, event: Event | null): void {
      this.owner.callObservers("controllerDidPressCloseButton", input, event, this.owner);
    },
    createController(): ToolController {
      const toolController = new ButtonToolController();
      const toolLayout = ToolLayout.create(this.viewKey!, 0, 0, 48);
      toolController.layout.setValue(toolLayout);
      const toolView = toolController.tool.attachView()!;
      toolView.iconWidth.setState(24, Affinity.Intrinsic);
      toolView.iconHeight.setState(24, Affinity.Intrinsic);
      toolView.graphics.setState(this.owner.closeIcon, Affinity.Intrinsic);
      return toolController;
    },
  })
  readonly closeButton!: TraitViewControllerRef<this, Trait, ToolView, ToolController> & Observes<ButtonToolController>;
  static readonly closeButton: FastenerClass<NavBarController["closeButton"]>;

  @TraitViewControllerRef<NavBarController["backButton"]>({
    controllerType: ToolController,
    binds: true,
    viewKey: "backButton",
    observes: true,
    get parentView(): BarView | null {
      return this.owner.bar.view;
    },
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, Trait, ToolView> {
      return toolController.tool;
    },
    controllerDidPressToolView(input: PositionGestureInput, event: Event | null): void {
      this.owner.callObservers("controllerDidPressBackButton", input, event, this.owner);
    },
    createController(): ToolController {
      const toolController = new ButtonToolController();
      const toolLayout = ToolLayout.create(this.viewKey!, 0, 0, 48);
      toolController.layout.setValue(toolLayout);
      const toolView = toolController.tool.attachView()!;
      toolView.iconWidth.setState(24, Affinity.Intrinsic);
      toolView.iconHeight.setState(24, Affinity.Intrinsic);
      toolView.graphics.setState(this.owner.backIcon, Affinity.Intrinsic);
      return toolController;
    },
  })
  readonly backButton!: TraitViewControllerRef<this, Trait, ToolView, ToolController> & Observes<ButtonToolController>;
  static readonly backButton: FastenerClass<NavBarController["backButton"]>;

  @TraitViewControllerRef<NavBarController["searchButton"]>({
    controllerType: ToolController,
    binds: true,
    viewKey: "searchButton",
    observes: true,
    get parentView(): BarView | null {
      return this.owner.bar.view;
    },
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, Trait, ToolView> {
      return toolController.tool;
    },
    controllerDidPressToolView(input: PositionGestureInput, event: Event | null): void {
      this.owner.callObservers("controllerDidPressSearchButton", input, event, this.owner);
    },
    createController(): ToolController {
      const toolController = new ButtonToolController();
      const toolLayout = ToolLayout.create(this.viewKey!, 0, 0, 48);
      toolController.layout.setValue(toolLayout);
      const toolView = toolController.tool.attachView()!;
      toolView.iconWidth.setState(24, Affinity.Intrinsic);
      toolView.iconHeight.setState(24, Affinity.Intrinsic);
      toolView.graphics.setState(this.owner.searchIcon, Affinity.Intrinsic);
      return toolController;
    },
  })
  readonly searchButton!: TraitViewControllerRef<this, Trait, ToolView, ToolController> & Observes<ButtonToolController>;
  static readonly searchButton: FastenerClass<NavBarController["searchButton"]>;

  @TraitViewControllerRef<NavBarController["searchInput"]>({
    controllerType: ToolController,
    binds: true,
    viewKey: "searchInput",
    observes: true,
    get parentView(): BarView | null {
      return this.owner.bar.view;
    },
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, Trait, ToolView> {
      return toolController.tool;
    },
    controllerDidUpdateSearch(query: string, inputView: HtmlView): void {
      this.owner.callObservers("controllerDidUpdateSearch", query, inputView, this.owner);
    },
    controllerDidSubmitSearch(query: string, inputView: HtmlView): void {
      this.owner.callObservers("controllerDidSubmitSearch", query, inputView, this.owner);
    },
    controllerDidCancelSearch(inputView: HtmlView): void {
      this.owner.callObservers("controllerDidCancelSearch", inputView, this.owner);
    },
    createController(): ToolController {
      const toolController = new SearchToolController();
      const toolLayout = ToolLayout.create(this.viewKey!, 1, 0, 0, 0.5);
      toolController.layout.setValue(toolLayout);
      const toolView = toolController.tool.attachView()!;
      toolView.stylesheet.insertView();
      const inputView = toolView.input.insertView();
      inputView.marginLeft.setState(8, Affinity.Intrinsic);
      inputView.marginRight.setState(8, Affinity.Intrinsic);
      inputView.placeholder.setState("Search", Affinity.Intrinsic);
      return toolController;
    },
  })
  readonly searchInput!: TraitViewControllerRef<this, Trait, ToolView, ToolController> & Observes<SearchToolController>;
  static readonly searchInput: FastenerClass<NavBarController["searchInput"]>;

  @TraitViewControllerRef<NavBarController["cancelSearch"]>({
    controllerType: ToolController,
    binds: true,
    viewKey: "cancelSearch",
    observes: true,
    get parentView(): BarView | null {
      return this.owner.bar.view;
    },
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, Trait, ToolView> {
      return toolController.tool;
    },
    controllerDidPressToolView(input: PositionGestureInput, event: Event | null): void {
      const searchInputView = this.owner.searchInput.view;
      const inputView = searchInputView instanceof SearchToolView ? searchInputView.input.view : null;
      this.owner.callObservers("controllerDidCancelSearch", inputView, this.owner);
    },
    createController(): ToolController {
      const toolController = new TitleToolController();
      const toolLayout = ToolLayout.create(this.viewKey!, 0, 0, 72, 0.5);
      toolController.layout.setValue(toolLayout);
      const toolView = toolController.tool.attachView()!;
      toolView.color.setLook(Look.accentColor, Affinity.Intrinsic);
      toolView.cursor.setState("pointer", Affinity.Intrinsic);
      toolView.content.setText("Cancel");
      return toolController;
    },
  })
  readonly cancelSearch!: TraitViewControllerRef<this, Trait, ToolView, ToolController> & Observes<ToolController>;
  static readonly cancelSearch: FastenerClass<NavBarController["cancelSearch"]>;

  @TraitViewControllerRef<NavBarController["front"]>({
    controllerType: SheetController,
    inherits: true,
    observes: true,
    getTraitViewRef(frontController: SheetController): TraitViewRef<unknown, Trait, SheetView> {
      return frontController.sheet;
    },
    willAttachController(frontController: SheetController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    didDetachController(frontController: SheetController): void {
      const sheetView = frontController.sheet.view;
      if (sheetView !== null && sheetView.back.view === null && sheetView.forward.view === null) {
        this.owner.requireUpdate(Controller.NeedsAssemble);
      }
    },
    controllerDidSetSearchable(searchable: boolean, frontController: SheetController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    controllerDidSetSearching(searching: boolean, frontController: SheetController): void {
      if (searching) {
        this.owner.updateLayout();
      } else {
        this.owner.requireUpdate(Controller.NeedsAssemble);
      }
    },
    controllerWillAttachTitle(titleController: ToolController, frontController: SheetController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    controllerDidDetachTitle(titleController: ToolController, frontController: SheetController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
  })
  readonly front!: TraitViewControllerRef<this, Trait, SheetView, SheetController> & Observes<SheetController>;
  static readonly front: FastenerClass<NavBarController["front"]>;

  get closeIcon(): VectorIcon {
    return NavBarController.closeIcon;
  }

  get backIcon(): VectorIcon {
    return NavBarController.backIcon;
  }

  get searchIcon(): VectorIcon {
    return NavBarController.searchIcon;
  }

  /** @internal */
  @Lazy
  static get closeIcon(): VectorIcon {
    return VectorIcon.create(24, 24, "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12Z");
  }

  /** @internal */
  @Lazy
  static get backIcon(): VectorIcon {
    return VectorIcon.create(24, 24, "M17.77,3.77L16,2L6,12L16,22L17.77,20.23L9.54,12Z").withFillLook(Look.accentColor);
  }

  /** @internal */
  @Lazy
  static get searchIcon(): VectorIcon {
    return VectorIcon.create(24, 24, "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z");
  }
}
