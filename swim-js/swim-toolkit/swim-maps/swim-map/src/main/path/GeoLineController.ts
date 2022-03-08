// Copyright 2015-2022 Swim.inc
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
import {Affinity, MemberFastenerClass} from "@swim/component";
import type {Length} from "@swim/math";
import type {GeoPath} from "@swim/geo";
import type {Color} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {TraitViewRef} from "@swim/controller";
import {GeoLineView} from "./GeoLineView";
import {GeoLineTrait} from "./GeoLineTrait";
import {GeoPathController} from "./GeoPathController";
import type {GeoLineControllerObserver} from "./GeoLineControllerObserver";

/** @public */
export class GeoLineController extends GeoPathController {
  override readonly observerType?: Class<GeoLineControllerObserver>;

  protected setGeoPath(geoPath: GeoPath | null, geoTrait: GeoLineTrait, timing?: AnyTiming | boolean): void {
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
      geoView.geoPath.setState(geoPath, timing, Affinity.Intrinsic);
    }
  }

  protected setStroke(stroke: Look<Color> | Color | null, geoTrait: GeoLineTrait, timing?: AnyTiming | boolean): void {
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
      if (stroke instanceof Look) {
        geoView.stroke.setLook(stroke, timing, Affinity.Intrinsic);
      } else {
        geoView.stroke.setState(stroke, timing, Affinity.Intrinsic);
      }
    }
  }

  protected setStrokeWidth(strokeWidth: Length | null, geoTrait: GeoLineTrait, timing?: AnyTiming | boolean): void {
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
      geoView.strokeWidth.setState(strokeWidth, timing, Affinity.Intrinsic);
    }
  }

  @TraitViewRef<GeoLineController, GeoLineTrait, GeoLineView>({
    traitType: GeoLineTrait,
    observesTrait: true,
    willAttachTrait(geoTrait: GeoLineTrait): void {
      this.owner.callObservers("controllerWillAttachGeoTrait", geoTrait, this.owner);
    },
    didAttachTrait(geoTrait: GeoLineTrait): void {
      const geoView = this.view;
      if (geoView !== null) {
        this.owner.setGeoPath(geoTrait.geoPath.value, geoTrait);
        const stroke = geoTrait.stroke.value;
        if (stroke !== null) {
          this.owner.setStroke(stroke, geoTrait);
        }
        const strokeWidth = geoTrait.strokeWidth.value;
        if (strokeWidth !== null) {
          this.owner.setStrokeWidth(strokeWidth, geoTrait);
        }
      }
    },
    didDetachTrait(geoTrait: GeoLineTrait): void {
      this.owner.callObservers("controllerDidDetachGeoTrait", geoTrait, this.owner);
    },
    traitDidSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoTrait: GeoLineTrait): void {
      this.owner.setGeoPath(newGeoPath, geoTrait);
    },
    traitDidSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoTrait: GeoLineTrait): void {
      this.owner.setStroke(newStroke, geoTrait);
    },
    traitDidSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoTrait: GeoLineTrait): void {
      this.owner.setStrokeWidth(newStrokeWidth, geoTrait);
    },
    viewType: GeoLineView,
    observesView: true,
    willAttachView(geoView: GeoLineView): void {
      this.owner.callObservers("controllerWillAttachGeoView", geoView, this.owner);
    },
    didAttachView(geoView: GeoLineView): void {
      const geoTrait = this.trait;
      if (geoTrait !== null) {
        this.owner.setGeoPath(geoTrait.geoPath.value, geoTrait);
        const stroke = geoTrait.stroke.value;
        if (stroke !== null) {
          this.owner.setStroke(stroke, geoTrait);
        }
        const strokeWidth = geoTrait.strokeWidth.value;
        if (strokeWidth !== null) {
          this.owner.setStrokeWidth(strokeWidth, geoTrait);
        }
      }
    },
    didDetachView(geoView: GeoLineView): void {
      this.owner.callObservers("controllerDidDetachGeoView", geoView, this.owner);
    },
    viewWillSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
      this.owner.callObservers("controllerWillSetGeoPath", newGeoPath, oldGeoPath, this.owner);
    },
    viewDidSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
      this.owner.callObservers("controllerDidSetGeoPath", newGeoPath, oldGeoPath, this.owner);
    },
    viewWillSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
      this.owner.callObservers("controllerWillSetStroke", newStroke, oldStroke, this.owner);
    },
    viewDidSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
      this.owner.callObservers("controllerDidSetStroke", newStroke, oldStroke, this.owner);
    },
    viewWillSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.callObservers("controllerWillSetStrokeWidth", newStrokeWidth, oldStrokeWidth, this.owner);
    },
    viewDidSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.callObservers("controllerDidSetStrokeWidth", newStrokeWidth, oldStrokeWidth, this.owner);
    },
  })
  readonly geo!: TraitViewRef<this, GeoLineTrait, GeoLineView>;
  static readonly geo: MemberFastenerClass<GeoLineController, "geo">;
}
