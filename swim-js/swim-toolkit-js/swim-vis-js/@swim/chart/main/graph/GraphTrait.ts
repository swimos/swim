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
import {Model, TraitModelType, Trait, TraitFastener} from "@swim/model";
import {PlotTrait} from "../plot/PlotTrait";
import type {GraphTraitObserver} from "./GraphTraitObserver";

export class GraphTrait<X, Y> extends Trait {
  constructor() {
    super();
    this.plotFasteners = [];
  }

  override readonly observerType?: Class<GraphTraitObserver<X, Y>>;

  insertPlot(plotTrait: PlotTrait<X, Y>, targetTrait: Trait | null = null): void {
    const plotFasteners = this.plotFasteners as TraitFastener<this, PlotTrait<X, Y>>[];
    let targetIndex = plotFasteners.length;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      if (plotFastener.trait === plotTrait) {
        return;
      } else if (plotFastener.trait === targetTrait) {
        targetIndex = i;
      }
    }
    const plotFastener = this.createPlotFastener(plotTrait);
    plotFasteners.splice(targetIndex, 0, plotFastener);
    plotFastener.setTrait(plotTrait, targetTrait);
    if (this.mounted) {
      plotFastener.mount();
    }
  }

  removePlot(plotTrait: PlotTrait<X, Y>): void {
    const plotFasteners = this.plotFasteners as TraitFastener<this, PlotTrait<X, Y>>[];
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      if (plotFastener.trait === plotTrait) {
        plotFastener.setTrait(null);
        if (this.mounted) {
          plotFastener.unmount();
        }
        plotFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initPlot(plotTrait: PlotTrait<X, Y>, plotFastener: TraitFastener<this, PlotTrait<X, Y>>): void {
    // hook
  }

  protected attachPlot(plotTrait: PlotTrait<X, Y>, plotFastener: TraitFastener<this, PlotTrait<X, Y>>): void {
    if (this.consuming) {
      plotTrait.consume(this);
    }
  }

  protected detachPlot(plotTrait: PlotTrait<X, Y>, plotFastener: TraitFastener<this, PlotTrait<X, Y>>): void {
    if (this.consuming) {
      plotTrait.unconsume(this);
    }
  }

  protected willSetPlot(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null,
                        targetTrait: Trait | null, plotFastener: TraitFastener<this, PlotTrait<X, Y>>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetPlot !== void 0) {
        traitObserver.traitWillSetPlot(newPlotTrait, oldPlotTrait, targetTrait, this);
      }
    }
  }

  protected onSetPlot(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null,
                      targetTrait: Trait | null, plotFastener: TraitFastener<this, PlotTrait<X, Y>>): void {
    if (oldPlotTrait !== null) {
      this.detachPlot(oldPlotTrait, plotFastener);
    }
    if (newPlotTrait !== null) {
      this.attachPlot(newPlotTrait, plotFastener);
      this.initPlot(newPlotTrait, plotFastener);
    }
  }

  protected didSetPlot(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null,
                       targetTrait: Trait | null, plotFastener: TraitFastener<this, PlotTrait<X, Y>>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetPlot !== void 0) {
        traitObserver.traitDidSetPlot(newPlotTrait, oldPlotTrait, targetTrait, this);
      }
    }
  }

  /** @internal */
  static PlotFastener = TraitFastener.define<GraphTrait<unknown, unknown>, PlotTrait<unknown, unknown>>({
    type: PlotTrait,
    sibling: false,
    willSetTrait(newPlotTrait: PlotTrait<unknown, unknown> | null, oldPlotTrait: PlotTrait<unknown, unknown> | null, targetTrait: Trait | null): void {
      this.owner.willSetPlot(newPlotTrait, oldPlotTrait, targetTrait, this);
    },
    onSetTrait(newPlotTrait: PlotTrait<unknown, unknown> | null, oldPlotTrait: PlotTrait<unknown, unknown> | null, targetTrait: Trait | null): void {
      this.owner.onSetPlot(newPlotTrait, oldPlotTrait, targetTrait, this);
    },
    didSetTrait(newPlotTrait: PlotTrait<unknown, unknown> | null, oldPlotTrait: PlotTrait<unknown, unknown> | null, targetTrait: Trait | null): void {
      this.owner.didSetPlot(newPlotTrait, oldPlotTrait, targetTrait, this);
    },
  });

  protected createPlotFastener(plotTrait: PlotTrait<X, Y>): TraitFastener<this, PlotTrait<X, Y>> {
    return GraphTrait.PlotFastener.create(this, plotTrait.key ?? "plot") as TraitFastener<this, PlotTrait<X, Y>>;
  }

  /** @internal */
  readonly plotFasteners: ReadonlyArray<TraitFastener<this, PlotTrait<X, Y>>>;

  /** @internal */
  protected mountPlotFasteners(): void {
    const plotFasteners = this.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      plotFastener.mount();
    }
  }

  /** @internal */
  protected unmountPlotFasteners(): void {
    const plotFasteners = this.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      plotFastener.unmount();
    }
  }

  /** @internal */
  protected startConsumingPlots(): void {
    const plotFasteners = this.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotTrait = plotFasteners[i]!.trait;
      if (plotTrait !== null) {
        plotTrait.consume(this);
      }
    }
  }

  /** @internal */
  protected stopConsumingPlots(): void {
    const plotFasteners = this.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotTrait = plotFasteners[i]!.trait;
      if (plotTrait !== null) {
        plotTrait.unconsume(this);
      }
    }
  }

  protected detectPlotModel(model: Model): PlotTrait<X, Y> | null {
    return model.getTrait(PlotTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const children = model.children;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const child = children[i]!;
      const plotTrait = this.detectPlotModel(child);
      if (plotTrait !== null) {
        this.insertPlot(plotTrait);
      }
    }
  }

  protected override didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    if (newModel !== null) {
      this.detectModels(newModel);
    }
    super.didSetModel(newModel, oldModel);
  }

  /** @protected */
  override onInsertChild(child: Model, target: Model | null): void {
    super.onInsertChild(child, target);
    const plotTrait = this.detectPlotModel(child);
    if (plotTrait !== null) {
      const targetTrait = target !== null ? this.detectPlotModel(target) : null;
      this.insertPlot(plotTrait, targetTrait);
    }
  }

  /** @protected */
  override onRemoveChild(child: Model): void {
    super.onRemoveChild(child);
    const plotTrait = this.detectPlotModel(child);
    if (plotTrait !== null) {
      this.removePlot(plotTrait);
    }
  }

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountPlotFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountPlotFasteners();
    super.unmountFasteners();
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingPlots();
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingPlots();
  }
}
