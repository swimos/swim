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
import type {PositionGestureInput} from "@swim/view";
import {TraitViewFastener, GenericController} from "@swim/controller";
import {CellView} from "./CellView";
import {CellTrait} from "./CellTrait";
import {TextCellTrait} from "./TextCellTrait";
import {IconCellTrait} from "./IconCellTrait";
import type {CellControllerObserver} from "./CellControllerObserver";
import {TextCellController} from "../"; // forward import
import {IconCellController} from "../"; // forward import

export class CellController extends GenericController {
  override readonly observerType?: Class<CellControllerObserver>;

  protected initCellTrait(cellTrait: CellTrait): void {
    // hook
  }

  protected attachCellTrait(cellTrait: CellTrait): void {
    // hook
  }

  protected detachCellTrait(cellTrait: CellTrait): void {
    // hook
  }

  protected willSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetCellTrait !== void 0) {
        observer.controllerWillSetCellTrait(newCellTrait, oldCellTrait, this);
      }
    }
  }

  protected onSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
    if (oldCellTrait !== null) {
      this.detachCellTrait(oldCellTrait);
    }
    if (newCellTrait !== null) {
      this.attachCellTrait(newCellTrait);
      this.initCellTrait(newCellTrait);
    }
  }

  protected didSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetCellTrait !== void 0) {
        observer.controllerDidSetCellTrait(newCellTrait, oldCellTrait, this);
      }
    }
  }

  protected createCellView(): CellView | null {
    return CellView.create();
  }

  protected initCellView(cellView: CellView): void {
    // hook
  }

  protected attachCellView(cellView: CellView): void {
    // hook
  }

  protected detachCellView(cellView: CellView): void {
    // hook
  }

  protected willSetCellView(newCellView: CellView | null, oldCellView: CellView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetCellView !== void 0) {
        observer.controllerWillSetCellView(newCellView, oldCellView, this);
      }
    }
  }

  protected onSetCellView(newCellView: CellView | null, oldCellView: CellView | null): void {
    if (oldCellView !== null) {
      this.detachCellView(oldCellView);
    }
    if (newCellView !== null) {
      this.attachCellView(newCellView);
      this.initCellView(newCellView);
    }
  }

  protected didSetCellView(newCellView: CellView | null, oldCellView: CellView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetCellView !== void 0) {
        observer.controllerDidSetCellView(newCellView, oldCellView, this);
      }
    }
  }

  protected didPressCellView(input: PositionGestureInput, event: Event | null, cellView: CellView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidPressCellView !== void 0) {
        observer.controllerDidPressCellView(input, event, cellView, this);
      }
    }
  }

  protected didLongPressCellView(input: PositionGestureInput, cellView: CellView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidLongPressCellView !== void 0) {
        observer.controllerDidLongPressCellView(input, cellView, this);
      }
    }
  }

  /** @internal */
  static CellFastener = TraitViewFastener.define<CellController, CellTrait, CellView>({
    traitType: CellTrait,
    willSetTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
      this.owner.willSetCellTrait(newCellTrait, oldCellTrait);
    },
    onSetTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
      this.owner.onSetCellTrait(newCellTrait, oldCellTrait);
    },
    didSetTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
      this.owner.didSetCellTrait(newCellTrait, oldCellTrait);
    },
    viewType: CellView,
    observesView: true,
    willSetView(newCellView: CellView | null, oldCellView: CellView | null): void {
      this.owner.willSetCellView(newCellView, oldCellView);
    },
    onSetView(newCellView: CellView | null, oldCellView: CellView | null): void {
      this.owner.onSetCellView(newCellView, oldCellView);
    },
    didSetView(newCellView: CellView | null, oldCellView: CellView | null): void {
      this.owner.didSetCellView(newCellView, oldCellView);
    },
    viewDidPress(input: PositionGestureInput, event: Event | null, cellView: CellView): void {
      this.owner.didPressCellView(input, event, cellView);
    },
    viewDidLongPress(input: PositionGestureInput, cellView: CellView): void {
      this.owner.didLongPressCellView(input, cellView);
    },
    createView(): CellView | null {
      return this.owner.createCellView();
    },
  });

  @TraitViewFastener<CellController, CellTrait, CellView>({
    extends: CellController.CellFastener,
  })
  readonly cell!: TraitViewFastener<this, CellTrait, CellView>;

  static createCell(cellTrait: CellTrait): CellController {
    if (cellTrait instanceof TextCellTrait) {
      return new TextCellController();
    } else if (cellTrait instanceof IconCellTrait) {
      return new IconCellController();
    } else {
      return new CellController();
    }
  }
}
