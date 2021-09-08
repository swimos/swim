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
import type {GeoPoint} from "@swim/geo";
import {Look, Mood} from "@swim/theme";
import {View} from "@swim/view";
import type {Graphics, IconLayout} from "@swim/graphics";
import {ControllerViewTrait} from "@swim/controller";
import {GeoController} from "../geo/GeoController";
import {GeoIconView} from "./GeoIconView";
import {GeoIconTrait} from "./GeoIconTrait";
import type {GeoIconControllerObserver} from "./GeoIconControllerObserver";

export class GeoIconController extends GeoController {
  override readonly controllerObservers!: ReadonlyArray<GeoIconControllerObserver>;

  protected initGeoTrait(geoTrait: GeoIconTrait): void {
    // hook
  }

  protected attachGeoTrait(geoTrait: GeoIconTrait): void {
    const geoView = this.geo.view;
    if (geoView !== null) {
      this.setGeoCenter(geoTrait.geoCenter.state, geoTrait);
      this.setIconLayout(geoTrait.iconLayout.state, geoTrait);
      this.setGraphics(geoTrait.graphics.state, geoTrait);
    }
  }

  protected detachGeoTrait(geoTrait: GeoIconTrait): void {
    // hook
  }

  protected willSetGeoTrait(newGeoTrait: GeoIconTrait | null, oldGeoTrait: GeoIconTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGeoTrait !== void 0) {
        controllerObserver.controllerWillSetGeoTrait(newGeoTrait, oldGeoTrait, this);
      }
    }
  }

  protected onSetGeoTrait(newGeoTrait: GeoIconTrait | null, oldGeoTrait: GeoIconTrait | null): void {
    if (oldGeoTrait !== null) {
      this.detachGeoTrait(oldGeoTrait);
    }
    if (newGeoTrait !== null) {
      this.attachGeoTrait(newGeoTrait);
      this.initGeoTrait(newGeoTrait);
    }
  }

  protected didSetGeoTrait(newGeoTrait: GeoIconTrait | null, oldGeoTrait: GeoIconTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGeoTrait !== void 0) {
        controllerObserver.controllerDidSetGeoTrait(newGeoTrait, oldGeoTrait, this);
      }
    }
  }

  protected createGeoView(): GeoIconView {
    return GeoIconView.create();
  }

  protected initGeoView(geoView: GeoIconView): void {
    // hook
  }

  protected attachGeoView(geoView: GeoIconView): void {
    const geoTrait = this.geo.trait;
    if (geoTrait !== null) {
      this.setGeoCenter(geoTrait.geoCenter.state, geoTrait);
      this.setIconLayout(geoTrait.iconLayout.state, geoTrait);
      this.setGraphics(geoTrait.graphics.state, geoTrait);
    }
  }

  protected detachGeoView(geoView: GeoIconView): void {
    // hook
  }

  protected willSetGeoView(newGeoView: GeoIconView | null, oldGeoView: GeoIconView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGeoView !== void 0) {
        controllerObserver.controllerWillSetGeoView(newGeoView, oldGeoView, this);
      }
    }
  }

  protected onSetGeoView(newGeoView: GeoIconView | null, oldGeoView: GeoIconView | null): void {
    if (oldGeoView !== null) {
      this.detachGeoView(oldGeoView);
    }
    if (newGeoView !== null) {
      this.attachGeoView(newGeoView);
      this.initGeoView(newGeoView);
    }
  }

  protected didSetGeoView(newGeoView: GeoIconView | null, oldGeoView: GeoIconView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGeoView !== void 0) {
        controllerObserver.controllerDidSetGeoView(newGeoView, oldGeoView, this);
      }
    }
  }

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
      geoView.geoCenter.setState(geoCenter, timing, View.Intrinsic);
    }
  }

  protected willSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null, geoView: GeoIconView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGeoCenter !== void 0) {
        controllerObserver.controllerWillSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
    }
  }

  protected onSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null, geoView: GeoIconView): void {
    // hook
  }

  protected didSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null, geoView: GeoIconView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGeoCenter !== void 0) {
        controllerObserver.controllerDidSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
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
      geoView.iconWidth.setState(iconLayout.iconWidth, timing, View.Intrinsic);
      geoView.iconHeight.setState(iconLayout.iconHeight, timing, View.Intrinsic);
      if (iconLayout.xAlign !== void 0) {
        geoView.xAlign.setState(iconLayout.xAlign, timing, View.Intrinsic);
      }
      if (iconLayout.yAlign !== void 0) {
        geoView.yAlign.setState(iconLayout.yAlign, timing, View.Intrinsic);
      }
    }
  }

  protected willSetIconLayout(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null, geoView: GeoIconView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetIconLayout !== void 0) {
        controllerObserver.controllerWillSetIconLayout(newIconLayout, oldIconLayout, this);
      }
    }
  }

  protected onSetIconLayout(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null, geoView: GeoIconView): void {
    // hook
  }

  protected didSetIconLayout(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null, geoView: GeoIconView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetIconLayout !== void 0) {
        controllerObserver.controllerDidSetIconLayout(newIconLayout, oldIconLayout, this);
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
      geoView.graphics.setState(graphics, timing, View.Intrinsic);
    }
  }

  protected willSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null, geoView: GeoIconView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGraphics !== void 0) {
        controllerObserver.controllerWillSetGraphics(newGraphics, oldGraphics, this);
      }
    }
  }

  protected onSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null, geoView: GeoIconView): void {
    // hook
  }

  protected didSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null, geoView: GeoIconView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGraphics !== void 0) {
        controllerObserver.controllerDidSetGraphics(newGraphics, oldGraphics, this);
      }
    }
  }

  /** @hidden */
  static GetFastener = ControllerViewTrait.define<GeoIconController, GeoIconView, GeoIconTrait>({
    viewType: GeoIconView,
    observeView: true,
    willSetView(newGeoView: GeoIconView | null, oldGeoView: GeoIconView | null): void {
      this.owner.willSetGeoView(newGeoView, oldGeoView);
    },
    onSetView(newGeoView: GeoIconView | null, oldGeoView: GeoIconView | null): void {
      this.owner.onSetGeoView(newGeoView, oldGeoView);
    },
    didSetView(newGeoView: GeoIconView | null, oldGeoView: GeoIconView | null): void {
      this.owner.didSetGeoView(newGeoView, oldGeoView);
    },
    viewWillSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null, geoView: GeoIconView): void {
      this.owner.willSetGeoCenter(newGeoCenter, oldGeoCenter, geoView);
    },
    viewDidSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null, geoView: GeoIconView): void {
      this.owner.onSetGeoCenter(newGeoCenter, oldGeoCenter, geoView);
      this.owner.didSetGeoCenter(newGeoCenter, oldGeoCenter, geoView);
    },
    viewWillSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null, geoView: GeoIconView): void {
      this.owner.willSetGraphics(newGraphics, oldGraphics, geoView);
    },
    viewDidSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null, geoView: GeoIconView): void {
      this.owner.onSetGraphics(newGraphics, oldGraphics, geoView);
      this.owner.didSetGraphics(newGraphics, oldGraphics, geoView);
    },
    createView(): GeoIconView | null {
      return this.owner.createGeoView();
    },
    traitType: GeoIconTrait,
    observeTrait: true,
    willSetTrait(newGeoTrait: GeoIconTrait | null, oldGeoTrait: GeoIconTrait | null): void {
      this.owner.willSetGeoTrait(newGeoTrait, oldGeoTrait);
    },
    onSetTrait(newGeoTrait: GeoIconTrait | null, oldGeoTrait: GeoIconTrait | null): void {
      this.owner.onSetGeoTrait(newGeoTrait, oldGeoTrait);
    },
    didSetTrait(newGeoTrait: GeoIconTrait | null, oldGeoTrait: GeoIconTrait | null): void {
      this.owner.didSetGeoTrait(newGeoTrait, oldGeoTrait);
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
  });

  @ControllerViewTrait<GeoIconController, GeoIconView, GeoIconTrait>({
    extends: GeoIconController.GetFastener,
  })
  readonly geo!: ControllerViewTrait<this, GeoIconView, GeoIconTrait>;
}
