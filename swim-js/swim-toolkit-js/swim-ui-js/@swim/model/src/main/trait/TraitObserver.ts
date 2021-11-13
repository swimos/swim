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

import type {Observer} from "@swim/util";
import type {Model} from "../model/Model";
import type {TraitModelType, TraitContextType, Trait} from "./Trait";

export interface TraitObserver<R extends Trait = Trait> extends Observer<R> {
  traitWillAttachModel?(model: TraitModelType<R>, trait: R): void;

  traitDidAttachModel?(model: TraitModelType<R>, trait: R): void;

  traitWillDetachModel?(model: TraitModelType<R>, trait: R): void;

  traitDidDetachModel?(model: TraitModelType<R>, trait: R): void;

  traitWillAttachParent?(parent: Model, trait: R): void;

  traitDidAttachParent?(parent: Model, trait: R): void;

  traitWillDetachParent?(parent: Model, trait: R): void;

  traitDidDetachParent?(parent: Model, trait: R): void;

  traitWillInsertChild?(child: Model, target: Model | null, trait: R): void;

  traitDidInsertChild?(child: Model, target: Model | null, trait: R): void;

  traitWillRemoveChild?(child: Model, trait: R): void;

  traitDidRemoveChild?(child: Model, trait: R): void;

  traitWillInsertTrait?(member: Trait, target: Trait | null, trait: R): void;

  traitDidInsertTrait?(member: Trait, target: Trait | null, trait: R): void;

  traitWillRemoveTrait?(member: Trait, trait: R): void;

  traitDidRemoveTrait?(member: Trait, trait: R): void;

  traitWillMount?(trait: R): void;

  traitDidMount?(trait: R): void;

  traitWillUnmount?(trait: R): void;

  traitDidUnmount?(trait: R): void;

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
