// Copyright 2015-2020 Swim inc.
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

import type {GraphicsView} from "@swim/graphics";
import type {ComponentObserver, ComponentFastener} from "@swim/component";
import type {SliceView} from "../slice/SliceView";
import type {SliceTrait} from "../slice/SliceTrait";
import type {SliceComponent} from "../slice/SliceComponent";
import type {PieView} from "./PieView";
import type {PieTrait} from "./PieTrait";
import type {PieComponent} from "./PieComponent";

export interface PieComponentObserver<C extends PieComponent = PieComponent> extends ComponentObserver<C> {
  pieWillSetTrait?(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null, component: C): void;

  pieDidSetTrait?(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null, component: C): void;

  pieWillSetView?(newPieView: PieView | null, oldPieView: PieView | null, component: C): void;

  pieDidSetView?(newPieView: PieView | null, oldPieView: PieView | null, component: C): void;

  pieWillSetTitleView?(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null, component: C): void;

  pieDidSetTitleView?(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null, component: C): void;

  pieWillSetSlice?(newSliceComponent: SliceComponent | null, oldSliceComponent: SliceComponent | null, sliceFastener: ComponentFastener<C, SliceComponent>): void;

  pieDidSetSlice?(newSliceComponent: SliceComponent | null, oldSliceComponent: SliceComponent | null, sliceFastener: ComponentFastener<C, SliceComponent>): void;

  pieWillSetSliceTrait?(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, sliceFastener: ComponentFastener<C, SliceComponent>): void;

  pieDidSetSliceTrait?(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, sliceFastener: ComponentFastener<C, SliceComponent>): void;

  pieWillSetSliceView?(newSliceView: SliceView | null, oldSliceView: SliceView | null, sliceFastener: ComponentFastener<C, SliceComponent>): void;

  pieDidSetSliceView?(newSliceView: SliceView | null, oldSliceView: SliceView | null, sliceFastener: ComponentFastener<C, SliceComponent>): void;

  pieWillSetSliceViewValue?(newValue: number, oldValue: number, sliceFastener: ComponentFastener<C, SliceComponent>): void;

  pieDidSetSliceViewValue?(newValue: number, oldValue: number, sliceFastener: ComponentFastener<C, SliceComponent>): void;

  pieWillSetSliceLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, sliceFastener: ComponentFastener<C, SliceComponent>): void;

  pieDidSetSliceLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, sliceFastener: ComponentFastener<C, SliceComponent>): void;

  pieWillSetSliceLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, sliceFastener: ComponentFastener<C, SliceComponent>): void;

  pieDidSetSliceLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, sliceFastener: ComponentFastener<C, SliceComponent>): void;
}
