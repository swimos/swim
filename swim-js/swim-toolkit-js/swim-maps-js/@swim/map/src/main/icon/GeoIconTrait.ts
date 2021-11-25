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

import type {Class} from "@swim/util";
import {Property} from "@swim/component";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {Graphics, AnyIconLayout, IconLayout} from "@swim/graphics";
import {GeoTrait} from "../geo/GeoTrait";
import type {GeoIconTraitObserver} from "./GeoIconTraitObserver";

/** @public */
export class GeoIconTrait extends GeoTrait {
  override readonly observerType?: Class<GeoIconTraitObserver>;

  override get geoBounds(): GeoBox {
    const geoCenter = this.geoCenter.state;
    return geoCenter !== null ? geoCenter.bounds : GeoBox.undefined();
  }

  @Property<GeoIconTrait, GeoPoint | null, AnyGeoPoint | null>({
    type: GeoPoint,
    state: null,
    willSetState(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.callObservers("traitWillSetGeoCenter", newGeoCenter, oldGeoCenter, this.owner);
    },
    didSetState(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.callObservers("traitDidSetGeoCenter", newGeoCenter, oldGeoCenter, this.owner);
    },
  })
  readonly geoCenter!: Property<this, GeoPoint | null, AnyGeoPoint | null>;

  @Property<GeoIconTrait, IconLayout | null, AnyIconLayout | null>({
    type: IconLayout,
    state: null,
    willSetState(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null): void {
      this.owner.callObservers("traitWillSetIconLayout", newIconLayout, oldIconLayout, this.owner);
    },
    didSetState(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null): void {
      this.owner.callObservers("traitDidSetIconLayout", newIconLayout, oldIconLayout, this.owner);
    },
  })
  readonly iconLayout!: Property<this, IconLayout | null, AnyIconLayout | null>;

  @Property<GeoIconTrait, Graphics | null>({
    state: null,
    willSetState(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.callObservers("traitWillSetGraphics", newGraphics, oldGraphics, this.owner);
    },
    didSetState(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.callObservers("traitDidSetGraphics", newGraphics, oldGraphics, this.owner);
    },
  })
  readonly graphics!: Property<this, Graphics | null>;
}
