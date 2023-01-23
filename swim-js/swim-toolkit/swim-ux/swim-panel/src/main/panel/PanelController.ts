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
import type {Trait} from "@swim/model";
import type {FastenerClass} from "@swim/component";
import {View, ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {Controller, TraitViewRef, TraitViewControllerSet} from "@swim/controller";
import {PanelView} from "./PanelView";
import type {PanelControllerObserver} from "./PanelControllerObserver";

/** @public */
export class PanelController extends Controller {
  override readonly observerType?: Class<PanelControllerObserver>;

  @TraitViewRef<PanelController["panel"]>({
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
  static readonly panel: FastenerClass<PanelController["panel"]>;

  @ViewRef<PanelController["panelHeader"]>({
    viewType: HtmlView,
    viewKey: true,
    get parentView(): View | null {
      return this.owner.panel.attachView().header.parentView;
    },
    initView(dialView: HtmlView): void {
      this.owner.panel.attachView().header.setView(dialView);
    },
    createView(): HtmlView {
      return this.owner.panel.attachView().header.createView();
    },
  })
  readonly panelHeader!: ViewRef<this, HtmlView>;
  static readonly panelHeader: FastenerClass<PanelController["panelHeader"]>;

  @ViewRef<PanelController["panelTitle"]>({
    viewType: HtmlView,
    viewKey: true,
    get parentView(): View | null {
      return this.owner.panel.attachView().headerTitle.parentView;
    },
    initView(dialView: HtmlView): void {
      this.owner.panel.attachView().headerTitle.setView(dialView);
    },
    setText(title: string | undefined): HtmlView {
      return this.owner.panel.attachView().headerTitle.setText(title);
    },
    createView(): HtmlView {
      return this.owner.panel.attachView().headerTitle.createView();
    },
  })
  readonly panelTitle!: ViewRef<this, HtmlView> & {
    setText(title: string | undefined): HtmlView,
  };
  static readonly panelTitle: FastenerClass<PanelController["panelTitle"]>;

  @ViewRef<PanelController["panelSubtitle"]>({
    viewType: HtmlView,
    viewKey: true,
    get parentView(): View | null {
      return this.owner.panel.attachView().headerSubtitle.parentView;
    },
    initView(dialView: HtmlView): void {
      this.owner.panel.attachView().headerSubtitle.setView(dialView);
    },
    setText(subtitle: string | undefined): HtmlView {
      return this.owner.panel.attachView().headerSubtitle.setText(subtitle);
    },
    createView(): HtmlView {
      return this.owner.panel.attachView().headerSubtitle.createView();
    },
  })
  readonly panelSubtitle!: ViewRef<this, HtmlView> & {
    setText(subtitle: string | undefined): HtmlView,
  };
  static readonly panelSubtitle: FastenerClass<PanelController["panelSubtitle"]>;

  @TraitViewControllerSet<PanelController["panes"]>({
    controllerType: PanelController,
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
  static readonly panes: FastenerClass<PanelController["panes"]>;
}
