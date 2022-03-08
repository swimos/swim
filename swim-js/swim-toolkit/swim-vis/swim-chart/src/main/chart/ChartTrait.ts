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

import type {Class} from "@swim/util";
import type {MemberFastenerClass} from "@swim/component";
import {Model, Trait, TraitRef} from "@swim/model";
import {GraphTrait} from "../graph/GraphTrait";
import type {AxisTrait} from "../axis/AxisTrait";
import {TopAxisTrait} from "../axis/TopAxisTrait";
import {RightAxisTrait} from "../axis/RightAxisTrait";
import {BottomAxisTrait} from "../axis/BottomAxisTrait";
import {LeftAxisTrait} from "../axis/LeftAxisTrait";
import type {ChartTraitObserver} from "./ChartTraitObserver";

/** @public */
export class ChartTrait<X = unknown, Y = unknown> extends Trait {
  override readonly observerType?: Class<ChartTraitObserver<X, Y>>;

  @TraitRef<ChartTrait<X, Y>, GraphTrait<X, Y>>({
    type: GraphTrait,
    binds: true,
    willAttachTrait(graphTrait: GraphTrait<X, Y>): void {
      this.owner.callObservers("traitWillAttachGraph", graphTrait, this.owner);
    },
    didAttachTrait(graphTrait: GraphTrait<X, Y>): void {
      if (this.owner.consuming) {
        graphTrait.consume(this.owner);
      }
    },
    willDetachTrait(graphTrait: GraphTrait<X, Y>): void {
      if (this.owner.consuming) {
        graphTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(graphTrait: GraphTrait<X, Y>): void {
      this.owner.callObservers("traitDidDetachGraph", graphTrait, this.owner);
    },
    detectModel(model: Model): GraphTrait<X, Y> | null {
      return model.getTrait(GraphTrait) as GraphTrait<X, Y>;
    },
    detectTrait(trait: Trait): GraphTrait<X, Y> | null {
      return trait instanceof GraphTrait ? trait : null;
    },
  })
  readonly graph!: TraitRef<this, GraphTrait<X, Y>>;
  static readonly graph: MemberFastenerClass<ChartTrait, "graph">;

  @TraitRef<ChartTrait<X, Y>, AxisTrait<X>>({
    type: TopAxisTrait,
    binds: true,
    willAttachTrait(topAxisTrait: AxisTrait<X>): void {
      this.owner.callObservers("traitWillAttachTopAxis", topAxisTrait, this.owner);
    },
    didAttachTrait(topAxisTrait: AxisTrait<X>): void {
      if (this.owner.consuming) {
        topAxisTrait.consume(this.owner);
      }
    },
    willDetachTrait(topAxisTrait: AxisTrait<X>): void {
      if (this.owner.consuming) {
        topAxisTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(topAxisTrait: AxisTrait<X>): void {
      this.owner.callObservers("traitDidDetachTopAxis", topAxisTrait, this.owner);
    },
    detectModel(model: Model): AxisTrait<X> | null {
      return model.getTrait(TopAxisTrait);
    },
    detectTrait(trait: Trait): AxisTrait<X> | null {
      return trait instanceof TopAxisTrait ? trait : null;
    },
  })
  readonly topAxis!: TraitRef<this, AxisTrait<X>>;
  static readonly topAxis: MemberFastenerClass<ChartTrait, "topAxis">;

  @TraitRef<ChartTrait<X, Y>, AxisTrait<Y>>({
    type: RightAxisTrait,
    binds: true,
    willAttachTrait(rightAxisTrait: AxisTrait<Y>): void {
      this.owner.callObservers("traitWillAttachRightAxis", rightAxisTrait, this.owner);
    },
    didAttachTrait(rightAxisTrait: AxisTrait<Y>): void {
      if (this.owner.consuming) {
        rightAxisTrait.consume(this.owner);
      }
    },
    willDetachTrait(rightAxisTrait: AxisTrait<Y>): void {
      if (this.owner.consuming) {
        rightAxisTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(rightAxisTrait: AxisTrait<Y>): void {
      this.owner.callObservers("traitDidDetachRightAxis", rightAxisTrait, this.owner);
    },
    detectModel(model: Model): AxisTrait<Y> | null {
      return model.getTrait(RightAxisTrait);
    },
    detectTrait(trait: Trait): AxisTrait<Y> | null {
      return trait instanceof RightAxisTrait ? trait : null;
    },
  })
  readonly rightAxis!: TraitRef<this, AxisTrait<Y>>;
  static readonly rightAxis: MemberFastenerClass<ChartTrait, "rightAxis">;

  @TraitRef<ChartTrait<X, Y>, AxisTrait<X>>({
    type: BottomAxisTrait,
    binds: true,
    willAttachTrait(bottomAxisTrait: AxisTrait<X>): void {
      this.owner.callObservers("traitWillAttachBottomAxis", bottomAxisTrait, this.owner);
    },
    didAttachTrait(bottomAxisTrait: AxisTrait<X>): void {
      if (this.owner.consuming) {
        bottomAxisTrait.consume(this.owner);
      }
    },
    willDetachTrait(bottomAxisTrait: AxisTrait<X>): void {
      if (this.owner.consuming) {
        bottomAxisTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(bottomAxisTrait: AxisTrait<X>): void {
      this.owner.callObservers("traitDidDetachBottomAxis", bottomAxisTrait, this.owner);
    },
    detectModel(model: Model): AxisTrait<X> | null {
      return model.getTrait(BottomAxisTrait);
    },
    detectTrait(trait: Trait): AxisTrait<X> | null {
      return trait instanceof BottomAxisTrait ? trait : null;
    },
  })
  readonly bottomAxis!: TraitRef<this, AxisTrait<X>>;
  static readonly bottomAxis: MemberFastenerClass<ChartTrait, "bottomAxis">;

  @TraitRef<ChartTrait<X, Y>, AxisTrait<Y>>({
    type: LeftAxisTrait,
    binds: true,
    willAttachTrait(leftAxisTrait: AxisTrait<Y>): void {
      this.owner.callObservers("traitWillAttachLeftAxis", leftAxisTrait, this.owner);
    },
    didAttachTrait(leftAxisTrait: AxisTrait<Y>): void {
      if (this.owner.consuming) {
        leftAxisTrait.consume(this.owner);
      }
    },
    willDetachTrait(leftAxisTrait: AxisTrait<Y>): void {
      if (this.owner.consuming) {
        leftAxisTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(leftAxisTrait: AxisTrait<Y>): void {
      this.owner.callObservers("traitDidDetachLeftAxis", leftAxisTrait, this.owner);
    },
    detectModel(model: Model): AxisTrait<Y> | null {
      return model.getTrait(LeftAxisTrait);
    },
    detectTrait(trait: Trait): AxisTrait<Y> | null {
      return trait instanceof LeftAxisTrait ? trait : null;
    },
  })
  readonly leftAxis!: TraitRef<this, AxisTrait<Y>>;
  static readonly leftAxis: MemberFastenerClass<ChartTrait, "leftAxis">;

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    const graphTrait = this.graph.trait;
    if (graphTrait !== null) {
      graphTrait.consume(this);
    }
    const topAxisTrair = this.topAxis.trait;
    if (topAxisTrair !== null) {
      topAxisTrair.consume(this);
    }
    const rightAxisTrait = this.rightAxis.trait;
    if (rightAxisTrait !== null) {
      rightAxisTrait.consume(this);
    }
    const bottomAxisTrait = this.bottomAxis.trait;
    if (bottomAxisTrait !== null) {
      bottomAxisTrait.consume(this);
    }
    const leftAxisTrait = this.leftAxis.trait;
    if (leftAxisTrait !== null) {
      leftAxisTrait.consume(this);
    }
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    const graphTrait = this.graph.trait;
    if (graphTrait !== null) {
      graphTrait.unconsume(this);
    }
    const topAxisTrair = this.topAxis.trait;
    if (topAxisTrair !== null) {
      topAxisTrair.unconsume(this);
    }
    const rightAxisTrait = this.rightAxis.trait;
    if (rightAxisTrait !== null) {
      rightAxisTrait.unconsume(this);
    }
    const bottomAxisTrait = this.bottomAxis.trait;
    if (bottomAxisTrait !== null) {
      bottomAxisTrait.unconsume(this);
    }
    const leftAxisTrait = this.leftAxis.trait;
    if (leftAxisTrait !== null) {
      leftAxisTrait.unconsume(this);
    }
  }
}
