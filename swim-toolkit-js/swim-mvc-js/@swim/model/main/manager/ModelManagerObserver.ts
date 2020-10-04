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

import {Model} from "../Model";
import {ModelManager} from "./ModelManager";

export interface ModelManagerObserver<M extends Model = Model, MM extends ModelManager<M> = ModelManager<M>> {
  modelManagerWillAttach?(modelManager: MM): void;

  modelManagerDidAttach?(modelManager: MM): void;

  modelManagerWillDetach?(modelManager: MM): void;

  modelManagerDidDetach?(modelManager: MM): void;

  modelManagerWillInsertRootModel?(rootModel: M, modelManager: MM): void;

  modelManagerDidInsertRootModel?(rootModel: M, modelManager: MM): void;

  modelManagerWillRemoveRootModel?(rootModel: M, modelManager: MM): void;

  modelManagerDidRemoveRootModel?(rootModel: M, modelManager: MM): void;
}
