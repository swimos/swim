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
import type {Graphics} from "@swim/graphics";
import {TraitViewRef} from "@swim/controller";
import {CellController} from "./CellController";
import {IconCellView} from "./IconCellView";
import {IconCellTrait} from "./IconCellTrait";
import type {IconCellControllerObserver} from "./IconCellControllerObserver";

export class IconCellController extends CellController {
  override readonly observerType?: Class<IconCellControllerObserver>;

  protected setIcon(icon: Graphics | null): void {
    const cellView = this.cell.view;
    if (cellView !== null) {
      cellView.graphics.setState(icon);
    }
  }

  @TraitViewRef<IconCellController, IconCellTrait, IconCellView>({
    extends: true,
    traitType: IconCellTrait,
    observesTrait: true,
    didAttachTrait(cellTrait: IconCellTrait): void {
      this.owner.setIcon(cellTrait.icon.state);
    },
    willDetachTrait(cellTrait: IconCellTrait): void {
      this.owner.setIcon(null);
    },
    traitDidSetIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null): void {
      this.owner.setIcon(newCellIcon);
    },
    viewType: IconCellView,
    observesView: true,
    didAttachView(cellView: IconCellView): void {
      const cellTrait = this.trait;
      if (cellTrait !== null) {
        this.owner.setIcon(cellTrait.icon.state);
      }
    },
    viewWillSetGraphics(newCellIcon: Graphics | null, oldCellIcon: Graphics | null): void {
      this.owner.callObservers("controllerWillSetCellIcon", newCellIcon, oldCellIcon, this.owner);
    },
    viewDidSetGraphics(newCellIcon: Graphics | null, oldCellIcon: Graphics | null): void {
      this.owner.callObservers("controllerDidSetCellIcon", newCellIcon, oldCellIcon, this.owner);
    },
  })
  override readonly cell!: TraitViewRef<this, IconCellTrait, IconCellView>;
}
