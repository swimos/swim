// Copyright 2015-2021 Swim inc.
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

import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {TraitProperty} from "@swim/model";
import {Graphics, AnyIconLayout, IconLayout} from "@swim/graphics";
import {GeoTrait} from "../geo/GeoTrait";
import type {GeoIconTraitObserver} from "./GeoIconTraitObserver";

export class GeoIconTrait extends GeoTrait {
  override readonly traitObservers!: ReadonlyArray<GeoIconTraitObserver>;

  override get geoBounds(): GeoBox {
    const geoCenter = this.geoCenter.state;
    return geoCenter !== null ? geoCenter.bounds : GeoBox.undefined();
  }

  protected willSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetGeoCenter !== void 0) {
        traitObserver.traitWillSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
    }
  }

  protected onSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
    // hook
  }

  protected didSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetGeoCenter !== void 0) {
        traitObserver.traitDidSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
    }
  }

  @TraitProperty<GeoIconTrait, GeoPoint | null, AnyGeoPoint | null>({
    type: GeoPoint,
    state: null,
    willSetState(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.willSetGeoCenter(newGeoCenter, oldGeoCenter);
    },
    didSetState(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.onSetGeoCenter(newGeoCenter, oldGeoCenter);
      this.owner.didSetGeoCenter(newGeoCenter, oldGeoCenter);
    },
  })
  readonly geoCenter!: TraitProperty<this, GeoPoint | null, AnyGeoPoint | null>;

  protected willSetIconLayout(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetIconLayout !== void 0) {
        traitObserver.traitWillSetIconLayout(newIconLayout, oldIconLayout, this);
      }
    }
  }

  protected onSetIconLayout(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null): void {
    // hook
  }

  protected didSetIconLayout(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetIconLayout !== void 0) {
        traitObserver.traitDidSetIconLayout(newIconLayout, oldIconLayout, this);
      }
    }
  }

  @TraitProperty<GeoIconTrait, IconLayout | null, AnyIconLayout | null>({
    type: IconLayout,
    state: null,
    willSetState(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null): void {
      this.owner.willSetIconLayout(newIconLayout, oldIconLayout);
    },
    didSetState(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null): void {
      this.owner.onSetIconLayout(newIconLayout, oldIconLayout);
      this.owner.didSetIconLayout(newIconLayout, oldIconLayout);
    },
  })
  readonly iconLayout!: TraitProperty<this, IconLayout | null, AnyIconLayout | null>;

  protected willSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetGraphics !== void 0) {
        traitObserver.traitWillSetGraphics(newGraphics, oldGraphics, this);
      }
    }
  }

  protected onSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
    // hook
  }

  protected didSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetGraphics !== void 0) {
        traitObserver.traitDidSetGraphics(newGraphics, oldGraphics, this);
      }
    }
  }

  @TraitProperty<GeoIconTrait, Graphics | null>({
    state: null,
    willSetState(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.willSetGraphics(newGraphics, oldGraphics);
    },
    didSetState(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.onSetGraphics(newGraphics, oldGraphics);
      this.owner.didSetGraphics(newGraphics, oldGraphics);
    },
  })
  readonly graphics!: TraitProperty<this, Graphics | null>;
}
