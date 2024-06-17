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
import type {CellViewObserver} from "./CellView";
import {CellView} from "./CellView";

/** @public */
export interface DisclosureCellViewObserver<V extends DisclosureCellView = DisclosureCellView> extends CellViewObserver<V> {
}

/** @public */
export class DisclosureCellView extends CellView {
  protected override initCell(): void {
    super.initCell();
    this.classList.add("cell-disclosure");
  }

  declare readonly observerType?: Class<DisclosureCellViewObserver>;

  @ExpansionAnimator({value: null, inherits: true})
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
