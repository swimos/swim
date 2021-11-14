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

import type {MemberFastenerClass} from "@swim/fastener";
import {AnyExpansion, Expansion} from "@swim/style";
import {ThemeAnimator, ExpansionThemeAnimator} from "@swim/theme";
import {ViewRef, PositionGestureInput} from "@swim/view";
import {DisclosureButton} from "@swim/button";
import {CellView} from "./CellView";

/** @public */
export class DisclosureCellView extends CellView {
  protected override initCell(): void {
    super.initCell();
    this.addClass("cell-disclosure");
    this.button.insertView();
  }

  @ThemeAnimator({type: Expansion, inherits: true})
  readonly disclosure!: ExpansionThemeAnimator<this, Expansion, AnyExpansion>;

  @ViewRef<DisclosureCellView, DisclosureButton>({
    key: true,
    type: DisclosureButton,
    binds: true,
  })
  readonly button!: ViewRef<this, DisclosureButton>;
  static readonly button: MemberFastenerClass<DisclosureCellView, "button">;

  override didPress(input: PositionGestureInput, event: Event | null): void {
    input.preventDefault();
    const superDisclosure = this.disclosure.superFastener;
    if (superDisclosure instanceof ExpansionThemeAnimator) {
      superDisclosure.toggle();
    }
    super.didPress(input, event);
  }
}
