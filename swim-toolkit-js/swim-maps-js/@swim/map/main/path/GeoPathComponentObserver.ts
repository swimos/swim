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

import type {GeoPath} from "@swim/geo";
import type {GeoPathView} from "./GeoPathView";
import type {GeoPathTrait} from "./GeoPathTrait";
import type {GeoComponentObserver} from "../geo/GeoComponentObserver";
import type {GeoPathComponent} from "./GeoPathComponent";

export interface GeoPathComponentObserver<C extends GeoPathComponent = GeoPathComponent> extends GeoComponentObserver<C> {
  componentWillSetGeoTrait?(newGeoTrait: GeoPathTrait | null, oldGeoTrait: GeoPathTrait | null, component: C): void;

  componentDidSetGeoTrait?(newGeoTrait: GeoPathTrait | null, oldGeoTrait: GeoPathTrait | null, component: C): void;

  componentWillSetGeoView?(newGeoView: GeoPathView | null, oldGeoView: GeoPathView | null, component: C): void;

  componentDidSetGeoView?(newGeoView: GeoPathView | null, oldGeoView: GeoPathView | null, component: C): void;

  componentWillSetGeoPath?(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, component: C): void;

  componentDidSetGeoPath?(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, component: C): void;
}
