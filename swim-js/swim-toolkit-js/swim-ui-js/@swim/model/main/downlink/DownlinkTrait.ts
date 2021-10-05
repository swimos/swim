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

import type {ConsumerType} from "@swim/util";
import {Trait} from "../trait/Trait";
import {TraitFastener} from "../trait/TraitFastener";

export abstract class DownlinkTrait extends Trait {
  protected attachDriver(driverTrait: Trait): void {
    if (driverTrait.consuming) {
      this.consume(driverTrait as ConsumerType<this>);
    }
  }

  protected detachDriver(driverTrait: Trait): void {
    if (driverTrait.consuming) {
      this.unconsume(driverTrait as ConsumerType<this>);
    }
  }

  protected driverDidStartConsuming(driverTrait: Trait): void {
    this.consume(driverTrait as ConsumerType<this>);
  }

  protected driverWillStopConsuming(driverTrait: Trait): void {
    this.unconsume(driverTrait as ConsumerType<this>);
  }

  @TraitFastener<DownlinkTrait, Trait>({
    type: Trait,
    observes: true,
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
