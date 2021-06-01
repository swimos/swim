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

import type {GeoBox} from "@swim/geo";
import type {ComponentFastener} from "@swim/component";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import type {GeoComponent} from "../geo/GeoComponent";
import type {GeoComponentObserver} from "../geo/GeoComponentObserver";
import type {GeoLayerTrait} from "./GeoLayerTrait";
import type {GeoLayerComponent} from "./GeoLayerComponent";

export interface GeoLayerComponentObserver<C extends GeoLayerComponent = GeoLayerComponent> extends GeoComponentObserver<C> {
  componentWillSetGeoTrait?(newGeoTrait: GeoLayerTrait | null, oldGeoTrait: GeoLayerTrait | null, component: C): void;

  componentDidSetGeoTrait?(newGeoTrait: GeoLayerTrait | null, oldGeoTrait: GeoLayerTrait | null, component: C): void;

  componentWillSetGeoView?(newGeoView: GeoView | null, oldGeoView: GeoView | null, component: C): void;

  componentDidSetGeoView?(newGeoView: GeoView | null, oldGeoView: GeoView | null, component: C): void;

  componentWillSetFeature?(newFeatureComponent: GeoComponent | null, oldFeatureComponent: GeoComponent | null, featureFastener: ComponentFastener<C, GeoComponent>): void;

  componentDidSetFeature(newFeatureComponent: GeoComponent | null, oldFeatureComponent: GeoComponent | null, featureFastener: ComponentFastener<C, GeoComponent>): void;

  componentWillSetFeatureTrait?(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null, featureFastener: ComponentFastener<C, GeoComponent>): void;

  componentDidSetFeatureTrait?(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null, featureFastener: ComponentFastener<C, GeoComponent>): void;

  componentWillSetFeatureView?(newFeatureView: GeoView | null, oldFeatureView: GeoView | null, featureFastener: ComponentFastener<C, GeoComponent>): void;

  componentDidSetFeatureView?(newFeatureView: GeoView | null, oldFeatureView: GeoView | null, featureFastener: ComponentFastener<C, GeoComponent>): void;

  componentWillSetFeatureGeoBounds?(newFeatureGeoBounds: GeoBox, oldFeatureGeoBounds: GeoBox, featureFastener: ComponentFastener<C, GeoComponent>): void;

  componentDidSetFeatureGeoBounds?(newFeatureGeoBounds: GeoBox, oldFeatureGeoBounds: GeoBox, featureFastener: ComponentFastener<C, GeoComponent>): void;
}
