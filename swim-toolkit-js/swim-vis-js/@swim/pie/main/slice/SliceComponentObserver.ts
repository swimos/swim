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
import type {ComponentObserver} from "@swim/component";
import type {SliceView} from "./SliceView";
import type {SliceTrait} from "./SliceTrait";
import type {SliceComponent} from "./SliceComponent";

export interface SliceComponentObserver<C extends SliceComponent = SliceComponent> extends ComponentObserver<C> {
  sliceWillSetTrait?(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, component: C): void;

  sliceDidSetTrait?(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, component: C): void;

  sliceWillSetView?(newSliceView: SliceView | null, oldSliceView: SliceView | null, component: C): void;

  sliceDidSetView?(newSliceView: SliceView | null, oldSliceView: SliceView | null, component: C): void;

  sliceWillSetViewValue?(newValue: number, oldValue: number, component: C): void;

  sliceDidSetViewValue?(newValue: number, oldValue: number, component: C): void;

  sliceWillSetLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, component: C): void;

  sliceDidSetLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, component: C): void;

  sliceWillSetLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, component: C): void;

  sliceDidSetLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, component: C): void;
}
