// Copyright 2015-2021 Swim.inc
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

import {Class, Lazy, ObserverType} from "@swim/util";
import {Affinity, MemberFastenerClass} from "@swim/component";
import {Look, Mood} from "@swim/theme";
import type {PositionGestureInput} from "@swim/view";
import {VectorIcon} from "@swim/graphics";
import {TraitViewRef, TraitViewControllerRef} from "@swim/controller";
import {
  ToolLayout,
  BarLayout,
  ToolView,
  ToolTrait,
  ToolController,
  ButtonToolController,
  BarView,
  BarController,
} from "@swim/toolbar";
import type {CardView} from "../card/CardView";
import type {CardTrait} from "../card/CardTrait";
import {CardController} from "../card/CardController";
import type {DeckBarControllerObserver} from "./DeckBarControllerObserver";

/** @public */
export class DeckBarController extends BarController {
  override readonly observerType?: Class<DeckBarControllerObserver>;

  protected override createLayout(): BarLayout | null {
    const tools = new Array<ToolLayout>();
    const topCardView = this.topCard.view;
    const topCardKey = topCardView !== null ? "title" + topCardView.uid : void 0;
    const backCardView = topCardView !== null ? topCardView.backCardView : null;
    const backCardKey = backCardView !== null ? "title" + backCardView.uid : void 0;

    if (topCardView === null || backCardView === null) {
      this.backTool.removeView();
      this.closeTool.insertView();
      const closeToolController = this.closeTool.controller;
      const closeToolLayout = closeToolController !== null ? closeToolController.layout.value : null;
      if (closeToolLayout !== null) {
        tools.push(closeToolLayout);
      }
    } else {
      this.closeTool.removeView();
      this.backTool.insertView();
      const backToolController = this.backTool.controller;
      const backToolLayout = backToolController !== null ? backToolController.layout.value : null;
      if (backToolLayout !== null) {
        tools.push(backToolLayout.withOverlap(backCardKey).withOverpad(16));
      }
    }

    if (backCardView !== null) {
      const backTitleView = backCardView.cardTitle.insertView(this.bar.view, void 0, void 0, backCardKey);
      if (backTitleView !== null) {
        const timing = backTitleView.getLookOr(Look.timing, Mood.navigating, false);
        backTitleView.color.setLook(Look.accentColor, timing, Affinity.Intrinsic);
        backTitleView.zIndex.setState(1, Affinity.Intrinsic);
      }
      const backCardLayout = ToolLayout.create(backCardKey!, 0, 0, 0, 0);
      tools.push(backCardLayout);
    }
    if (topCardView !== null) {
      const topTitleView = topCardView.cardTitle.insertView(this.bar.view, void 0, void 0, topCardKey);
      if (topTitleView !== null) {
        const timing = topTitleView.getLookOr(Look.timing, Mood.navigating, false);
        topTitleView.color.setLook(Look.textColor, timing, Affinity.Intrinsic);
        topTitleView.zIndex.setState(1, Affinity.Intrinsic);
      }
      const topCardLayout = ToolLayout.create(topCardKey!, 1, 0, 0, 0.5);
      tools.push(topCardLayout);
    }

    const menuToolController = this.menuTool.controller;
    const menuToolLayout = menuToolController !== null ? menuToolController.layout.value : null;
    if (menuToolLayout !== null) {
      tools.push(menuToolLayout);
      this.menuTool.insertView();
    }

    return BarLayout.create(tools);
  }

  @TraitViewControllerRef<DeckBarController, ToolTrait, ToolView, ToolController, ObserverType<ToolController | ButtonToolController>>({
    implements: true,
    type: BarController,
    binds: true,
    viewKey: "close",
    observes: true,
    get parentView(): BarView | null {
      return this.owner.bar.view;
    },
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, ToolTrait, ToolView> {
      return toolController.tool;
    },
    controllerDidPressToolView(input: PositionGestureInput, event: Event | null): void {
      this.owner.callObservers("controllerDidPressClose", input, event, this.owner);
    },
    createController(): ToolController {
      const toolController = new ButtonToolController();
      toolController.layout.setValue(ToolLayout.create(this.viewKey!, 0, 0, 48));
      const toolView = toolController.tool.attachView()!;
      toolView.iconWidth.setState(24, Affinity.Intrinsic);
      toolView.iconHeight.setState(24, Affinity.Intrinsic);
      toolView.graphics.setState(DeckBarController.closeIcon, Affinity.Intrinsic);
      return toolController;
    },
  })
  readonly closeTool!: TraitViewControllerRef<this, ToolTrait, ToolView, ToolController>;
  static readonly closeTool: MemberFastenerClass<DeckBarController, "closeTool">;

  @TraitViewControllerRef<DeckBarController, ToolTrait, ToolView, ToolController, ObserverType<ToolController | ButtonToolController>>({
    implements: true,
    type: BarController,
    binds: true,
    viewKey: "back",
    observes: true,
    get parentView(): BarView | null {
      return this.owner.bar.view;
    },
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, ToolTrait, ToolView> {
      return toolController.tool;
    },
    controllerDidPressToolView(input: PositionGestureInput, event: Event | null): void {
      this.owner.callObservers("controllerDidPressBack", input, event, this.owner);
    },
    createController(): ToolController {
      const toolController = new ButtonToolController();
      toolController.layout.setValue(ToolLayout.create(this.viewKey!, 0, 0, 48));
      const toolView = toolController.tool.attachView()!;
      toolView.iconWidth.setState(24, Affinity.Intrinsic);
      toolView.iconHeight.setState(24, Affinity.Intrinsic);
      toolView.graphics.setState(DeckBarController.backIcon, Affinity.Intrinsic);
      return toolController;
    },
  })
  readonly backTool!: TraitViewControllerRef<this, ToolTrait, ToolView, ToolController>;
  static readonly backTool: MemberFastenerClass<DeckBarController, "backTool">;

  @TraitViewControllerRef<DeckBarController, ToolTrait, ToolView, ToolController, ObserverType<ToolController | ButtonToolController>>({
    implements: true,
    type: BarController,
    binds: true,
    viewKey: "menu",
    observes: true,
    get parentView(): BarView | null {
      return this.owner.bar.view;
    },
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, ToolTrait, ToolView> {
      return toolController.tool;
    },
    controllerDidPressToolView(input: PositionGestureInput, event: Event | null): void {
      this.owner.callObservers("controllerDidPressMenu", input, event, this.owner);
    },
    createController(): ToolController {
      const toolController = new ButtonToolController();
      toolController.layout.setValue(ToolLayout.create(this.viewKey!, 0, 0, 48));
      const toolView = toolController.tool.attachView()!;
      toolView.iconWidth.setState(24, Affinity.Intrinsic);
      toolView.iconHeight.setState(24, Affinity.Intrinsic);
      toolView.graphics.setState(DeckBarController.menuIcon, Affinity.Intrinsic);
      return toolController;
    },
  })
  readonly menuTool!: TraitViewControllerRef<this, ToolTrait, ToolView, ToolController>;
  static readonly menuTool: MemberFastenerClass<DeckBarController, "menuTool">;

  @TraitViewControllerRef<DeckBarController, CardTrait, CardView, CardController>({
    type: CardController,
    inherits: true,
    observes: true,
    getTraitViewRef(cardController: CardController): TraitViewRef<unknown, CardTrait, CardView> {
      return cardController.card;
    },
    willAttachController(cardController: CardController): void {
      this.owner.updateLayout();
    },
    didDetachController(cardController: CardController): void {
      const cardView = cardController.card.view;
      if (cardView !== null && cardView.backCardView === null && cardView.frontCardView === null) {
        this.owner.updateLayout();
      }
    },
    controllerWillAttachCardTitleView(titleView: ToolView, cardController: CardController): void {
      this.owner.updateLayout();
    },
    controllerDidDetachCardTitleView(titleView: ToolView, cardController: CardController): void {
      this.owner.updateLayout();
    },
  })
  readonly topCard!: TraitViewControllerRef<this, CardTrait, CardView, CardController>;
  static readonly topCard: MemberFastenerClass<DeckBarController, "topCard">;

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
  static get menuIcon(): VectorIcon {
    return VectorIcon.create(24, 24, "M3,18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3Z");
  }
}
