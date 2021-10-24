// Copyright 2015-2021 Swim Inc.
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
import type {ColLayout} from "../layout/ColLayout";
import type {ColLabel, ColTrait} from "./ColTrait";

export interface ColTraitObserver<T extends ColTrait = ColTrait> extends TraitObserver<T> {
  traitWillSetLayout?(newLayout: ColLayout | null, oldLayout: ColLayout | null, trait: T): void;

  traitDidSetLayout?(newLayout: ColLayout | null, oldLayout: ColLayout | null, trait: T): void;

  traitWillSetLabel?(newLabel: ColLabel | null, oldLabel: ColLabel | null, trait: T): void;

  traitDidSetLabel?(newLabel: ColLabel | null, oldLabel: ColLabel | null, trait: T): void;
}
