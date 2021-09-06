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
import type {Length} from "@swim/math";
import type {GeoPath} from "@swim/geo";
import type {Color} from "@swim/style";
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {View} from "@swim/view";
import {ControllerViewTrait} from "@swim/controller";
import {GeoAreaView} from "./GeoAreaView";
import {GeoAreaTrait} from "./GeoAreaTrait";
import {GeoPathController} from "./GeoPathController";
import type {GeoAreaControllerObserver} from "./GeoAreaControllerObserver";

export class GeoAreaController extends GeoPathController {
  override readonly controllerObservers!: ReadonlyArray<GeoAreaControllerObserver>;

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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGeoTrait !== void 0) {
        controllerObserver.controllerWillSetGeoTrait(newGeoTrait, oldGeoTrait, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGeoTrait !== void 0) {
        controllerObserver.controllerDidSetGeoTrait(newGeoTrait, oldGeoTrait, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGeoView !== void 0) {
        controllerObserver.controllerWillSetGeoView(newGeoView, oldGeoView, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGeoView !== void 0) {
        controllerObserver.controllerDidSetGeoView(newGeoView, oldGeoView, this);
      }
    }
  }

  protected themeGeoView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, geoView: GeoAreaView): void {
    // hook
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
      geoView.geoPath.setState(geoPath, timing, View.Intrinsic);
    }
  }

  protected willSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoView: GeoAreaView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGeoPath !== void 0) {
        controllerObserver.controllerWillSetGeoPath(newGeoPath, oldGeoPath, this);
      }
    }
  }

  protected onSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoView: GeoAreaView): void {
    // hook
  }

  protected didSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoView: GeoAreaView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGeoPath !== void 0) {
        controllerObserver.controllerDidSetGeoPath(newGeoPath, oldGeoPath, this);
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
        geoView.fill.setLook(fill, timing, View.Intrinsic);
      } else {
        geoView.fill.setState(fill, timing, View.Intrinsic);
      }
    }
  }

  protected willSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, geoView: GeoAreaView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetFill !== void 0) {
        controllerObserver.controllerWillSetFill(newFill, oldFill, this);
      }
    }
  }

  protected onSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, geoView: GeoAreaView): void {
    // hook
  }

  protected didSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, geoView: GeoAreaView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetFill !== void 0) {
        controllerObserver.controllerDidSetFill(newFill, oldFill, this);
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
        geoView.stroke.setLook(stroke, timing, View.Intrinsic);
      } else {
        geoView.stroke.setState(stroke, timing, View.Intrinsic);
      }
    }
  }

  protected willSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoView: GeoAreaView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetStroke !== void 0) {
        controllerObserver.controllerWillSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected onSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoView: GeoAreaView): void {
    // hook
  }

  protected didSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoView: GeoAreaView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetStroke !== void 0) {
        controllerObserver.controllerDidSetStroke(newStroke, oldStroke, this);
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
      geoView.strokeWidth.setState(strokeWidth, timing, View.Intrinsic);
    }
  }

  protected willSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoView: GeoAreaView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetStrokeWidth !== void 0) {
        controllerObserver.controllerWillSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  protected onSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoView: GeoAreaView): void {
    // hook
  }

  protected didSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoView: GeoAreaView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetStrokeWidth !== void 0) {
        controllerObserver.controllerDidSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  /** @hidden */
  static GetFastener = ControllerViewTrait.define<GeoAreaController, GeoAreaView, GeoAreaTrait>({
    viewType: GeoAreaView,
    observeView: true,
    willSetView(newGeoView: GeoAreaView | null, oldGeoView: GeoAreaView | null): void {
      this.owner.willSetGeoView(newGeoView, oldGeoView);
    },
    onSetView(newGeoView: GeoAreaView | null, oldGeoView: GeoAreaView | null): void {
      this.owner.onSetGeoView(newGeoView, oldGeoView);
    },
    didSetView(newGeoView: GeoAreaView | null, oldGeoView: GeoAreaView | null): void {
      this.owner.didSetGeoView(newGeoView, oldGeoView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, geoView: GeoAreaView): void {
      this.owner.themeGeoView(theme, mood, timing, geoView);
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
    traitType: GeoAreaTrait,
    observeTrait: true,
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
  });

  @ControllerViewTrait<GeoAreaController, GeoAreaView, GeoAreaTrait>({
    extends: GeoAreaController.GetFastener,
  })
  readonly geo!: ControllerViewTrait<this, GeoAreaView, GeoAreaTrait>;
}
