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
import {GeoPoint} from "@swim/geo";
import type {ColorOrLook} from "@swim/theme";
import {ColorLook} from "@swim/theme";
import {Graphics} from "@swim/graphics";
import {IconLayout} from "@swim/graphics";
import type {GeoFeatureTraitObserver} from "./GeoFeatureTrait";
import {GeoFeatureTrait} from "./GeoFeatureTrait";
import type {GeoFeatureController} from "./GeoFeatureController";
import {GeoIconController} from "./"; // forward import

/** @public */
export interface GeoIconTraitObserver<T extends GeoIconTrait = GeoIconTrait> extends GeoFeatureTraitObserver<T> {
  traitDidSetGeoCenter?(geoCenter: GeoPoint | null, trait: T): void;

  traitDidSetIconLayout?(iconLayout: IconLayout | null, trait: T): void;

  traitDidSetGraphics?(graphics: Graphics | null, trait: T): void;
}

/** @public */
export class GeoIconTrait extends GeoFeatureTrait {
  declare readonly observerType?: Class<GeoIconTraitObserver>;

  @Property({
    valueType: GeoPoint,
    value: null,
    didSetValue(geoCenter: GeoPoint | null): void {
      this.owner.callObservers("traitDidSetGeoCenter", geoCenter, this.owner);
      this.owner.geoPerspective.setIntrinsic(geoCenter);
    },
  })
  readonly geoCenter!: Property<this, GeoPoint | null>;

  @Property({
    valueType: IconLayout,
    value: null,
    didSetValue(iconLayout: IconLayout | null): void {
      this.owner.callObservers("traitDidSetIconLayout", iconLayout, this.owner);
    },
  })
  readonly iconLayout!: Property<this, IconLayout | null>;

  @Property({valueType: ColorLook, value: null})
  readonly iconColor!: Property<this, ColorOrLook | null>;

  @Property({
    valueType: Graphics,
    value: null,
    didSetValue(graphics: Graphics | null): void {
      this.owner.callObservers("traitDidSetGraphics", graphics, this.owner);
    },
  })
  readonly graphics!: Property<this, Graphics | null>;

  override createGeoController(): GeoFeatureController {
    return new GeoIconController();
  }
}
