// Copyright 2015-2021 Swim.inc
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

import {Class, AnyTiming, Timing} from "@swim/util";
import {MemberFastenerClass, Property} from "@swim/component";
import type {Trait} from "@swim/model";
import {ViewRef} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import {Controller, TraitViewRef, TraitViewControllerSet} from "@swim/controller";
import type {SliceView} from "../slice/SliceView";
import type {SliceTrait} from "../slice/SliceTrait";
import {SliceController} from "../slice/SliceController";
import {PieView} from "./PieView";
import {PieTitle, PieTrait} from "./PieTrait";
import type {PieControllerObserver} from "./PieControllerObserver";

/** @public */
export interface PieControllerSliceExt {
  attachSliceTrait(sliceTrait: SliceTrait, sliceController: SliceController): void;
  detachSliceTrait(sliceTrait: SliceTrait, sliceController: SliceController): void;
  attachSliceView(sliceView: SliceView, sliceController: SliceController): void;
  detachSliceView(sliceView: SliceView, sliceController: SliceController): void;
  attachSliceLabelView(labelView: GraphicsView, sliceController: SliceController): void;
  detachSliceLabelView(labelView: GraphicsView, sliceController: SliceController): void;
  attachSliceLegendView(legendView: GraphicsView, sliceController: SliceController): void;
  detachSliceLegendView(legendView: GraphicsView, sliceController: SliceController): void;
}

/** @public */
export class PieController extends Controller {
  override readonly observerType?: Class<PieControllerObserver>;

  protected createTitleView(title: PieTitle, pieTrait: PieTrait): GraphicsView | string | null {
    if (typeof title === "function") {
      return title(pieTrait);
    } else {
      return title;
    }
  }

  protected setTitleView(title: PieTitle | null, pieTrait: PieTrait): void {
    const pieView = this.pie.view;
    if (pieView !== null) {
      const titleView = title !== null ? this.createTitleView(title, pieTrait) : null;
      pieView.title.setView(titleView);
    }
  }

  @TraitViewRef<PieController, PieTrait, PieView>({
    traitType: PieTrait,
    observesTrait: true,
    willAttachTrait(pieTrait: PieTrait): void {
      this.owner.callObservers("controllerWillAttachPieTrait", pieTrait, this.owner);
    },
    didAttachTrait(pieTrait: PieTrait): void {
      const sliceTraits = pieTrait.slices.traits;
      for (const traitId in sliceTraits) {
        const sliceTrait = sliceTraits[traitId]!;
        this.owner.slices.addTraitController(sliceTrait);
      }
      const pieView = this.view;
      if (pieView !== null) {
        this.owner.setTitleView(pieTrait.title.value, pieTrait);
      }
    },
    willDetachTrait(pieTrait: PieTrait): void {
      const pieView = this.view;
      if (pieView !== null) {
        this.owner.setTitleView(pieTrait.title.value, pieTrait);
      }
      const sliceTraits = pieTrait.slices.traits;
      for (const traitId in sliceTraits) {
        const sliceTrait = sliceTraits[traitId]!;
        this.owner.slices.deleteTraitController(sliceTrait);
      }
    },
    didDetachTrait(pieTrait: PieTrait): void {
      this.owner.callObservers("controllerDidDetachPieTrait", pieTrait, this.owner);
    },
    traitDidSetPieTitle(newTitle: PieTitle | null, oldTitle: PieTitle | null, pieTrait: PieTrait): void {
      this.owner.setTitleView(newTitle, pieTrait);
    },
    traitWillAttachSlice(sliceTrait: SliceTrait, targetTrait: Trait): void {
      this.owner.slices.addTraitController(sliceTrait);
    },
    traitDidDetachSlice(sliceTrait: SliceTrait): void {
      this.owner.slices.deleteTraitController(sliceTrait);
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
        this.owner.setTitleView(pieTrait.title.value, pieTrait);
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
    viewWillAttachPieTitle(titleView: GraphicsView): void {
      this.owner.title.setView(titleView);
    },
    viewDidDetachPieTitle(titleView: GraphicsView): void {
      this.owner.title.setView(titleView);
    },
  })
  readonly pie!: TraitViewRef<this, PieTrait, PieView>;
  static readonly pie: MemberFastenerClass<PieController, "pie">;

  @ViewRef<PieController, GraphicsView>({
    key: true,
    willAttachView(titleView: GraphicsView): void {
      this.owner.callObservers("controllerWillAttachPieTitleView", titleView, this.owner);
    },
    didDetachView(titleView: GraphicsView): void {
      this.owner.callObservers("controllerDidDetachPieTitleView", titleView, this.owner);
    },
  })
  readonly title!: ViewRef<this, GraphicsView>;
  static readonly title: MemberFastenerClass<PieController, "title">;

  @Property({type: Timing, value: true})
  readonly sliceTiming!: Property<this, Timing | boolean | undefined, AnyTiming>;

  @TraitViewControllerSet<PieController, SliceTrait, SliceView, SliceController, PieControllerSliceExt>({
    implements: true,
    type: SliceController,
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
    controllerWillSetSliceValue(newValue: number, oldValue: number, sliceController: SliceController): void {
      this.owner.callObservers("controllerWillSetSliceValue", newValue, oldValue, sliceController, this.owner);
    },
    controllerDidSetSliceValue(newValue: number, oldValue: number, sliceController: SliceController): void {
      this.owner.callObservers("controllerDidSetSliceValue", newValue, oldValue, sliceController, this.owner);
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
  readonly slices!: TraitViewControllerSet<this, SliceTrait, SliceView, SliceController> & PieControllerSliceExt;
  static readonly slices: MemberFastenerClass<PieController, "slices">;
}
