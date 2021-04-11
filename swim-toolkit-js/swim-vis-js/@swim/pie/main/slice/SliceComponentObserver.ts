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
  componentWillSetSliceTrait?(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, component: C): void;

  componentDidSetSliceTrait?(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, component: C): void;

  componentWillSetSliceView?(newSliceView: SliceView | null, oldSliceView: SliceView | null, component: C): void;

  componentDidSetSliceView?(newSliceView: SliceView | null, oldSliceView: SliceView | null, component: C): void;

  componentWillSetSliceValue?(newValue: number, oldValue: number, component: C): void;

  componentDidSetSliceValue?(newValue: number, oldValue: number, component: C): void;

  componentWillSetSliceLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, component: C): void;

  componentDidSetSliceLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, component: C): void;

  componentWillSetSliceLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, component: C): void;

  componentDidSetSliceLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, component: C): void;
}
