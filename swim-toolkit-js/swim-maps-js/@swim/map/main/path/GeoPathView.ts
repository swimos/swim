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
import {AnyGeoPoint, GeoPoint, GeoBox, AnyGeoPath, GeoPath} from "@swim/geo";
import {ViewContextType, View, ViewAnimator} from "@swim/view";
import type {GeoViewInit} from "../geo/GeoView";
import type {GeoViewController} from "../geo/GeoViewController";
import {GeoLayerView} from "../layer/GeoLayerView";
import {GeoRippleOptions, GeoRippleView} from "../effect/GeoRippleView";
import type {GeoPathViewObserver} from "./GeoPathViewObserver";

export interface GeoPathViewInit extends GeoViewInit {
  geoPath?: GeoPath;
}

export class GeoPathView extends GeoLayerView {
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

  declare readonly viewController: GeoViewController<GeoPathView> & GeoPathViewObserver | null;

  declare readonly viewObservers: ReadonlyArray<GeoPathViewObserver>;

  protected willSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetGeoPath !== void 0) {
      viewController.viewWillSetGeoPath(newGeoPath, oldGeoPath, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetGeoPath !== void 0) {
        viewObserver.viewWillSetGeoPath(newGeoPath, oldGeoPath, this);
      }
    }
  }

  protected onSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
    this.setGeoBounds(newGeoPath !== null ? newGeoPath.bounds : GeoBox.undefined());
    if (this.isMounted()) {
      this.projectPath(this.viewContext as ViewContextType<this>);
    }
  }

  protected didSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetGeoPath !== void 0) {
        viewObserver.viewDidSetGeoPath(newGeoPath, oldGeoPath, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetGeoPath !== void 0) {
      viewController.viewDidSetGeoPath(newGeoPath, oldGeoPath, this);
    }
  }

  @ViewAnimator<GeoPathView, GeoPath | null>({
    type: GeoPath,
    state: null,
    willSetValue(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
      this.owner.willSetGeoPath(newGeoPath, oldGeoPath);
    },
    didSetValue(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
      this.owner.onSetGeoPath(newGeoPath, oldGeoPath);
      this.owner.didSetGeoPath(newGeoPath, oldGeoPath);
    },
  })
  declare geoPath: ViewAnimator<this, GeoPath | null, AnyGeoPath | null>;

  @ViewAnimator({type: PathR2, state: null})
  declare viewPath: ViewAnimator<this, PathR2 | null>;

  @ViewAnimator({type: GeoPoint, state: null})
  declare geoCentroid: ViewAnimator<this, GeoPoint | null, AnyGeoPoint | null>;

  @ViewAnimator({type: PointR2, state: null})
  declare viewCentroid: ViewAnimator<this, PointR2 | null, AnyPointR2 | null>;

  protected onProject(viewContext: ViewContextType<this>): void {
    super.onProject(viewContext);
    this.projectPath(viewContext);
  }

  protected projectPath(viewContext: ViewContextType<this>): void {
    const geoViewport = viewContext.geoViewport;

    let viewPath: PathR2 | null;
    if (this.viewPath.takesPrecedence(View.Intrinsic)) {
      const geoPath = this.geoPath.value;
      viewPath = geoPath !== null && geoPath.isDefined() ? geoPath.project(geoViewport) : null;
      this.viewPath.setState(viewPath, View.Intrinsic);
    } else {
      viewPath = this.viewPath.value;
    }

    if (this.viewCentroid.takesPrecedence(View.Intrinsic)) {
      const geoCentroid = this.geoCentroid.value;
      const viewCentroid = geoCentroid !== null && geoCentroid.isDefined()
                         ? geoViewport.project(geoCentroid)
                         : null;
      this.viewCentroid.setState(viewCentroid, View.Intrinsic);
    }

    Object.defineProperty(this, "viewBounds", {
      value: viewPath !== null ? viewPath.bounds : this.viewFrame,
      enumerable: true,
      configurable: true,
    });

    this.cullGeoFrame(viewContext.geoViewport.geoFrame);
  }

  protected updateGeoBounds(): void {
    // nop
  }

  get popoverFrame(): BoxR2 {
    const inversePageTransform = this.pageTransform.inverse();
    const viewCentroid = this.viewCentroid.value;
    if (viewCentroid !== null && viewCentroid.isDefined()) {
      const px = inversePageTransform.transformX(viewCentroid.x, viewCentroid.y);
      const py = inversePageTransform.transformY(viewCentroid.x, viewCentroid.y);
      return new BoxR2(px, py, px, py);
    } else {
      return this.viewBounds.transform(inversePageTransform);
    }
  }

  declare readonly viewBounds: BoxR2;

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }
}
