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
import type {GeoLineView} from "./GeoLineView";
import type {GeoLineTrait} from "./GeoLineTrait";
import type {GeoPathComponentObserver} from "./GeoPathComponentObserver";
import type {GeoLineComponent} from "./GeoLineComponent";

export interface GeoLineComponentObserver<C extends GeoLineComponent = GeoLineComponent> extends GeoPathComponentObserver<C> {
  componentWillSetGeoTrait?(newGeoTrait: GeoLineTrait | null, oldGeoTrait: GeoLineTrait | null, component: C): void;

  componentDidSetGeoTrait?(newGeoTrait: GeoLineTrait | null, oldGeoTrait: GeoLineTrait | null, component: C): void;

  componentWillSetGeoView?(newGeoView: GeoLineView | null, oldGeoView: GeoLineView | null, component: C): void;

  componentDidSetGeoView?(newGeoView: GeoLineView | null, oldGeoView: GeoLineView | null, component: C): void;

  componentWillSetStroke?(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, component: C): void;

  componentDidSetStroke?(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, component: C): void;

  componentWillSetStrokeWidth?(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, component: C): void;

  componentDidSetStrokeWidth?(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, component: C): void;
}
