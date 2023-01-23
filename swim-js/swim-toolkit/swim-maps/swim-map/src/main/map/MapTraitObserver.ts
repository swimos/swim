// Copyright 2015-2023 Swim.inc
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

import type {Trait, TraitObserver} from "@swim/model";
import type {GeoPerspective} from "../geo/GeoPerspective";
import type {GeoTrait} from "../geo/GeoTrait";
import type {MapTrait} from "./MapTrait";

/** @public */
export interface MapTraitObserver<T extends MapTrait = MapTrait> extends TraitObserver<T> {
  traitDidSetGeoPerspective?(geoPerspective: GeoPerspective | null, trait: T): void;

  traitWillAttachLayer?(layerTrait: GeoTrait, targetTrait: Trait | null, trait: T): void;

  traitDidDetachLayer?(layerTrait: GeoTrait, trait: T): void;
}
