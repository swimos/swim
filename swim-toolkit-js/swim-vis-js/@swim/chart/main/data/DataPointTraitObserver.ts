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

import type {Length} from "@swim/math";
import type {Color} from "@swim/style";
import type {Look} from "@swim/theme";
import type {TraitObserver} from "@swim/model";
import type {DataPointLabel, DataPointTrait} from "./DataPointTrait";

export interface DataPointTraitObserver<X, Y, R extends DataPointTrait<X, Y> = DataPointTrait<X, Y>> extends TraitObserver<R> {
  dataPointTraitWillSetX?(newX: X, oldX: X, trait: R): void;

  dataPointTraitDidSetX?(newX: X, oldX: X, trait: R): void;

  dataPointTraitWillSetY?(newY: Y, oldY: Y, trait: R): void;

  dataPointTraitDidSetY?(newY: Y, oldY: Y, trait: R): void;

  dataPointTraitWillSetY2?(newY2: Y | undefined, oldY2: Y | undefined, trait: R): void;

  dataPointTraitDidSetY2?(newY2: Y | undefined, oldY2: Y | undefined, trait: R): void;

  dataPointTraitWillSetRadius?(newRadius: Length | null, oldRadius: Length | null, trait: R): void;

  dataPointTraitDidSetRadius?(newRadius: Length | null, oldRadius: Length | null, trait: R): void;

  dataPointTraitWillSetColor?(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null, trait: R): void;

  dataPointTraitDidSetColor?(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null, trait: R): void;

  dataPointTraitWillSetLabel?(newLabel: DataPointLabel<X, Y> | null, oldLabel: DataPointLabel<X, Y> | null, trait: R): void;

  dataPointTraitDidSetLabel?(newLabel: DataPointLabel<X, Y> | null, oldLabel: DataPointLabel<X, Y> | null, trait: R): void;
}
