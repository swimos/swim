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
import type {Model} from "@swim/model";
import type {TraitObserver} from "@swim/model";
import {Trait} from "@swim/model";
import {TraitSet} from "@swim/model";
import {PlotTrait} from "./PlotTrait";

/** @public */
export interface GraphTraitObserver<X = unknown, Y = unknown, T extends GraphTrait<X, Y> = GraphTrait<X, Y>> extends TraitObserver<T> {
  traitWillAttachPlot?(plotTrait: PlotTrait<X, Y>, trait: T): void;

  traitDidDetachPlot?(plotTrait: PlotTrait<X, Y>, trait: T): void;
}

/** @public */
export class GraphTrait<X = unknown, Y = unknown> extends Trait {
  declare readonly observerType?: Class<GraphTraitObserver<X, Y>>;

  @TraitSet({
    traitType: PlotTrait,
    binds: true,
    willAttachTrait(plotTrait: PlotTrait<X, Y>): void {
      this.owner.callObservers("traitWillAttachPlot", plotTrait, this.owner);
    },
    didAttachTrait(plotTrait: PlotTrait<X, Y>): void {
      if (this.owner.consuming) {
        plotTrait.consume(this.owner);
      }
    },
    willDetachTrait(plotTrait: PlotTrait<X, Y>): void {
      if (this.owner.consuming) {
        plotTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(plotTrait: PlotTrait<X, Y>): void {
      this.owner.callObservers("traitDidDetachPlot", plotTrait, this.owner);
    },
    detectModel(model: Model): PlotTrait<X, Y> | null {
      return model.getTrait(PlotTrait) as PlotTrait<X, Y>;
    },
  })
  readonly plots!: TraitSet<this, PlotTrait<X, Y>>;

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.plots.consumeTraits(this);
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.plots.unconsumeTraits(this);
  }
}
