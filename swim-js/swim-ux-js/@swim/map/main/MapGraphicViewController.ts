// Copyright 2015-2019 SWIM.AI inc.
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

import {AnyPointR2, PointR2} from "@swim/math";
import {GraphicViewController} from "@swim/view";
import {AnyLngLat, LngLat} from "./LngLat";
import {MapProjection} from "./MapProjection";
import {MapGraphicView} from "./MapGraphicView";
import {MapGraphicViewObserver} from "./MapGraphicViewObserver";

export class MapGraphicViewController<V extends MapGraphicView = MapGraphicView> extends GraphicViewController<V> implements MapGraphicViewObserver<V> {
  project(lnglat: AnyLngLat): PointR2;
  project(lng: number, lat: number): PointR2;
  project(lng: AnyLngLat | number, lat?: number): PointR2 {
    return this.projection.project.apply(this.projection, arguments);
  }

  unproject(point: AnyPointR2): LngLat;
  unproject(x: number, y: number): LngLat;
  unproject(x: AnyPointR2 | number, y?: number): LngLat {
    return this.projection.unproject.apply(this.projection, arguments);
  }

  get projection(): MapProjection {
    const view = this._view;
    return view ? view.projection : MapProjection.identity();
  }

  viewWillSetProjection(projection: MapProjection, view: V): MapProjection | void {
    // hook
  }

  viewDidSetProjection(projection: MapProjection, view: V): void {
    // hook
  }

  get zoom(): number {
    const view = this._view;
    return view ? view.zoom : 0;
  }

  viewWillSetZoom(zoom: number, view: V): void {
    // hook
  }

  viewDidSetZoom(newZoom: number, oldZoom: number, view: V): void {
    // hook
  }
}
