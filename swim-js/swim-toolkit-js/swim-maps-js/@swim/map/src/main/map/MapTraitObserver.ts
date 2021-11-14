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

import type {Trait} from "@swim/model";
import type {GeoPerspective} from "../geo/GeoPerspective";
import type {GeoTrait} from "../geo/GeoTrait";
import type {GeoTraitObserver} from "../geo/GeoTraitObserver";
import type {MapTrait} from "./MapTrait";

/** @public */
export interface MapTraitObserver<R extends MapTrait = MapTrait> extends GeoTraitObserver<R> {
  traitWillSetGeoPerspective?(newGeoPerspective: GeoPerspective | null, oldGeoPerspective: GeoPerspective | null, trait: R): void;

  traitDidSetGeoPerspective?(newGeoPerspective: GeoPerspective | null, oldGeoPerspective: GeoPerspective | null, trait: R): void;

  traitWillAttachLayer?(layerTrait: GeoTrait, targetTrait: Trait | null, trait: R): void;

  traitDidDetachLayer?(layerTrait: GeoTrait, trait: R): void;
}
