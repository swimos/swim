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

import {Class, AnyTiming, Timing, Observes} from "@swim/util";
import {Affinity, FastenerClass} from "@swim/component";
import type {GeoPoint} from "@swim/geo";
import {Look, Mood} from "@swim/theme";
import type {Graphics, IconLayout} from "@swim/graphics";
import {TraitViewRef} from "@swim/controller";
import {GeoController} from "../geo/GeoController";
import {GeoIconView} from "./GeoIconView";
import {GeoIconTrait} from "./GeoIconTrait";
import type {GeoIconControllerObserver} from "./GeoIconControllerObserver";

/** @public */
export class GeoIconController extends GeoController {
  override readonly observerType?: Class<GeoIconControllerObserver>;

  protected setGeoCenter(geoCenter: GeoPoint | null, geoTrait: GeoIconTrait, timing?: AnyTiming | boolean): void {
    const geoView = this.geo.view;
    if (geoView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.geoTiming.value;
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
        timing = this.geoTiming.value;
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
        timing = this.geoTiming.value;
        if (timing === true) {
          timing = geoView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      geoView.graphics.setState(graphics, timing, Affinity.Intrinsic);
    }
  }

  @TraitViewRef<GeoIconController["geo"]>({
    traitType: GeoIconTrait,
    observesTrait: true,
    willAttachTrait(geoTrait: GeoIconTrait): void {
      this.owner.callObservers("controllerWillAttachGeoTrait", geoTrait, this.owner);
    },
    didAttachTrait(geoTrait: GeoIconTrait): void {
      const geoView = this.view;
      if (geoView !== null) {
        this.owner.setGeoCenter(geoTrait.geoCenter.value, geoTrait);
        this.owner.setIconLayout(geoTrait.iconLayout.value, geoTrait);
        this.owner.setGraphics(geoTrait.graphics.value, geoTrait);
      }
    },
    didDetachTrait(geoTrait: GeoIconTrait): void {
      this.owner.callObservers("controllerDidDetachGeoTrait", geoTrait, this.owner);
    },
    traitDidSetGeoCenter(geoCenter: GeoPoint | null, geoTrait: GeoIconTrait): void {
      this.owner.setGeoCenter(geoCenter, geoTrait);
    },
    traitDidSetIconLayout(iconLayout: IconLayout, geoTrait: GeoIconTrait): void {
      this.owner.setIconLayout(iconLayout, geoTrait);
    },
    traitDidSetGraphics(graphics: Graphics | null, geoTrait: GeoIconTrait): void {
      this.owner.setGraphics(graphics, geoTrait);
    },
    viewType: GeoIconView,
    observesView: true,
    willAttachView(geoView: GeoIconView): void {
      this.owner.callObservers("controllerWillAttachGeoView", geoView, this.owner);
    },
    didAttachView(geoView: GeoIconView): void {
      const geoTrait = this.trait;
      if (geoTrait !== null) {
        this.owner.setGeoCenter(geoTrait.geoCenter.value, geoTrait);
        this.owner.setIconLayout(geoTrait.iconLayout.value, geoTrait);
        this.owner.setGraphics(geoTrait.graphics.value, geoTrait);
      }
    },
    didDetachView(geoView: GeoIconView): void {
      this.owner.callObservers("controllerDidDetachGeoView", geoView, this.owner);
    },
    viewDidSetGeoCenter(geoCenter: GeoPoint | null): void {
      this.owner.callObservers("controllerDidSetGeoCenter", geoCenter, this.owner);
    },
    viewDidSetGraphics(graphics: Graphics | null): void {
      this.owner.callObservers("controllerDidSetGraphics", graphics, this.owner);
    },
  })
  override readonly geo!: TraitViewRef<this, GeoIconTrait, GeoIconView> & Observes<GeoIconTrait & GeoIconView>;
  static readonly geo: FastenerClass<GeoIconController["geo"]>;
}
