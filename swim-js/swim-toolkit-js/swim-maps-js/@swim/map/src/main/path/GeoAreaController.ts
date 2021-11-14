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
import type {Length} from "@swim/math";
import type {GeoPath} from "@swim/geo";
import type {Color} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {TraitViewRef} from "@swim/controller";
import {GeoAreaView} from "./GeoAreaView";
import {GeoAreaTrait} from "./GeoAreaTrait";
import {GeoPathController} from "./GeoPathController";
import type {GeoAreaControllerObserver} from "./GeoAreaControllerObserver";

/** @public */
export class GeoAreaController extends GeoPathController {
  override readonly observerType?: Class<GeoAreaControllerObserver>;

  protected setGeoPath(geoPath: GeoPath | null, geoTrait: GeoAreaTrait, timing?: AnyTiming | boolean): void {
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
      geoView.geoPath.setState(geoPath, timing, Affinity.Intrinsic);
    }
  }

  protected setFill(fill: Look<Color> | Color | null, geoTrait: GeoAreaTrait, timing?: AnyTiming | boolean): void {
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
      if (fill instanceof Look) {
        geoView.fill.setLook(fill, timing, Affinity.Intrinsic);
      } else {
        geoView.fill.setState(fill, timing, Affinity.Intrinsic);
      }
    }
  }

  protected setStroke(stroke: Look<Color> | Color | null, geoTrait: GeoAreaTrait, timing?: AnyTiming | boolean): void {
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
      if (stroke instanceof Look) {
        geoView.stroke.setLook(stroke, timing, Affinity.Intrinsic);
      } else {
        geoView.stroke.setState(stroke, timing, Affinity.Intrinsic);
      }
    }
  }

  protected setStrokeWidth(strokeWidth: Length | null, geoTrait: GeoAreaTrait, timing?: AnyTiming | boolean): void {
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
      geoView.strokeWidth.setState(strokeWidth, timing, Affinity.Intrinsic);
    }
  }

  @TraitViewRef<GeoAreaController, GeoAreaTrait, GeoAreaView>({
    traitType: GeoAreaTrait,
    observesTrait: true,
    willAttachTrait(geoTrait: GeoAreaTrait): void {
      this.owner.callObservers("controllerWillAttachGeoTrait", geoTrait, this.owner);
    },
    didAttachTrait(geoTrait: GeoAreaTrait): void {
      const geoView = this.view;
      if (geoView !== null) {
        this.owner.setGeoPath(geoTrait.geoPath.state, geoTrait);
        const fill = geoTrait.fill.state;
        if (fill !== null) {
          this.owner.setFill(fill, geoTrait);
        }
        const stroke = geoTrait.stroke.state;
        if (stroke !== null) {
          this.owner.setStroke(stroke, geoTrait);
        }
        const strokeWidth = geoTrait.strokeWidth.state;
        if (strokeWidth !== null) {
          this.owner.setStrokeWidth(strokeWidth, geoTrait);
        }
      }
    },
    didDetachTrait(geoTrait: GeoAreaTrait): void {
      this.owner.callObservers("controllerDidDetachGeoTrait", geoTrait, this.owner);
    },
    traitDidSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoTrait: GeoAreaTrait): void {
      this.owner.setGeoPath(newGeoPath, geoTrait);
    },
    traitDidSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, geoTrait: GeoAreaTrait): void {
      this.owner.setFill(newFill, geoTrait);
    },
    traitDidSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoTrait: GeoAreaTrait): void {
      this.owner.setStroke(newStroke, geoTrait);
    },
    traitDidSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoTrait: GeoAreaTrait): void {
      this.owner.setStrokeWidth(newStrokeWidth, geoTrait);
    },
    viewType: GeoAreaView,
    observesView: true,
    willAttachView(geoView: GeoAreaView): void {
      this.owner.callObservers("controllerWillAttachGeoView", geoView, this.owner);
    },
    didAttachView(geoView: GeoAreaView): void {
      const geoTrait = this.trait;
      if (geoTrait !== null) {
        this.owner.setGeoPath(geoTrait.geoPath.state, geoTrait);
        const fill = geoTrait.fill.state;
        if (fill !== null) {
          this.owner.setFill(fill, geoTrait);
        }
        const stroke = geoTrait.stroke.state;
        if (stroke !== null) {
          this.owner.setStroke(stroke, geoTrait);
        }
        const strokeWidth = geoTrait.strokeWidth.state;
        if (strokeWidth !== null) {
          this.owner.setStrokeWidth(strokeWidth, geoTrait);
        }
      }
    },
    didDetachView(geoView: GeoAreaView): void {
      this.owner.callObservers("controllerDidDetachGeoView", geoView, this.owner);
    },
    viewWillSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
      this.owner.callObservers("controllerWillSetGeoPath", newGeoPath, oldGeoPath, this.owner);
    },
    viewDidSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null): void {
      this.owner.callObservers("controllerDidSetGeoPath", newGeoPath, oldGeoPath, this.owner);
    },
    viewWillSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
      this.owner.callObservers("controllerWillSetFill", newFill, oldFill, this.owner);
    },
    viewDidSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
      this.owner.callObservers("controllerDidSetFill", newFill, oldFill, this.owner);
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
  readonly geo!: TraitViewRef<this, GeoAreaTrait, GeoAreaView>;
}
