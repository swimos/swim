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

import {AnyGeoPath, GeoPath, GeoBox} from "@swim/geo";
import {TraitProperty} from "@swim/model";
import {GeoTrait} from "../geo/GeoTrait";
import type {GeoPathTraitObserver} from "./GeoPathTraitObserver";

export abstract class GeoPathTrait extends GeoTrait {
  override readonly traitObservers!: ReadonlyArray<GeoPathTraitObserver>;

  override get geoBounds(): GeoBox {
    const geoPath = this.geoPath.state;
    return geoPath !== null ? geoPath.bounds : GeoBox.undefined();
  }

  protected willSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetGeoPath !== void 0) {
        traitObserver.traitWillSetGeoPath(newGeoPath, oldGeoPath, this);
      }
    }
  }

  protected onSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
    // hook
  }

  protected didSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetGeoPath !== void 0) {
        traitObserver.traitDidSetGeoPath(newGeoPath, oldGeoPath, this);
      }
    }
  }

  @TraitProperty<GeoPathTrait, GeoPath | null, AnyGeoPath | null>({
    type: GeoPath,
    state: null,
    willSetState(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
      this.owner.willSetGeoPath(newGeoPath, oldGeoPath);
    },
    didSetState(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
      this.owner.onSetGeoPath(newGeoPath, oldGeoPath);
      this.owner.didSetGeoPath(newGeoPath, oldGeoPath);
    },
  })
  readonly geoPath!: TraitProperty<this, GeoPath | null, AnyGeoPath | null>;
}
