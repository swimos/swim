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

import type {GeoTile, GeoBox} from "@swim/geo";
import {GeoView} from "../geo/GeoView";

/** @public */
export class GeoGridView extends GeoView {
  constructor(geoTile: GeoTile) {
    super();
    this.geoTile = geoTile;
    this.geoBounds = geoTile.bounds;
  }

  readonly geoTile: GeoTile;

  override readonly geoBounds: GeoBox;

  protected override setGeoBounds(newGeoBounds: GeoBox): void {
    // immutable
  }

  protected override updateGeoBounds(): void {
    // nop
  }
}
