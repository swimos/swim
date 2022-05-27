// Copyright 2015-2022 Swim.inc
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
import type {Trait} from "./Trait";

/** @public */
export interface TraitObserver<T extends Trait = Trait> extends Observer<T> {
  traitWillAttachModel?(model: Model, trait: T): void;

  traitDidAttachModel?(model: Model, trait: T): void;

  traitWillDetachModel?(model: Model, trait: T): void;

  traitDidDetachModel?(model: Model, trait: T): void;

  traitWillAttachParent?(parent: Model, trait: T): void;

  traitDidAttachParent?(parent: Model, trait: T): void;

  traitWillDetachParent?(parent: Model, trait: T): void;

  traitDidDetachParent?(parent: Model, trait: T): void;

  traitWillInsertChild?(child: Model, target: Model | null, trait: T): void;

  traitDidInsertChild?(child: Model, target: Model | null, trait: T): void;

  traitWillRemoveChild?(child: Model, trait: T): void;

  traitDidRemoveChild?(child: Model, trait: T): void;

  traitWillReinsertChild?(child: Model, target: Model | null, trait: T): void;

  traitDidReinsertChild?(child: Model, target: Model | null, trait: T): void;

  traitWillInsertTrait?(member: Trait, target: Trait | null, trait: T): void;

  traitDidInsertTrait?(member: Trait, target: Trait | null, trait: T): void;

  traitWillRemoveTrait?(member: Trait, trait: T): void;

  traitDidRemoveTrait?(member: Trait, trait: T): void;

  traitWillMount?(trait: T): void;

  traitDidMount?(trait: T): void;

  traitWillUnmount?(trait: T): void;

  traitDidUnmount?(trait: T): void;

  traitWillMutate?(trait: T): void;

  traitDidMutate?(trait: T): void;

  traitWillAggregate?(trait: T): void;

  traitDidAggregate?(trait: T): void;

  traitWillCorrelate?(trait: T): void;

  traitDidCorrelate?(trait: T): void;

  traitWillValidate?(trait: T): void;

  traitDidValidate?(trait: T): void;

  traitWillReconcile?(trait: T): void;

  traitDidReconcile?(trait: T): void;

  traitWillStartConsuming?(trait: T): void;

  traitDidStartConsuming?(trait: T): void;

  traitWillStopConsuming?(trait: T): void;

  traitDidStopConsuming?(trait: T): void;
}
