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

import type {Class, ObserverType} from "@swim/util";
import type {MemberFastenerClass} from "@swim/component";
import type {TraitCreator, Trait} from "@swim/model";
import {Look, Mood} from "@swim/theme";
import type {PositionGestureInput, ViewCreator} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import {Controller, TraitViewRef, TraitViewControllerSet} from "@swim/controller";
import type {ToolLayout} from "../layout/ToolLayout";
import {BarLayout} from "../layout/BarLayout";
import type {ToolView} from "../tool/ToolView";
import {TitleToolView} from "../tool/TitleToolView";
import type {ToolTrait} from "../tool/ToolTrait";
import {ToolController} from "../tool/ToolController";
import type {TitleToolController} from "../tool/TitleToolController";
import type {ButtonToolController} from "../tool/ButtonToolController";
import {BarView} from "./BarView";
import {BarTrait} from "./BarTrait";
import type {BarControllerObserver} from "./BarControllerObserver";

/** @public */
export interface BarControllerToolExt {
  attachToolTrait(toolTrait: ToolTrait, toolController: ToolController): void;
  detachToolTrait(toolTrait: ToolTrait, toolController: ToolController): void;
  attachToolView(toolView: ToolView, toolController: ToolController): void;
  detachToolView(toolView: ToolView, toolController: ToolController): void;
  attachToolContentView(toolContentView: HtmlView, toolController: ToolController): void;
  detachToolContentView(toolContentView: HtmlView, toolController: ToolController): void;
}

/** @public */
export class BarController extends Controller {
  override readonly observerType?: Class<BarControllerObserver>;

  @TraitViewRef<BarController, BarTrait, BarView>({
    traitType: BarTrait,
    observesTrait: true,
    willAttachTrait(barTrait: BarTrait): void {
      this.owner.callObservers("controllerWillAttachBarTrait", barTrait, this.owner);
    },
    didAttachTrait(barTrait: BarTrait): void {
      const toolTraits = barTrait.tools.traits;
      for (const traitId in toolTraits) {
        const toolTrait = toolTraits[traitId]!;
        this.owner.tools.addTraitController(toolTrait);
      }
    },
    willDetachTrait(barTrait: BarTrait): void {
      const toolTraits = barTrait.tools.traits;
      for (const traitId in toolTraits) {
        const toolTrait = toolTraits[traitId]!;
        this.owner.tools.deleteTraitController(toolTrait);
      }
    },
    didDetachTrait(barTrait: BarTrait): void {
      this.owner.callObservers("controllerDidDetachBarTrait", barTrait, this.owner);
    },
    traitWillAttachTool(toolTrait: ToolTrait, targetTrait: Trait | null): void {
      this.owner.tools.addTraitController(toolTrait, targetTrait);
    },
    traitDidDetachTool(toolTrait: ToolTrait): void {
      this.owner.tools.deleteTraitController(toolTrait);
    },
    viewType: BarView,
    observesView: true,
    initView(barView: BarView): void {
      const toolControllers = this.owner.tools.controllers;
      for (const controllerId in toolControllers) {
        const toolController = toolControllers[controllerId]!;
        const toolView = toolController.tool.view;
        if (toolView !== null && toolView.parent === null) {
          const toolTrait = toolController.tool.trait;
          if (toolTrait !== null) {
            toolController.tool.insertView(barView, void 0, void 0, toolTrait.key);
          }
        }
      }
    },
    willAttachView(barView: BarView): void {
      this.owner.callObservers("controllerWillAttachBarView", barView, this.owner);
    },
    didAttachView(barView: BarView): void {
      this.owner.updateLayout();
    },
    didDetachView(barView: BarView): void {
      this.owner.callObservers("controllerDidDetachBarView", barView, this.owner);
    },
    viewWillSetLayout(newLayout: BarLayout | null, oldLayout: BarLayout | null): void {
      this.owner.callObservers("controllerWillSetBarLayout", newLayout, oldLayout, this.owner);
    },
    viewDidSetLayout(newLayout: BarLayout | null, oldLayout: BarLayout | null): void {
      this.owner.callObservers("controllerDidSetBarLayout", newLayout, oldLayout, this.owner);
    },
  })
  readonly bar!: TraitViewRef<this, BarTrait, BarView>;
  static readonly bar: MemberFastenerClass<BarController, "bar">;

  protected createLayout(): BarLayout | null {
    const tools = new Array<ToolLayout>();
    const toolControllers = this.tools.controllers;
    for (const controllerId in toolControllers) {
      const toolController = toolControllers[controllerId]!;
      const toolLayout = toolController.layout.value;
      if (toolLayout !== null) {
        tools.push(toolLayout);
      }
    }
    return BarLayout.create(tools);
  }

  protected updateLayout(): void {
    const barView = this.bar.view;
    if (barView !== null) {
      const barLayout = this.createLayout();
      if (barLayout !== null) {
        const timing = barView.getLookOr(Look.timing, Mood.navigating, false);
        barView.layout.setState(barLayout, timing);
      }
    }
  }

  getToolTrait<F extends abstract new (...args: any) => ToolTrait>(key: string, toolTraitClass: F): InstanceType<F> | null;
  getToolTrait(key: string): ToolTrait | null;
  getToolTrait(key: string, toolTraitClass?: abstract new (...args: any) => ToolTrait): ToolTrait | null {
    const barTrait = this.bar.trait;
    return barTrait !== null ? barTrait.getTool(key, toolTraitClass!) : null;
  }

  getOrCreateToolTrait<F extends TraitCreator<F, ToolTrait>>(key: string, toolTraitClass: F): InstanceType<F> {
    const barTrait = this.bar.trait;
    if (barTrait === null) {
      throw new Error("no bar trait");
    }
    return barTrait.getOrCreateTool(key, toolTraitClass);
  }

  setToolTrait(key: string, toolTrait: ToolTrait): void {
    const barTrait = this.bar.trait;
    if (barTrait === null) {
      throw new Error("no bar trait");
    }
    barTrait.setTool(key, toolTrait);
  }

  getToolView<F extends abstract new (...args: any) => ToolView>(key: string, toolViewClass: F): InstanceType<F> | null;
  getToolView(key: string): ToolView | null;
  getToolView(key: string, toolViewClass?: abstract new (...args: any) => ToolView): ToolView | null {
    const barView = this.bar.view;
    return barView !== null ? barView.getTool(key, toolViewClass!) : null;
  }

  getOrCreateToolView<F extends ViewCreator<F, ToolView>>(key: string, toolViewClass: F): InstanceType<F> {
    let barView = this.bar.view;
    if (barView === null) {
      barView = this.bar.createView();
      if (barView === null) {
        throw new Error("no bar view");
      }
      this.bar.setView(barView);
    }
    return barView.getOrCreateTool(key, toolViewClass);
  }

  setToolView(key: string, toolView: ToolView): void {
    let barView = this.bar.view;
    if (barView === null) {
      barView = this.bar.createView();
      if (barView === null) {
        throw new Error("no bar view");
      }
      this.bar.setView(barView);
    }
    barView.setTool(key, toolView);
  }

  @TraitViewControllerSet<BarController, ToolTrait, ToolView, ToolController, BarControllerToolExt & ObserverType<ToolController | TitleToolController | ButtonToolController>>({
    implements: true,
    type: ToolController,
    binds: true,
    observes: true,
    get parentView(): BarView | null {
      return this.owner.bar.view;
    },
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, ToolTrait, ToolView> {
      return toolController.tool;
    },
    willAttachController(toolController: ToolController): void {
      this.owner.callObservers("controllerWillAttachTool", toolController, this.owner);
    },
    didAttachController(toolController: ToolController): void {
      const toolTrait = toolController.tool.trait;
      if (toolTrait !== null) {
        this.attachToolTrait(toolTrait, toolController);
      }
      const toolView = toolController.tool.view;
      if (toolView !== null) {
        this.attachToolView(toolView, toolController);
      }
      this.owner.updateLayout();
    },
    willDetachController(toolController: ToolController): void {
      const toolView = toolController.tool.view;
      if (toolView !== null) {
        this.detachToolView(toolView, toolController);
      }
      const toolTrait = toolController.tool.trait;
      if (toolTrait !== null) {
        this.detachToolTrait(toolTrait, toolController);
      }
    },
    didDetachController(toolController: ToolController): void {
      this.owner.updateLayout();
      this.owner.callObservers("controllerDidDetachTool", toolController, this.owner);
    },
    controllerWillAttachToolTrait(toolTrait: ToolTrait, toolController: ToolController): void {
      this.owner.callObservers("controllerWillAttachToolTrait", toolTrait, toolController, this.owner);
      this.attachToolTrait(toolTrait, toolController);
    },
    controllerDidDetachToolTrait(toolTrait: ToolTrait, toolController: ToolController): void {
      this.detachToolTrait(toolTrait, toolController);
      this.owner.callObservers("controllerDidDetachToolTrait", toolTrait, toolController, this.owner);
    },
    attachToolTrait(toolTrait: ToolTrait, toolController: ToolController): void {
      // hook
    },
    detachToolTrait(toolTrait: ToolTrait, toolController: ToolController): void {
      // hook
    },
    controllerWillAttachToolView(toolView: ToolView, toolController: ToolController): void {
      this.owner.callObservers("controllerWillAttachToolView", toolView, toolController, this.owner);
      this.attachToolView(toolView, toolController);
    },
    controllerDidDetachToolView(toolView: ToolView, toolController: ToolController): void {
      this.detachToolView(toolView, toolController);
      this.owner.callObservers("controllerDidDetachToolView", toolView, toolController, this.owner);
    },
    attachToolView(toolView: ToolView, toolController: ToolController): void {
      if (toolView instanceof TitleToolView) {
        const toolContentView = toolView.content.view;
        if (toolContentView !== null) {
          this.attachToolContentView(toolContentView, toolController);
        }
      }
    },
    detachToolView(toolView: ToolView, toolController: ToolController): void {
      if (toolView instanceof TitleToolView) {
        const toolContentView = toolView.content.view;
        if (toolContentView !== null) {
          this.detachToolContentView(toolContentView, toolController);
        }
      }
      toolView.remove();
    },
    controllerWillSetToolLayout(newToolLayout: ToolLayout | null, oldToolLayout: ToolLayout | null, toolController: ToolController): void {
      this.owner.callObservers("controllerWillSetToolLayout", newToolLayout, oldToolLayout, toolController, this.owner);
    },
    controllerDidSetToolLayout(newToolLayout: ToolLayout | null, oldToolLayout: ToolLayout | null, toolController: ToolController): void {
      this.owner.updateLayout();
      this.owner.callObservers("controllerDidSetToolLayout", newToolLayout, oldToolLayout, toolController, this.owner);
    },
    controllerWillAttachToolContentView(contentView: HtmlView, toolController: ToolController): void {
      this.attachToolContentView(contentView, toolController);
      this.owner.callObservers("controllerWillAttachToolContentView", contentView, toolController, this.owner);
    },
    controllerDidDetachToolContentView(contentView: HtmlView, toolController: ToolController): void {
      this.owner.callObservers("controllerDidDetachToolContentView", contentView, toolController, this.owner);
      this.detachToolContentView(contentView, toolController);
    },
    attachToolContentView(toolContentView: HtmlView, toolController: ToolController): void {
      // hook
    },
    detachToolContentView(toolContentView: HtmlView, toolController: ToolController): void {
      // hook
    },
    controllerWillSetToolIcon(newToolIcon: Graphics | null, oldToolIcon: Graphics | null, toolController: ToolController): void {
      this.owner.callObservers("controllerWillSetToolIcon", newToolIcon, oldToolIcon, toolController, this.owner);
    },
    controllerDidSetToolIcon(newToolIcon: Graphics | null, oldToolIcon: Graphics | null, toolController: ToolController): void {
      this.owner.callObservers("controllerDidSetToolIcon", newToolIcon, oldToolIcon, toolController, this.owner);
    },
    controllerDidPressToolView(input: PositionGestureInput, event: Event | null, toolController: ToolController): void {
      this.owner.callObservers("controllerDidPressToolView", input, event, toolController, this.owner);
    },
    controllerDidLongPressToolView(input: PositionGestureInput, toolController: ToolController): void {
      this.owner.callObservers("controllerDidLongPressToolView", input, toolController, this.owner);
    },
    createController(toolTrait?: ToolTrait): ToolController {
      if (toolTrait !== void 0) {
        return ToolController.fromTrait(toolTrait);
      } else {
        return TraitViewControllerSet.prototype.createController.call(this);
      }
    },
  })
  readonly tools!: TraitViewControllerSet<this, ToolTrait, ToolView, ToolController>;
  static readonly tools: MemberFastenerClass<BarController, "tools">;
}
