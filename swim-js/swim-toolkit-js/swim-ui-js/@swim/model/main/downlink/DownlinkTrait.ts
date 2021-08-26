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

import {Trait} from "../Trait";
import type {TraitConsumerType} from "../TraitConsumer";
import {TraitFastener} from "../fastener/TraitFastener";
import {GenericTrait} from "../generic/GenericTrait";

export abstract class DownlinkTrait extends GenericTrait {
  protected attachDriver(driverTrait: Trait): void {
    if (driverTrait.isConsuming()) {
      this.addTraitConsumer(driverTrait as TraitConsumerType<this>);
    }
  }

  protected detachDriver(driverTrait: Trait): void {
    if (driverTrait.isConsuming()) {
      this.removeTraitConsumer(driverTrait as TraitConsumerType<this>);
    }
  }

  protected driverDidStartConsuming(driverTrait: Trait): void {
    this.addTraitConsumer(driverTrait as TraitConsumerType<this>);
  }

  protected driverWillStopConsuming(driverTrait: Trait): void {
    this.removeTraitConsumer(driverTrait as TraitConsumerType<this>);
  }

  @TraitFastener<DownlinkTrait, Trait>({
    type: Trait,
    observe: true,
    onSetTrait(newDriverTrait: Trait | null, oldDriverTrait: Trait | null): void {
      if (oldDriverTrait !== null) {
        this.owner.detachDriver(oldDriverTrait);
      }
      if (newDriverTrait !== null) {
        this.owner.attachDriver(newDriverTrait);
      }
    },
    traitDidStartConsuming(driverTrait: Trait): void {
      this.owner.driverDidStartConsuming(driverTrait);
    },
    traitWillStopConsuming(driverTrait: Trait): void {
      this.owner.driverWillStopConsuming(driverTrait);
    },
  })
  readonly driver!: TraitFastener<this, Trait>;
}
