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

import type {Mutable, Class} from "@swim/util";
import {Affinity, Animator} from "@swim/fastener";
import {AnyR2Point, R2Point, R2Box, R2Path} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox, AnyGeoPath, GeoPath} from "@swim/geo";
import type {ViewContextType} from "@swim/view";
import type {GeoViewInit} from "../geo/GeoView";
import {GeoLayerView} from "../layer/GeoLayerView";
import {GeoRippleOptions, GeoRippleView} from "../effect/GeoRippleView";
import type {GeoPathViewObserver} from "./GeoPathViewObserver";

/** @public */
export interface GeoPathViewInit extends GeoViewInit {
  geoPath?: GeoPath;
}

/** @public */
export class GeoPathView extends GeoLayerView {
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

  @Animator<GeoPathView, GeoPath | null, AnyGeoPath | null>({
    type: GeoPath,
    state: null,
    willSetValue(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
      this.owner.callObservers("viewWillSetGeoPath", newGeoPath, oldGeoPath, this.owner);
    },
    didSetValue(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
      this.owner.setGeoBounds(newGeoPath !== null ? newGeoPath.bounds : GeoBox.undefined());
      if (this.mounted) {
        this.owner.projectPath(this.owner.viewContext);
      }
      this.owner.callObservers("viewDidSetGeoPath", newGeoPath, oldGeoPath, this.owner);
    },
  })
  readonly geoPath!: Animator<this, GeoPath | null, AnyGeoPath | null>;

  @Animator({type: R2Path, state: null})
  readonly viewPath!: Animator<this, R2Path | null>;

  @Animator({type: GeoPoint, state: null})
  readonly geoCentroid!: Animator<this, GeoPoint | null, AnyGeoPoint | null>;

  @Animator({type: R2Point, state: null})
  readonly viewCentroid!: Animator<this, R2Point | null, AnyR2Point | null>;

  protected override onProject(viewContext: ViewContextType<this>): void {
    super.onProject(viewContext);
    this.projectPath(viewContext);
  }

  protected projectPath(viewContext: ViewContextType<this>): void {
    const geoViewport = viewContext.geoViewport;

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

    (this as Mutable<this>).viewBounds = viewPath !== null ? viewPath.bounds : viewContext.viewFrame;

    this.cullGeoFrame(viewContext.geoViewport.geoFrame);
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
