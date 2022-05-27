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

import type {Class, Observes} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import type {Trait} from "@swim/model";
import type {View} from "@swim/view";
import {TraitViewRef, TraitViewControllerSet} from "@swim/controller";
import {SheetController} from "@swim/sheet";
import type {PanelView} from "../panel/PanelView";
import {PanelController} from "../panel/PanelController";
import {BoardView} from "./BoardView";
import type {BoardControllerObserver} from "./BoardControllerObserver";

/** @public */
export class BoardController extends SheetController {
  override readonly observerType?: Class<BoardControllerObserver>;

  @TraitViewRef<BoardController["sheet"]>({
    extends: SheetController.sheet,
    viewType: BoardView,
  })
  override readonly sheet!: TraitViewRef<this, Trait, BoardView> & SheetController["sheet"];
  static override readonly sheet: FastenerClass<BoardController["sheet"]>;

  @TraitViewControllerSet<BoardController["panels"]>({
    controllerType: PanelController,
    binds: true,
    observes: true,
    get parentView(): View | null {
      return this.owner.sheet.attachView();
    },
    getTraitViewRef(panelController: PanelController): TraitViewRef<unknown, Trait, PanelView> {
      return panelController.panel;
    },
    willAttachController(panelController: PanelController): void {
      this.owner.callObservers("controllerWillAttachPanel", panelController, this.owner);
    },
    didAttachController(panelController: PanelController): void {
      const panelTrait = panelController.panel.trait;
      if (panelTrait !== null) {
        this.attachPanelTrait(panelTrait, panelController);
      }
      const panelView = panelController.panel.view;
      if (panelView !== null) {
        this.attachPanelView(panelView, panelController);
      }
    },
    willDetachController(panelController: PanelController): void {
      const panelView = panelController.panel.view;
      if (panelView !== null) {
        this.detachPanelView(panelView, panelController);
      }
      const panelTrait = panelController.panel.trait;
      if (panelTrait !== null) {
        this.detachPanelTrait(panelTrait, panelController);
      }
    },
    didDetachController(panelController: PanelController): void {
      this.owner.callObservers("controllerDidDetachPanel", panelController, this.owner);
    },
    controllerWillAttachPanelTrait(panelTrait: Trait, panelController: PanelController): void {
      this.owner.callObservers("controllerWillAttachPanelTrait", panelTrait, panelController, this.owner);
      this.attachPanelTrait(panelTrait, panelController);
    },
    controllerDidDetachPanelTrait(panelTrait: Trait, panelController: PanelController): void {
      this.detachPanelTrait(panelTrait, panelController);
      this.owner.callObservers("controllerDidDetachPanelTrait", panelTrait, panelController, this.owner);
    },
    attachPanelTrait(panelTrait: Trait, panelController: PanelController): void {
      // hook
    },
    detachPanelTrait(panelTrait: Trait, panelController: PanelController): void {
      // hook
    },
    controllerWillAttachPanelView(panelView: PanelView, panelController: PanelController): void {
      this.owner.callObservers("controllerWillAttachPanelView", panelView, panelController, this.owner);
      this.attachPanelView(panelView, panelController);
    },
    controllerDidDetachPanelView(panelView: PanelView, panelController: PanelController): void {
      this.detachPanelView(panelView, panelController);
      this.owner.callObservers("controllerDidDetachPanelView", panelView, panelController, this.owner);
    },
    attachPanelView(panelView: PanelView, panelController: PanelController): void {
      // hook
    },
    detachPanelView(panelView: PanelView, panelController: PanelController): void {
      panelView.remove();
    },
  })
  readonly panels!: TraitViewControllerSet<this, Trait, PanelView, PanelController> & Observes<PanelController> & {
    attachPanelTrait(panelTrait: Trait, panelController: PanelController): void,
    detachPanelTrait(panelTrait: Trait, panelController: PanelController): void,
    attachPanelView(panelView: PanelView, panelController: PanelController): void,
    detachPanelView(panelView: PanelView, panelController: PanelController): void,
  };
  static readonly panels: FastenerClass<BoardController["panels"]>;
}
