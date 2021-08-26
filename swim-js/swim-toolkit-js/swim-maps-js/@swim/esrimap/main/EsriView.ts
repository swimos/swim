// Copyright 2015-2021 Swim Inc.
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

/// <reference types="arcgis-js-api"/>

import {MapView} from "@swim/map";
import {EsriViewport} from "./EsriViewport";
import type {EsriViewObserver} from "./EsriViewObserver";
import type {EsriViewController} from "./EsriViewController";

export abstract class EsriView extends MapView {
  constructor() {
    super();
    EsriViewport.init();
  }

  override readonly viewController!: EsriViewController | null;

  override readonly viewObservers!: ReadonlyArray<EsriViewObserver>;

  abstract readonly map: __esri.View;

  abstract override readonly geoViewport: EsriViewport;
}
