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

import {Class, AnyTiming, Timing} from "@swim/util";
import {Affinity} from "@swim/fastener";
import type {GeoPoint} from "@swim/geo";
import {Look, Mood} from "@swim/theme";
import type {Graphics, IconLayout} from "@swim/graphics";
import {TraitViewRef} from "@swim/controller";
import {GeoController} from "../geo/GeoController";
import {GeoIconView} from "./GeoIconView";
import {GeoIconTrait} from "./GeoIconTrait";
import type {GeoIconControllerObserver} from "./GeoIconControllerObserver";

export class GeoIconController extends GeoController {
  override readonly observerType?: Class<GeoIconControllerObserver>;

  protected setGeoCenter(geoCenter: GeoPoint | null, geoTrait: GeoIconTrait, timing?: AnyTiming | boolean): void {
    const geoView = this.geo.view;
    if (geoView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.geoTiming.state;
        if (timing === true) {
          timing = geoView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      geoView.geoCenter.setState(geoCenter, timing, Affinity.Intrinsic);
    }
  }

  protected setIconLayout(iconLayout: IconLayout | null, geoTrait: GeoIconTrait, timing?: AnyTiming | boolean): void {
    const geoView = this.geo.view;
    if (geoView !== null && iconLayout !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.geoTiming.state;
        if (timing === true) {
          timing = geoView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      geoView.iconWidth.setState(iconLayout.iconWidth, timing, Affinity.Intrinsic);
      geoView.iconHeight.setState(iconLayout.iconHeight, timing, Affinity.Intrinsic);
      if (iconLayout.xAlign !== void 0) {
        geoView.xAlign.setState(iconLayout.xAlign, timing, Affinity.Intrinsic);
      }
      if (iconLayout.yAlign !== void 0) {
        geoView.yAlign.setState(iconLayout.yAlign, timing, Affinity.Intrinsic);
      }
    }
  }

  protected setGraphics(graphics: Graphics | null, geoTrait: GeoIconTrait, timing?: AnyTiming | boolean): void {
    const geoView = this.geo.view;
    if (geoView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.geoTiming.state;
        if (timing === true) {
          timing = geoView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      geoView.graphics.setState(graphics, timing, Affinity.Intrinsic);
    }
  }

  @TraitViewRef<GeoIconController, GeoIconTrait, GeoIconView>({
    traitType: GeoIconTrait,
    observesTrait: true,
    willAttachTrait(geoTrait: GeoIconTrait): void {
      this.owner.callObservers("controllerWillAttachGeoTrait", geoTrait, this.owner);
    },
    didAttachTrait(geoTrait: GeoIconTrait): void {
      const geoView = this.view;
      if (geoView !== null) {
        this.owner.setGeoCenter(geoTrait.geoCenter.state, geoTrait);
        this.owner.setIconLayout(geoTrait.iconLayout.state, geoTrait);
        this.owner.setGraphics(geoTrait.graphics.state, geoTrait);
      }
    },
    didDetachTrait(geoTrait: GeoIconTrait): void {
      this.owner.callObservers("controllerDidDetachGeoTrait", geoTrait, this.owner);
    },
    traitDidSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null, geoTrait: GeoIconTrait): void {
      this.owner.setGeoCenter(newGeoCenter, geoTrait);
    },
    traitDidSetIconLayout(newIconLayout: IconLayout, oldIconLayout: IconLayout, geoTrait: GeoIconTrait): void {
      this.owner.setIconLayout(newIconLayout, geoTrait);
    },
    traitDidSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null, geoTrait: GeoIconTrait): void {
      this.owner.setGraphics(newGraphics, geoTrait);
    },
    viewType: GeoIconView,
    observesView: true,
    willAttachView(geoView: GeoIconView): void {
      this.owner.callObservers("controllerWillAttachGeoView", geoView, this.owner);
    },
    didAttachView(geoView: GeoIconView): void {
      const geoTrait = this.trait;
      if (geoTrait !== null) {
        this.owner.setGeoCenter(geoTrait.geoCenter.state, geoTrait);
        this.owner.setIconLayout(geoTrait.iconLayout.state, geoTrait);
        this.owner.setGraphics(geoTrait.graphics.state, geoTrait);
      }
    },
    didDetachView(geoView: GeoIconView): void {
      this.owner.callObservers("controllerDidDetachGeoView", geoView, this.owner);
    },
    viewWillSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.callObservers("controllerWillSetGeoCenter", newGeoCenter, oldGeoCenter, this.owner);
    },
    viewDidSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.callObservers("controllerDidSetGeoCenter", newGeoCenter, oldGeoCenter, this.owner);
    },
    viewWillSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.callObservers("controllerWillSetGraphics", newGraphics, oldGraphics, this.owner);
    },
    viewDidSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null): void {
      this.owner.callObservers("controllerDidSetGraphics", newGraphics, oldGraphics, this.owner);
    },
  })
  readonly geo!: TraitViewRef<this, GeoIconTrait, GeoIconView>;
}
