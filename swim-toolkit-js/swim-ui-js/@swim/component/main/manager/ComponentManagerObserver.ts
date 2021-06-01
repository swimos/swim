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

import type {Component} from "../Component";
import type {ComponentManager} from "./ComponentManager";

export type ComponentManagerObserverType<CM extends ComponentManager> =
  CM extends {readonly componentManagerObservers: ReadonlyArray<infer CMO>} ? CMO : never;

export interface ComponentManagerObserver<C extends Component = Component, CM extends ComponentManager<C> = ComponentManager<C>> {
  componentManagerWillAttach?(componentManager: CM): void;

  componentManagerDidAttach?(componentManager: CM): void;

  componentManagerWillDetach?(componentManager: CM): void;

  componentManagerDidDetach?(componentManager: CM): void;

  componentManagerWillInsertRootComponent?(rootComponent: C, componentManager: CM): void;

  componentManagerDidInsertRootComponent?(rootComponent: C, componentManager: CM): void;

  componentManagerWillRemoveRootComponent?(rootComponent: C, componentManager: CM): void;

  componentManagerDidRemoveRootComponent?(rootComponent: C, componentManager: CM): void;
}
