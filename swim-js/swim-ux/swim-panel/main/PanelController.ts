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
import type {Observes} from "@swim/util";
import type {Like} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {Trait} from "@swim/model";
import type {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import {PanelView} from "./PanelView";

/** @public */
export interface PanelControllerObserver<C extends PanelController = PanelController> extends ControllerObserver<C> {
  controllerWillAttachPanelTrait?(panelTrait: Trait, controller: C): void;

  controllerDidDetachPanelTrait?(panelTrait: Trait, controller: C): void;

  controllerWillAttachPanelView?(panelView: PanelView, controller: C): void;

  controllerDidDetachPanelView?(panelView: PanelView, controller: C): void;

  controllerWillAttachPane?(paneController: PanelController, controller: C): void;

  controllerDidDetachPane?(paneController: PanelController, controller: C): void;

  controllerWillAttachPaneTrait?(paneTrait: Trait, paneController: PanelController, controller: C): void;

  controllerDidDetachPaneTrait?(paneTrait: Trait, paneController: PanelController, controller: C): void;

  controllerWillAttachPaneView?(paneView: PanelView, paneController: PanelController, controller: C): void;

  controllerDidDetachPaneView?(paneView: PanelView, paneController: PanelController, controller: C): void;
}

/** @public */
export class PanelController extends Controller {
  declare readonly observerType?: Class<PanelControllerObserver>;

  @TraitViewRef({
    willAttachTrait(panelTrait: Trait): void {
      this.owner.callObservers("controllerWillAttachPanelTrait", panelTrait, this.owner);
    },
    didDetachTrait(panelTrait: Trait): void {
      this.owner.callObservers("controllerDidDetachPanelTrait", panelTrait, this.owner);
    },
    viewType: PanelView,
    observesView: true,
    didAttachView(panelView: PanelView, targetView: View | null): void {
      this.owner.panelHeader.setView(panelView.header.view);
      this.owner.panelTitle.setView(panelView.headerTitle.view);
      this.owner.panelSubtitle.setView(panelView.headerSubtitle.view);
    },
    willDetachView(panelView: PanelView): void {
      this.owner.panelHeader.setView(null);
      this.owner.panelTitle.setView(null);
      this.owner.panelSubtitle.setView(null);
    },
    willAttachView(panelView: PanelView): void {
      this.owner.callObservers("controllerWillAttachPanelView", panelView, this.owner);
    },
    didDetachView(panelView: PanelView): void {
      this.owner.callObservers("controllerDidDetachPanelView", panelView, this.owner);
    },
    viewWillAttachHeader(headerView: HtmlView): void {
      this.owner.panelHeader.setView(headerView);
    },
    viewDidDetachHeader(headerView: HtmlView): void {
      this.owner.panelHeader.setView(null);
    },
    viewWillAttachHeaderTitle(titleView: HtmlView): void {
      this.owner.panelTitle.setView(titleView);
    },
    viewDidDetachHeaderTitle(titleView: HtmlView): void {
      this.owner.panelTitle.setView(null);
    },
    viewWillAttachHeaderSubtitle(subtitleView: HtmlView): void {
      this.owner.panelSubtitle.setView(subtitleView);
    },
    viewDidDetachHeaderSubtitle(subtitleView: HtmlView): void {
      this.owner.panelSubtitle.setView(null);
    },
  })
  readonly panel!: TraitViewRef<this, Trait, PanelView> & Observes<PanelView>;

  @ViewRef({
    viewType: HtmlView,
    viewKey: true,
    get parentView(): View | null {
      return this.owner.panel.attachView().header.parentView;
    },
    initView(headerView: HtmlView): void {
      this.owner.panel.attachView().header.setView(headerView);
    },
    createView(): HtmlView {
      return this.owner.panel.attachView().header.createView();
    },
  })
  readonly panelHeader!: ViewRef<this, HtmlView>;

  @ViewRef({
    viewType: HtmlView,
    viewKey: true,
    get parentView(): View | null {
      return this.owner.panel.attachView().headerTitle.parentView;
    },
    initView(titleView: HtmlView): void {
      this.owner.panel.attachView().headerTitle.setView(titleView);
    },
    fromLike(value: HtmlView | LikeType<HtmlView> | string | undefined): HtmlView {
      if (value === void 0 || typeof value === "string") {
        return this.owner.panel.attachView().headerTitle.fromLike(value);
      }
      return super.fromLike(value);
    },
    createView(): HtmlView {
      return this.owner.panel.attachView().headerTitle.createView();
    },
  })
  readonly panelTitle!: ViewRef<this, Like<HtmlView, string | undefined>>;

  @ViewRef({
    viewType: HtmlView,
    viewKey: true,
    get parentView(): View | null {
      return this.owner.panel.attachView().headerSubtitle.parentView;
    },
    initView(subtitleView: HtmlView): void {
      this.owner.panel.attachView().headerSubtitle.setView(subtitleView);
    },
    fromLike(value: HtmlView | LikeType<HtmlView> | string | undefined): HtmlView {
      if (value === void 0 || typeof value === "string") {
        return this.owner.panel.attachView().headerSubtitle.fromLike(value);
      }
      return super.fromLike(value);
    },
    createView(): HtmlView {
      return this.owner.panel.attachView().headerSubtitle.createView();
    },
  })
  readonly panelSubtitle!: ViewRef<this, Like<HtmlView, string | undefined>>;

  @TraitViewControllerSet({
    get controllerType(): typeof PanelController {
      return PanelController;
    },
    binds: true,
    observes: true,
    get parentView(): View | null {
      return this.owner.panel.attachView();
    },
    getTraitViewRef(paneController: PanelController): TraitViewRef<unknown, Trait, PanelView> {
      return paneController.panel;
    },
    willAttachController(paneController: PanelController): void {
      this.owner.callObservers("controllerWillAttachPane", paneController, this.owner);
    },
    didAttachController(paneController: PanelController): void {
      const paneTrait = paneController.panel.trait;
      if (paneTrait !== null) {
        this.attachPaneTrait(paneTrait, paneController);
      }
      const paneView = paneController.panel.view;
      if (paneView !== null) {
        this.attachPaneView(paneView, paneController);
      }
    },
    willDetachController(paneController: PanelController): void {
      const paneView = paneController.panel.view;
      if (paneView !== null) {
        this.detachPaneView(paneView, paneController);
      }
      const paneTrait = paneController.panel.trait;
      if (paneTrait !== null) {
        this.detachPaneTrait(paneTrait, paneController);
      }
    },
    didDetachController(paneController: PanelController): void {
      this.owner.callObservers("controllerDidDetachPane", paneController, this.owner);
    },
    controllerWillAttachPanelTrait(paneTrait: Trait, paneController: PanelController): void {
      this.owner.callObservers("controllerWillAttachPaneTrait", paneTrait, paneController, this.owner);
      this.attachPaneTrait(paneTrait, paneController);
    },
    controllerDidDetachPanelTrait(paneTrait: Trait, paneController: PanelController): void {
      this.detachPaneTrait(paneTrait, paneController);
      this.owner.callObservers("controllerDidDetachPaneTrait", paneTrait, paneController, this.owner);
    },
    attachPaneTrait(paneTrait: Trait, paneController: PanelController): void {
      // hook
    },
    detachPaneTrait(paneTrait: Trait, paneController: PanelController): void {
      // hook
    },
    controllerWillAttachPanelView(paneView: PanelView, paneController: PanelController): void {
      this.owner.callObservers("controllerWillAttachPaneView", paneView, paneController, this.owner);
      this.attachPaneView(paneView, paneController);
    },
    controllerDidDetachPanelView(paneView: PanelView, paneController: PanelController): void {
      this.detachPaneView(paneView, paneController);
      this.owner.callObservers("controllerDidDetachPaneView", paneView, paneController, this.owner);
    },
    attachPaneView(paneView: PanelView, paneController: PanelController): void {
      // hook
    },
    detachPaneView(paneView: PanelView, paneController: PanelController): void {
      paneView.remove();
    },
  })
  readonly panes!: TraitViewControllerSet<this, Trait, PanelView, PanelController> & Observes<PanelController> & {
    attachPaneTrait(paneTrait: Trait, paneController: PanelController): void,
    detachPaneTrait(paneTrait: Trait, paneController: PanelController): void,
    attachPaneView(paneView: PanelView, paneController: PanelController): void,
    detachPaneView(paneView: PanelView, paneController: PanelController): void,
  };
}
