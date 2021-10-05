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
import {TraitViewFastener} from "@swim/controller";
import {GeoAreaView} from "./GeoAreaView";
import {GeoAreaTrait} from "./GeoAreaTrait";
import {GeoPathController} from "./GeoPathController";
import type {GeoAreaControllerObserver} from "./GeoAreaControllerObserver";

export class GeoAreaController extends GeoPathController {
  override readonly observerType?: Class<GeoAreaControllerObserver>;

  protected initGeoTrait(geoTrait: GeoAreaTrait): void {
    // hook
  }

  protected attachGeoTrait(geoTrait: GeoAreaTrait): void {
    const geoView = this.geo.view;
    if (geoView !== null) {
      this.setGeoPath(geoTrait.geoPath.state, geoTrait);
      const fill = geoTrait.fill.state;
      if (fill !== null) {
        this.setFill(fill, geoTrait);
      }
      const stroke = geoTrait.stroke.state;
      if (stroke !== null) {
        this.setStroke(stroke, geoTrait);
      }
      const strokeWidth = geoTrait.strokeWidth.state;
      if (strokeWidth !== null) {
        this.setStrokeWidth(strokeWidth, geoTrait);
      }
    }
  }

  protected detachGeoTrait(geoTrait: GeoAreaTrait): void {
    // hook
  }

  protected willSetGeoTrait(newGeoTrait: GeoAreaTrait | null, oldGeoTrait: GeoAreaTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetGeoTrait !== void 0) {
        observer.controllerWillSetGeoTrait(newGeoTrait, oldGeoTrait, this);
      }
    }
  }

  protected onSetGeoTrait(newGeoTrait: GeoAreaTrait | null, oldGeoTrait: GeoAreaTrait | null): void {
    if (oldGeoTrait !== null) {
      this.detachGeoTrait(oldGeoTrait);
    }
    if (newGeoTrait !== null) {
      this.attachGeoTrait(newGeoTrait);
      this.initGeoTrait(newGeoTrait);
    }
  }

  protected didSetGeoTrait(newGeoTrait: GeoAreaTrait | null, oldGeoTrait: GeoAreaTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetGeoTrait !== void 0) {
        observer.controllerDidSetGeoTrait(newGeoTrait, oldGeoTrait, this);
      }
    }
  }

  protected createGeoView(): GeoAreaView {
    return GeoAreaView.create();
  }

  protected initGeoView(geoView: GeoAreaView): void {
    // hook
  }

  protected attachGeoView(geoView: GeoAreaView): void {
    const geoTrait = this.geo.trait;
    if (geoTrait !== null) {
      this.setGeoPath(geoTrait.geoPath.state, geoTrait);
      const fill = geoTrait.fill.state;
      if (fill !== null) {
        this.setFill(fill, geoTrait);
      }
      const stroke = geoTrait.stroke.state;
      if (stroke !== null) {
        this.setStroke(stroke, geoTrait);
      }
      const strokeWidth = geoTrait.strokeWidth.state;
      if (strokeWidth !== null) {
        this.setStrokeWidth(strokeWidth, geoTrait);
      }
    }
  }

  protected detachGeoView(geoView: GeoAreaView): void {
    // hook
  }

  protected willSetGeoView(newGeoView: GeoAreaView | null, oldGeoView: GeoAreaView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetGeoView !== void 0) {
        observer.controllerWillSetGeoView(newGeoView, oldGeoView, this);
      }
    }
  }

  protected onSetGeoView(newGeoView: GeoAreaView | null, oldGeoView: GeoAreaView | null): void {
    if (oldGeoView !== null) {
      this.detachGeoView(oldGeoView);
    }
    if (newGeoView !== null) {
      this.attachGeoView(newGeoView);
      this.initGeoView(newGeoView);
    }
  }

  protected didSetGeoView(newGeoView: GeoAreaView | null, oldGeoView: GeoAreaView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetGeoView !== void 0) {
        observer.controllerDidSetGeoView(newGeoView, oldGeoView, this);
      }
    }
  }

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

  protected willSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoView: GeoAreaView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetGeoPath !== void 0) {
        observer.controllerWillSetGeoPath(newGeoPath, oldGeoPath, this);
      }
    }
  }

  protected onSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoView: GeoAreaView): void {
    // hook
  }

  protected didSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoView: GeoAreaView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetGeoPath !== void 0) {
        observer.controllerDidSetGeoPath(newGeoPath, oldGeoPath, this);
      }
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

  protected willSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, geoView: GeoAreaView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetFill !== void 0) {
        observer.controllerWillSetFill(newFill, oldFill, this);
      }
    }
  }

  protected onSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, geoView: GeoAreaView): void {
    // hook
  }

  protected didSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, geoView: GeoAreaView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetFill !== void 0) {
        observer.controllerDidSetFill(newFill, oldFill, this);
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

  protected willSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoView: GeoAreaView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetStroke !== void 0) {
        observer.controllerWillSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected onSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoView: GeoAreaView): void {
    // hook
  }

  protected didSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoView: GeoAreaView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetStroke !== void 0) {
        observer.controllerDidSetStroke(newStroke, oldStroke, this);
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

  protected willSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoView: GeoAreaView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetStrokeWidth !== void 0) {
        observer.controllerWillSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  protected onSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoView: GeoAreaView): void {
    // hook
  }

  protected didSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoView: GeoAreaView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetStrokeWidth !== void 0) {
        observer.controllerDidSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  /** @internal */
  static GetFastener = TraitViewFastener.define<GeoAreaController, GeoAreaTrait, GeoAreaView>({
    traitType: GeoAreaTrait,
    observesTrait: true,
    willSetTrait(newGeoTrait: GeoAreaTrait | null, oldGeoTrait: GeoAreaTrait | null): void {
      this.owner.willSetGeoTrait(newGeoTrait, oldGeoTrait);
    },
    onSetTrait(newGeoTrait: GeoAreaTrait | null, oldGeoTrait: GeoAreaTrait | null): void {
      this.owner.onSetGeoTrait(newGeoTrait, oldGeoTrait);
    },
    didSetTrait(newGeoTrait: GeoAreaTrait | null, oldGeoTrait: GeoAreaTrait | null): void {
      this.owner.didSetGeoTrait(newGeoTrait, oldGeoTrait);
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
    willSetView(newGeoView: GeoAreaView | null, oldGeoView: GeoAreaView | null): void {
      this.owner.willSetGeoView(newGeoView, oldGeoView);
    },
    onSetView(newGeoView: GeoAreaView | null, oldGeoView: GeoAreaView | null): void {
      this.owner.onSetGeoView(newGeoView, oldGeoView);
    },
    didSetView(newGeoView: GeoAreaView | null, oldGeoView: GeoAreaView | null): void {
      this.owner.didSetGeoView(newGeoView, oldGeoView);
    },
    viewWillSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoView: GeoAreaView): void {
      this.owner.willSetGeoPath(newGeoPath, oldGeoPath, geoView);
    },
    viewDidSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoView: GeoAreaView): void {
      this.owner.onSetGeoPath(newGeoPath, oldGeoPath, geoView);
      this.owner.didSetGeoPath(newGeoPath, oldGeoPath, geoView);
    },
    viewWillSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, geoView: GeoAreaView): void {
      this.owner.willSetFill(newFill, oldFill, geoView);
    },
    viewDidSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, geoView: GeoAreaView): void {
      this.owner.onSetFill(newFill, oldFill, geoView);
      this.owner.didSetFill(newFill, oldFill, geoView);
    },
    viewWillSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoView: GeoAreaView): void {
      this.owner.willSetStroke(newStroke, oldStroke, geoView);
    },
    viewDidSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoView: GeoAreaView): void {
      this.owner.onSetStroke(newStroke, oldStroke, geoView);
      this.owner.didSetStroke(newStroke, oldStroke, geoView);
    },
    viewWillSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoView: GeoAreaView): void {
      this.owner.willSetStrokeWidth(newStrokeWidth, oldStrokeWidth, geoView);
    },
    viewDidSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoView: GeoAreaView): void {
      this.owner.onSetStrokeWidth(newStrokeWidth, oldStrokeWidth, geoView);
      this.owner.didSetStrokeWidth(newStrokeWidth, oldStrokeWidth, geoView);
    },
    createView(): GeoAreaView | null {
      return this.owner.createGeoView();
    },
  });

  @TraitViewFastener<GeoAreaController, GeoAreaTrait, GeoAreaView>({
    extends: GeoAreaController.GetFastener,
  })
  readonly geo!: TraitViewFastener<this, GeoAreaTrait, GeoAreaView>;
}
