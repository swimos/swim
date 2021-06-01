// Copyright 2015-2021 Swim inc.
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
import type {GeoIconView} from "./GeoIconView";
import type {GeoIconTrait} from "./GeoIconTrait";
import type {GeoComponentObserver} from "../geo/GeoComponentObserver";
import type {GeoIconComponent} from "./GeoIconComponent";

export interface GeoIconComponentObserver<C extends GeoIconComponent = GeoIconComponent> extends GeoComponentObserver<C> {
  componentWillSetGeoTrait?(newGeoTrait: GeoIconTrait | null, oldGeoTrait: GeoIconTrait | null, component: C): void;

  componentDidSetGeoTrait?(newGeoTrait: GeoIconTrait | null, oldGeoTrait: GeoIconTrait | null, component: C): void;

  componentWillSetGeoView?(newGeoView: GeoIconView | null, oldGeoView: GeoIconView | null, component: C): void;

  componentDidSetGeoView?(newGeoView: GeoIconView | null, oldGeoView: GeoIconView | null, component: C): void;

  componentWillSetGeoCenter?(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null, component: C): void;

  componentDidSetGeoCenter?(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null, component: C): void;

  componentWillSetIconLayout?(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null, component: C): void;

  componentDidSetIconLayout?(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null, component: C): void;

  componentWillSetGraphics?(newGraphics: Graphics | null, oldGraphics: Graphics | null, component: C): void;

  componentDidSetGraphics?(newGraphics: Graphics | null, oldGraphics: Graphics | null, component: C): void;
}
