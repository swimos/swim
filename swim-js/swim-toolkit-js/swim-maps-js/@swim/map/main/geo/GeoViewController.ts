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

import {GeoShape, GeoBox} from "@swim/geo";
import {GraphicsViewController} from "@swim/graphics";
import type {GeoViewport} from "./GeoViewport";
import type {GeoView} from "./GeoView";
import type {GeoViewObserver} from "./GeoViewObserver";

export class GeoViewController<V extends GeoView = GeoView> extends GraphicsViewController<V> implements GeoViewObserver<V> {
  get geoViewport(): GeoViewport | null {
    const view = this.view;
    return view !== null ? view.geoViewport : null;
  }

  get geoFrame(): GeoBox {
    const view = this.view;
    return view !== null ? view.geoFrame : GeoBox.globe();
  }

  get geoBounds(): GeoBox {
    const view = this.view;
    return view !== null ? view.geoBounds : GeoBox.undefined();
  }

  viewWillSetGeoBounds(newGeoBounds: GeoShape, oldGeoBounds: GeoShape, view: V): void {
    // hook
  }

  viewDidSetGeoBounds(newGeoBounds: GeoShape, oldGeoBounds: GeoShape, view: V): void {
    // hook
  }
}
