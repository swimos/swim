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

import {RenderedView} from "@swim/view";
import {MapProjection} from "./MapProjection";
import {MapViewContext} from "./MapViewContext";
import {MapViewController} from "./MapViewController";

export interface MapView extends RenderedView {
  readonly viewController: MapViewController | null;

  readonly projection: MapProjection | null;

  readonly zoom: number;

  readonly heading: number;

  readonly tilt: number;

  needsUpdate(updateFlags: number, viewContext: MapViewContext): number;

  /** @hidden */
  doProject(viewContext: MapViewContext): void;
}

/** @hidden */
export const MapView = {
  NeedsProject: 1 << 8,

  is(object: unknown): object is MapView {
    if (typeof object === "object" && object) {
      const view = object as MapView;
      return RenderedView.is(view)
          && typeof view.doProject === "function";
    }
    return false;
  },
};
