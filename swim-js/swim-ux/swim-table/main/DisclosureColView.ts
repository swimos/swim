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
import type {Expansion} from "@swim/style";
import {ExpansionAnimator} from "@swim/style";
import {ViewRef} from "@swim/view";
import type {PositionGestureInput} from "@swim/view";
import {DisclosureButton} from "@swim/button";
import type {ColViewObserver} from "./ColView";
import {ColView} from "./ColView";

/** @public */
export interface DisclosureColViewObserver<V extends DisclosureColView = DisclosureColView> extends ColViewObserver<V> {
}

/** @public */
export class DisclosureColView extends ColView {
  protected override initCol(): void {
    super.initCol();
    this.classList.add("col-disclosure");
  }

  declare readonly observerType?: Class<DisclosureColViewObserver>;

  @ExpansionAnimator({value: null, inherits: true, inheritName: "expansion"})
  readonly disclosure!: ExpansionAnimator<this, Expansion | null>;

  @ViewRef({
    viewType: DisclosureButton,
    viewKey: true,
    binds: true,
    init(): void {
      this.insertView();
    },
  })
  readonly button!: ViewRef<this, DisclosureButton>;

  override didPress(input: PositionGestureInput, event: Event | null): void {
    input.preventDefault();
    const superDisclosure = this.disclosure.inlet;
    if (superDisclosure instanceof ExpansionAnimator) {
      superDisclosure.toggle();
    }
    super.didPress(input, event);
  }
}
