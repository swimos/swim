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
import {TraitRef} from "@swim/model";
import {GraphTrait} from "./GraphTrait";
import type {AxisTrait} from "./AxisTrait";
import {TopAxisTrait} from "./AxisTrait";
import {RightAxisTrait} from "./AxisTrait";
import {BottomAxisTrait} from "./AxisTrait";
import {LeftAxisTrait} from "./AxisTrait";

/** @public */
export interface ChartTraitObserver<X = unknown, Y = unknown, T extends ChartTrait<X, Y> = ChartTrait<X, Y>> extends TraitObserver<T> {
  traitWillAttachGraph?(graphTrait: GraphTrait<X, Y>, trait: T): void;

  traitDidDetachGraph?(graphTrait: GraphTrait<X, Y>, trait: T): void;

  traitWillAttachTopAxis?(topAxisTrait: AxisTrait<X>, trait: T): void;

  traitDidDetachTopAxis?(topAxisTrait: AxisTrait<X>, trait: T): void;

  traitWillAttachRightAxis?(rightAxisTrait: AxisTrait<Y>, trait: T): void;

  traitDidDetachRightAxis?(rightAxisTrait: AxisTrait<Y>, trait: T): void;

  traitWillAttachBottomAxis?(bottomAxisTrait: AxisTrait<X>, trait: T): void;

  traitDidDetachBottomAxis?(bottomAxisTrait: AxisTrait<X>, trait: T): void;

  traitWillAttachLeftAxis?(leftAxisTrait: AxisTrait<Y>, trait: T): void;

  traitDidDetachLeftAxis?(leftAxisTrait: AxisTrait<Y>, trait: T): void;
}

/** @public */
export class ChartTrait<X = unknown, Y = unknown> extends Trait {
  declare readonly observerType?: Class<ChartTraitObserver<X, Y>>;

  @TraitRef({
    traitType: GraphTrait,
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

  @TraitRef({
    traitType: TopAxisTrait,
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

  @TraitRef({
    traitType: RightAxisTrait,
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

  @TraitRef({
    traitType: BottomAxisTrait,
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

  @TraitRef({
    traitType: LeftAxisTrait,
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
