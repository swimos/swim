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

import type {Trait, TraitObserver} from "@swim/model";
import type {SliceTrait} from "../slice/SliceTrait";
import type {PieTitle, PieTrait} from "./PieTrait";

export interface PieTraitObserver<R extends PieTrait = PieTrait> extends TraitObserver<R> {
  traitWillSetPieTitle?(newTitle: PieTitle | null, oldTitle: PieTitle | null, trait: R): void;

  traitDidSetPieTitle?(newTitle: PieTitle | null, oldTitle: PieTitle | null, trait: R): void;

  traitWillSetSlice?(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, targetTrait: Trait | null, trait: R): void;

  traitDidSetSlice?(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, targetTrait: Trait | null, trait: R): void;
}
