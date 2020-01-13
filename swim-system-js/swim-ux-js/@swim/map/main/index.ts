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

export {
  AnyLngLat,
  LngLatInit,
  LngLat,
} from "./LngLat";
export {LngLatInterpolator} from "./LngLatInterpolator";

export {MapProjection} from "./MapProjection";

export {MapViewContext} from "./MapViewContext";
export {MapView} from "./MapView";
export {MapViewObserver} from "./MapViewObserver";
export {MapViewController} from "./MapViewController";

export {MapGraphicView} from "./MapGraphicView";
export {MapGraphicViewObserver} from "./MapGraphicViewObserver";
export {MapGraphicViewController} from "./MapGraphicViewController";

export {MapLayerViewContext} from "./MapLayerViewContext";
export {MapLayerView} from "./MapLayerView";
export {MapLayerViewObserver} from "./MapLayerViewObserver";
export {MapLayerViewController} from "./MapLayerViewController";

export {
  AnyMapLineView,
  MapLineViewInit,
  MapLineView,
} from "./MapLineView";

export {
  AnyMapCircleView,
  MapCircleViewInit,
  MapCircleView,
} from "./MapCircleView";

export {
  AnyMapPolygonView,
  MapPolygonViewInit,
  MapPolygonView,
} from "./MapPolygonView";

import {AnyLngLat} from "./LngLat";
import {LngLatInterpolator} from "./LngLatInterpolator";
declare module "@swim/interpolate" {
  namespace Interpolator {
    function lngLat(c0?: AnyLngLat, c1?: AnyLngLat): LngLatInterpolator;
  }
}
