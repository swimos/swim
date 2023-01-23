// Copyright 2015-2023 Swim.inc
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

import {Class, AnyTiming, Timing} from "@swim/util";
import {Property} from "@swim/component";
import {Controller, TraitViewRef} from "@swim/controller";
import type {GeoView} from "./GeoView";
import type {GeoTrait} from "./GeoTrait";
import type {GeoControllerObserver} from "./GeoControllerObserver";

/** @public */
export abstract class GeoController extends Controller {
  override readonly observerType?: Class<GeoControllerObserver>;

  @Property({valueType: Timing, inherits: true})
  readonly geoTiming!: Property<this, Timing | boolean | undefined, AnyTiming | boolean | undefined>;

  abstract readonly geo: TraitViewRef<this, GeoTrait, GeoView>;
}
