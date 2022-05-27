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

import type {TraitObserver} from "@swim/model";
import type {GraphTrait} from "../graph/GraphTrait";
import type {AxisTrait} from "../axis/AxisTrait";
import type {ChartTrait} from "./ChartTrait";

/** @public */
export interface ChartTraitObserver<X = unknown, Y = unknown, T extends ChartTrait<X, Y> = ChartTrait<X, Y>> extends TraitObserver<T> {
  traitWillAttachGraph?(graphTrait: GraphTrait<X, Y>, trait: T): void;

  traitDidDetachGraph?(graphTrait: GraphTrait<X, Y>, trait: T): void;

  traitWillAttachTopAxis?(topAxisTrait: AxisTrait<X>, trait: T): void;

  traitDidDetachTopAxis?(topAxisTrait: AxisTrait<X>, trait: T): void;

  traitWillAttachRightAxis?(rightAxisTrait: AxisTrait<Y>, trait: T): void;

  traitDidDetachRightAxis?(rightAxisTrait: AxisTrait<Y>, trait: T): void;

  traitWillAttachBottomAxis?(bottomAxisTrait: AxisTrait<X>, trait: T): void;

  traitDidDetachBottomAxis?(bottomAxisTrait: AxisTrait<X>, trait: T): void;

  traitWillAttachLeftAxis?(leftAxisTrait: AxisTrait<Y>, trait: T): void;

  traitDidDetachLeftAxis?(leftAxisTrait: AxisTrait<Y>, trait: T): void;
}
