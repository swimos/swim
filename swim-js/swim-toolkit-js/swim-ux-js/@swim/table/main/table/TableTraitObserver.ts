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

import type {Trait, TraitObserver} from "@swim/model";
import type {TableLayout} from "../layout/TableLayout";
import type {RowTrait} from "../row/RowTrait";
import type {ColTrait} from "../col/ColTrait";
import type {HeaderTrait} from "../header/HeaderTrait";
import type {TableTrait} from "./TableTrait";

export interface TableTraitObserver<T extends TableTrait = TableTrait> extends TraitObserver<T> {
  traitWillSetTableLayout?(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null, trait: T): void;

  traitDidSetTableLayout?(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null, trait: T): void;

  traitWillAttachHeader?(headerTrait: HeaderTrait, trait: T): void;

  traitDidDetachHeader?(headerTrait: HeaderTrait, trait: T): void;

  traitWillAttachCol?(colTrait: ColTrait, targetTrait: Trait | null, trait: T): void;

  traitDidDetachCol?(colTrait: ColTrait, trait: T): void;

  traitWillAttachRow?(rowTrait: RowTrait, targetTrait: Trait | null, trait: T): void;

  traitDidDetachRow?(rowTrait: RowTrait, trait: T): void;
}
