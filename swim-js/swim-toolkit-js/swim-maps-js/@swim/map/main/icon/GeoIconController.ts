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
import {TraitViewFastener} from "@swim/controller";
import {GeoController} from "../geo/GeoController";
import {GeoIconView} from "./GeoIconView";
import {GeoIconTrait} from "./GeoIconTrait";
import type {GeoIconControllerObserver} from "./GeoIconControllerObserver";

export class GeoIconController extends GeoController {
  override readonly observerType?: Class<GeoIconControllerObserver>;

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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetGeoTrait !== void 0) {
        observer.controllerWillSetGeoTrait(newGeoTrait, oldGeoTrait, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetGeoTrait !== void 0) {
        observer.controllerDidSetGeoTrait(newGeoTrait, oldGeoTrait, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetGeoView !== void 0) {
        observer.controllerWillSetGeoView(newGeoView, oldGeoView, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetGeoView !== void 0) {
        observer.controllerDidSetGeoView(newGeoView, oldGeoView, this);
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
      geoView.geoCenter.setState(geoCenter, timing, Affinity.Intrinsic);
    }
  }

  protected willSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null, geoView: GeoIconView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetGeoCenter !== void 0) {
        observer.controllerWillSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
    }
  }

  protected onSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null, geoView: GeoIconView): void {
    // hook
  }

  protected didSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null, geoView: GeoIconView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetGeoCenter !== void 0) {
        observer.controllerDidSetGeoCenter(newGeoCenter, oldGeoCenter, this);
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

  protected willSetIconLayout(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null, geoView: GeoIconView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetIconLayout !== void 0) {
        observer.controllerWillSetIconLayout(newIconLayout, oldIconLayout, this);
      }
    }
  }

  protected onSetIconLayout(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null, geoView: GeoIconView): void {
    // hook
  }

  protected didSetIconLayout(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null, geoView: GeoIconView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetIconLayout !== void 0) {
        observer.controllerDidSetIconLayout(newIconLayout, oldIconLayout, this);
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

  protected willSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null, geoView: GeoIconView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetGraphics !== void 0) {
        observer.controllerWillSetGraphics(newGraphics, oldGraphics, this);
      }
    }
  }

  protected onSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null, geoView: GeoIconView): void {
    // hook
  }

  protected didSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null, geoView: GeoIconView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetGraphics !== void 0) {
        observer.controllerDidSetGraphics(newGraphics, oldGraphics, this);
      }
    }
  }

  /** @internal */
  static GetFastener = TraitViewFastener.define<GeoIconController, GeoIconTrait, GeoIconView>({
    traitType: GeoIconTrait,
    observesTrait: true,
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
    viewType: GeoIconView,
    observesView: true,
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
  });

  @TraitViewFastener<GeoIconController, GeoIconTrait, GeoIconView>({
    extends: GeoIconController.GetFastener,
  })
  readonly geo!: TraitViewFastener<this, GeoIconTrait, GeoIconView>;
}
