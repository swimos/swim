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
import type {DialLabel, DialLegend, DialTrait} from "./DialTrait";

export interface DialTraitObserver<R extends DialTrait = DialTrait> extends TraitObserver<R> {
  traitWillSetDialValue?(newValue: number, oldValue: number, trait: R): void;

  traitDidSetDialValue?(newValue: number, oldValue: number, trait: R): void;

  traitWillSetDialLimit?(newLimit: number, oldLimit: number, trait: R): void;

  traitDidSetDialLimit?(newLimit: number, oldLimit: number, trait: R): void;

  traitWillSetDialLabel?(newLabel: DialLabel | null, oldLabel: DialLabel | null, trait: R): void;

  traitDidSetDialLabel?(newLabel: DialLabel | null, oldLabel: DialLabel | null, trait: R): void;

  traitWillSetDialLegend?(newLegend: DialLegend | null, oldLegend: DialLegend | null, trait: R): void;

  traitDidSetDialLegend?(newLegend: DialLegend | null, oldLegend: DialLegend | null, trait: R): void;
}
