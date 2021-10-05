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
import {TraitModelType, Trait, TraitFastener} from "@swim/model";
import {GraphTrait} from "../graph/GraphTrait";
import type {AxisTrait} from "../axis/AxisTrait";
import {TopAxisTrait} from "../axis/TopAxisTrait";
import {RightAxisTrait} from "../axis/RightAxisTrait";
import {BottomAxisTrait} from "../axis/BottomAxisTrait";
import {LeftAxisTrait} from "../axis/LeftAxisTrait";
import type {ChartTraitObserver} from "./ChartTraitObserver";

export class ChartTrait<X, Y> extends Trait {
  override readonly observerType?: Class<ChartTraitObserver<X, Y>>;

  protected initGraph(graphTrait: GraphTrait<X, Y>): void {
    // hook
  }

  protected attachGraph(graphTrait: GraphTrait<X, Y>): void {
    if (this.consuming) {
      graphTrait.consume(this);
    }
  }

  protected detachGraph(graphTrait: GraphTrait<X, Y>): void {
    if (this.consuming) {
      graphTrait.unconsume(this);
    }
  }

  protected willSetGraph(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null, targetTrait: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetGraph !== void 0) {
        traitObserver.traitWillSetGraph(newGraphTrait, oldGraphTrait, targetTrait, this);
      }
    }
  }

  protected onSetGraph(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null, targetTrait: Trait | null): void {
    if (oldGraphTrait !== null) {
      this.detachGraph(oldGraphTrait);
    }
    if (newGraphTrait !== null) {
      this.attachGraph(newGraphTrait);
      this.initGraph(newGraphTrait);
    }
  }

  protected didSetGraph(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null, targetTrait: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetGraph !== void 0) {
        traitObserver.traitDidSetGraph(newGraphTrait, oldGraphTrait, targetTrait, this);
      }
    }
  }

  @TraitFastener<ChartTrait<X, Y>, GraphTrait<X, Y>>({
    type: GraphTrait,
    sibling: false,
    willSetTrait(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null, targetTrait: Trait | null): void {
      this.owner.willSetGraph(newGraphTrait, oldGraphTrait, targetTrait);
    },
    onSetTrait(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null, targetTrait: Trait | null): void {
      this.owner.onSetGraph(newGraphTrait, oldGraphTrait, targetTrait);
    },
    didSetTrait(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null, targetTrait: Trait | null): void {
      this.owner.didSetGraph(newGraphTrait, oldGraphTrait, targetTrait);
    },
  })
  readonly graph!: TraitFastener<this, GraphTrait<X, Y>>;

  protected initTopAxis(topAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected attachTopAxis(topAxisTrait: AxisTrait<X>): void {
    if (this.consuming) {
      topAxisTrait.consume(this);
    }
  }

  protected detachTopAxis(topAxisTrait: AxisTrait<X>): void {
    if (this.consuming) {
      topAxisTrait.unconsume(this);
    }
  }

  protected willSetTopAxis(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null, targetTrait: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetTopAxis !== void 0) {
        traitObserver.traitWillSetTopAxis(newTopAxisTrait, oldTopAxisTrait, targetTrait, this);
      }
    }
  }

  protected onSetTopAxis(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null, targetTrait: Trait | null): void {
    if (oldTopAxisTrait !== null) {
      this.detachTopAxis(oldTopAxisTrait);
    }
    if (newTopAxisTrait !== null) {
      this.attachTopAxis(newTopAxisTrait);
      this.initTopAxis(newTopAxisTrait);
    }
  }

  protected didSetTopAxis(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null, targetTrait: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetTopAxis !== void 0) {
        traitObserver.traitDidSetTopAxis(newTopAxisTrait, oldTopAxisTrait, targetTrait, this);
      }
    }
  }

  @TraitFastener<ChartTrait<X, Y>, AxisTrait<X>>({
    sibling: false,
    willSetTrait(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null, targetTrait: Trait | null): void {
      this.owner.willSetTopAxis(newTopAxisTrait, oldTopAxisTrait, targetTrait);
    },
    onSetTrait(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null, targetTrait: Trait | null): void {
      this.owner.onSetTopAxis(newTopAxisTrait, oldTopAxisTrait, targetTrait);
    },
    didSetTrait(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null, targetTrait: Trait | null): void {
      this.owner.didSetTopAxis(newTopAxisTrait, oldTopAxisTrait, targetTrait);
    },
  })
  readonly topAxis!: TraitFastener<this, AxisTrait<X>>;

  protected initRightAxis(rightAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected attachRightAxis(rightAxisTrait: AxisTrait<Y>): void {
    if (this.consuming) {
      rightAxisTrait.consume(this);
    }
  }

  protected detachRightAxis(rightAxisTrait: AxisTrait<Y>): void {
    if (this.consuming) {
      rightAxisTrait.unconsume(this);
    }
  }

  protected willSetRightAxis(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null, targetTrait: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetRightAxis !== void 0) {
        traitObserver.traitWillSetRightAxis(newRightAxisTrait, oldRightAxisTrait, targetTrait, this);
      }
    }
  }

  protected onSetRightAxis(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null, targetTrait: Trait | null): void {
    if (oldRightAxisTrait !== null) {
      this.detachRightAxis(oldRightAxisTrait);
    }
    if (newRightAxisTrait !== null) {
      this.attachRightAxis(newRightAxisTrait);
      this.initRightAxis(newRightAxisTrait);
    }
  }

  protected didSetRightAxis(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null, targetTrait: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetRightAxis !== void 0) {
        traitObserver.traitDidSetRightAxis(newRightAxisTrait, oldRightAxisTrait, targetTrait, this);
      }
    }
  }

  @TraitFastener<ChartTrait<X, Y>, AxisTrait<Y>>({
    sibling: false,
    willSetTrait(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null, targetTrait: Trait | null): void {
      this.owner.willSetRightAxis(newRightAxisTrait, oldRightAxisTrait, targetTrait);
    },
    onSetTrait(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null, targetTrait: Trait | null): void {
      this.owner.onSetRightAxis(newRightAxisTrait, oldRightAxisTrait, targetTrait);
    },
    didSetTrait(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null, targetTrait: Trait | null): void {
      this.owner.didSetRightAxis(newRightAxisTrait, oldRightAxisTrait, targetTrait);
    },
  })
  readonly rightAxis!: TraitFastener<this, AxisTrait<Y>>;

  protected initBottomAxis(bottomAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected attachBottomAxis(bottomAxisTrait: AxisTrait<X>): void {
    if (this.consuming) {
      bottomAxisTrait.consume(this);
    }
  }

  protected detachBottomAxis(bottomAxisTrait: AxisTrait<X>): void {
    if (this.consuming) {
      bottomAxisTrait.unconsume(this);
    }
  }

  protected willSetBottomAxis(newBottomAxisTrrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null, targetTrait: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetBottomAxis !== void 0) {
        traitObserver.traitWillSetBottomAxis(newBottomAxisTrrait, oldBottomAxisTrait, targetTrait, this);
      }
    }
  }

  protected onSetBottomAxis(newBottomAxisTrrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null, targetTrait: Trait | null): void {
    if (oldBottomAxisTrait !== null) {
      this.detachBottomAxis(oldBottomAxisTrait);
    }
    if (newBottomAxisTrrait !== null) {
      this.attachBottomAxis(newBottomAxisTrrait);
      this.initBottomAxis(newBottomAxisTrrait);
    }
  }

  protected didSetBottomAxis(newBottomAxisTrrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null, targetTrait: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetBottomAxis !== void 0) {
        traitObserver.traitDidSetBottomAxis(newBottomAxisTrrait, oldBottomAxisTrait, targetTrait, this);
      }
    }
  }

  @TraitFastener<ChartTrait<X, Y>, AxisTrait<X>>({
    sibling: false,
    willSetTrait(newBottomAxisTrrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null, targetTrait: Trait | null): void {
      this.owner.willSetBottomAxis(newBottomAxisTrrait, oldBottomAxisTrait, targetTrait);
    },
    onSetTrait(newBottomAxisTrrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null, targetTrait: Trait | null): void {
      this.owner.onSetBottomAxis(newBottomAxisTrrait, oldBottomAxisTrait, targetTrait);
    },
    didSetTrait(newBottomAxisTrrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null, targetTrait: Trait | null): void {
      this.owner.didSetBottomAxis(newBottomAxisTrrait, oldBottomAxisTrait, targetTrait);
    },
  })
  readonly bottomAxis!: TraitFastener<this, AxisTrait<X>>;

  protected initLeftAxis(leftAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected attachLeftAxis(leftAxisTrait: AxisTrait<Y>): void {
    if (this.consuming) {
      leftAxisTrait.consume(this);
    }
  }

  protected detachLeftAxis(leftAxisTrait: AxisTrait<Y>): void {
    if (this.consuming) {
      leftAxisTrait.unconsume(this);
    }
  }

  protected willSetLeftAxis(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null, targetTrait: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetLeftAxis !== void 0) {
        traitObserver.traitWillSetLeftAxis(newLeftAxisTrait, oldLeftAxisTrait, targetTrait, this);
      }
    }
  }

  protected onSetLeftAxis(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null, targetTrait: Trait | null): void {
    if (oldLeftAxisTrait !== null) {
      this.detachLeftAxis(oldLeftAxisTrait);
    }
    if (newLeftAxisTrait !== null) {
      this.attachLeftAxis(newLeftAxisTrait);
      this.initLeftAxis(newLeftAxisTrait);
    }
  }

  protected didSetLeftAxis(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null, targetTrait: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetLeftAxis !== void 0) {
        traitObserver.traitDidSetLeftAxis(newLeftAxisTrait, oldLeftAxisTrait, targetTrait, this);
      }
    }
  }

  @TraitFastener<ChartTrait<X, Y>, AxisTrait<Y>>({
    sibling: false,
    willSetTrait(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null, targetTrait: Trait | null): void {
      this.owner.willSetLeftAxis(newLeftAxisTrait, oldLeftAxisTrait, targetTrait);
    },
    onSetTrait(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null, targetTrait: Trait | null): void {
      this.owner.onSetLeftAxis(newLeftAxisTrait, oldLeftAxisTrait, targetTrait);
    },
    didSetTrait(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null, targetTrait: Trait | null): void {
      this.owner.didSetLeftAxis(newLeftAxisTrait, oldLeftAxisTrait, targetTrait);
    },
  })
  readonly leftAxis!: TraitFastener<this, AxisTrait<Y>>;

  protected detectGraphTrait(trait: Trait): GraphTrait<X, Y> | null {
    return trait instanceof GraphTrait ? trait : null;
  }

  protected detectTopAxisTrait(trait: Trait): AxisTrait<X> | null {
    return trait instanceof TopAxisTrait ? trait : null;
  }

  protected detectRightAxisTrait(trait: Trait): AxisTrait<Y> | null {
    return trait instanceof RightAxisTrait ? trait : null;
  }

  protected detectBottomAxisTrait(trait: Trait): AxisTrait<X> | null {
    return trait instanceof BottomAxisTrait ? trait : null;
  }

  protected detectLeftAxisTrait(trait: Trait): AxisTrait<Y> | null {
    return trait instanceof LeftAxisTrait ? trait : null;
  }

  protected detectTraits(model: TraitModelType<this>): void {
    const traits = model.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      const trait = traits[i]!;
      if (this.graph.trait === null) {
        const graphTrait = this.detectGraphTrait(trait);
        if (graphTrait !== null) {
          this.graph.setTrait(graphTrait);
        }
      }
      if (this.topAxis.trait === null) {
        const topAxisTrait = this.detectTopAxisTrait(trait);
        if (topAxisTrait !== null) {
          this.topAxis.setTrait(topAxisTrait);
        }
      }
      if (this.rightAxis.trait === null) {
        const rightAxisTrait = this.detectRightAxisTrait(trait);
        if (rightAxisTrait !== null) {
          this.rightAxis.setTrait(rightAxisTrait);
        }
      }
      if (this.bottomAxis.trait === null) {
        const bottomAxisTrait = this.detectBottomAxisTrait(trait);
        if (bottomAxisTrait !== null) {
          this.bottomAxis.setTrait(bottomAxisTrait);
        }
      }
      if (this.leftAxis.trait === null) {
        const leftAxisTrait = this.detectLeftAxisTrait(trait);
        if (leftAxisTrait !== null) {
          this.leftAxis.setTrait(leftAxisTrait);
        }
      }
    }
  }

  protected override didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    if (newModel !== null) {
      this.detectTraits(newModel);
    }
    super.didSetModel(newModel, oldModel);
  }

  /** @protected */
  override onInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    super.onInsertTrait(trait, targetTrait);
    if (this.graph.trait === null) {
      const graphTrait = this.detectGraphTrait(trait);
      if (graphTrait !== null) {
        this.graph.setTrait(graphTrait, targetTrait);
      }
    }
    if (this.topAxis.trait === null) {
      const topAxisTrait = this.detectTopAxisTrait(trait);
      if (topAxisTrait !== null) {
        this.topAxis.setTrait(topAxisTrait, targetTrait);
      }
    }
    if (this.rightAxis.trait === null) {
      const rightAxisTrait = this.detectRightAxisTrait(trait);
      if (rightAxisTrait !== null) {
        this.rightAxis.setTrait(rightAxisTrait, targetTrait);
      }
    }
    if (this.bottomAxis.trait === null) {
      const bottomAxisTrait = this.detectBottomAxisTrait(trait);
      if (bottomAxisTrait !== null) {
        this.bottomAxis.setTrait(bottomAxisTrait, targetTrait);
      }
    }
    if (this.leftAxis.trait === null) {
      const leftAxisTrait = this.detectLeftAxisTrait(trait);
      if (leftAxisTrait !== null) {
        this.leftAxis.setTrait(leftAxisTrait, targetTrait);
      }
    }
  }

  /** @protected */
  override onRemoveTrait(trait: Trait): void {
    super.onRemoveTrait(trait);
    const graphTrait = this.detectGraphTrait(trait);
    if (graphTrait !== null && this.graph.trait === graphTrait) {
      this.graph.setTrait(null);
    }
    const topAxisTrait = this.detectTopAxisTrait(trait);
    if (topAxisTrait !== null && this.topAxis.trait === topAxisTrait) {
      this.topAxis.setTrait(null);
    }
    const rightAxisTrait = this.detectRightAxisTrait(trait);
    if (rightAxisTrait !== null && this.rightAxis.trait === rightAxisTrait) {
      this.rightAxis.setTrait(null);
    }
    const bottomAxisTrait = this.detectBottomAxisTrait(trait);
    if (bottomAxisTrait !== null && this.bottomAxis.trait === bottomAxisTrait) {
      this.bottomAxis.setTrait(null);
    }
    const leftAxisTrait = this.detectLeftAxisTrait(trait);
    if (leftAxisTrait !== null && this.leftAxis.trait === leftAxisTrait) {
      this.leftAxis.setTrait(null);
    }
  }

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
