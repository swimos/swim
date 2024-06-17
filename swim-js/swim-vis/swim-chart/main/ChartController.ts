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
import type {View} from "@swim/view";
import type {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerRef} from "@swim/controller";
import type {GraphControllerObserver} from "./GraphController";
import type {GraphView} from "./GraphView";
import type {GraphTrait} from "./GraphTrait";
import {GraphController} from "./GraphController";
import type {AxisView} from "./AxisView";
import type {AxisTrait} from "./AxisTrait";
import type {AxisController} from "./AxisController";
import {TopAxisController} from "./AxisController";
import {RightAxisController} from "./AxisController";
import {BottomAxisController} from "./AxisController";
import {LeftAxisController} from "./AxisController";
import {ChartView} from "./ChartView";
import {ChartTrait} from "./ChartTrait";

/** @public */
export interface ChartControllerObserver<X = unknown, Y = unknown, C extends ChartController<X, Y> = ChartController<X, Y>> extends GraphControllerObserver<X, Y, C> {
  controllerWillAttachChartTrait?(chartTrait: ChartTrait<X, Y>, controller: C): void;

  controllerDidDetachChartTrait?(chartTrait: ChartTrait<X, Y>, controller: C): void;

  controllerWillAttachChartView?(chartView: ChartView<X, Y>, controller: C): void;

  controllerDidDetachChartView?(chartView: ChartView<X, Y>, controller: C): void;

  controllerWillAttachTopAxis?(topAxisController: AxisController<X>, controller: C): void;

  controllerDidDetachTopAxis?(topAxisController: AxisController<X>, controller: C): void;

  controllerWillAttachTopAxisTrait?(topAxisTrait: AxisTrait<X>, controller: C): void;

  controllerDidDetachTopAxisTrait?(topAxisTrait: AxisTrait<X>, controller: C): void;

  controllerWillAttachTopAxisView?(topAxisView: AxisView<X>, controller: C): void;

  controllerDidDetachTopAxisView?(topAxisView: AxisView<X>, controller: C): void;

  controllerWillAttachRightAxis?(rightAxisController: AxisController<Y>, controller: C): void;

  controllerDidDetachRightAxis?(rightAxisController: AxisController<Y>, controller: C): void;

  controllerWillAttachRightAxisTrait?(rightAxisTrait: AxisTrait<Y>, controller: C): void;

  controllerDidDetachRightAxisTrait?(rightAxisTrait: AxisTrait<Y>, controller: C): void;

  controllerWillAttachRightAxisView?(rightAxisView: AxisView<Y>, controller: C): void;

  controllerDidDetachRightAxisView?(rightAxisView: AxisView<Y>, controller: C): void;

  controllerWillAttachBottomAxis?(bottomAxisController: AxisController<X>, controller: C): void;

  controllerDidDetachBottomAxis?(bottomAxisController: AxisController<X>, controller: C): void;

  controllerWillAttachBottomAxisTrait?(bottomAxisTrait: AxisTrait<X>, controller: C): void;

  controllerDidDetachBottomAxisTrait?(bottomAxisTrait: AxisTrait<X>, controller: C): void;

  controllerWillAttachBottomAxisView?(bottomAxisView: AxisView<X>, controller: C): void;

  controllerDidDetachBottomAxisView?(bottomAxisView: AxisView<X>, controller: C): void;

  controllerWillAttachLeftAxis?(leftAxisController: AxisController<Y>, controller: C): void;

  controllerDidDetachLeftAxis?(leftAxisController: AxisController<Y>, controller: C): void;

  controllerWillAttachLeftAxisTrait?(leftAxisTrait: AxisTrait<Y>, controller: C): void;

  controllerDidDetachLeftAxisTrait?(leftAxisTrait: AxisTrait<Y>, controller: C): void;

  controllerWillAttachLeftAxisView?(leftAxisView: AxisView<Y>, controller: C): void;

  controllerDidDetachLeftAxisView?(leftAxisView: AxisView<Y>, controller: C): void;
}

/** @public */
export class ChartController<X = unknown, Y = unknown> extends GraphController<X, Y> {
  declare readonly observerType?: Class<ChartControllerObserver<X, Y>>;

  @TraitViewRef({
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
  readonly chart!: TraitViewRef<this, ChartTrait<X, Y>, ChartView<X, Y>> & Observes<ChartTrait<X, Y>>;

  @TraitViewRef({
    extends: true,
    initTrait(graphTrait: GraphTrait<X, Y>): void {
      super.initTrait(graphTrait as GraphTrait);
      const chartView = this.owner.chart.view;
      if (chartView !== null) {
        this.insertView(chartView);
      }
    },
    initView(graphView: GraphView<X, Y>): void {
      super.initView(graphView as GraphView);
      const chartView = this.owner.chart.view;
      if (chartView !== null) {
        this.insertView(chartView);
      }
    },
    deinitView(graphView: GraphView<X, Y>): void {
      super.deinitView(graphView as GraphView);
      graphView.remove();
    },
  })
  override readonly graph!: TraitViewRef<this, GraphTrait<X, Y>, GraphView<X, Y>> & GraphController<X, Y>["graph"];

  @TraitViewControllerRef({
    controllerType: TopAxisController,
    binds: true,
    observes: true,
    get parentView(): View | null {
      return this.owner.chart.view;
    },
    getTraitViewRef(controller: AxisController<X>): TraitViewRef<unknown, AxisTrait<X>, AxisView<X>> {
      return controller.axis;
    },
    willAttachController(topAxisController: AxisController<X>): void {
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
  readonly topAxis!: TraitViewControllerRef<this, AxisTrait<X>, AxisView<X>, AxisController<X>> & Observes<AxisController<X>> & {
    attachAxisTrait(axisTrait: AxisTrait<X>): void,
    detachAxisTrait(axisTrait: AxisTrait<X>): void,
    attachAxisView(axisView: AxisView<X>): void,
    detachAxisView(axisView: AxisView<X>): void,
  };

  @TraitViewControllerRef({
    controllerType: RightAxisController,
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
  readonly rightAxis!: TraitViewControllerRef<this, AxisTrait<Y>, AxisView<Y>, AxisController<Y>> & Observes<AxisController<Y>> & {
    attachAxisTrait(axisTrait: AxisTrait<Y>): void,
    detachAxisTrait(axisTrait: AxisTrait<Y>): void,
    attachAxisView(axisView: AxisView<Y>): void,
    detachAxisView(axisView: AxisView<Y>): void,
  };

  @TraitViewControllerRef({
    controllerType: BottomAxisController,
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
  readonly bottomAxis!: TraitViewControllerRef<this, AxisTrait<X>, AxisView<X>, AxisController<X>> & Observes<AxisController<X>> & {
    attachAxisTrait(axisTrait: AxisTrait<X>): void;
    detachAxisTrait(axisTrait: AxisTrait<X>): void;
    attachAxisView(axisView: AxisView<X>): void;
    detachAxisView(axisView: AxisView<X>): void;
  };

  @TraitViewControllerRef({
    controllerType: LeftAxisController,
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
  readonly leftAxis!: TraitViewControllerRef<this, AxisTrait<Y>, AxisView<Y>, AxisController<Y>> & Observes<AxisController<Y>> & {
    attachAxisTrait(axisTrait: AxisTrait<Y>): void;
    detachAxisTrait(axisTrait: AxisTrait<Y>): void;
    attachAxisView(axisView: AxisView<Y>): void;
    detachAxisView(axisView: AxisView<Y>): void;
  };
}
