// Copyright 2015-2021 Swim Inc.
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
import type {MemberFastenerClass} from "@swim/component";
import type {View} from "@swim/view";
import {Controller, TraitViewRef, TraitViewControllerRef} from "@swim/controller";
import type {GraphView} from "../graph/GraphView";
import type {GraphTrait} from "../graph/GraphTrait";
import {GraphController} from "../graph/GraphController";
import type {AxisView} from "../axis/AxisView";
import type {AxisTrait} from "../axis/AxisTrait";
import type {AxisController} from "../axis/AxisController";
import {TopAxisController} from "../axis/TopAxisController";
import {RightAxisController} from "../axis/RightAxisController";
import {BottomAxisController} from "../axis/BottomAxisController";
import {LeftAxisController} from "../axis/LeftAxisController";
import {ChartView} from "./ChartView";
import {ChartTrait} from "./ChartTrait";
import type {ChartControllerObserver} from "./ChartControllerObserver";

/** @public */
export interface ChartControllerAxisExt<D = unknown> {
  attachAxisTrait(axisTrait: AxisTrait<D>): void;
  detachAxisTrait(axisTrait: AxisTrait<D>): void;
  attachAxisView(axisView: AxisView<D>): void;
  detachAxisView(axisView: AxisView<D>): void;
}

/** @public */
export class ChartController<X = unknown, Y = unknown> extends GraphController<X, Y> {
  override readonly observerType?: Class<ChartControllerObserver<X, Y>>;

  @TraitViewRef<ChartController<X, Y>, ChartTrait<X, Y>, ChartView<X, Y>>({
    traitType: ChartTrait,
    observesTrait: true,
    initTrait(chartTrait: ChartTrait<X, Y>): void {
      this.owner.graph.setTrait(chartTrait.graph.trait);
      const topAxisTrait = chartTrait.topAxis.trait;
      if (topAxisTrait !== null) {
        this.owner.topAxis.setTrait(topAxisTrait);
      }
      const rightAxisTrait = chartTrait.rightAxis.trait;
      if (rightAxisTrait !== null) {
        this.owner.rightAxis.setTrait(rightAxisTrait);
      }
      const bottomAxisTrait = chartTrait.bottomAxis.trait;
      if (bottomAxisTrait !== null) {
        this.owner.bottomAxis.setTrait(bottomAxisTrait);
      }
      const leftAxisTrait = chartTrait.leftAxis.trait;
      if (leftAxisTrait !== null) {
        this.owner.leftAxis.setTrait(leftAxisTrait);
      }
    },
    deinitTrait(chartTrait: ChartTrait<X, Y>): void {
      const leftAxisTrait = chartTrait.leftAxis.trait;
      if (leftAxisTrait !== null) {
        this.owner.leftAxis.deleteTrait(leftAxisTrait);
      }
      const bottomAxisTrait = chartTrait.bottomAxis.trait;
      if (bottomAxisTrait !== null) {
        this.owner.bottomAxis.deleteTrait(bottomAxisTrait);
      }
      const rightAxisTrait = chartTrait.rightAxis.trait;
      if (rightAxisTrait !== null) {
        this.owner.rightAxis.deleteTrait(rightAxisTrait);
      }
      const topAxisTrait = chartTrait.topAxis.trait;
      if (topAxisTrait !== null) {
        this.owner.topAxis.deleteTrait(topAxisTrait);
      }
      this.owner.graph.setTrait(null);
    },
    willAttachTrait(newChartTrait: ChartTrait<X, Y>): void {
      this.owner.callObservers("controllerWillAttachChartTrait", newChartTrait, this.owner);
    },
    didDetachTrait(newChartTrait: ChartTrait<X, Y>): void {
      this.owner.callObservers("controllerDidDetachChartTrait", newChartTrait, this.owner);
    },
    traitWillAttachTopAxis(topAxisTrait: AxisTrait<unknown>): void {
      this.owner.topAxis.setTrait(topAxisTrait);
    },
    traitDidDetachTopAxis(topAxisTrait: AxisTrait<unknown>): void {
      this.owner.topAxis.setTrait(null);
    },
    traitWillAttachRightAxis(rightAxisTrait: AxisTrait<unknown>): void {
      this.owner.rightAxis.setTrait(rightAxisTrait);
    },
    traitDidDetachRightAxis(rightAxisTrait: AxisTrait<unknown>): void {
      this.owner.rightAxis.setTrait(null);
    },
    traitWillAttachBottomAxis(bottomAxisTrait: AxisTrait<unknown>): void {
      this.owner.bottomAxis.setTrait(bottomAxisTrait);
    },
    traitDidDetachBottomAxis(bottomAxisTrait: AxisTrait<unknown>): void {
      this.owner.bottomAxis.setTrait(null);
    },
    traitWillAttachLeftAxis(leftAxisTrait: AxisTrait<unknown>): void {
      this.owner.leftAxis.setTrait(leftAxisTrait);
    },
    traitDidDetachLeftAxis(leftAxisTrait: AxisTrait<unknown>): void {
      this.owner.leftAxis.setTrait(null);
    },
    viewType: ChartView,
    initView(chartView: ChartView<X, Y>): void {
      const topAxisController = this.owner.topAxis.controller;
      if (topAxisController !== null) {
        topAxisController.axis.insertView(chartView);
      }
      const rightAxisController = this.owner.rightAxis.controller;
      if (rightAxisController !== null) {
        rightAxisController.axis.insertView(chartView);
      }
      const bottomAxisController = this.owner.bottomAxis.controller;
      if (bottomAxisController !== null) {
        bottomAxisController.axis.insertView(chartView);
      }
      const leftAxisController = this.owner.leftAxis.controller;
      if (leftAxisController !== null) {
        leftAxisController.axis.insertView(chartView);
      }
      if (this.owner.graph.view !== null || this.owner.graph.trait !== null) {
        this.owner.graph.insertView(chartView);
      }
    },
    willAttachView(chartView: ChartView<X, Y>): void {
      this.owner.callObservers("controllerWillAttachChartView", chartView, this.owner);
    },
    didDetachView(chartView: ChartView<X, Y>): void {
      this.owner.callObservers("controllerDidDetachChartView", chartView, this.owner);
    },
  })
  readonly chart!: TraitViewRef<this, ChartTrait<X, Y>, ChartView<X, Y>>;
  static readonly chart: MemberFastenerClass<ChartController, "chart">;

  @TraitViewRef<ChartController<X, Y>, GraphTrait<X, Y>, GraphView<X, Y>>({
    extends: true,
    initTrait(graphTrait: GraphTrait<X, Y>): void {
      GraphController.graph.prototype.initTrait.call(this, graphTrait as GraphTrait);
      const chartView = this.owner.chart.view;
      if (chartView !== null) {
        this.insertView(chartView);
      }
    },
    initView(graphView: GraphView<X, Y>): void {
      GraphController.graph.prototype.initView.call(this, graphView as GraphView);
      const chartView = this.owner.chart.view;
      if (chartView !== null) {
        this.insertView(chartView);
      }
    },
    deinitView(graphView: GraphView<X, Y>): void {
      GraphController.graph.prototype.deinitView.call(this, graphView as GraphView);
      graphView.remove();
    },
  })
  override readonly graph!: TraitViewRef<this, GraphTrait<X, Y>, GraphView<X, Y>>;
  static override readonly graph: MemberFastenerClass<ChartController, "graph">;

  @TraitViewControllerRef<ChartController<X, Y>, AxisTrait<X>, AxisView<X>, AxisController<X>, ChartControllerAxisExt<X>>({
    type: TopAxisController,
    binds: true,
    observes: true,
    get parentView(): View | null {
      return this.owner.chart.view;
    },
    getTraitViewRef(controller: AxisController<X>): TraitViewRef<unknown, AxisTrait<X>, AxisView<X>> {
      return controller.axis;
    },
    willAttachController(topAxisController: AxisController<X> ): void {
      this.owner.callObservers("controllerWillAttachTopAxis", topAxisController, this.owner);
    },
    didAttachController(topAxisController: AxisController<X>): void {
      const topAxisTrait = topAxisController.axis.trait;
      if (topAxisTrait !== null) {
        this.attachAxisTrait(topAxisTrait);
      }
      const topAxisView = topAxisController.axis.view;
      if (topAxisView !== null) {
        this.attachAxisView(topAxisView);
      }
    },
    willDetachController(topAxisController: AxisController<X>): void {
      const topAxisView = topAxisController.axis.view;
      if (topAxisView !== null) {
        this.detachAxisView(topAxisView);
      }
      const topAxisTrait = topAxisController.axis.trait;
      if (topAxisTrait !== null) {
        this.detachAxisTrait(topAxisTrait);
      }
    },
    didDetachController(topAxisController: AxisController<X>): void {
      this.owner.callObservers("controllerDidDetachTopAxis", topAxisController, this.owner);
    },
    controllerWillAttachAxisTrait(topAxisTrait: AxisTrait<X>): void {
      this.owner.callObservers("controllerWillAttachTopAxisTrait", topAxisTrait, this.owner);
      this.attachAxisTrait(topAxisTrait);
    },
    controllerDidDetachAxisTrait(topAxisTrait: AxisTrait<X>): void {
      this.detachAxisTrait(topAxisTrait);
      this.owner.callObservers("controllerDidDetachTopAxisTrait", topAxisTrait, this.owner);
    },
    attachAxisTrait(topAxisTrait: AxisTrait<X>): void {
      // hook
    },
    detachAxisTrait(topAxisTrait: AxisTrait<X>): void {
      // hook
    },
    controllerWillAttachAxisView(topAxisView: AxisView<X>): void {
      this.owner.callObservers("controllerWillAttachTopAxisView", topAxisView, this.owner);
      this.attachAxisView(topAxisView);
    },
    controllerDidDetachAxisView(topAxisView: AxisView<X>): void {
      this.detachAxisView(topAxisView);
      this.owner.callObservers("controllerDidDetachTopAxisView", topAxisView, this.owner);
    },
    attachAxisView(topAxisView: AxisView<X>): void {
      // hook
    },
    detachAxisView(topAxisView: AxisView<X>): void {
      topAxisView.remove();
    },
    detectController(controller: Controller): AxisController<X> | null {
      return controller instanceof TopAxisController ? controller : null;
    },
  })
  readonly topAxis!: TraitViewControllerRef<this, AxisTrait<X>, AxisView<X>, AxisController<X>>;
  static readonly topAxis: MemberFastenerClass<ChartController, "topAxis">;

  @TraitViewControllerRef<ChartController<X, Y>, AxisTrait<Y>, AxisView<Y>, AxisController<Y>, ChartControllerAxisExt<Y>>({
    type: RightAxisController,
    binds: true,
    observes: true,
    get parentView(): View | null {
      return this.owner.chart.view;
    },
    getTraitViewRef(controller: AxisController<Y>): TraitViewRef<unknown, AxisTrait<Y>, AxisView<Y>> {
      return controller.axis;
    },
    willAttachController(rightAxisController: AxisController<Y>): void {
      this.owner.callObservers("controllerWillAttachRightAxis", rightAxisController, this.owner);
    },
    didAttachController(rightAxisController: AxisController<Y>): void {
      const rightAxisTrait = rightAxisController.axis.trait;
      if (rightAxisTrait !== null) {
        this.attachAxisTrait(rightAxisTrait);
      }
      const rightAxisView = rightAxisController.axis.view;
      if (rightAxisView !== null) {
        this.attachAxisView(rightAxisView);
      }
    },
    willDetachController(rightAxisController: AxisController<Y>): void {
      const rightAxisView = rightAxisController.axis.view;
      if (rightAxisView !== null) {
        this.detachAxisView(rightAxisView);
      }
      const rightAxisTrait = rightAxisController.axis.trait;
      if (rightAxisTrait !== null) {
        this.detachAxisTrait(rightAxisTrait);
      }
    },
    didDetachController(rightAxisController: AxisController<Y>): void {
      this.owner.callObservers("controllerDidDetachRightAxis", rightAxisController, this.owner);
    },
    controllerWillAttachAxisTrait(rightAxisTrait: AxisTrait<Y>): void {
      this.owner.callObservers("controllerWillAttachRightAxisTrait", rightAxisTrait, this.owner);
      this.attachAxisTrait(rightAxisTrait);
    },
    controllerDidDetachAxisTrait(rightAxisTrait: AxisTrait<Y>): void {
      this.detachAxisTrait(rightAxisTrait);
      this.owner.callObservers("controllerDidDetachRightAxisTrait", rightAxisTrait, this.owner);
    },
    attachAxisTrait(rightAxisTrait: AxisTrait<Y>): void {
      // hook
    },
    detachAxisTrait(rightAxisTrait: AxisTrait<Y>): void {
      // hook
    },
    controllerWillAttachAxisView(rightAxisView: AxisView<Y>): void {
      this.owner.callObservers("controllerWillAttachRightAxisView", rightAxisView, this.owner);
      this.attachAxisView(rightAxisView);
    },
    controllerDidDetachAxisView(rightAxisView: AxisView<Y>): void {
      this.detachAxisView(rightAxisView);
      this.owner.callObservers("controllerDidDetachRightAxisView", rightAxisView, this.owner);
    },
    attachAxisView(rightAxisView: AxisView<Y>): void {
      // hook
    },
    detachAxisView(rightAxisView: AxisView<Y>): void {
      rightAxisView.remove();
    },
    detectController(controller: Controller): AxisController<Y> | null {
      return controller instanceof RightAxisController ? controller : null;
    },
  })
  readonly rightAxis!: TraitViewControllerRef<this, AxisTrait<Y>, AxisView<Y>, AxisController<Y>>;
  static readonly rightAxis: MemberFastenerClass<ChartController, "rightAxis">;

  @TraitViewControllerRef<ChartController<X, Y>, AxisTrait<X>, AxisView<X>, AxisController<X>, ChartControllerAxisExt<X>>({
    type: BottomAxisController,
    binds: true,
    observes: true,
    get parentView(): View | null {
      return this.owner.chart.view;
    },
    getTraitViewRef(controller: AxisController<X>): TraitViewRef<unknown, AxisTrait<X>, AxisView<X>> {
      return controller.axis;
    },
    willAttachController(bottomAxisController: AxisController<X>): void {
      this.owner.callObservers("controllerWillAttachBottomAxis", bottomAxisController, this.owner);
    },
    didAttachController(bottomAxisController: AxisController<X>): void {
      const bottomAxisTrait = bottomAxisController.axis.trait;
      if (bottomAxisTrait !== null) {
        this.attachAxisTrait(bottomAxisTrait);
      }
      const bottomAxisView = bottomAxisController.axis.view;
      if (bottomAxisView !== null) {
        this.attachAxisView(bottomAxisView);
      }
    },
    willDetachController(bottomAxisController: AxisController<X>): void {
      const bottomAxisView = bottomAxisController.axis.view;
      if (bottomAxisView !== null) {
        this.detachAxisView(bottomAxisView);
      }
      const bottomAxisTrait = bottomAxisController.axis.trait;
      if (bottomAxisTrait !== null) {
        this.detachAxisTrait(bottomAxisTrait);
      }
    },
    didDetachController(bottomAxisController: AxisController<X>): void {
      this.owner.callObservers("controllerDidDetachBottomAxis", bottomAxisController, this.owner);
    },
    controllerWillAttachAxisTrait(bottomAxisTrait: AxisTrait<X>): void {
      this.owner.callObservers("controllerWillAttachBottomAxisTrait", bottomAxisTrait, this.owner);
      this.attachAxisTrait(bottomAxisTrait);
    },
    controllerDidDetachAxisTrait(bottomAxisTrait: AxisTrait<X>): void {
      this.detachAxisTrait(bottomAxisTrait);
      this.owner.callObservers("controllerDidDetachBottomAxisTrait", bottomAxisTrait, this.owner);
    },
    attachAxisTrait(bottomAxisTrait: AxisTrait<X>): void {
      // hook
    },
    detachAxisTrait(bottomAxisTrait: AxisTrait<X>): void {
      // hook
    },
    controllerWillAttachAxisView(bottomAxisView: AxisView<X>): void {
      this.owner.callObservers("controllerWillAttachBottomAxisView", bottomAxisView, this.owner);
      this.attachAxisView(bottomAxisView);
    },
    controllerDidDetachAxisView(bottomAxisView: AxisView<X>): void {
      this.detachAxisView(bottomAxisView);
      this.owner.callObservers("controllerDidDetachBottomAxisView", bottomAxisView, this.owner);
    },
    attachAxisView(bottomAxisView: AxisView<X>): void {
      // hook
    },
    detachAxisView(bottomAxisView: AxisView<X>): void {
      bottomAxisView.remove();
    },
    detectController(controller: Controller): AxisController<X> | null {
      return controller instanceof BottomAxisController ? controller : null;
    },
  })
  readonly bottomAxis!: TraitViewControllerRef<this, AxisTrait<X>, AxisView<X>, AxisController<X>>;
  static readonly bottomAxis: MemberFastenerClass<ChartController, "bottomAxis">;

  @TraitViewControllerRef<ChartController<X, Y>, AxisTrait<Y>, AxisView<Y>, AxisController<Y>, ChartControllerAxisExt<Y>>({
    type: LeftAxisController,
    binds: true,
    observes: true,
    get parentView(): View | null {
      return this.owner.chart.view;
    },
    getTraitViewRef(controller: AxisController<Y>): TraitViewRef<unknown, AxisTrait<Y>, AxisView<Y>> {
      return controller.axis;
    },
    willAttachController(leftAxisController: AxisController<Y>): void {
      this.owner.callObservers("controllerWillAttachLeftAxis", leftAxisController, this.owner);
    },
    didAttachController(leftAxisController: AxisController<Y>): void {
      const leftAxisTrait = leftAxisController.axis.trait;
      if (leftAxisTrait !== null) {
        this.attachAxisTrait(leftAxisTrait);
      }
      const leftAxisView = leftAxisController.axis.view;
      if (leftAxisView !== null) {
        this.attachAxisView(leftAxisView);
      }
    },
    willDetachController(leftAxisController: AxisController<Y>): void {
      const leftAxisView = leftAxisController.axis.view;
      if (leftAxisView !== null) {
        this.detachAxisView(leftAxisView);
      }
      const leftAxisTrait = leftAxisController.axis.trait;
      if (leftAxisTrait !== null) {
        this.detachAxisTrait(leftAxisTrait);
      }
    },
    didDetachController(leftAxisController: AxisController<Y>): void {
      this.owner.callObservers("controllerDidDetachLeftAxis", leftAxisController, this.owner);
    },
    controllerWillAttachAxisTrait(leftAxisTrait: AxisTrait<Y>): void {
      this.owner.callObservers("controllerWillAttachLeftAxisTrait", leftAxisTrait, this.owner);
      this.attachAxisTrait(leftAxisTrait);
    },
    controllerDidDetachAxisTrait(leftAxisTrait: AxisTrait<Y>): void {
      this.detachAxisTrait(leftAxisTrait);
      this.owner.callObservers("controllerDidDetachLeftAxisTrait", leftAxisTrait, this.owner);
    },
    attachAxisTrait(leftAxisTrait: AxisTrait<Y>): void {
      // hook
    },
    detachAxisTrait(leftAxisTrait: AxisTrait<Y>): void {
      // hook
    },
    controllerWillAttachAxisView(leftAxisView: AxisView<Y>): void {
      this.owner.callObservers("controllerWillAttachLeftAxisView", leftAxisView, this.owner);
      this.attachAxisView(leftAxisView);
    },
    controllerDidDetachAxisView(leftAxisView: AxisView<Y>): void {
      this.detachAxisView(leftAxisView);
      this.owner.callObservers("controllerDidDetachLeftAxisView", leftAxisView, this.owner);
    },
    attachAxisView(leftAxisView: AxisView<Y>): void {
      // hook
    },
    detachAxisView(leftAxisView: AxisView<Y>): void {
      leftAxisView.remove();
    },
    detectController(controller: Controller): AxisController<Y> | null {
      return controller instanceof LeftAxisController ? controller : null;
    },
  })
  readonly leftAxis!: TraitViewControllerRef<this, AxisTrait<Y>, AxisView<Y>, AxisController<Y>>;
  static readonly leftAxis: MemberFastenerClass<ChartController, "leftAxis">;
}
