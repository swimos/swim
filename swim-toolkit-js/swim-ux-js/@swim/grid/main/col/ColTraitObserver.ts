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
import type {ColLayout} from "../layout/ColLayout";
import type {ColHeader, ColTrait} from "./ColTrait";

export interface ColTraitObserver<R extends ColTrait = ColTrait> extends TraitObserver<R> {
  traitWillSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, trait: R): void;

  traitDidSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, trait: R): void;

  traitWillSetColHeader?(newColHeader: ColHeader | null, oldColHeader: ColHeader | null, trait: R): void;

  traitDidSetColHeader?(newColHeader: ColHeader | null, oldColHeader: ColHeader | null, trait: R): void;
}
