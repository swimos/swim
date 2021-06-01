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
import type {TableLayout} from "../layout/TableLayout";
import type {ColTrait} from "../col/ColTrait";
import type {RowTrait} from "../row/RowTrait";
import type {TableTrait} from "./TableTrait";

export interface TableTraitObserver<R extends TableTrait = TableTrait> extends TraitObserver<R> {
  traitWillSetTableLayout?(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null, trait: R): void;

  traitDidSetTableLayout?(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null, trait: R): void;

  traitWillSetCol?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait | null, trait: R): void;

  traitDidSetCol?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait | null, trait: R): void;

  traitWillSetRow?(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, targetTrait: Trait | null, trait: R): void;

  traitDidSetRow?(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, targetTrait: Trait | null, trait: R): void;
}
