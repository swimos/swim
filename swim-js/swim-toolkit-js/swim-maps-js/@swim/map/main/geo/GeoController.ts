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

import {AnyTiming, Timing} from "@swim/mapping";
import {ControllerProperty, ControllerViewTrait, CompositeController} from "@swim/controller";
import type {GeoView} from "./GeoView";
import type {GeoTrait} from "./GeoTrait";
import type {GeoControllerObserver} from "./GeoControllerObserver";
import {GeoLayerTrait} from "../"; // forward import
import {GeoLayerController} from "../"; // forward import
import {GeoLineTrait} from "../"; // forward import
import {GeoLineController} from "../"; // forward import
import {GeoAreaTrait} from "../"; // forward import
import {GeoAreaController} from "../"; // forward import
import {GeoIconTrait} from "../"; // forward import
import {GeoIconController} from "../"; // forward import

export abstract class GeoController extends CompositeController {
  override readonly controllerObservers!: ReadonlyArray<GeoControllerObserver>;

  @ControllerProperty({type: Timing, inherit: true})
  readonly geoTiming!: ControllerProperty<this, Timing | boolean | undefined, AnyTiming>;

  abstract readonly geo: ControllerViewTrait<this, GeoView, GeoTrait>;

  static fromTrait(geoTrait: GeoTrait): GeoController | null {
    if (geoTrait instanceof GeoLayerTrait) {
      return new GeoLayerController();
    } else if (geoTrait instanceof GeoIconTrait) {
      return new GeoIconController();
    } else if (geoTrait instanceof GeoAreaTrait) {
      return new GeoAreaController();
    } else if (geoTrait instanceof GeoLineTrait) {
      return new GeoLineController();
    } else {
      return null;
    }
  }
}
