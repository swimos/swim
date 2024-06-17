// Copyright 2015-2024 Nstream, inc.
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

import type {Class} from "@swim/util";
import {Property} from "@swim/component";
import type {TraitObserver} from "@swim/model";
import {Trait} from "@swim/model";
import {GeoPerspective} from "./GeoPerspective";
import {GeoController} from "./"; // forward import

/** @public */
export interface GeoTraitObserver<T extends GeoTrait = GeoTrait> extends TraitObserver<T> {
  traitDidSetGeoPerspective?(geoPerspective: GeoPerspective | null, trait: T): void;
}

/** @public */
export abstract class GeoTrait extends Trait {
  declare readonly observerType?: Class<GeoTraitObserver>;

  @Property({
    valueType: GeoPerspective,
    value: null,
    didSetValue(geoPerspective: GeoPerspective | null): void {
      this.owner.callObservers("traitDidSetGeoPerspective", geoPerspective, this.owner);
    },
  })
  readonly geoPerspective!: Property<this, GeoPerspective | null>;

  createGeoController(): GeoController {
    return new GeoController();
  }
}
