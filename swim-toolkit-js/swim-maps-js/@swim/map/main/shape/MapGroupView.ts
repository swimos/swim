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

import {PointR2, BoxR2} from "@swim/math";
import {ViewContextType, View} from "@swim/view";
import {GeoPoint} from "../geo/GeoPoint";
import {GeoBox} from "../geo/GeoBox";
import {MapGraphicsView} from "../graphics/MapGraphicsView";
import {MapLayerView} from "../graphics/MapLayerView";

export class MapGroupView extends MapLayerView {
  /** @hidden */
  _geoCentroid: GeoPoint;
  /** @hidden */
  _viewCentroid: PointR2;
  /** @hidden */
  _geoBounds: GeoBox;

  constructor() {
    super();
    this._geoCentroid = GeoPoint.origin();
    this._viewCentroid = PointR2.origin();
    this._geoBounds = GeoBox.undefined();
  }

  get geoCentroid(): GeoPoint {
    return this._geoCentroid;
  }

  get viewCentroid(): PointR2 {
    return this._viewCentroid;
  }

  get popoverFrame(): BoxR2 {
    const viewCentroid = this._viewCentroid;
    const inversePageTransform = this.pageTransform.inverse();
    const [px, py] = inversePageTransform.transform(viewCentroid.x, viewCentroid.y);
    return new BoxR2(px, py, px, py);
  }

  get geoBounds(): GeoBox {
    return this._geoBounds;
  }

  get hitBounds(): BoxR2 {
    return this.viewBounds;
  }

  protected didInsertChildView(childView: View, targetView: View | null | undefined): void {
    this.doUpdateGeoBounds();
    super.didInsertChildView(childView, targetView);
  }

  protected didRemoveChildVIew(childView: View): void {
    this.doUpdateGeoBounds();
    super.didRemoveChildView(childView);
  }

  protected didProject(viewContext: ViewContextType<this>): void {
    this._viewCentroid = viewContext.geoProjection.project(this._geoCentroid);
    super.didProject(viewContext);
  }

  protected doUpdateGeoBounds(): void {
    const oldGeoBounds = this._geoBounds;
    const newGeoBounds = this.deriveGeoBounds();
    if (!oldGeoBounds.equals(newGeoBounds)) {
      this._geoBounds = newGeoBounds;
      this._geoCentroid = new GeoPoint((newGeoBounds.lngMin + newGeoBounds.lngMax) / 2,
                                       (newGeoBounds.latMin + newGeoBounds.latMax) / 2);
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
  }

  childViewDidSetGeoBounds(childView: MapGraphicsView, newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    this.doUpdateGeoBounds();
  }
}
