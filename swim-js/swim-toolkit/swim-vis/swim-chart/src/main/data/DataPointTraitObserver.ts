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

import type {Length} from "@swim/math";
import type {Color} from "@swim/style";
import type {Look} from "@swim/theme";
import type {TraitObserver} from "@swim/model";
import type {DataPointLabel, DataPointTrait} from "./DataPointTrait";

/** @public */
export interface DataPointTraitObserver<X = unknown, Y = unknown, R extends DataPointTrait<X, Y> = DataPointTrait<X, Y>> extends TraitObserver<R> {
  traitWillSetDataPointX?(newX: X, oldX: X, trait: R): void;

  traitDidSetDataPointX?(newX: X, oldX: X, trait: R): void;

  traitWillSetDataPointY?(newY: Y, oldY: Y, trait: R): void;

  traitDidSetDataPointY?(newY: Y, oldY: Y, trait: R): void;

  traitWillSetDataPointY2?(newY2: Y | undefined, oldY2: Y | undefined, trait: R): void;

  traitDidSetDataPointY2?(newY2: Y | undefined, oldY2: Y | undefined, trait: R): void;

  traitWillSetDataPointRadius?(newRadius: Length | null, oldRadius: Length | null, trait: R): void;

  traitDidSetDataPointRadius?(newRadius: Length | null, oldRadius: Length | null, trait: R): void;

  traitWillSetDataPointColor?(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null, trait: R): void;

  traitDidSetDataPointColor?(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null, trait: R): void;

  traitWillSetDataPointOpacity?(newOpacity: number | undefined, oldOpacity: number | undefined, trait: R): void;

  traitDidSetDataPointOpacity?(newOpacity: number | undefined, oldOpacity: number | undefined, trait: R): void;

  traitWillSetDataPointLabel?(newLabel: DataPointLabel<X, Y> | null, oldLabel: DataPointLabel<X, Y> | null, trait: R): void;

  traitDidSetDataPointLabel?(newLabel: DataPointLabel<X, Y> | null, oldLabel: DataPointLabel<X, Y> | null, trait: R): void;
}
