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

import type {TraitObserver} from "@swim/model";
import type {PlotTrait} from "../plot/PlotTrait";
import type {GraphTrait} from "./GraphTrait";

export interface GraphTraitObserver<X = unknown, Y = unknown, R extends GraphTrait<X, Y> = GraphTrait<X, Y>> extends TraitObserver<R> {
  traitWillAttachPlot?(plotTrait: PlotTrait<X, Y>, trait: R): void;

  traitDidDetachPlot?(plotTrait: PlotTrait<X, Y>, trait: R): void;
}
