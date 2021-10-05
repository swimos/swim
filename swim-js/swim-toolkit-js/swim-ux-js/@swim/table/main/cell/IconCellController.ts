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
import {TraitViewFastener} from "@swim/controller";
import {CellController} from "./CellController";
import {IconCellView} from "./IconCellView";
import {IconCellTrait} from "./IconCellTrait";
import type {IconCellControllerObserver} from "./IconCellControllerObserver";

export class IconCellController extends CellController {
  override readonly observerType?: Class<IconCellControllerObserver>;

  protected override attachCellTrait(cellTrait: IconCellTrait): void {
    super.attachCellTrait(cellTrait);
    this.setIcon(cellTrait.icon.state);
  }

  protected override detachCellTrait(cellTrait: IconCellTrait): void {
    this.setIcon(null);
    super.detachCellTrait(cellTrait);
  }

  protected override createCellView(): IconCellView | null {
    return IconCellView.create();
  }

  protected override attachCellView(cellView: IconCellView): void {
    const cellTrait = this.cell.trait;
    if (cellTrait !== null) {
      this.setIcon(cellTrait.icon.state);
    }
  }

  protected override detachCellView(cellView: IconCellView): void {
    // hook
  }

  protected setIcon(icon: Graphics | null): void {
    const cellView = this.cell.view;
    if (cellView !== null) {
      cellView.graphics.setState(icon);
    }
  }

  protected willSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellView: IconCellView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetCellIcon !== void 0) {
        observer.controllerWillSetCellIcon(newCellIcon, oldCellIcon, this);
      }
    }
  }

  protected onSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellView: IconCellView): void {
    // hook
  }

  protected didSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellView: IconCellView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetCellIcon !== void 0) {
        observer.controllerDidSetCellIcon(newCellIcon, oldCellIcon, this);
      }
    }
  }

  /** @internal */
  static override CellFastener = TraitViewFastener.define<IconCellController, IconCellTrait, IconCellView>({
    extends: CellController.CellFastener,
    traitType: IconCellTrait,
    observesTrait: true,
    traitDidSetIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellTrait: IconCellTrait): void {
      this.owner.setIcon(newCellIcon);
    },
    viewType: IconCellView,
    observesView: true,
    viewWillSetGraphics(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellView: IconCellView): void {
      this.owner.willSetCellIcon(newCellIcon, oldCellIcon, cellView);
    },
    viewDidSetGraphics(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellView: IconCellView): void {
      this.owner.onSetCellIcon(newCellIcon, oldCellIcon, cellView);
      this.owner.didSetCellIcon(newCellIcon, oldCellIcon, cellView);
    },
  });

  @TraitViewFastener<IconCellController, IconCellTrait, IconCellView>({
    extends: IconCellController.CellFastener,
  })
  override readonly cell!: TraitViewFastener<this, IconCellTrait, IconCellView>;
}
