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

import type {Class} from "@swim/util";
import type {Instance} from "@swim/util";
import type {Creatable} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Trait} from "@swim/model";
import {Look} from "@swim/theme";
import {Mood} from "@swim/theme";
import {View} from "@swim/view";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import type {ToolLayout} from "./ToolLayout";
import {BarLayout} from "./BarLayout";
import type {ToolView} from "./ToolView";
import {TitleToolView} from "./TitleToolView";
import {ToolController} from "./ToolController";
import type {TitleToolController} from "./TitleToolController";
import type {ButtonToolController} from "./ButtonToolController";
import type {SearchToolController} from "./SearchToolController";
import {BarView} from "./BarView";

/** @public */
export interface BarControllerObserver<C extends BarController = BarController> extends ControllerObserver<C> {
  controllerWillAttachBarView?(barView: BarView, controller: C): void;

  controllerDidDetachBarView?(barView: BarView, controller: C): void;

  controllerDidSetBarLayout?(barLayout: BarLayout | null, controller: C): void;

  controllerWillAttachTool?(toolController: ToolController, controller: C): void;

  controllerDidDetachTool?(toolController: ToolController, controller: C): void;

  controllerWillAttachToolView?(toolView: ToolView, toolController: ToolController, controller: C): void;

  controllerDidDetachToolView?(toolView: ToolView, toolController: ToolController, controller: C): void;

  controllerDidSetToolLayout?(toolLayout: ToolLayout | null, toolController: ToolController, controller: C): void;

  controllerWillAttachToolContentView?(toolContentView: HtmlView, toolController: ToolController, controller: C): void;

  controllerDidDetachToolContentView?(toolContentView: HtmlView, toolController: ToolController, controller: C): void;

  controllerDidSetToolIcon?(toolIcon: Graphics | null, toolController: ToolController, controller: C): void;

  controllerDidUpdateSearchTool?(query: string, inputView: HtmlView, toolController: ToolController, controller: C): void;

  controllerDidSubmitSearchTool?(query: string, inputView: HtmlView, toolController: ToolController, controller: C): void;

  controllerDidCancelSearchTool?(inputView: HtmlView, toolController: ToolController, controller: C): void;

  controllerDidPressToolView?(input: PositionGestureInput, event: Event | null, toolController: ToolController, controller: C): void;

  controllerDidLongPressToolView?(input: PositionGestureInput, toolController: ToolController, controller: C): void;
}

/** @public */
export class BarController extends Controller {
  declare readonly observerType?: Class<BarControllerObserver>;

  @TraitViewRef({
    viewType: BarView,
    observesView: true,
    initView(barView: BarView): void {
      const toolControllers = this.owner.tools.controllers;
      for (const controllerId in toolControllers) {
        const toolController = toolControllers[controllerId]!;
        const toolView = toolController.tool.view;
        if (toolView !== null && toolView.parent === null) {
          toolController.tool.insertView(barView);
        }
      }
    },
    willAttachView(barView: BarView): void {
      this.owner.callObservers("controllerWillAttachBarView", barView, this.owner);
    },
    didAttachView(barView: BarView): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    didDetachView(barView: BarView): void {
      this.owner.callObservers("controllerDidDetachBarView", barView, this.owner);
    },
    viewDidSetBarLayout(barLayout: BarLayout | null): void {
      this.owner.callObservers("controllerDidSetBarLayout", barLayout, this.owner);
    },
    viewDidDismissTool(toolView: ToolView, toolLayout: ToolLayout, barView: BarView): void {
      toolView.remove();
    },
  })
  readonly bar!: TraitViewRef<this, Trait, BarView> & Observes<BarView>;

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

  updateLayout(): void {
    const barView = this.bar.view;
    if (barView === null) {
      return;
    }
    const barLayout = this.createLayout();
    if (barLayout === null) {
      return;
    }
    const timing = barView.getLookOr(Look.timing, Mood.navigating, false);
    barView.layout.set(barLayout, timing);
    // Immediately run resize pass to prevent layout flicker.
    barView.requireUpdate(View.NeedsResize, true);
  }

  getTool<F extends Class<ToolController>>(key: string, toolControllerClass: F): InstanceType<F> | null;
  getTool(key: string): ToolController | null;
  getTool(key: string, toolControllerClass?: Class<ToolController>): ToolController | null {
    if (toolControllerClass === void 0) {
      toolControllerClass = ToolController;
    }
    const toolController = this.getChild(key);
    return toolController instanceof toolControllerClass ? toolController : null;
  }

  getOrCreateTool<F extends Class<Instance<F, ToolController>> & Creatable<Instance<F, ToolController>>>(key: string, toolControllerClass: F): InstanceType<F> {
    let toolController = this.getChild(key, toolControllerClass);
    if (toolController === null) {
      toolController = toolControllerClass.create();
      this.setChild(key, toolController);
    }
    return toolController!;
  }

  setTool(key: string, toolController: ToolController | null): void {
    this.setChild(key, toolController);
  }

  getToolView<F extends Class<ToolView>>(key: string, toolViewClass: F): InstanceType<F> | null;
  getToolView(key: string): ToolView | null;
  getToolView(key: string, toolViewClass?: Class<ToolView>): ToolView | null {
    const barView = this.bar.view;
    return barView !== null ? barView.getTool(key, toolViewClass!) : null;
  }

  getOrCreateToolView<F extends Class<Instance<F, ToolView>> & Creatable<Instance<F, ToolView>>>(key: string, toolViewClass: F): InstanceType<F> {
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

  setToolView(key: string, toolView: ToolView | null): void {
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

  @TraitViewControllerSet({
    controllerType: ToolController,
    binds: true,
    observes: true,
    get parentView(): BarView | null {
      return this.owner.bar.view;
    },
    getTraitViewRef(toolController: ToolController): TraitViewRef<unknown, Trait, ToolView> {
      return toolController.tool;
    },
    willAttachController(toolController: ToolController): void {
      this.owner.callObservers("controllerWillAttachTool", toolController, this.owner);
    },
    didAttachController(toolController: ToolController): void {
      const toolView = toolController.tool.view;
      if (toolView !== null) {
        this.attachToolView(toolView, toolController);
      }
      this.owner.requireUpdate(Controller.NeedsAssemble);
    },
    willDetachController(toolController: ToolController): void {
      const toolView = toolController.tool.view;
      if (toolView !== null) {
        this.detachToolView(toolView, toolController);
      }
    },
    didDetachController(toolController: ToolController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
      this.owner.callObservers("controllerDidDetachTool", toolController, this.owner);
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
    controllerDidSetToolLayout(toolLayout: ToolLayout | null, toolController: ToolController): void {
      this.owner.requireUpdate(Controller.NeedsAssemble);
      this.owner.callObservers("controllerDidSetToolLayout", toolLayout, toolController, this.owner);
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
    controllerDidSetToolIcon(toolIcon: Graphics | null, toolController: ToolController): void {
      this.owner.callObservers("controllerDidSetToolIcon", toolIcon, toolController, this.owner);
    },
    controllerDidUpdateSearch(query: string, inputView: HtmlView, toolController: ToolController): void {
      this.owner.callObservers("controllerDidUpdateSearchTool", query, inputView, toolController, this.owner);
    },
    controllerDidSubmitSearch(query: string, inputView: HtmlView, toolController: ToolController): void {
      this.owner.callObservers("controllerDidSubmitSearchTool", query, inputView, toolController, this.owner);
    },
    controllerDidCancelSearch(inputView: HtmlView, toolController: ToolController): void {
      this.owner.callObservers("controllerDidCancelSearchTool", inputView, toolController, this.owner);
    },
    controllerDidPressToolView(input: PositionGestureInput, event: Event | null, toolController: ToolController): void {
      this.owner.callObservers("controllerDidPressToolView", input, event, toolController, this.owner);
    },
    controllerDidLongPressToolView(input: PositionGestureInput, toolController: ToolController): void {
      this.owner.callObservers("controllerDidLongPressToolView", input, toolController, this.owner);
    },
  })
  readonly tools!: TraitViewControllerSet<this, Trait, ToolView, ToolController> & Observes<ToolController> & Observes<TitleToolController> & Observes<ButtonToolController> & Observes<SearchToolController> & {
    attachToolView(toolView: ToolView, toolController: ToolController): void;
    detachToolView(toolView: ToolView, toolController: ToolController): void;
    attachToolContentView(toolContentView: HtmlView, toolController: ToolController): void;
    detachToolContentView(toolContentView: HtmlView, toolController: ToolController): void;
  };

  protected override onAssemble(): void {
    super.onAssemble();
    this.updateLayout();
  }
}
