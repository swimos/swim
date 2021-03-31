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

import type {Model} from "./Model";
import type {TraitModelType, TraitContextType, Trait} from "./Trait";

export type TraitObserverType<R extends Trait> =
  R extends {readonly traitObservers: ReadonlyArray<infer RO>} ? RO : never;

export interface TraitObserver<R extends Trait = Trait> {
  traitWillSetModel?(newModel: TraitModelType<R> | null, oldModel: TraitModelType<R> | null, trait: R): void;

  traitDidSetModel?(newModel: TraitModelType<R> | null, oldModel: TraitModelType<R> | null, trait: R): void;

  traitWillSetParentModel?(newParentModel: Model | null, oldParentModel: Model | null, trait: R): void;

  traitDidSetParentModel?(newParentModel: Model | null, oldParentModel: Model | null, trait: R): void;

  traitWillInsertChildModel?(childModel: Model, targetModel: Model | null, trait: R): void;

  traitDidInsertChildModel?(childModel: Model, targetModel: Model | null, trait: R): void;

  traitWillRemoveChildModel?(childModel: Model, trait: R): void;

  traitDidRemoveChildModel?(childModel: Model, trait: R): void;

  traitWillInsertTrait?(memberTrait: Trait, targetTrait: Trait | null, trait: R): void;

  traitDidInsertTrait?(memberTrait: Trait, targetTrait: Trait | null, trait: R): void;

  traitWillRemoveTrait?(memberTrait: Trait, trait: R): void;

  traitDidRemoveTrait?(memberTrait: Trait, trait: R): void;

  traitWillMount?(trait: R): void;

  traitDidMount?(trait: R): void;

  traitWillUnmount?(trait: R): void;

  traitDidUnmount?(trait: R): void;

  traitWillPower?(trait: R): void;

  traitDidPower?(trait: R): void;

  traitWillUnpower?(trait: R): void;

  traitDidUnpower?(trait: R): void;

  traitWillMutate?(modelContext: TraitContextType<R>, trait: R): void;

  traitDidMutate?(modelContext: TraitContextType<R>, trait: R): void;

  traitWillAggregate?(modelContext: TraitContextType<R>, trait: R): void;

  traitDidAggregate?(modelContext: TraitContextType<R>, trait: R): void;

  traitWillCorrelate?(modelContext: TraitContextType<R>, trait: R): void;

  traitDidCorrelate?(modelContext: TraitContextType<R>, trait: R): void;

  traitWillValidate?(modelContext: TraitContextType<R>, trait: R): void;

  traitDidValidate?(modelContext: TraitContextType<R>, trait: R): void;

  traitWillReconcile?(modelContext: TraitContextType<R>, trait: R): void;

  traitDidReconcile?(modelContext: TraitContextType<R>, trait: R): void;

  traitWillStartConsuming?(trait: R): void;

  traitDidStartConsuming?(trait: R): void;

  traitWillStopConsuming?(trait: R): void;

  traitDidStopConsuming?(trait: R): void;
}
