// Copyright 2015-2022 Swim.inc
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

import type {Mutable, Class} from "@swim/util";
import {Affinity, Animator} from "@swim/component";
import {AnyR2Point, R2Point, R2Box, AnyR2Path, R2Path} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox, AnyGeoPath, GeoPath} from "@swim/geo";
import {GeoViewInit, GeoView} from "../geo/GeoView";
import {GeoRippleOptions, GeoRippleView} from "../effect/GeoRippleView";
import type {GeoPathViewObserver} from "./GeoPathViewObserver";

/** @public */
export interface GeoPathViewInit extends GeoViewInit {
  geoPath?: GeoPath;
}

/** @public */
export class GeoPathView extends GeoView {
  constructor() {
    super();
    Object.defineProperty(this, "viewBounds", {
      value: R2Box.undefined(),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly observerType?: Class<GeoPathViewObserver>;

  @Animator<GeoPathView["geoPath"]>({
    valueType: GeoPath,
    value: null,
    didSetValue(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
      this.owner.setGeoBounds(newGeoPath !== null ? newGeoPath.bounds : GeoBox.undefined());
      if (this.mounted) {
        this.owner.projectPath();
      }
      this.owner.callObservers("viewDidSetGeoPath", newGeoPath, this.owner);
    },
  })
  readonly geoPath!: Animator<this, GeoPath | null, AnyGeoPath | null>;

  @Animator({valueType: R2Path, value: null})
  readonly viewPath!: Animator<this, R2Path | null, AnyR2Path | null>;

  @Animator({valueType: GeoPoint, value: null})
  readonly geoCentroid!: Animator<this, GeoPoint | null, AnyGeoPoint | null>;

  @Animator({valueType: R2Point, value: null})
  readonly viewCentroid!: Animator<this, R2Point | null, AnyR2Point | null>;

  protected override onProject(): void {
    super.onProject();
    this.projectPath();
  }

  protected projectPath(): void {
    const geoViewport = this.geoViewport.value;
    let viewPath: R2Path | null;
    if (this.viewPath.hasAffinity(Affinity.Intrinsic)) {
      const geoPath = this.geoPath.value;
      viewPath = geoPath !== null && geoPath.isDefined() ? geoPath.project(geoViewport) : null;
      this.viewPath.setState(viewPath, Affinity.Intrinsic);
    } else {
      viewPath = this.viewPath.value;
    }

    if (this.viewCentroid.hasAffinity(Affinity.Intrinsic)) {
      const geoCentroid = this.geoCentroid.value;
      const viewCentroid = geoCentroid !== null && geoCentroid.isDefined()
                         ? geoViewport.project(geoCentroid)
                         : null;
      this.viewCentroid.setState(viewCentroid, Affinity.Intrinsic);
    }

    (this as Mutable<this>).viewBounds = viewPath !== null ? viewPath.bounds : this.viewFrame;

    this.cullGeoFrame(this.geoViewport.value.geoFrame);
  }

  protected override updateGeoBounds(): void {
    // nop
  }

  override get popoverFrame(): R2Box {
    const inversePageTransform = this.pageTransform.inverse();
    const viewCentroid = this.viewCentroid.value;
    if (viewCentroid !== null && viewCentroid.isDefined()) {
      const px = inversePageTransform.transformX(viewCentroid.x, viewCentroid.y);
      const py = inversePageTransform.transformY(viewCentroid.x, viewCentroid.y);
      return new R2Box(px, py, px, py);
    } else {
      return this.viewBounds.transform(inversePageTransform);
    }
  }

  override readonly viewBounds!: R2Box;

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }

  override init(init: GeoPathViewInit): void {
    super.init(init);
    if (init.geoPath !== void 0) {
      this.geoPath(init.geoPath);
    }
  }
}
