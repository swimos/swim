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

import {AnyTiming, Timing} from "@swim/mapping";
import {ComponentProperty, ComponentViewTrait, CompositeComponent} from "@swim/component";
import type {GeoView} from "./GeoView";
import type {GeoTrait} from "./GeoTrait";
import type {GeoComponentObserver} from "./GeoComponentObserver";
import {GeoLayerTrait} from "../"; // forward import
import {GeoLayerComponent} from "../"; // forward import
import {GeoLineTrait} from "../"; // forward import
import {GeoLineComponent} from "../"; // forward import
import {GeoAreaTrait} from "../"; // forward import
import {GeoAreaComponent} from "../"; // forward import
import {GeoIconTrait} from "../"; // forward import
import {GeoIconComponent} from "../"; // forward import

export abstract class GeoComponent extends CompositeComponent {
  declare readonly componentObservers: ReadonlyArray<GeoComponentObserver>;

  @ComponentProperty({type: Timing, inherit: true})
  declare geoTiming: ComponentProperty<this, Timing | boolean | undefined, AnyTiming>;

  abstract readonly geo: ComponentViewTrait<this, GeoView, GeoTrait>;

  static fromTrait(geoTrait: GeoTrait): GeoComponent | null {
    if (geoTrait instanceof GeoLayerTrait) {
      return new GeoLayerComponent();
    } else if (geoTrait instanceof GeoIconTrait) {
      return new GeoIconComponent();
    } else if (geoTrait instanceof GeoAreaTrait) {
      return new GeoAreaComponent();
    } else if (geoTrait instanceof GeoLineTrait) {
      return new GeoLineComponent();
    } else {
      return null;
    }
  }
}
