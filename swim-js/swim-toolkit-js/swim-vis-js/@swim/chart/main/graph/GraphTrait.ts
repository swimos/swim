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

import {Model, TraitModelType, Trait, TraitFastener, GenericTrait} from "@swim/model";
import {PlotTrait} from "../plot/PlotTrait";
import type {GraphTraitObserver} from "./GraphTraitObserver";

export class GraphTrait<X, Y> extends GenericTrait {
  constructor() {
    super();
    this.plotFasteners = [];
  }

  override readonly traitObservers!: ReadonlyArray<GraphTraitObserver<X, Y>>;

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
    if (this.isMounted()) {
      plotFastener.mount();
    }
  }

  removePlot(plotTrait: PlotTrait<X, Y>): void {
    const plotFasteners = this.plotFasteners as TraitFastener<this, PlotTrait<X, Y>>[];
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      if (plotFastener.trait === plotTrait) {
        plotFastener.setTrait(null);
        if (this.isMounted()) {
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
    if (this.isConsuming()) {
      plotTrait.addTraitConsumer(this);
    }
  }

  protected detachPlot(plotTrait: PlotTrait<X, Y>, plotFastener: TraitFastener<this, PlotTrait<X, Y>>): void {
    if (this.isConsuming()) {
      plotTrait.removeTraitConsumer(this);
    }
  }

  protected willSetPlot(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null,
                        targetTrait: Trait | null, plotFastener: TraitFastener<this, PlotTrait<X, Y>>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
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
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetPlot !== void 0) {
        traitObserver.traitDidSetPlot(newPlotTrait, oldPlotTrait, targetTrait, this);
      }
    }
  }

  /** @hidden */
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
    return new GraphTrait.PlotFastener(this as GraphTrait<unknown, unknown>, plotTrait.key, "plot") as TraitFastener<this, PlotTrait<X, Y>>;
  }

  /** @hidden */
  readonly plotFasteners: ReadonlyArray<TraitFastener<this, PlotTrait<X, Y>>>;

  /** @hidden */
  protected mountPlotFasteners(): void {
    const plotFasteners = this.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      plotFastener.mount();
    }
  }

  /** @hidden */
  protected unmountPlotFasteners(): void {
    const plotFasteners = this.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      plotFastener.unmount();
    }
  }

  /** @hidden */
  protected startConsumingPlots(): void {
    const plotFasteners = this.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotTrait = plotFasteners[i]!.trait;
      if (plotTrait !== null) {
        plotTrait.addTraitConsumer(this);
      }
    }
  }

  /** @hidden */
  protected stopConsumingPlots(): void {
    const plotFasteners = this.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotTrait = plotFasteners[i]!.trait;
      if (plotTrait !== null) {
        plotTrait.removeTraitConsumer(this);
      }
    }
  }

  protected detectPlotModel(model: Model): PlotTrait<X, Y> | null {
    return model.getTrait(PlotTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const childModels = model.childModels;
    for (let i = 0, n = childModels.length; i < n; i += 1) {
      const childModel = childModels[i]!;
      const plotTrait = this.detectPlotModel(childModel);
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

  protected override onInsertChildModel(childModel: Model, targetModel: Model | null): void {
    super.onInsertChildModel(childModel, targetModel);
    const plotTrait = this.detectPlotModel(childModel);
    if (plotTrait !== null) {
      const targetTrait = targetModel !== null ? this.detectPlotModel(targetModel) : null;
      this.insertPlot(plotTrait, targetTrait);
    }
  }

  protected override onRemoveChildModel(childModel: Model): void {
    super.onRemoveChildModel(childModel);
    const plotTrait = this.detectPlotModel(childModel);
    if (plotTrait !== null) {
      this.removePlot(plotTrait);
    }
  }

  /** @hidden */
  protected override mountTraitFasteners(): void {
    super.mountTraitFasteners();
    this.mountPlotFasteners();
  }

  /** @hidden */
  protected override unmountTraitFasteners(): void {
    this.unmountPlotFasteners();
    super.unmountTraitFasteners();
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
