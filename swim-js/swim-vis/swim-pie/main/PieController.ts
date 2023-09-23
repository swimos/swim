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
import {Timing} from "@swim/util";
import type {Observes} from "@swim/util";
import {Property} from "@swim/component";
import type {Trait} from "@swim/model";
import {ViewRef} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import type {SliceView} from "./SliceView";
import type {SliceTrait} from "./SliceTrait";
import {SliceController} from "./SliceController";
import {PieView} from "./PieView";
import {PieTrait} from "./PieTrait";

/** @public */
export interface PieControllerObserver<C extends PieController = PieController> extends ControllerObserver<C> {
  controllerWillAttachPieTrait?(pieTrait: PieTrait, controller: C): void;

  controllerDidDetachPieTrait?(pieTrait: PieTrait, controller: C): void;

  controllerWillAttachPieView?(pieView: PieView, controller: C): void;

  controllerDidDetachPieView?(pieView: PieView, controller: C): void;

  controllerWillAttachPieTitleView?(titleView: GraphicsView, controller: C): void;

  controllerDidDetachPieTitleView?(titleView: GraphicsView, controller: C): void;

  controllerWillAttachSlice?(sliceController: SliceController, controller: C): void;

  controllerDidDetachSlice?(sliceController: SliceController, controller: C): void;

  controllerWillAttachSliceTrait?(sliceTrait: SliceTrait, sliceController: SliceController, controller: C): void;

  controllerDidDetachSliceTrait?(sliceTrait: SliceTrait, sliceController: SliceController, controller: C): void;

  controllerWillAttachSliceView?(sliceView: SliceView, sliceController: SliceController, controller: C): void;

  controllerDidDetachSliceView?(sliceView: SliceView, sliceController: SliceController, controller: C): void;

  controllerDidSetSliceValue?(sliceValue: number, sliceController: SliceController, controller: C): void;

  controllerWillAttachSliceLabelView?(labelView: GraphicsView, sliceController: SliceController, controller: C): void;

  controllerDidDetachSliceLabelView?(labelView: GraphicsView, sliceController: SliceController, controller: C): void;

  controllerWillAttachSliceLegendView?(legendView: GraphicsView, sliceController: SliceController, controller: C): void;

  controllerDidDetachSliceLegendView?(legendView: GraphicsView, sliceController: SliceController, controller: C): void;
}

/** @public */
export class PieController extends Controller {
  declare readonly observerType?: Class<PieControllerObserver>;

  protected setTitleView(title: string | undefined): void {
    const pieView = this.pie.view;
    if (pieView !== null) {
      pieView.title.set(title);
    }
  }

  @TraitViewRef({
    traitType: PieTrait,
    observesTrait: true,
    willAttachTrait(pieTrait: PieTrait): void {
      this.owner.callObservers("controllerWillAttachPieTrait", pieTrait, this.owner);
    },
    didAttachTrait(pieTrait: PieTrait): void {
      this.owner.slices.addTraits(pieTrait.slices.traits);
      const pieView = this.view;
      if (pieView !== null) {
        this.owner.setTitleView(pieTrait.title.value);
      }
    },
    willDetachTrait(pieTrait: PieTrait): void {
      const pieView = this.view;
      if (pieView !== null) {
        this.owner.setTitleView(pieTrait.title.value);
      }
      this.owner.slices.deleteTraits(pieTrait.slices.traits);
    },
    didDetachTrait(pieTrait: PieTrait): void {
      this.owner.callObservers("controllerDidDetachPieTrait", pieTrait, this.owner);
    },
    traitDidSetTitle(title: string | undefined): void {
      this.owner.setTitleView(title);
    },
    traitWillAttachSlice(sliceTrait: SliceTrait, targetTrait: Trait): void {
      this.owner.slices.addTrait(sliceTrait);
    },
    traitDidDetachSlice(sliceTrait: SliceTrait): void {
      this.owner.slices.deleteTrait(sliceTrait);
    },
    viewType: PieView,
    observesView: true,
    initView(pieView: PieView): void {
      const sliceControllers = this.owner.slices.controllers;
      for (const controllerId in sliceControllers) {
        const sliceController = sliceControllers[controllerId]!;
        const sliceView = sliceController.slice.view;
        if (sliceView !== null && sliceView.parent === null) {
          sliceController.slice.insertView(pieView);
        }
      }
      this.owner.title.setView(pieView.title.view);
      const pieTrait = this.trait;
      if (pieTrait !== null) {
        this.owner.setTitleView(pieTrait.title.value);
      }
    },
    deinitView(pieView: PieView): void {
      this.owner.title.setView(null);
    },
    willAttachView(pieView: PieView): void {
      this.owner.callObservers("controllerWillAttachPieView", pieView, this.owner);
    },
    didDetachView(pieView: PieView): void {
      this.owner.callObservers("controllerDidDetachPieView", pieView, this.owner);
    },
    viewWillAttachTitle(titleView: GraphicsView): void {
      this.owner.title.setView(titleView);
    },
    viewDidDetachTitle(titleView: GraphicsView): void {
      this.owner.title.setView(null);
    },
  })
  readonly pie!: TraitViewRef<this, PieTrait, PieView> & Observes<PieTrait> & Observes<PieView>;

  @ViewRef({
    viewKey: true,
    willAttachView(titleView: GraphicsView): void {
      this.owner.callObservers("controllerWillAttachPieTitleView", titleView, this.owner);
    },
    didDetachView(titleView: GraphicsView): void {
      this.owner.callObservers("controllerDidDetachPieTitleView", titleView, this.owner);
    },
  })
  readonly title!: ViewRef<this, GraphicsView>;

  @Property({valueType: Timing, value: true})
  get sliceTiming(): Property<this, Timing | boolean | undefined> {
    return Property.getter();
  }

  @TraitViewControllerSet({
    controllerType: SliceController,
    binds: true,
    observes: true,
    get parentView(): PieView | null {
      return this.owner.pie.view;
    },
    getTraitViewRef(sliceController: SliceController): TraitViewRef<unknown, SliceTrait, SliceView> {
      return sliceController.slice;
    },
    willAttachController(sliceController: SliceController): void {
      this.owner.callObservers("controllerWillAttachSlice", sliceController, this.owner);
    },
    didAttachController(sliceController: SliceController): void {
      const sliceTrait = sliceController.slice.trait;
      if (sliceTrait !== null) {
        this.attachSliceTrait(sliceTrait, sliceController);
      }
      const sliceView = sliceController.slice.view;
      if (sliceView !== null) {
        this.attachSliceView(sliceView, sliceController);
      }
    },
    willDetachController(sliceController: SliceController): void {
      const sliceView = sliceController.slice.view;
      if (sliceView !== null) {
        this.detachSliceView(sliceView, sliceController);
      }
      const sliceTrait = sliceController.slice.trait;
      if (sliceTrait !== null) {
        this.detachSliceTrait(sliceTrait, sliceController);
      }
    },
    didDetachController(sliceController: SliceController): void {
      this.owner.callObservers("controllerDidDetachSlice", sliceController, this.owner);
    },
    controllerWillAttachSliceTrait(sliceTrait: SliceTrait, sliceController: SliceController): void {
      this.owner.callObservers("controllerWillAttachSliceTrait", sliceTrait, sliceController, this.owner);
      this.attachSliceTrait(sliceTrait, sliceController);
    },
    controllerDidDetachSliceTrait(sliceTrait: SliceTrait, sliceController: SliceController): void {
      this.detachSliceTrait(sliceTrait, sliceController);
      this.owner.callObservers("controllerDidDetachSliceTrait", sliceTrait, sliceController, this.owner);
    },
    attachSliceTrait(sliceTrait: SliceTrait, sliceController: SliceController): void {
      // hook
    },
    detachSliceTrait(sliceTrait: SliceTrait, sliceController: SliceController): void {
      // hook
    },
    controllerWillAttachSliceView(sliceView: SliceView, sliceController: SliceController): void {
      this.owner.callObservers("controllerWillAttachSliceView", sliceView, sliceController, this.owner);
      this.attachSliceView(sliceView, sliceController);
    },
    controllerDidDetachSliceView(sliceView: SliceView, sliceController: SliceController): void {
      this.detachSliceView(sliceView, sliceController);
      this.owner.callObservers("controllerDidDetachSliceView", sliceView, sliceController, this.owner);
    },
    attachSliceView(sliceView: SliceView, sliceController: SliceController): void {
      const labelView = sliceView.label.view;
      if (labelView !== null) {
        this.attachSliceLabelView(labelView, sliceController);
      }
      const legendView = sliceView.legend.view;
      if (legendView !== null) {
        this.attachSliceLegendView(legendView, sliceController);
      }
    },
    detachSliceView(sliceView: SliceView, sliceController: SliceController): void {
      const legendView = sliceView.legend.view;
      if (legendView !== null) {
        this.detachSliceLegendView(legendView, sliceController);
      }
      const labelView = sliceView.label.view;
      if (labelView !== null) {
        this.detachSliceLabelView(labelView, sliceController);
      }
      sliceView.remove();
    },
    controllerDidSetSliceValue(sliceValue: number, sliceController: SliceController): void {
      this.owner.callObservers("controllerDidSetSliceValue", sliceValue, sliceController, this.owner);
    },
    controllerWillAttachSliceLabelView(labelView: GraphicsView, sliceController: SliceController): void {
      this.owner.callObservers("controllerWillAttachSliceLabelView", labelView, sliceController, this.owner);
      this.attachSliceLabelView(labelView, sliceController);
    },
    controllerDidDetachSliceLabelView(labelView: GraphicsView, sliceController: SliceController): void {
      this.detachSliceLabelView(labelView, sliceController);
      this.owner.callObservers("controllerDidDetachSliceLabelView", labelView, sliceController, this.owner);
    },
    attachSliceLabelView(labelView: GraphicsView, sliceController: SliceController): void {
      // hook
    },
    detachSliceLabelView(labelView: GraphicsView, sliceController: SliceController): void {
      // hook
    },
    controllerWillAttachSliceLegendView(legendView: GraphicsView, sliceController: SliceController): void {
      this.owner.callObservers("controllerWillAttachSliceLegendView", legendView, sliceController, this.owner);
      this.attachSliceLegendView(legendView, sliceController);
    },
    controllerDidDetachSliceLegendView(legendView: GraphicsView, sliceController: SliceController): void {
      this.detachSliceLegendView(legendView, sliceController);
      this.owner.callObservers("controllerDidDetachSliceLegendView", legendView, sliceController, this.owner);
    },
    attachSliceLegendView(legendView: GraphicsView, sliceController: SliceController): void {
      // hook
    },
    detachSliceLegendView(legendView: GraphicsView, sliceController: SliceController): void {
      // hook
    },
  })
  readonly slices!: TraitViewControllerSet<this, SliceTrait, SliceView, SliceController> & Observes<SliceController> & {
    attachSliceTrait(sliceTrait: SliceTrait, sliceController: SliceController): void,
    detachSliceTrait(sliceTrait: SliceTrait, sliceController: SliceController): void,
    attachSliceView(sliceView: SliceView, sliceController: SliceController): void,
    detachSliceView(sliceView: SliceView, sliceController: SliceController): void,
    attachSliceLabelView(labelView: GraphicsView, sliceController: SliceController): void,
    detachSliceLabelView(labelView: GraphicsView, sliceController: SliceController): void,
    attachSliceLegendView(legendView: GraphicsView, sliceController: SliceController): void,
    detachSliceLegendView(legendView: GraphicsView, sliceController: SliceController): void,
  };
}
