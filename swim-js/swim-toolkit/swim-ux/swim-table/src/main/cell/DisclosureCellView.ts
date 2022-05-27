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

import type {FastenerClass} from "@swim/component";
import {AnyExpansion, Expansion, ExpansionAnimator} from "@swim/style";
import {PositionGestureInput, ViewRef} from "@swim/view";
import {DisclosureButton} from "@swim/button";
import {CellView} from "./CellView";

/** @public */
export class DisclosureCellView extends CellView {
  protected override initCell(): void {
    super.initCell();
    this.addClass("cell-disclosure");
    this.button.insertView();
  }

  @ExpansionAnimator({inherits: true})
  readonly disclosure!: ExpansionAnimator<this, Expansion, AnyExpansion>;

  @ViewRef<DisclosureCellView["button"]>({
    viewType: DisclosureButton,
    viewKey: true,
    binds: true,
  })
  readonly button!: ViewRef<this, DisclosureButton>;
  static readonly button: FastenerClass<DisclosureCellView["button"]>;

  override didPress(input: PositionGestureInput, event: Event | null): void {
    input.preventDefault();
    const superDisclosure = this.disclosure.inlet;
    if (superDisclosure instanceof ExpansionAnimator) {
      superDisclosure.toggle();
    }
    super.didPress(input, event);
  }
}
