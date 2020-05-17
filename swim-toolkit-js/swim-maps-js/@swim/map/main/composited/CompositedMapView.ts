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

import {ViewFlags, CompositedViewInit, CompositedView} from "@swim/view";
import {MapViewInit, MapView} from "../MapView";
import {CompositedMapViewContext} from "./CompositedMapViewContext";
import {CompositedMapViewController} from "./CompositedMapViewController";
import {MapRasterView} from "../raster/MapRasterView";

export interface CompositedMapViewInit extends CompositedViewInit, MapViewInit {
}

export interface CompositedMapView extends CompositedView, MapView {
  readonly viewController: CompositedMapViewController | null;

  needsProcess(processFlags: ViewFlags, viewContext: CompositedMapViewContext): ViewFlags;

  needsDisplay(displayFlags: ViewFlags, viewContext: CompositedMapViewContext): ViewFlags;
}

/** @hidden */
export const CompositedMapView = {
  is(object: unknown): object is CompositedMapView {
    if (typeof object === "object" && object !== null) {
      const view = object as CompositedMapView;
      return view instanceof MapRasterView
          || CompositedView.is(view) && MapView.is(view);
    }
    return false;
  },
};
