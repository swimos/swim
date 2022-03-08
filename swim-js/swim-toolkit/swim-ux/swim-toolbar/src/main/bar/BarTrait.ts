// Copyright 2015-2021 Swim.inc
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
import {Model, TraitCreator, Trait, TraitSet} from "@swim/model";
import {ToolTrait} from "../tool/ToolTrait";
import type {BarTraitObserver} from "./BarTraitObserver";

/** @public */
export class BarTrait extends Trait {
  override readonly observerType?: Class<BarTraitObserver>;

  getTool<F extends abstract new (...args: any) => ToolTrait>(key: string, toolTraitClass: F): InstanceType<F> | null;
  getTool(key: string): ToolTrait | null;
  getTool(key: string, toolTraitClass?: abstract new (...args: any) => ToolTrait): ToolTrait | null {
    if (toolTraitClass === void 0) {
      toolTraitClass = ToolTrait;
    }
    const toolTrait = this.getTrait(key);
    return toolTrait instanceof toolTraitClass ? toolTrait : null;
  }

  getOrCreateTool<F extends TraitCreator<F, ToolTrait>>(key: string, toolTraitClass: F): InstanceType<F> {
    let toolTrait = this.getTrait(key, toolTraitClass);
    if (toolTrait === null) {
      toolTrait = toolTraitClass.create();
      this.setTrait(key, toolTrait);
    }
    return toolTrait!;
  }

  setTool(key: string, toolTrait: ToolTrait): void {
    this.setTrait(key, toolTrait);
  }

  @TraitSet<BarTrait, ToolTrait>({
    type: ToolTrait,
    binds: true,
    willAttachTrait(toolTrait: ToolTrait, targetTrait: Trait | null): void {
      this.owner.callObservers("traitWillAttachTool", toolTrait, targetTrait, this.owner);
    },
    didAttachTrait(toolTrait: ToolTrait, targetTrait: Trait | null): void {
      if (this.owner.consuming) {
        toolTrait.consume(this.owner);
      }
    },
    willDetachTrait(toolTrait: ToolTrait): void {
      if (this.owner.consuming) {
        toolTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(toolTrait: ToolTrait): void {
      this.owner.callObservers("traitDidDetachTool", toolTrait, this.owner);
    },
    detectModel(model: Model): ToolTrait | null {
      return model.getTrait(ToolTrait);
    },
  })
  readonly tools!: TraitSet<this, ToolTrait>;
  static readonly tools: MemberFastenerClass<BarTrait, "tools">;

  /** @internal */
  protected startConsumingTools(): void {
    const toolTraits = this.tools.traits;
    for (const traitId in toolTraits) {
      const toolTrait = toolTraits[traitId]!;
      toolTrait.consume(this);
    }
  }

  /** @internal */
  protected stopConsumingTools(): void {
    const toolTraits = this.tools.traits;
    for (const traitId in toolTraits) {
      const toolTrait = toolTraits[traitId]!;
      toolTrait.unconsume(this);
    }
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingTools();
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingTools();
  }
}
