// Copyright 2015-2023 Nstream, inc.
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

import type {Class} from "@swim/util";
import {Property} from "@swim/component";
import {Hyperlink} from "@swim/controller";
import type {GeoTraitObserver} from "./GeoTrait";
import {GeoTrait} from "./GeoTrait";
import {GeoFeatureController} from "./"; // forward import

/** @public */
export interface GeoFeatureTraitObserver<T extends GeoFeatureTrait = GeoFeatureTrait> extends GeoTraitObserver<T> {
}

/** @public */
export class GeoFeatureTrait extends GeoTrait {
  declare readonly observerType?: Class<GeoFeatureTraitObserver>;

  @Property({valueType: Hyperlink, value: null})
  get hyperlink(): Property<this, Hyperlink | null> {
    return Property.getter();
  }

  override createGeoController(): GeoFeatureController {
    return new GeoFeatureController();
  }
}
