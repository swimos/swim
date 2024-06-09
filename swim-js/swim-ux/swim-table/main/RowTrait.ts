// Copyright 2015-2024 Nstream, inc.
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

import type {Class} from "@swim/util";
import type {Model} from "@swim/model";
import type {Trait} from "@swim/model";
import {TraitRef} from "@swim/model";
import type {LeafTraitObserver} from "./LeafTrait";
import {LeafTrait} from "./LeafTrait";
import {TableTrait} from "./"; // forward import

/** @public */
export interface RowTraitObserver<T extends RowTrait = RowTrait> extends LeafTraitObserver<T> {
  traitWillAttachTree?(treeTrait: TableTrait, trait: T): void;

  traitDidDetachTree?(treeTrait: TableTrait, trait: T): void;
}

/** @public */
export class RowTrait extends LeafTrait {
  declare readonly observerType?: Class<RowTraitObserver>;

  @TraitRef({
    get traitType(): typeof TableTrait {
      return TableTrait;
    },
    binds: true,
    willAttachTrait(treeTrait: TableTrait): void {
      this.owner.callObservers("traitWillAttachTree", treeTrait, this.owner);
    },
    didDetachTrait(treeTrait: TableTrait): void {
      this.owner.callObservers("traitDidDetachTree", treeTrait, this.owner);
    },
    detectModel(model: Model): TableTrait | null {
      return model.getTrait(TableTrait);
    },
    detectTrait(trait: Trait): TableTrait | null {
      return trait instanceof TableTrait ? trait : null;
    },
  })
  readonly tree!: TraitRef<this, TableTrait>;
}
