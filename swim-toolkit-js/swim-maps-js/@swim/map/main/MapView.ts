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

import {ViewFlags, RenderedViewInit, RenderedView} from "@swim/view";
import {GeoBox} from "./geo/GeoBox";
import {GeoProjection} from "./geo/GeoProjection";
import {MapViewContext} from "./MapViewContext";
import {MapViewController} from "./MapViewController";
import {MapGraphicsView} from "./graphics/MapGraphicsView";
import {MapLayerView} from "./layer/MapLayerView";

export interface MapViewInit extends RenderedViewInit {
}

export interface MapView extends RenderedView {
  readonly viewController: MapViewController | null;

  readonly geoProjection: GeoProjection | null;

  readonly mapZoom: number;

  readonly mapHeading: number;

  readonly mapTilt: number;

  /**
   * The map-specified geographic bounding box in which this view should layout
   * and render geometry.
   */
  readonly geoFrame: GeoBox;

  /**
   * The self-defined geographic bounding box surrounding all geometry this
   * view could possibly render.  Views with geo bounds that don't overlap
   * their map frames may be culled from rendering and hit testing.
   */
  readonly geoBounds: GeoBox;

  needsProcess(processFlags: ViewFlags, viewContext: MapViewContext): ViewFlags;

  needsDisplay(displayFlags: ViewFlags, viewContext: MapViewContext): ViewFlags;

  childViewDidSetGeoBounds(childView: MapView, newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void;
}

/** @hidden */
export const MapView = {
  is(object: unknown): object is MapView {
    if (typeof object === "object" && object !== null) {
      const view = object as MapView;
      return view instanceof MapGraphicsView
          || view instanceof MapLayerView
          || RenderedView.is(view) && "geoProjection" in view;
    }
    return false;
  },
};
