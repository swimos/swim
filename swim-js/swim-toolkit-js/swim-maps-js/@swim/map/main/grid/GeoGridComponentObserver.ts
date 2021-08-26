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

import type {ComponentFastener} from "@swim/component";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import type {GeoLayerComponentObserver} from "../layer/GeoLayerComponentObserver";
import type {GeoGridTrait} from "./GeoGridTrait";
import type {GeoGridComponent} from "./GeoGridComponent";

export interface GeoGridComponentObserver<C extends GeoGridComponent = GeoGridComponent> extends GeoLayerComponentObserver<C> {
  componentWillSetGeoTrait?(newGeoTrait: GeoGridTrait | null, oldGeoTrait: GeoGridTrait | null, component: C): void;

  componentDidSetGeoTrait?(newGeoTrait: GeoGridTrait | null, oldGeoTrait: GeoGridTrait | null, component: C): void;

  componentWillSetTile?(newTileComponent: GeoGridComponent | null, oldTileComponent: GeoGridComponent | null, tileFastener: ComponentFastener<C, GeoGridComponent>): void;

  componentDidSetTile(newTileComponent: GeoGridComponent | null, oldTileComponent: GeoGridComponent | null, tileFastener: ComponentFastener<C, GeoGridComponent>): void;

  componentWillSetTileTrait?(newTileTrait: GeoTrait | null, oldTileTrait: GeoTrait | null, tileFastener: ComponentFastener<C, GeoGridComponent>): void;

  componentDidSetTileTrait?(newTileTrait: GeoTrait | null, oldTileTrait: GeoTrait | null, tileFastener: ComponentFastener<C, GeoGridComponent>): void;

  componentWillSetTileView?(newTileView: GeoView | null, oldTileView: GeoView | null, tileFastener: ComponentFastener<C, GeoGridComponent>): void;

  componentDidSetTileView?(newTileView: GeoView | null, oldTileView: GeoView | null, tileFastener: ComponentFastener<C, GeoGridComponent>): void;
}
