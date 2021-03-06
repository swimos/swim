// Copyright 2015-2021 Swim inc.
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

import type {EsriViewObserver} from "./EsriViewObserver";
import type {EsriMapViewport} from "./EsriMapViewport";
import type {EsriMapView} from "./EsriMapView";

export interface EsriMapViewObserver<V extends EsriMapView = EsriMapView> extends EsriViewObserver<V> {
  viewWillSetGeoViewport?(newGeoViewport: EsriMapViewport, oldGeoViewport: EsriMapViewport, view: V): void;

  viewDidSetGeoViewport?(newGeoViewport: EsriMapViewport, oldGeoViewport: EsriMapViewport, view: V): void;
}
