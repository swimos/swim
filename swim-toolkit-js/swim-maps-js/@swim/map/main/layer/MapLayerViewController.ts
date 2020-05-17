// Copyright 2015-2020 SWIM.AI inc.
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

import {BoxR2} from "@swim/math";
import {ViewController, CanvasView} from "@swim/view";
import {GeoBox} from "../geo/GeoBox";
import {GeoProjection} from "../geo/GeoProjection";
import {MapViewContext} from "../MapViewContext";
import {MapViewController} from "../MapViewController";
import {MapLayerView} from "./MapLayerView";
import {MapLayerViewObserver} from "./MapLayerViewObserver";

export class MapLayerViewController<V extends MapLayerView = MapLayerView> extends ViewController<V> implements MapViewController<V>, MapLayerViewObserver<V> {
  get canvasView(): CanvasView | null {
    const view = this._view;
    return view !== null ? view.canvasView : null;
  }

  get geoProjection(): GeoProjection | null {
    const view = this._view;
    return view !== null ? view.geoProjection : null;
  }

  get mapZoom(): number {
    const view = this._view;
    return view !== null ? view.mapZoom : 0;
  }

  get mapHeading(): number {
    const view = this._view;
    return view !== null ? view.mapHeading : 0;
  }

  get mapTilt(): number {
    const view = this._view;
    return view !== null ? view.mapTilt : 0;
  }

  get geoFrame(): GeoBox {
    const view = this._view;
    return view !== null ? view.geoFrame : GeoBox.globe();
  }

  get geoBounds(): GeoBox {
    const view = this._view;
    return view !== null ? view.geoBounds : GeoBox.empty();
  }

  viewWillAnimate(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewDidAnimate(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewWillProject(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewDidProject(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewWillRender(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewDidRender(viewContext: MapViewContext, view: V): void {
    // hook
  }

  isHidden(): boolean {
    const view = this._view;
    return view !== null && view.isHidden();
  }

  viewWillSetHidden(hidden: boolean, view: V): void {
    // hook
  }

  viewDidSetHidden(hidden: boolean, view: V): void {
    // hook
  }

  isCulled(): boolean {
    const view = this._view;
    return view !== null && view.isCulled();
  }

  viewWillSetCulled(culled: boolean, view: V): void {
    // hook
  }

  viewDidSetCulled(culled: boolean, view: V): void {
    // hook
  }

  get viewFrame(): BoxR2 {
    const view = this._view;
    return view !== null ? view.viewFrame : BoxR2.empty();
  }

  get viewBounds(): BoxR2 {
    const view = this._view;
    return view !== null ? view.viewBounds : BoxR2.empty();
  }

  get hitBounds(): BoxR2 {
    const view = this._view;
    return view !== null ? view.hitBounds : BoxR2.empty();
  }
}
