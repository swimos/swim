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

import type {GeoBox} from "@swim/geo";
import type {ComponentObserver} from "@swim/component";
import type {GeoView} from "./GeoView";
import type {GeoTrait} from "./GeoTrait";
import type {GeoComponent} from "./GeoComponent";

export interface GeoComponentObserver<C extends GeoComponent = GeoComponent> extends ComponentObserver<C> {
  componentWillSetGeoTrait?(newGeoTrait: GeoTrait | null, oldGeoTrait: GeoTrait | null, component: C): void;

  componentDidSetGeoTrait?(newGeoTrait: GeoTrait | null, oldGeoTrait: GeoTrait | null, component: C): void;

  componentWillSetGeoView?(newGeoView: GeoView | null, oldGeoView: GeoView | null, component: C): void;

  componentDidSetGeoView?(newGeoView: GeoView | null, oldGeoView: GeoView | null, component: C): void;

  componentWillSetGeoBounds?(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, component: C): void;

  componentDidSetGeoBounds?(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, component: C): void;
}
