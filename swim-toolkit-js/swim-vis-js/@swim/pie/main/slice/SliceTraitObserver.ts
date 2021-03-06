// Copyright 2015-2021 Swim inc.
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

import type {TraitObserver} from "@swim/model";
import type {SliceLabel, SliceLegend, SliceTrait} from "./SliceTrait";

export interface SliceTraitObserver<R extends SliceTrait = SliceTrait> extends TraitObserver<R> {
  traitWillSetSliceValue?(newValue: number, oldValue: number, trait: R): void;

  traitDidSetSliceValue?(newValue: number, oldValue: number, trait: R): void;

  traitWillSetSliceLabel?(newLabel: SliceLabel | null, oldLabel: SliceLabel | null, trait: R): void;

  traitDidSetSliceLabel?(newLabel: SliceLabel | null, oldLabel: SliceLabel | null, trait: R): void;

  traitWillSetSliceLegend?(newLegend: SliceLegend | null, oldLegend: SliceLegend | null, trait: R): void;

  traitDidSetSliceLegend?(newLegend: SliceLegend | null, oldLegend: SliceLegend | null, trait: R): void;
}
