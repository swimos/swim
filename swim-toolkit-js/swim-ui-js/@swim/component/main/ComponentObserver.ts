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

import type {ComponentContextType} from "./ComponentContext";
import type {Component} from "./Component";

export type ComponentObserverType<C extends Component> =
  C extends {readonly componentObservers: ReadonlyArray<infer CO>} ? CO : never;

export interface ComponentObserver<C extends Component = Component> {
  componentWillSetParentComponent?(newParentComponent: Component | null, oldParentComponent: Component | null, component: C): void;

  componentDidSetParentComponent?(newParentComponent: Component | null, oldParentComponent: Component | null, component: C): void;

  componentWillInsertChildComponent?(childComponent: Component, targetModel: Component | null, component: C): void;

  componentDidInsertChildComponent?(childComponent: Component, targetModel: Component | null, component: C): void;

  componentWillRemoveChildComponent?(childComponent: Component, component: C): void;

  componentDidRemoveChildComponent?(childComponent: Component, component: C): void;

  componentWillMount?(component: Component): void;

  componentDidMount?(component: Component): void;

  componentWillUnmount?(component: Component): void;

  componentDidUnmount?(component: Component): void;

  componentWillPower?(component: Component): void;

  componentDidPower?(component: Component): void;

  componentWillUnpower?(component: Component): void;

  componentDidUnpower?(component: Component): void;

  componentWillResolve?(componentContext: ComponentContextType<C>, component: C): void;

  componentDidResolve?(componentContext: ComponentContextType<C>, component: C): void;

  componentWillGenerate?(componentContext: ComponentContextType<C>, component: C): void;

  componentDidGenerate?(componentContext: ComponentContextType<C>, component: C): void;

  componentWillAssemble?(componentContext: ComponentContextType<C>, component: C): void;

  componentDidAssemble?(componentContext: ComponentContextType<C>, component: C): void;

  componentWillRevise?(componentContext: ComponentContextType<C>, component: C): void;

  componentDidRevise?(componentContext: ComponentContextType<C>, component: C): void;

  componentWillCompute?(componentContext: ComponentContextType<C>, component: C): void;

  componentDidCompute?(componentContext: ComponentContextType<C>, component: C): void;
}
