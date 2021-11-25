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
import {Property} from "@swim/component";
import type {Graphics} from "@swim/graphics";
import {CellTrait} from "./CellTrait";
import type {IconCellTraitObserver} from "./IconCellTraitObserver";

/** @public */
export class IconCellTrait extends CellTrait {
  override readonly observerType?: Class<IconCellTraitObserver>;

  @Property<IconCellTrait, Graphics | null>({
    state: null,
    willSetState(newIcon: Graphics | null, oldIcon: Graphics | null): void {
      this.owner.callObservers("traitWillSetIcon", newIcon, oldIcon, this.owner);
    },
    didSetState(newIcon: Graphics | null, oldIcon: Graphics | null): void {
      this.owner.callObservers("traitDidSetIcon", newIcon, oldIcon, this.owner);
    },
  })
  readonly icon!: Property<this, Graphics | null>;
}
