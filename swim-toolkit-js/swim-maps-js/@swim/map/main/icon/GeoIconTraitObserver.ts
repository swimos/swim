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

import type {GeoPoint} from "@swim/geo";
import type {Graphics, IconLayout} from "@swim/graphics";
import type {GeoTraitObserver} from "../geo/GeoTraitObserver";
import type {GeoIconTrait} from "./GeoIconTrait";

export interface GeoIconTraitObserver<R extends GeoIconTrait = GeoIconTrait> extends GeoTraitObserver<R> {
  traitWillSetGeoCenter?(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint, trait: R): void;

  traitDidSetGeoCenter?(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint, trait: R): void;

  traitWillSetIconLayout?(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null, trait: R): void;

  traitDidSetIconLayout?(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null, trait: R): void;

  traitWillSetGraphics?(newGraphics: Graphics | null, oldGraphics: Graphics | null, trait: R): void;

  traitDidSetGraphics?(newGraphics: Graphics | null, oldGraphics: Graphics | null, trait: R): void;
}
