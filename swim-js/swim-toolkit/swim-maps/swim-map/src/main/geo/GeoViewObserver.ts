// Copyright 2015-2021 Swim.inc
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

import type {GeoBox} from "@swim/geo";
import type {GraphicsViewObserver} from "@swim/graphics";
import type {GeoView} from "./GeoView";

/** @public */
export interface GeoViewObserver<V extends GeoView = GeoView> extends GraphicsViewObserver<V> {
  viewWillSetGeoBounds?(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, view: V): void;

  viewDidSetGeoBounds?(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, view: V): void;
}
