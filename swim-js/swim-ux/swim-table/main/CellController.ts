// Copyright 2015-2023 Nstream, inc.
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
import type {Observes} from "@swim/util";
import {Property} from "@swim/component";
import type {PositionGestureInput} from "@swim/view";
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {Hyperlink} from "@swim/controller";
import {CellView} from "./CellView";
import {CellTrait} from "./CellTrait";

/** @public */
export interface CellControllerObserver<C extends CellController = CellController> extends ControllerObserver<C> {
  controllerWillAttachCellTrait?(cellTrait: CellTrait, controller: C): void;

  controllerDidDetachCellTrait?(cellTrait: CellTrait, controller: C): void;

  controllerWillAttachCellView?(cellView: CellView, controller: C): void;

  controllerDidDetachCellView?(cellView: CellView, controller: C): void;

  controllerDidPressCellView?(input: PositionGestureInput, event: Event | null, cellView: CellView, controller: C): void;

  controllerDidLongPressCellView?(input: PositionGestureInput, cellView: CellView, controller: C): void;
}

/** @public */
export class CellController extends Controller {
  declare readonly observerType?: Class<CellControllerObserver>;

  @Property({valueType: Hyperlink, value: null})
  get hyperlink(): Property<this, Hyperlink | null> {
    return Property.getter();
  }

  @TraitViewRef({
    traitType: CellTrait,
    willAttachTrait(cellTrait: CellTrait): void {
      this.owner.callObservers("controllerWillAttachCellTrait", cellTrait, this.owner);
    },
    initTrait(cellTrait: CellTrait): void {
      this.owner.hyperlink.bindInlet(cellTrait.hyperlink);
    },
    deinitTrait(cellTrait: CellTrait): void {
      this.owner.hyperlink.unbindInlet(cellTrait.hyperlink);
    },
    didDetachTrait(cellTrait: CellTrait): void {
      this.owner.callObservers("controllerDidDetachCellTrait", cellTrait, this.owner);
    },
    viewType: CellView,
    observesView: true,
    initView(cellView: CellView): void {
      cellView.hyperlink.bindInlet(this.owner.hyperlink);
    },
    willAttachView(cellView: CellView): void {
      this.owner.callObservers("controllerWillAttachCellView", cellView, this.owner);
    },
    deinitView(cellView: CellView): void {
      cellView.hyperlink.unbindInlet(this.owner.hyperlink);
    },
    didDetachView(cellView: CellView): void {
      this.owner.callObservers("controllerDidDetachCellView", cellView, this.owner);
    },
    viewDidPress(input: PositionGestureInput, event: Event | null, cellView: CellView): void {
      this.owner.callObservers("controllerDidPressCellView", input, event, cellView, this.owner);
      const hyperlink = Property.tryValue(this.owner, "hyperlink");
      if (hyperlink !== null && !input.defaultPrevented) {
        input.preventDefault();
        hyperlink.activate(event);
      }
    },
    viewDidLongPress(input: PositionGestureInput, cellView: CellView): void {
      this.owner.callObservers("controllerDidLongPressCellView", input, cellView, this.owner);
    },
  })
  readonly cell!: TraitViewRef<this, CellTrait, CellView> & Observes<CellView>;
}
