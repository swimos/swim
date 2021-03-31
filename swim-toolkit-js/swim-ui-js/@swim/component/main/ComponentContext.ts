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

import type {Component} from "./Component";

export type ComponentContextType<C extends Component> =
  C extends {readonly componentContext: infer C} ? C : unknown;

export interface ComponentContext {
  readonly updateTime: number;
}

export const ComponentContext = {} as {
  default(): ComponentContext;
};

ComponentContext.default = function (): ComponentContext {
  return {
    updateTime: performance.now(),
  };
};
