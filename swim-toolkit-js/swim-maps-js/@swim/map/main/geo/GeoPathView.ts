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

import {AnyPointR2, PointR2, BoxR2, PathR2} from "@swim/math";
import {AnyGeoPoint, GeoPoint, AnyGeoPath, GeoPath} from "@swim/geo";
import {ViewContextType, View, ViewAnimator} from "@swim/view";
import type {MapGraphicsViewController} from "../graphics/MapGraphicsViewController";
import {MapLayerView} from "../layer/MapLayerView";
import type {GeoViewInit, GeoView} from "./GeoView";
import type {GeoPathViewObserver} from "./GeoPathViewObserver";

export interface GeoPathViewInit extends GeoViewInit {
  geoPath?: GeoPath;
}

export class GeoPathView extends MapLayerView implements GeoView {
  constructor() {
    super();
    Object.defineProperty(this, "viewBounds", {
      value: BoxR2.undefined(),
      enumerable: true,
      configurable: true,
    });
  }

  initView(init: GeoPathViewInit): void {
    super.initView(init);
    if (init.geoPath !== void 0) {
      this.geoPath(init.geoPath);
    }
  }

  declare readonly viewController: MapGraphicsViewController<GeoPathView> & GeoPathViewObserver | null;

  declare readonly viewObservers: ReadonlyArray<GeoPathViewObserver>;

  protected willSetGeoPath(newGeoPath: GeoPath, oldGeoPath: GeoPath): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.geoViewWillSetGeometry !== void 0) {
      viewController.geoViewWillSetGeometry(newGeoPath, oldGeoPath, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.geoViewWillSetGeometry !== void 0) {
        viewObserver.geoViewWillSetGeometry(newGeoPath, oldGeoPath, this);
      }
    }
  }

  protected onSetGeoPath(newGeoPath: GeoPath, oldGeoPath: GeoPath): void {
    this.updateGeoBounds(newGeoPath);
  }

  protected didSetGeoPath(newGeoPath: GeoPath, oldGeoPath: GeoPath): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.geoViewDidSetGeometry !== void 0) {
        viewObserver.geoViewDidSetGeometry(newGeoPath, oldGeoPath, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.geoViewDidSetGeometry !== void 0) {
      viewController.geoViewDidSetGeometry(newGeoPath, oldGeoPath, this);
    }
  }

  @ViewAnimator<GeoPathView, GeoPath>({
    type: GeoPath,
    state: GeoPath.empty(),
    willSetValue(newGeoPath: GeoPath, oldGeoPath: GeoPath): void {
      this.owner.willSetGeoPath(newGeoPath, oldGeoPath);
    },
    didSetValue(newGeoPath: GeoPath, oldGeoPath: GeoPath): void {
      this.owner.onSetGeoPath(newGeoPath, oldGeoPath);
      this.owner.didSetGeoPath(newGeoPath, oldGeoPath);
    },
  })
  declare geoPath: ViewAnimator<this, GeoPath, AnyGeoPath>;

  @ViewAnimator({type: PathR2, state: PathR2.empty()})
  declare viewPath: ViewAnimator<this, PathR2>;

  @ViewAnimator({type: GeoPoint, state: GeoPoint.undefined()})
  declare geoCentroid: ViewAnimator<this, GeoPoint, AnyGeoPoint>;

  @ViewAnimator({type: PointR2, state: PointR2.undefined()})
  declare viewCentroid: ViewAnimator<this, PointR2, AnyPointR2>;

  protected updateGeoBounds(geoPath: GeoPath): void {
    const oldGeoBounds = this.geoBounds;
    const newGeoBounds = geoPath.bounds;
    if (!oldGeoBounds.equals(newGeoBounds)) {
      Object.defineProperty(this, "geoBounds", {
        value: newGeoBounds,
        enumerable: true,
        configurable: true,
      });
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
      this.requireUpdate(View.NeedsProject);
    }
  }

  protected onProject(viewContext: ViewContextType<this>): void {
    super.onProject(viewContext);
    const geoProjection = viewContext.geoProjection;

    let viewPath: PathR2;
    if (this.viewPath.isPrecedent(View.Intrinsic)) {
      const geoPath = this.geoPath.getValue();
      viewPath = geoPath.project(geoProjection);
      this.viewPath.setState(viewPath, View.Intrinsic);
    } else {
      viewPath = this.viewPath.getValue();
    }

    if (this.viewCentroid.isPrecedent(View.Intrinsic)) {
      const geoCentroid = this.geoCentroid.getValue();
      const viewCentroid = geoProjection.project(geoCentroid);
      this.viewCentroid.setState(viewCentroid, View.Intrinsic);
    }

    Object.defineProperty(this, "viewBounds", {
      value: viewPath.bounds,
      enumerable: true,
      configurable: true,
    });

    this.cullGeoFrame(viewContext.geoFrame);
  }

  protected doUpdateGeoBounds(): void {
    // nop
  }

  get popoverFrame(): BoxR2 {
    const inversePageTransform = this.pageTransform.inverse();
    const viewCentroid = this.viewCentroid.getValue();
    if (viewCentroid.isDefined()) {
      const px = inversePageTransform.transformX(viewCentroid.x, viewCentroid.y);
      const py = inversePageTransform.transformY(viewCentroid.x, viewCentroid.y);
      return new BoxR2(px, py, px, py);
    } else {
      return this.viewBounds.transform(inversePageTransform);
    }
  }

  // @ts-ignore
  declare readonly viewBounds: BoxR2;
}
