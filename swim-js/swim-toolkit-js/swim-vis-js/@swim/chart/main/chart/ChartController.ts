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

import type {Trait} from "@swim/model";
import {Controller, ControllerViewTrait, ControllerFastener} from "@swim/controller";
import type {GraphView} from "../graph/GraphView";
import type {GraphTrait} from "../graph/GraphTrait";
import {GraphController} from "../graph/GraphController";
import type {AxisView} from "../axis/AxisView";
import type {AxisTrait} from "../axis/AxisTrait";
import {AxisController} from "../axis/AxisController";
import {TopAxisController} from "../axis/TopAxisController";
import {RightAxisController} from "../axis/RightAxisController";
import {BottomAxisController} from "../axis/BottomAxisController";
import {LeftAxisController} from "../axis/LeftAxisController";
import {ChartView} from "./ChartView";
import {ChartTrait} from "./ChartTrait";
import type {ChartControllerObserver} from "./ChartControllerObserver";

export class ChartController<X, Y> extends GraphController<X, Y> {
  override readonly controllerObservers!: ReadonlyArray<ChartControllerObserver<X, Y>>;

  protected initChartTrait(chartTrait: ChartTrait<X, Y>): void {
    // hook
  }

  protected attachChartTrait(chartTrait: ChartTrait<X, Y>): void {
    this.graph.setTrait(chartTrait.graph.trait);
    const topAxisTrait = chartTrait.topAxis.trait;
    if (topAxisTrait !== null) {
      this.insertTopAxisTrait(topAxisTrait);
    }
    const rightAxisTrait = chartTrait.rightAxis.trait;
    if (rightAxisTrait !== null) {
      this.insertRightAxisTrait(rightAxisTrait);
    }
    const bottomAxisTrait = chartTrait.bottomAxis.trait;
    if (bottomAxisTrait !== null) {
      this.insertBottomAxisTrait(bottomAxisTrait);
    }
    const leftAxisTrait = chartTrait.leftAxis.trait;
    if (leftAxisTrait !== null) {
      this.insertLeftAxisTrait(leftAxisTrait);
    }
  }

  protected detachChartTrait(chartTrait: ChartTrait<X, Y>): void {
    const leftAxisTrait = chartTrait.leftAxis.trait;
    if (leftAxisTrait !== null) {
      this.removeLeftAxisTrait(leftAxisTrait);
    }
    const bottomAxisTrait = chartTrait.bottomAxis.trait;
    if (bottomAxisTrait !== null) {
      this.removeBottomAxisTrait(bottomAxisTrait);
    }
    const rightAxisTrait = chartTrait.rightAxis.trait;
    if (rightAxisTrait !== null) {
      this.removeRightAxisTrait(rightAxisTrait);
    }
    const topAxisTrait = chartTrait.topAxis.trait;
    if (topAxisTrait !== null) {
      this.removeTopAxisTrait(topAxisTrait);
    }
    this.graph.setTrait(null);
  }

  protected willSetChartTrait(newGraphTrait: ChartTrait<X, Y> | null, oldGraphTrait: ChartTrait<X, Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetChartTrait !== void 0) {
        controllerObserver.controllerWillSetChartTrait(newGraphTrait, oldGraphTrait, this);
      }
    }
  }

  protected onSetChartTrait(newGraphTrait: ChartTrait<X, Y> | null, oldGraphTrait: ChartTrait<X, Y> | null): void {
    if (oldGraphTrait !== null) {
      this.detachChartTrait(oldGraphTrait);
    }
    if (newGraphTrait !== null) {
      this.attachChartTrait(newGraphTrait);
      this.initChartTrait(newGraphTrait);
    }
  }

  protected didSetChartTrait(newGraphTrait: ChartTrait<X, Y> | null, oldGraphTrait: ChartTrait<X, Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetChartTrait !== void 0) {
        controllerObserver.controllerDidSetChartTrait(newGraphTrait, oldGraphTrait, this);
      }
    }
  }

  protected createChartView(): ChartView<X, Y> | null {
    return ChartView.create<X, Y>();
  }

  protected initChartView(chartView: ChartView<X, Y>): void {
    // hook
  }

  protected attachChartView(chartView: ChartView<X, Y>): void {
    const topAxisController = this.topAxis.controller;
    if (topAxisController !== null) {
      topAxisController.axis.injectView(chartView);
    }
    const rightAxisController = this.rightAxis.controller;
    if (rightAxisController !== null) {
      rightAxisController.axis.injectView(chartView);
    }
    const bottomAxisController = this.bottomAxis.controller;
    if (bottomAxisController !== null) {
      bottomAxisController.axis.injectView(chartView);
    }
    const leftAxisController = this.leftAxis.controller;
    if (leftAxisController !== null) {
      leftAxisController.axis.injectView(chartView);
    }
    if (this.graph.view !== null || this.graph.trait !== null) {
      this.graph.injectView(chartView);
    }
  }

  protected detachChartView(chartView: ChartView<X, Y>): void {
    // hook
  }

  protected willSetChartView(newChartView: ChartView<X, Y> | null, oldChartView: ChartView<X, Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetChartView !== void 0) {
        controllerObserver.controllerWillSetChartView(newChartView, oldChartView, this);
      }
    }
  }

  protected onSetChartView(newChartView: ChartView<X, Y> | null, oldChartView: ChartView<X, Y> | null): void {
    if (oldChartView !== null) {
      this.detachChartView(oldChartView);
    }
    if (newChartView !== null) {
      this.attachChartView(newChartView);
      this.initChartView(newChartView);
    }
  }

  protected didSetChartView(newChartView: ChartView<X, Y> | null, oldChartView: ChartView<X, Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetChartView !== void 0) {
        controllerObserver.controllerDidSetChartView(newChartView, oldChartView, this);
      }
    }
  }

  /** @hidden */
  static ChartFastener = ControllerViewTrait.define<ChartController<unknown, unknown>, ChartView<unknown, unknown>, ChartTrait<unknown, unknown>>({
    viewType: ChartView,
    willSetView(newChartView: ChartView<unknown, unknown> | null, oldChartView: ChartView<unknown, unknown> | null): void {
      this.owner.willSetChartView(newChartView, oldChartView);
    },
    onSetView(newChartView: ChartView<unknown, unknown> | null, oldChartView: ChartView<unknown, unknown> | null): void {
      this.owner.onSetChartView(newChartView, oldChartView);
    },
    didSetView(newChartView: ChartView<unknown, unknown> | null, oldChartView: ChartView<unknown, unknown> | null): void {
      this.owner.didSetChartView(newChartView, oldChartView);
    },
    createView(): ChartView<unknown, unknown> | null {
      return this.owner.createChartView();
    },
    traitType: ChartTrait,
    observeTrait: true,
    willSetTrait(newChartTrait: ChartTrait<unknown, unknown> | null, oldChartTrait: ChartTrait<unknown, unknown> | null): void {
      this.owner.willSetChartTrait(newChartTrait, oldChartTrait);
    },
    onSetTrait(newChartTrait: ChartTrait<unknown, unknown> | null, oldChartTrait: ChartTrait<unknown, unknown> | null): void {
      this.owner.onSetChartTrait(newChartTrait, oldChartTrait);
    },
    didSetTrait(newChartTrait: ChartTrait<unknown, unknown> | null, oldChartTrait: ChartTrait<unknown, unknown> | null): void {
      this.owner.didSetChartTrait(newChartTrait, oldChartTrait);
    },
    traitWillSetTopAxis(newTopAxisTrait: AxisTrait<unknown> | null, oldTopAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (oldTopAxisTrait !== null) {
        this.owner.removeTopAxisTrait(oldTopAxisTrait);
      }
    },
    traitDidSetTopAxis(newTopAxisTrait: AxisTrait<unknown> | null, oldTopAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (newTopAxisTrait !== null) {
        this.owner.insertTopAxisTrait(newTopAxisTrait);
      }
    },
    traitWillSetRightAxis(newRightAxisTrait: AxisTrait<unknown> | null, oldRightAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (oldRightAxisTrait !== null) {
        this.owner.removeRightAxisTrait(oldRightAxisTrait);
      }
    },
    traitDidSetRightAxis(newRightAxisTrait: AxisTrait<unknown> | null, oldRightAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (newRightAxisTrait !== null) {
        this.owner.insertRightAxisTrait(newRightAxisTrait);
      }
    },
    traitWillSetBottomAxis(newBottomAxisTrait: AxisTrait<unknown> | null, oldBottomAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (oldBottomAxisTrait !== null) {
        this.owner.removeBottomAxisTrait(oldBottomAxisTrait);
      }
    },
    traitDidSetBottomAxis(newBottomAxisTrait: AxisTrait<unknown> | null, oldBottomAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (newBottomAxisTrait !== null) {
        this.owner.insertBottomAxisTrait(newBottomAxisTrait);
      }
    },
    traitWillSetLeftAxis(newLeftAxisTrait: AxisTrait<unknown> | null, oldLeftAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (oldLeftAxisTrait !== null) {
        this.owner.removeLeftAxisTrait(oldLeftAxisTrait);
      }
    },
    traitDidSetLeftAxis(newLeftAxisTrait: AxisTrait<unknown> | null, oldLeftAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (newLeftAxisTrait !== null) {
        this.owner.insertLeftAxisTrait(newLeftAxisTrait);
      }
    },
  });

  @ControllerViewTrait<ChartController<X, Y>, ChartView<X, Y>, ChartTrait<X, Y>>({
    extends: ChartController.ChartFastener,
  })
  readonly chart!: ControllerViewTrait<this, ChartView<X, Y>, ChartTrait<X, Y>>;

  protected override attachGraphTrait(graphTrait: GraphTrait<X, Y>): void {
    super.attachGraphTrait(graphTrait);
    const chartView = this.chart.view;
    if (chartView !== null) {
      this.graph.injectView(chartView);
    }
  }

  protected override attachGraphView(graphView: GraphView<X, Y>): void {
    super.attachGraphView(graphView);
    const chartView = this.chart.view;
    if (chartView !== null) {
      this.graph.injectView(chartView);
    }
  }

  protected override detachGraphView(graphView: GraphView<X, Y>): void {
    graphView.remove();
  }

  protected createTopAxis(topAxisTrait: AxisTrait<X>): AxisController<X> | null {
    return new TopAxisController<X>();
  }

  protected initTopAxis(topAxisController: AxisController<X>): void {
    const topAxisTrait = topAxisController.axis.trait;
    if (topAxisTrait !== null) {
      this.initTopAxisTrait(topAxisTrait);
    }
    const topAxisView = topAxisController.axis.view;
    if (topAxisView !== null) {
      this.initTopAxisView(topAxisView);
    }
  }

  protected attachTopAxis(topAxisController: AxisController<X>): void {
    const topAxisTrait = topAxisController.axis.trait;
    if (topAxisTrait !== null) {
      this.attachTopAxisTrait(topAxisTrait);
    }
    const topAxisView = topAxisController.axis.view;
    if (topAxisView !== null) {
      this.attachTopAxisView(topAxisView);
    }
  }

  protected detachTopAxis(topAxisController: AxisController<X>): void {
    const topAxisTrait = topAxisController.axis.trait;
    if (topAxisTrait !== null) {
      this.detachTopAxisTrait(topAxisTrait);
    }
    const topAxisView = topAxisController.axis.view;
    if (topAxisView !== null) {
      this.detachTopAxisView(topAxisView);
    }
  }

  protected willSetTopAxis(newTopAxisController: AxisController<X> | null, oldTopAxisController: AxisController<X> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTopAxis !== void 0) {
        controllerObserver.controllerWillSetTopAxis(newTopAxisController, oldTopAxisController, this);
      }
    }
  }

  protected onSetTopAxis(newTopAxisController: AxisController<X> | null, oldTopAxisController: AxisController<X> | null): void {
    if (oldTopAxisController !== null) {
      this.detachTopAxis(oldTopAxisController);
    }
    if (newTopAxisController !== null) {
      this.attachTopAxis(newTopAxisController);
      this.initTopAxis(newTopAxisController);
    }
  }

  protected didSetTopAxis(newTopAxisController: AxisController<X> | null, oldTopAxisController: AxisController<X> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTopAxis !== void 0) {
        controllerObserver.controllerDidSetTopAxis(newTopAxisController, oldTopAxisController, this);
      }
    }
  }

  protected insertTopAxisTrait(topAxisTrait: AxisTrait<X>, targetTrait: Trait | null = null): void {
    const childControllers = this.childControllers;
    let targetController: AxisController<unknown> | null = null;
    for (let i = 0, n = childControllers.length; i < n; i += 1) {
      const childController = childControllers[i]!;
      if (childController instanceof AxisController) {
        if (childController.axis.trait === topAxisTrait) {
          return;
        } else if (childController.axis.trait === targetTrait) {
          targetController = childController;
        }
      }
    }
    const topAxisController = this.createTopAxis(topAxisTrait);
    if (topAxisController !== null) {
      topAxisController.axis.setTrait(topAxisTrait);
      this.topAxis.setController(topAxisController, targetController);
      this.insertChildController(topAxisController, targetController);
      if (topAxisController.axis.view === null) {
        const topAxisView = this.createTopAxisView(topAxisController);
        let targetView: AxisView<unknown> | null = null;
        if (targetController !== null) {
          targetView = targetController.axis.view;
        }
        const chartView = this.chart.view;
        if (chartView !== null) {
          topAxisController.axis.injectView(chartView, topAxisView, targetView, null);
        } else {
          topAxisController.axis.setView(topAxisView, targetView);
        }
      }
    }
  }

  protected removeTopAxisTrait(topAxisTrait: AxisTrait<X>): void {
    const childControllers = this.childControllers;
    for (let i = 0, n = childControllers.length; i < n; i += 1) {
      const childController = childControllers[i]!;
      if (childController instanceof AxisController && childController.axis.trait === topAxisTrait) {
        this.topAxis.setController(null);
        childController.remove();
        return;
      }
    }
  }

  protected initTopAxisTrait(topAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected attachTopAxisTrait(topAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected detachTopAxisTrait(topAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected willSetTopAxisTrait(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTopAxisTrait !== void 0) {
        controllerObserver.controllerWillSetTopAxisTrait(newTopAxisTrait, oldTopAxisTrait, this);
      }
    }
  }

  protected onSetTopAxisTrait(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null): void {
    if (oldTopAxisTrait !== null) {
      this.detachTopAxisTrait(oldTopAxisTrait);
    }
    if (newTopAxisTrait !== null) {
      this.attachTopAxisTrait(newTopAxisTrait);
      this.initTopAxisTrait(newTopAxisTrait);
    }
  }

  protected didSetTopAxisTrait(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTopAxisTrait !== void 0) {
        controllerObserver.controllerDidSetTopAxisTrait(newTopAxisTrait, oldTopAxisTrait, this);
      }
    }
  }

  protected createTopAxisView(topAxisController: AxisController<X>): AxisView<X> | null {
    return topAxisController.axis.createView();
  }

  protected initTopAxisView(topAxisView: AxisView<X>): void {
    // hook
  }

  protected attachTopAxisView(topAxisView: AxisView<X>): void {
    // hook
  }

  protected detachTopAxisView(topAxisView: AxisView<X>): void {
    topAxisView.remove();
  }

  protected willSetTopAxisView(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTopAxisView !== void 0) {
        controllerObserver.controllerWillSetTopAxisView(newTopAxisView, oldTopAxisView, this);
      }
    }
  }

  protected onSetTopAxisView(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null): void {
    if (oldTopAxisView !== null) {
      this.detachTopAxisView(oldTopAxisView);
    }
    if (newTopAxisView !== null) {
      this.attachTopAxisView(newTopAxisView);
      this.initTopAxisView(newTopAxisView);
    }
  }

  protected didSetTopAxisView(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTopAxisView !== void 0) {
        controllerObserver.controllerDidSetTopAxisView(newTopAxisView, oldTopAxisView, this);
      }
    }
  }

  /** @hidden */
  static TopAxisFastener = ControllerFastener.define<ChartController<unknown, unknown>, AxisController<unknown>>({
    type: TopAxisController,
    observe: true,
    willSetController(newTopAxisController: AxisController<unknown> | null, oldTopAxisController: AxisController<unknown> | null): void {
      this.owner.willSetTopAxis(newTopAxisController, oldTopAxisController);
    },
    onSetController(newTopAxisController: AxisController<unknown> | null, oldTopAxisController: AxisController<unknown> | null): void {
      this.owner.onSetTopAxis(newTopAxisController, oldTopAxisController);
    },
    didSetController(newTopAxisController: AxisController<unknown> | null, oldTopAxisController: AxisController<unknown> | null): void {
      this.owner.didSetTopAxis(newTopAxisController, oldTopAxisController);
    },
    controllerWillSetAxisTrait(newTopAxisTrait: AxisTrait<unknown> | null, oldTopAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.willSetTopAxisTrait(newTopAxisTrait, oldTopAxisTrait);
    },
    controllerDidSetAxisTrait(newTopAxisTrait: AxisTrait<unknown> | null, oldTopAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.onSetTopAxisTrait(newTopAxisTrait, oldTopAxisTrait);
      this.owner.didSetTopAxisTrait(newTopAxisTrait, oldTopAxisTrait);
    },
    controllerWillSetAxisView(newTopAxisView: AxisView<unknown> | null, oldTopAxisView: AxisView<unknown> | null): void {
      this.owner.willSetTopAxisView(newTopAxisView, oldTopAxisView);
    },
    controllerDidSetAxisView(newTopAxisView: AxisView<unknown> | null, oldTopAxisView: AxisView<unknown> | null): void {
      this.owner.onSetTopAxisView(newTopAxisView, oldTopAxisView);
      this.owner.didSetTopAxisView(newTopAxisView, oldTopAxisView);
    },
  });

  @ControllerFastener<ChartController<X, Y>, AxisController<X>>({
    extends: ChartController.TopAxisFastener,
  })
  readonly topAxis!: ControllerFastener<this, AxisController<X>>;

  protected createRightAxis(rightAxisTrait: AxisTrait<Y>): AxisController<Y> | null {
    return new RightAxisController<Y>();
  }

  protected initRightAxis(rightAxisController: AxisController<Y>): void {
    const rightAxisTrait = rightAxisController.axis.trait;
    if (rightAxisTrait !== null) {
      this.initRightAxisTrait(rightAxisTrait);
    }
    const rightAxisView = rightAxisController.axis.view;
    if (rightAxisView !== null) {
      this.initRightAxisView(rightAxisView);
    }
  }

  protected attachRightAxis(rightAxisController: AxisController<Y>): void {
    const rightAxisTrait = rightAxisController.axis.trait;
    if (rightAxisTrait !== null) {
      this.attachRightAxisTrait(rightAxisTrait);
    }
    const rightAxisView = rightAxisController.axis.view;
    if (rightAxisView !== null) {
      this.attachRightAxisView(rightAxisView);
    }
  }

  protected detachRightAxis(rightAxisController: AxisController<Y>): void {
    const rightAxisTrait = rightAxisController.axis.trait;
    if (rightAxisTrait !== null) {
      this.detachRightAxisTrait(rightAxisTrait);
    }
    const rightAxisView = rightAxisController.axis.view;
    if (rightAxisView !== null) {
      this.detachRightAxisView(rightAxisView);
    }
  }

  protected willSetRightAxis(newRightAxisController: AxisController<Y> | null, oldRightAxisController: AxisController<Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetRightAxis !== void 0) {
        controllerObserver.controllerWillSetRightAxis(newRightAxisController, oldRightAxisController, this);
      }
    }
  }

  protected onSetRightAxis(newRightAxisController: AxisController<Y> | null, oldRightAxisController: AxisController<Y> | null): void {
    if (oldRightAxisController !== null) {
      this.detachRightAxis(oldRightAxisController);
    }
    if (newRightAxisController !== null) {
      this.attachRightAxis(newRightAxisController);
      this.initRightAxis(newRightAxisController);
    }
  }

  protected didSetRightAxis(newRightAxisController: AxisController<Y> | null, oldRightAxisController: AxisController<Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetRightAxis !== void 0) {
        controllerObserver.controllerDidSetRightAxis(newRightAxisController, oldRightAxisController, this);
      }
    }
  }

  protected insertRightAxisTrait(rightAxisTrait: AxisTrait<Y>, targetTrait: Trait | null = null): void {
    const childControllers = this.childControllers;
    let targetController: AxisController<unknown> | null = null;
    for (let i = 0, n = childControllers.length; i < n; i += 1) {
      const childController = childControllers[i]!;
      if (childController instanceof AxisController) {
        if (childController.axis.trait === rightAxisTrait) {
          return;
        } else if (childController.axis.trait === targetTrait) {
          targetController = childController;
        }
      }
    }
    const rightAxisController = this.createRightAxis(rightAxisTrait);
    if (rightAxisController !== null) {
      rightAxisController.axis.setTrait(rightAxisTrait);
      this.rightAxis.setController(rightAxisController, targetController);
      this.insertChildController(rightAxisController, targetController);
      if (rightAxisController.axis.view === null) {
        const rightAxisView = this.createRightAxisView(rightAxisController);
        let targetView: AxisView<unknown> | null = null;
        if (targetController !== null) {
          targetView = targetController.axis.view;
        }
        const chartView = this.chart.view;
        if (chartView !== null) {
          rightAxisController.axis.injectView(chartView, rightAxisView, targetView, null);
        } else {
          rightAxisController.axis.setView(rightAxisView, targetView);
        }
      }
    }
  }

  protected removeRightAxisTrait(rightAxisTrait: AxisTrait<Y>): void {
    const childControllers = this.childControllers;
    for (let i = 0, n = childControllers.length; i < n; i += 1) {
      const childController = childControllers[i]!;
      if (childController instanceof AxisController && childController.axis.trait === rightAxisTrait) {
        this.rightAxis.setController(null);
        childController.remove();
        return;
      }
    }
  }

  protected initRightAxisTrait(rightAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected attachRightAxisTrait(rightAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected detachRightAxisTrait(rightAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected willSetRightAxisTrait(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllertWillSetRightAxisTrait !== void 0) {
        controllerObserver.controllertWillSetRightAxisTrait(newRightAxisTrait, oldRightAxisTrait, this);
      }
    }
  }

  protected onSetRightAxisTrait(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null): void {
    if (oldRightAxisTrait !== null) {
      this.detachRightAxisTrait(oldRightAxisTrait);
    }
    if (newRightAxisTrait !== null) {
      this.attachRightAxisTrait(newRightAxisTrait);
      this.initRightAxisTrait(newRightAxisTrait);
    }
  }

  protected didSetRightAxisTrait(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetRightAxisTrait !== void 0) {
        controllerObserver.controllerDidSetRightAxisTrait(newRightAxisTrait, oldRightAxisTrait, this);
      }
    }
  }

  protected createRightAxisView(rightAxisController: AxisController<Y>): AxisView<Y> | null {
    return rightAxisController.axis.createView();
  }

  protected initRightAxisView(rightAxisView: AxisView<Y>): void {
    // hook
  }

  protected attachRightAxisView(rightAxisView: AxisView<Y>): void {
    // hook
  }

  protected detachRightAxisView(rightAxisView: AxisView<Y>): void {
    rightAxisView.remove();
  }

  protected willSetRightAxisView(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetRightAxisView !== void 0) {
        controllerObserver.controllerWillSetRightAxisView(newRightAxisView, oldRightAxisView, this);
      }
    }
  }

  protected onSetRightAxisView(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null): void {
    if (oldRightAxisView !== null) {
      this.detachRightAxisView(oldRightAxisView);
    }
    if (newRightAxisView !== null) {
      this.attachRightAxisView(newRightAxisView);
      this.initRightAxisView(newRightAxisView);
    }
  }

  protected didSetRightAxisView(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetRightAxisView !== void 0) {
        controllerObserver.controllerDidSetRightAxisView(newRightAxisView, oldRightAxisView, this);
      }
    }
  }

  /** @hidden */
  static RightAxisFastener = ControllerFastener.define<ChartController<unknown, unknown>, AxisController<unknown>>({
    type: RightAxisController,
    observe: true,
    willSetController(newRightAxisController: AxisController<unknown> | null, oldRightAxisController: AxisController<unknown> | null): void {
      this.owner.willSetRightAxis(newRightAxisController, oldRightAxisController);
    },
    onSetController(newRightAxisController: AxisController<unknown> | null, oldRightAxisController: AxisController<unknown> | null): void {
      this.owner.onSetRightAxis(newRightAxisController, oldRightAxisController);
    },
    didSetController(newRightAxisController: AxisController<unknown> | null, oldRightAxisController: AxisController<unknown> | null): void {
      this.owner.didSetRightAxis(newRightAxisController, oldRightAxisController);
    },
    controllerWillSetAxisTrait(newRightAxisTrait: AxisTrait<unknown> | null, oldRightAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.willSetRightAxisTrait(newRightAxisTrait, oldRightAxisTrait);
    },
    controllerDidSetAxisTrait(newRightAxisTrait: AxisTrait<unknown> | null, oldRightAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.onSetRightAxisTrait(newRightAxisTrait, oldRightAxisTrait);
      this.owner.didSetRightAxisTrait(newRightAxisTrait, oldRightAxisTrait);
    },
    controllerWillSetAxisView(newRightAxisView: AxisView<unknown> | null, oldRightAxisView: AxisView<unknown> | null): void {
      this.owner.willSetRightAxisView(newRightAxisView, oldRightAxisView);
    },
    controllerDidSetAxisView(newRightAxisView: AxisView<unknown> | null, oldRightAxisView: AxisView<unknown> | null): void {
      this.owner.onSetRightAxisView(newRightAxisView, oldRightAxisView);
      this.owner.didSetRightAxisView(newRightAxisView, oldRightAxisView);
    },
  });

  @ControllerFastener<ChartController<X, Y>, AxisController<Y>>({
    extends: ChartController.RightAxisFastener,
  })
  readonly rightAxis!: ControllerFastener<this, AxisController<Y>>;

  protected createBottomAxis(bottomAxisTrait: AxisTrait<X>): AxisController<X> | null {
    return new BottomAxisController<X>();
  }

  protected initBottomAxis(bottomAxisController: AxisController<X>): void {
    const bottomAxisTrait = bottomAxisController.axis.trait;
    if (bottomAxisTrait !== null) {
      this.initBottomAxisTrait(bottomAxisTrait);
    }
    const bottomAxisView = bottomAxisController.axis.view;
    if (bottomAxisView !== null) {
      this.initBottomAxisView(bottomAxisView);
    }
  }

  protected attachBottomAxis(bottomAxisController: AxisController<X>): void {
    const bottomAxisTrait = bottomAxisController.axis.trait;
    if (bottomAxisTrait !== null) {
      this.attachBottomAxisTrait(bottomAxisTrait);
    }
    const bottomAxisView = bottomAxisController.axis.view;
    if (bottomAxisView !== null) {
      this.attachBottomAxisView(bottomAxisView);
    }
  }

  protected detachBottomAxis(bottomAxisController: AxisController<X>): void {
    const bottomAxisTrait = bottomAxisController.axis.trait;
    if (bottomAxisTrait !== null) {
      this.detachBottomAxisTrait(bottomAxisTrait);
    }
    const bottomAxisView = bottomAxisController.axis.view;
    if (bottomAxisView !== null) {
      this.detachBottomAxisView(bottomAxisView);
    }
  }

  protected willSetBottomAxis(newBottomAxisController: AxisController<X> | null, oldBottomAxisController: AxisController<X> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetBottomAxis !== void 0) {
        controllerObserver.controllerWillSetBottomAxis(newBottomAxisController, oldBottomAxisController, this);
      }
    }
  }

  protected onSetBottomAxis(newBottomAxisController: AxisController<X> | null, oldBottomAxisController: AxisController<X> | null): void {
    if (oldBottomAxisController !== null) {
      this.detachBottomAxis(oldBottomAxisController);
    }
    if (newBottomAxisController !== null) {
      this.attachBottomAxis(newBottomAxisController);
      this.initBottomAxis(newBottomAxisController);
    }
  }

  protected didSetBottomAxis(newBottomAxisController: AxisController<X> | null, oldBottomAxisController: AxisController<X> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetBottomAxis !== void 0) {
        controllerObserver.controllerDidSetBottomAxis(newBottomAxisController, oldBottomAxisController, this);
      }
    }
  }

  protected insertBottomAxisTrait(bottomAxisTrait: AxisTrait<X>, targetTrait: Trait | null = null): void {
    const childControllers = this.childControllers;
    let targetController: AxisController<unknown> | null = null;
    for (let i = 0, n = childControllers.length; i < n; i += 1) {
      const childController = childControllers[i]!;
      if (childController instanceof AxisController) {
        if (childController.axis.trait === bottomAxisTrait) {
          return;
        } else if (childController.axis.trait === targetTrait) {
          targetController = childController;
        }
      }
    }
    const bottomAxisController = this.createBottomAxis(bottomAxisTrait);
    if (bottomAxisController !== null) {
      bottomAxisController.axis.setTrait(bottomAxisTrait);
      this.bottomAxis.setController(bottomAxisController, targetController);
      this.insertChildController(bottomAxisController, targetController);
      if (bottomAxisController.axis.view === null) {
        const bottomAxisView = this.createBottomAxisView(bottomAxisController);
        let targetView: AxisView<unknown> | null = null;
        if (targetController !== null) {
          targetView = targetController.axis.view;
        }
        const chartView = this.chart.view;
        if (chartView !== null) {
          bottomAxisController.axis.injectView(chartView, bottomAxisView, targetView, null);
        } else {
          bottomAxisController.axis.setView(bottomAxisView, targetView);
        }
      }
    }
  }

  protected removeBottomAxisTrait(bottomAxisTrait: AxisTrait<X>): void {
    const childControllers = this.childControllers;
    for (let i = 0, n = childControllers.length; i < n; i += 1) {
      const childController = childControllers[i]!;
      if (childController instanceof AxisController && childController.axis.trait === bottomAxisTrait) {
        this.bottomAxis.setController(null);
        childController.remove();
        return;
      }
    }
  }

  protected initBottomAxisTrait(bottomAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected attachBottomAxisTrait(bottomAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected detachBottomAxisTrait(bottomAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected willSetBottomAxisTrait(newBottomAxisTrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetBottomAxisTrait !== void 0) {
        controllerObserver.controllerWillSetBottomAxisTrait(newBottomAxisTrait, oldBottomAxisTrait, this);
      }
    }
  }

  protected onSetBottomAxisTrait(newBottomAxisTrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null): void {
    if (oldBottomAxisTrait !== null) {
      this.detachBottomAxisTrait(oldBottomAxisTrait);
    }
    if (newBottomAxisTrait !== null) {
      this.attachBottomAxisTrait(newBottomAxisTrait);
      this.initBottomAxisTrait(newBottomAxisTrait);
    }
  }

  protected didSetBottomAxisTrait(newBottomAxisTrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetBottomAxisTrait !== void 0) {
        controllerObserver.controllerDidSetBottomAxisTrait(newBottomAxisTrait, oldBottomAxisTrait, this);
      }
    }
  }

  protected createBottomAxisView(bottomAxisController: AxisController<X>): AxisView<X> | null {
    return bottomAxisController.axis.createView();
  }

  protected initBottomAxisView(bottomAxisView: AxisView<X>): void {
    // hook
  }

  protected attachBottomAxisView(bottomAxisView: AxisView<X>): void {
    // hook
  }

  protected detachBottomAxisView(bottomAxisView: AxisView<X>): void {
    bottomAxisView.remove();
  }

  protected willSetBottomAxisView(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetBottomAxisView !== void 0) {
        controllerObserver.controllerWillSetBottomAxisView(newBottomAxisView, oldBottomAxisView, this);
      }
    }
  }

  protected onSetBottomAxisView(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null): void {
    if (oldBottomAxisView !== null) {
      this.detachBottomAxisView(oldBottomAxisView);
    }
    if (newBottomAxisView !== null) {
      this.attachBottomAxisView(newBottomAxisView);
      this.initBottomAxisView(newBottomAxisView);
    }
  }

  protected didSetBottomAxisView(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetBottomAxisView !== void 0) {
        controllerObserver.controllerDidSetBottomAxisView(newBottomAxisView, oldBottomAxisView, this);
      }
    }
  }

  /** @hidden */
  static BottomAxisFastener = ControllerFastener.define<ChartController<unknown, unknown>, AxisController<unknown>>({
    type: BottomAxisController,
    observe: true,
    willSetController(newBottomAxisController: AxisController<unknown> | null, oldBottomAxisController: AxisController<unknown> | null): void {
      this.owner.willSetBottomAxis(newBottomAxisController, oldBottomAxisController);
    },
    onSetController(newBottomAxisController: AxisController<unknown> | null, oldBottomAxisController: AxisController<unknown> | null): void {
      this.owner.onSetBottomAxis(newBottomAxisController, oldBottomAxisController);
    },
    didSetController(newBottomAxisController: AxisController<unknown> | null, oldBottomAxisController: AxisController<unknown> | null): void {
      this.owner.didSetBottomAxis(newBottomAxisController, oldBottomAxisController);
    },
    controllerWillSetAxisTrait(newBottomAxisTrait: AxisTrait<unknown> | null, oldBottomAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.willSetBottomAxisTrait(newBottomAxisTrait, oldBottomAxisTrait);
    },
    controllerDidSetAxisTrait(newBottomAxisTrait: AxisTrait<unknown> | null, oldBottomAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.onSetBottomAxisTrait(newBottomAxisTrait, oldBottomAxisTrait);
      this.owner.didSetBottomAxisTrait(newBottomAxisTrait, oldBottomAxisTrait);
    },
    controllerWillSetAxisView(newBottomAxisView: AxisView<unknown> | null, oldBottomAxisView: AxisView<unknown> | null): void {
      this.owner.willSetBottomAxisView(newBottomAxisView, oldBottomAxisView);
    },
    controllerDidSetAxisView(newBottomAxisView: AxisView<unknown> | null, oldBottomAxisView: AxisView<unknown> | null): void {
      this.owner.onSetBottomAxisView(newBottomAxisView, oldBottomAxisView);
      this.owner.didSetBottomAxisView(newBottomAxisView, oldBottomAxisView);
    },
  });

  @ControllerFastener<ChartController<X, Y>, AxisController<X>>({
    extends: ChartController.BottomAxisFastener,
  })
  readonly bottomAxis!: ControllerFastener<this, AxisController<X>>;

  protected createLeftAxis(leftAxisTrait: AxisTrait<Y>): AxisController<Y> | null {
    return new LeftAxisController<Y>();
  }

  protected initLeftAxis(leftAxisController: AxisController<Y>): void {
    const leftAxisTrait = leftAxisController.axis.trait;
    if (leftAxisTrait !== null) {
      this.initLeftAxisTrait(leftAxisTrait);
    }
    const leftAxisView = leftAxisController.axis.view;
    if (leftAxisView !== null) {
      this.initLeftAxisView(leftAxisView);
    }
  }

  protected attachLeftAxis(leftAxisController: AxisController<Y>): void {
    const leftAxisTrait = leftAxisController.axis.trait;
    if (leftAxisTrait !== null) {
      this.attachLeftAxisTrait(leftAxisTrait);
    }
    const leftAxisView = leftAxisController.axis.view;
    if (leftAxisView !== null) {
      this.attachLeftAxisView(leftAxisView);
    }
  }

  protected detachLeftAxis(leftAxisController: AxisController<Y>): void {
    const leftAxisTrait = leftAxisController.axis.trait;
    if (leftAxisTrait !== null) {
      this.detachLeftAxisTrait(leftAxisTrait);
    }
    const leftAxisView = leftAxisController.axis.view;
    if (leftAxisView !== null) {
      this.detachLeftAxisView(leftAxisView);
    }
  }

  protected willSetLeftAxis(newLeftAxisController: AxisController<Y> | null, oldLeftAxisController: AxisController<Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetLeftAxis !== void 0) {
        controllerObserver.controllerWillSetLeftAxis(newLeftAxisController, oldLeftAxisController, this);
      }
    }
  }

  protected onSetLeftAxis(newLeftAxisController: AxisController<Y> | null, oldLeftAxisController: AxisController<Y> | null): void {
    if (oldLeftAxisController !== null) {
      this.detachLeftAxis(oldLeftAxisController);
    }
    if (newLeftAxisController !== null) {
      this.attachLeftAxis(newLeftAxisController);
      this.initLeftAxis(newLeftAxisController);
    }
  }

  protected didSetLeftAxis(newLeftAxisController: AxisController<Y> | null, oldLeftAxisController: AxisController<Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetLeftAxis !== void 0) {
        controllerObserver.controllerDidSetLeftAxis(newLeftAxisController, oldLeftAxisController, this);
      }
    }
  }

  protected insertLeftAxisTrait(leftAxisTrait: AxisTrait<Y>, targetTrait: Trait | null = null): void {
    const childControllers = this.childControllers;
    let targetController: AxisController<unknown> | null = null;
    for (let i = 0, n = childControllers.length; i < n; i += 1) {
      const childController = childControllers[i]!;
      if (childController instanceof AxisController) {
        if (childController.axis.trait === leftAxisTrait) {
          return;
        } else if (childController.axis.trait === targetTrait) {
          targetController = childController;
        }
      }
    }
    const leftAxisController = this.createLeftAxis(leftAxisTrait);
    if (leftAxisController !== null) {
      leftAxisController.axis.setTrait(leftAxisTrait);
      this.leftAxis.setController(leftAxisController, targetController);
      this.insertChildController(leftAxisController, targetController);
      if (leftAxisController.axis.view === null) {
        const leftAxisView = this.createLeftAxisView(leftAxisController);
        let targetView: AxisView<unknown> | null = null;
        if (targetController !== null) {
          targetView = targetController.axis.view;
        }
        const chartView = this.chart.view;
        if (chartView !== null) {
          leftAxisController.axis.injectView(chartView, leftAxisView, targetView, null);
        } else {
          leftAxisController.axis.setView(leftAxisView, targetView);
        }
      }
    }
  }

  protected removeLeftAxisTrait(leftAxisTrait: AxisTrait<Y>): void {
    const childControllers = this.childControllers;
    for (let i = 0, n = childControllers.length; i < n; i += 1) {
      const childController = childControllers[i]!;
      if (childController instanceof AxisController && childController.axis.trait === leftAxisTrait) {
        this.leftAxis.setController(null);
        childController.remove();
        return;
      }
    }
  }

  protected initLeftAxisTrait(leftAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected attachLeftAxisTrait(leftAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected detachLeftAxisTrait(leftAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected willSetLeftAxisTrait(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetLeftAxisTrait !== void 0) {
        controllerObserver.controllerWillSetLeftAxisTrait(newLeftAxisTrait, oldLeftAxisTrait, this);
      }
    }
  }

  protected onSetLeftAxisTrait(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null): void {
    if (oldLeftAxisTrait !== null) {
      this.detachLeftAxisTrait(oldLeftAxisTrait);
    }
    if (newLeftAxisTrait !== null) {
      this.attachLeftAxisTrait(newLeftAxisTrait);
      this.initLeftAxisTrait(newLeftAxisTrait);
    }
  }

  protected didSetLeftAxisTrait(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetLeftAxisTrait !== void 0) {
        controllerObserver.controllerDidSetLeftAxisTrait(newLeftAxisTrait, oldLeftAxisTrait, this);
      }
    }
  }

  protected createLeftAxisView(leftAxisController: AxisController<Y>): AxisView<Y> | null {
    return leftAxisController.axis.createView();
  }

  protected initLeftAxisView(leftAxisView: AxisView<Y>): void {
    // hook
  }

  protected attachLeftAxisView(leftAxisView: AxisView<Y>): void {
    // hook
  }

  protected detachLeftAxisView(leftAxisView: AxisView<Y>): void {
    leftAxisView.remove();
  }

  protected willSetLeftAxisView(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetLeftAxisView !== void 0) {
        controllerObserver.controllerWillSetLeftAxisView(newLeftAxisView, oldLeftAxisView, this);
      }
    }
  }

  protected onSetLeftAxisView(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null): void {
    if (oldLeftAxisView !== null) {
      this.detachLeftAxisView(oldLeftAxisView);
    }
    if (newLeftAxisView !== null) {
      this.attachLeftAxisView(newLeftAxisView);
      this.initLeftAxisView(newLeftAxisView);
    }
  }

  protected didSetLeftAxisView(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetLeftAxisView !== void 0) {
        controllerObserver.controllerDidSetLeftAxisView(newLeftAxisView, oldLeftAxisView, this);
      }
    }
  }

  /** @hidden */
  static LeftAxisFastener = ControllerFastener.define<ChartController<unknown, unknown>, AxisController<unknown>>({
    type: LeftAxisController,
    observe: true,
    willSetController(newLeftAxisController: AxisController<unknown> | null, oldLeftAxisController: AxisController<unknown> | null): void {
      this.owner.willSetLeftAxis(newLeftAxisController, oldLeftAxisController);
    },
    onSetController(newLeftAxisController: AxisController<unknown> | null, oldLeftAxisController: AxisController<unknown> | null): void {
      this.owner.onSetLeftAxis(newLeftAxisController, oldLeftAxisController);
    },
    didSetController(newLeftAxisController: AxisController<unknown> | null, oldLeftAxisController: AxisController<unknown> | null): void {
      this.owner.didSetLeftAxis(newLeftAxisController, oldLeftAxisController);
    },
    controllerWillSetAxisTrait(newLeftAxisTrait: AxisTrait<unknown> | null, oldLeftAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.willSetLeftAxisTrait(newLeftAxisTrait, oldLeftAxisTrait);
    },
    controllerDidSetAxisTrait(newLeftAxisTrait: AxisTrait<unknown> | null, oldLeftAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.onSetLeftAxisTrait(newLeftAxisTrait, oldLeftAxisTrait);
      this.owner.didSetLeftAxisTrait(newLeftAxisTrait, oldLeftAxisTrait);
    },
    controllerWillSetAxisView(newLeftAxisView: AxisView<unknown> | null, oldLeftAxisView: AxisView<unknown> | null): void {
      this.owner.willSetLeftAxisView(newLeftAxisView, oldLeftAxisView);
    },
    controllerDidSetAxisView(newLeftAxisView: AxisView<unknown> | null, oldLeftAxisView: AxisView<unknown> | null): void {
      this.owner.onSetLeftAxisView(newLeftAxisView, oldLeftAxisView);
      this.owner.didSetLeftAxisView(newLeftAxisView, oldLeftAxisView);
    },
  });

  @ControllerFastener<ChartController<X, Y>, AxisController<Y>>({
    extends: ChartController.LeftAxisFastener,
  })
  readonly leftAxis!: ControllerFastener<this, AxisController<Y>>;

  protected detectTopAxisController(controller: Controller): AxisController<X> | null {
    return controller instanceof TopAxisController ? controller : null;
  }

  protected detectRightAxisController(controller: Controller): AxisController<Y> | null {
    return controller instanceof RightAxisController ? controller : null;
  }

  protected detectBottomAxisController(controller: Controller): AxisController<X> | null {
    return controller instanceof BottomAxisController ? controller : null;
  }

  protected detectLeftAxisController(controller: Controller): AxisController<Y> | null {
    return controller instanceof LeftAxisController ? controller : null;
  }

  protected override onInsertChildController(childController: Controller, targetController: Controller | null): void {
    super.onInsertChildController(childController, targetController);
    const topAxisController = this.detectTopAxisController(childController);
    if (topAxisController !== null) {
      this.topAxis.setController(topAxisController, targetController);
    }
    const rightAxisController = this.detectRightAxisController(childController);
    if (rightAxisController !== null) {
      this.rightAxis.setController(rightAxisController, targetController);
    }
    const bottomAxisController = this.detectBottomAxisController(childController);
    if (bottomAxisController !== null) {
      this.bottomAxis.setController(bottomAxisController, targetController);
    }
    const leftAxisController = this.detectLeftAxisController(childController);
    if (leftAxisController !== null) {
      this.leftAxis.setController(leftAxisController, targetController);
    }
  }

  protected override onRemoveChildController(childController: Controller): void {
    super.onRemoveChildController(childController);
    const topAxisController = this.detectTopAxisController(childController);
    if (topAxisController !== null) {
      this.topAxis.setController(null);
    }
    const rightAxisController = this.detectRightAxisController(childController);
    if (rightAxisController !== null) {
      this.rightAxis.setController(null);
    }
    const bottomAxisController = this.detectBottomAxisController(childController);
    if (bottomAxisController !== null) {
      this.bottomAxis.setController(null);
    }
    const leftAxisController = this.detectLeftAxisController(childController);
    if (leftAxisController !== null) {
      this.leftAxis.setController(null);
    }
  }
}
