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

import {View, RenderView} from "@swim/view";
import {MapProjection} from "./MapProjection";
import {MapViewController} from "./MapViewController";

export interface MapView extends RenderView {
  readonly viewController: MapViewController | null;

  readonly projection: MapProjection;

  setProjection(projection: MapProjection): void;

  readonly zoom: number;

  setZoom(zoom: number): void;
}

/** @hidden */
export const MapView = {
  is(object: unknown): object is MapView {
    if (typeof object === "object" && object) {
      const view = object as MapView;
      return view instanceof View
          && typeof view.setProjection === "function"
          && typeof view.setZoom === "function";
    }
    return false;
  },
};
