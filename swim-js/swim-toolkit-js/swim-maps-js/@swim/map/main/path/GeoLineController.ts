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

import {AnyTiming, Timing} from "@swim/util";
import type {Length} from "@swim/math";
import type {GeoPath} from "@swim/geo";
import type {Color} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {View} from "@swim/view";
import {ControllerViewTrait} from "@swim/controller";
import {GeoLineView} from "./GeoLineView";
import {GeoLineTrait} from "./GeoLineTrait";
import {GeoPathController} from "./GeoPathController";
import type {GeoLineControllerObserver} from "./GeoLineControllerObserver";

export class GeoLineController extends GeoPathController {
  override readonly controllerObservers!: ReadonlyArray<GeoLineControllerObserver>;

  protected initGeoTrait(geoTrait: GeoLineTrait): void {
    // hook
  }

  protected attachGeoTrait(geoTrait: GeoLineTrait): void {
    const geoView = this.geo.view;
    if (geoView !== null) {
      this.setGeoPath(geoTrait.geoPath.state, geoTrait);
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

  protected detachGeoTrait(geoTrait: GeoLineTrait): void {
    // hook
  }

  protected willSetGeoTrait(newGeoTrait: GeoLineTrait | null, oldGeoTrait: GeoLineTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGeoTrait !== void 0) {
        controllerObserver.controllerWillSetGeoTrait(newGeoTrait, oldGeoTrait, this);
      }
    }
  }

  protected onSetGeoTrait(newGeoTrait: GeoLineTrait | null, oldGeoTrait: GeoLineTrait | null): void {
    if (oldGeoTrait !== null) {
      this.detachGeoTrait(oldGeoTrait);
    }
    if (newGeoTrait !== null) {
      this.attachGeoTrait(newGeoTrait);
      this.initGeoTrait(newGeoTrait);
    }
  }

  protected didSetGeoTrait(newGeoTrait: GeoLineTrait | null, oldGeoTrait: GeoLineTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGeoTrait !== void 0) {
        controllerObserver.controllerDidSetGeoTrait(newGeoTrait, oldGeoTrait, this);
      }
    }
  }

  protected createGeoView(): GeoLineView {
    return GeoLineView.create();
  }

  protected initGeoView(geoView: GeoLineView): void {
    // hook
  }

  protected attachGeoView(geoView: GeoLineView): void {
    const geoTrait = this.geo.trait;
    if (geoTrait !== null) {
      this.setGeoPath(geoTrait.geoPath.state, geoTrait);
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

  protected detachGeoView(geoView: GeoLineView): void {
    // hook
  }

  protected willSetGeoView(newGeoView: GeoLineView | null, oldGeoView: GeoLineView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGeoView !== void 0) {
        controllerObserver.controllerWillSetGeoView(newGeoView, oldGeoView, this);
      }
    }
  }

  protected onSetGeoView(newGeoView: GeoLineView | null, oldGeoView: GeoLineView | null): void {
    if (oldGeoView !== null) {
      this.detachGeoView(oldGeoView);
    }
    if (newGeoView !== null) {
      this.attachGeoView(newGeoView);
      this.initGeoView(newGeoView);
    }
  }

  protected didSetGeoView(newGeoView: GeoLineView | null, oldGeoView: GeoLineView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGeoView !== void 0) {
        controllerObserver.controllerDidSetGeoView(newGeoView, oldGeoView, this);
      }
    }
  }

  protected setGeoPath(geoPath: GeoPath | null, geoTrait: GeoLineTrait, timing?: AnyTiming | boolean): void {
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

  protected willSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoView: GeoLineView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGeoPath !== void 0) {
        controllerObserver.controllerWillSetGeoPath(newGeoPath, oldGeoPath, this);
      }
    }
  }

  protected onSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoView: GeoLineView): void {
    // hook
  }

  protected didSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoView: GeoLineView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGeoPath !== void 0) {
        controllerObserver.controllerDidSetGeoPath(newGeoPath, oldGeoPath, this);
      }
    }
  }

  protected setStroke(stroke: Look<Color> | Color | null, geoTrait: GeoLineTrait, timing?: AnyTiming | boolean): void {
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

  protected willSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoView: GeoLineView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetStroke !== void 0) {
        controllerObserver.controllerWillSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected onSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoView: GeoLineView): void {
    // hook
  }

  protected didSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoView: GeoLineView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetStroke !== void 0) {
        controllerObserver.controllerDidSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected setStrokeWidth(strokeWidth: Length | null, geoTrait: GeoLineTrait, timing?: AnyTiming | boolean): void {
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

  protected willSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoView: GeoLineView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetStrokeWidth !== void 0) {
        controllerObserver.controllerWillSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  protected onSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoView: GeoLineView): void {
    // hook
  }

  protected didSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoView: GeoLineView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetStrokeWidth !== void 0) {
        controllerObserver.controllerDidSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  /** @hidden */
  static GetFastener = ControllerViewTrait.define<GeoLineController, GeoLineView, GeoLineTrait>({
    viewType: GeoLineView,
    observeView: true,
    willSetView(newGeoView: GeoLineView | null, oldGeoView: GeoLineView | null): void {
      this.owner.willSetGeoView(newGeoView, oldGeoView);
    },
    onSetView(newGeoView: GeoLineView | null, oldGeoView: GeoLineView | null): void {
      this.owner.onSetGeoView(newGeoView, oldGeoView);
    },
    didSetView(newGeoView: GeoLineView | null, oldGeoView: GeoLineView | null): void {
      this.owner.didSetGeoView(newGeoView, oldGeoView);
    },
    viewWillSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoView: GeoLineView): void {
      this.owner.willSetGeoPath(newGeoPath, oldGeoPath, geoView);
    },
    viewDidSetGeoPath(newGeoPath: GeoPath | null, oldGeoPath: GeoPath | null, geoView: GeoLineView): void {
      this.owner.onSetGeoPath(newGeoPath, oldGeoPath, geoView);
      this.owner.didSetGeoPath(newGeoPath, oldGeoPath, geoView);
    },
    viewWillSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoView: GeoLineView): void {
      this.owner.willSetStroke(newStroke, oldStroke, geoView);
    },
    viewDidSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, geoView: GeoLineView): void {
      this.owner.onSetStroke(newStroke, oldStroke, geoView);
      this.owner.didSetStroke(newStroke, oldStroke, geoView);
    },
    viewWillSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoView: GeoLineView): void {
      this.owner.willSetStrokeWidth(newStrokeWidth, oldStrokeWidth, geoView);
    },
    viewDidSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, geoView: GeoLineView): void {
      this.owner.onSetStrokeWidth(newStrokeWidth, oldStrokeWidth, geoView);
      this.owner.didSetStrokeWidth(newStrokeWidth, oldStrokeWidth, geoView);
    },
    createView(): GeoLineView | null {
      return this.owner.createGeoView();
    },
    traitType: GeoLineTrait,
    observeTrait: true,
    willSetTrait(newGeoTrait: GeoLineTrait | null, oldGeoTrait: GeoLineTrait | null): void {
      this.owner.willSetGeoTrait(newGeoTrait, oldGeoTrait);
    },
    onSetTrait(newGeoTrait: GeoLineTrait | null, oldGeoTrait: GeoLineTrait | null): void {
      this.owner.onSetGeoTrait(newGeoTrait, oldGeoTrait);
    },
    didSetTrait(newGeoTrait: GeoLineTrait | null, oldGeoTrait: GeoLineTrait | null): void {
      this.owner.didSetGeoTrait(newGeoTrait, oldGeoTrait);
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
  });

  @ControllerViewTrait<GeoLineController, GeoLineView, GeoLineTrait>({
    extends: GeoLineController.GetFastener,
  })
  readonly geo!: ControllerViewTrait<this, GeoLineView, GeoLineTrait>;
}
