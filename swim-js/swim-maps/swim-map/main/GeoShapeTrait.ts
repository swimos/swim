// Copyright 2015-2024 Nstream, inc.
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
import {Length} from "@swim/math";
import {GeoShape} from "@swim/geo";
import type {NumberOrLook} from "@swim/theme";
import {NumberLook} from "@swim/theme";
import type {ColorOrLook} from "@swim/theme";
import {ColorLook} from "@swim/theme";
import type {GeoFeatureTraitObserver} from "./GeoFeatureTrait";
import {GeoFeatureTrait} from "./GeoFeatureTrait";
import type {GeoFeatureController} from "./GeoFeatureController";
import {GeoShapeController} from "./"; // forward import

/** @public */
export interface GeoShapeTraitObserver<T extends GeoShapeTrait = GeoShapeTrait> extends GeoFeatureTraitObserver<T> {
  traitDidSetGeoShape?(geoShape: GeoShape | null, trait: T): void;
}

/** @public */
export class GeoShapeTrait extends GeoFeatureTrait {
  declare readonly observerType?: Class<GeoShapeTraitObserver>;

  @Property({
    valueType: GeoShape,
    value: null,
    didSetValue(geoShape: GeoShape | null): void {
      this.owner.callObservers("traitDidSetGeoShape", geoShape, this.owner);
      this.owner.geoPerspective.setIntrinsic(geoShape);
    },
  })
  readonly geoShape!: Property<this, GeoShape | null>;

  @Property({valueType: ColorLook, value: null})
  readonly fill!: Property<this, ColorOrLook | null>;

  @Property({valueType: NumberLook})
  readonly fillOpacity!: Property<this, NumberOrLook | undefined>;

  @Property({valueType: ColorLook, value: null})
  readonly stroke!: Property<this, ColorOrLook | null>;

  @Property({valueType: NumberLook})
  readonly strokeOpacity!: Property<this, NumberOrLook | undefined>;

  @Property({valueType: Length, value: null})
  readonly strokeWidth!: Property<this, Length | null>;

  override createGeoController(): GeoFeatureController {
    return new GeoShapeController();
  }
}
