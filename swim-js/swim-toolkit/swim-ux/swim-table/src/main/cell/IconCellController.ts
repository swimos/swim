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

import type {Class, Observes} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import type {Graphics} from "@swim/graphics";
import {TraitViewRef} from "@swim/controller";
import {CellController} from "./CellController";
import {IconCellView} from "./IconCellView";
import {IconCellTrait} from "./IconCellTrait";
import type {IconCellControllerObserver} from "./IconCellControllerObserver";

/** @public */
export class IconCellController extends CellController {
  override readonly observerType?: Class<IconCellControllerObserver>;

  protected setIcon(icon: Graphics | null): void {
    const cellView = this.cell.view;
    if (cellView !== null) {
      cellView.graphics.setState(icon);
    }
  }

  @TraitViewRef<IconCellController["cell"]>({
    extends: true,
    traitType: IconCellTrait,
    observesTrait: true,
    initTrait(cellTrait: IconCellTrait): void {
      this.owner.setIcon(cellTrait.icon.value);
    },
    deinitTrait(cellTrait: IconCellTrait): void {
      this.owner.setIcon(null);
    },
    traitDidSetIcon(icon: Graphics | null): void {
      this.owner.setIcon(icon);
    },
    viewType: IconCellView,
    observesView: true,
    initView(cellView: IconCellView): void {
      const cellTrait = this.trait;
      if (cellTrait !== null) {
        this.owner.setIcon(cellTrait.icon.value);
      }
    },
    viewDidSetGraphics(cellIcon: Graphics | null): void {
      this.owner.callObservers("controllerDidSetCellIcon", cellIcon, this.owner);
    },
  })
  override readonly cell!: TraitViewRef<this, IconCellTrait, IconCellView> & CellController["cell"] & Observes<IconCellTrait & IconCellView>;
  static override readonly cell: FastenerClass<IconCellController["cell"]>;
}
