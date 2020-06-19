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

import {GeoProjection} from "@swim/map";

export interface EsriProjection extends GeoProjection {
  readonly map: __esri.View;
}

/** @hidden */
export const EsriProjection = {
  webMercatorUtils: void 0 as __esri.webMercatorUtils | undefined,

  init(): void {
    if (EsriProjection.webMercatorUtils === void 0) {
      (window.require as any)(["esri/geometry/support/webMercatorUtils"], function (webMercatorUtils: __esri.webMercatorUtils): void {
        EsriProjection.webMercatorUtils = webMercatorUtils;
      });
    }
  },
}
