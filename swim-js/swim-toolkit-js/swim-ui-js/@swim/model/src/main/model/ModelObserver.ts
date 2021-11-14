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

import type {ModelContextType, Model} from "./Model";
import type {Trait} from "../trait/Trait";

/** @public */
export interface ModelObserver<M extends Model = Model> {
  modelWillAttachParent?(parent: Model, model: M): void;

  modelDidAttachParent?(parent: Model, model: M): void;

  modelWillDetachParent?(parent: Model, model: M): void;

  modelDidDetachParent?(parent: Model, model: M): void;

  modelWillInsertChild?(child: Model, target: Model | null, model: M): void;

  modelDidInsertChild?(child: Model, target: Model | null, model: M): void;

  modelWillRemoveChild?(child: Model, model: M): void;

  modelDidRemoveChild?(child: Model, model: M): void;

  modelWillInsertTrait?(trait: Trait, target: Trait | null, model: M): void;

  modelDidInsertTrait?(trait: Trait, target: Trait | null, model: M): void;

  modelWillRemoveTrait?(trait: Trait, model: M): void;

  modelDidRemoveTrait?(trait: Trait, model: M): void;

  modelWillMount?(model: M): void;

  modelDidMount?(model: M): void;

  modelWillUnmount?(model: M): void;

  modelDidUnmount?(model: M): void;

  modelWillMutate?(modelContext: ModelContextType<M>, model: M): void;

  modelDidMutate?(modelContext: ModelContextType<M>, model: M): void;

  modelWillAggregate?(modelContext: ModelContextType<M>, model: M): void;

  modelDidAggregate?(modelContext: ModelContextType<M>, model: M): void;

  modelWillCorrelate?(modelContext: ModelContextType<M>, model: M): void;

  modelDidCorrelate?(modelContext: ModelContextType<M>, model: M): void;

  modelWillValidate?(modelContext: ModelContextType<M>, model: M): void;

  modelDidValidate?(modelContext: ModelContextType<M>, model: M): void;

  modelWillReconcile?(modelContext: ModelContextType<M>, model: M): void;

  modelDidReconcile?(modelContext: ModelContextType<M>, model: M): void;

  modelWillStartConsuming?(model: M): void;

  modelDidStartConsuming?(model: M): void;

  modelWillStopConsuming?(model: M): void;

  modelDidStopConsuming?(model: M): void;
}
