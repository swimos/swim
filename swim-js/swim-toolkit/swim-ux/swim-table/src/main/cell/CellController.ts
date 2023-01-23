// Copyright 2015-2023 Swim.inc
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
import type {PositionGestureInput} from "@swim/view";
import {Controller, TraitViewRef} from "@swim/controller";
import {CellView} from "./CellView";
import {CellTrait} from "./CellTrait";
import type {CellControllerObserver} from "./CellControllerObserver";

/** @public */
export class CellController extends Controller {
  override readonly observerType?: Class<CellControllerObserver>;

  @TraitViewRef<CellController["cell"]>({
    traitType: CellTrait,
    willAttachTrait(cellTrait: CellTrait): void {
      this.owner.callObservers("controllerWillAttachCellTrait", cellTrait, this.owner);
    },
    didDetachTrait(cellTrait: CellTrait): void {
      this.owner.callObservers("controllerDidDetachCellTrait", cellTrait, this.owner);
    },
    viewType: CellView,
    observesView: true,
    willAttachView(cellView: CellView): void {
      this.owner.callObservers("controllerWillAttachCellView", cellView, this.owner);
    },
    didDetachView(cellView: CellView): void {
      this.owner.callObservers("controllerDidDetachCellView", cellView, this.owner);
    },
    viewDidPress(input: PositionGestureInput, event: Event | null, cellView: CellView): void {
      this.owner.callObservers("controllerDidPressCellView", input, event, cellView, this.owner);
    },
    viewDidLongPress(input: PositionGestureInput, cellView: CellView): void {
      this.owner.callObservers("controllerDidLongPressCellView", input, cellView, this.owner);
    },
  })
  readonly cell!: TraitViewRef<this, CellTrait, CellView> & Observes<CellView>;
  static readonly cell: FastenerClass<CellController["cell"]>;
}
