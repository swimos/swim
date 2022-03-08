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

import type {ConsumerType} from "@swim/util";
import type {MemberFastenerClass} from "@swim/component";
import {Trait} from "../trait/Trait";
import {TraitRef} from "../trait/TraitRef";

/** @beta */
export abstract class DownlinkTrait extends Trait {
  @TraitRef<DownlinkTrait, Trait>({
    type: Trait,
    observes: true,
    didAttachTrait(driverTrait: Trait): void {
      if (driverTrait.consuming) {
        this.owner.consume(driverTrait as ConsumerType<DownlinkTrait>);
      }
    },
    willDetachTrait(driverTrait: Trait): void {
      if (driverTrait.consuming) {
        this.owner.unconsume(driverTrait as ConsumerType<DownlinkTrait>);
      }
    },
    traitDidStartConsuming(driverTrait: Trait): void {
      this.owner.consume(driverTrait as ConsumerType<DownlinkTrait>);
    },
    traitWillStopConsuming(driverTrait: Trait): void {
      this.owner.unconsume(driverTrait as ConsumerType<DownlinkTrait>);
    },
  })
  readonly driver!: TraitRef<this, Trait>;
  static readonly driver: MemberFastenerClass<DownlinkTrait, "driver">;
}
