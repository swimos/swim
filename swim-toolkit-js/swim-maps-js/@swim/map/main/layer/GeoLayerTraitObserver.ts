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

import type {Trait} from "@swim/model";
import type {GeoTrait} from "../geo/GeoTrait";
import type {GeoTraitObserver} from "../geo/GeoTraitObserver";
import type {GeoLayerTrait} from "./GeoLayerTrait";

export interface GeoLayerTraitObserver<R extends GeoLayerTrait = GeoLayerTrait> extends GeoTraitObserver<R> {
  traitWillSetFeature?(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null, targetTrait: Trait | null, trait: R): void;

  traitDidSetFeature?(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null, targetTrait: Trait | null, trait: R): void;
}
