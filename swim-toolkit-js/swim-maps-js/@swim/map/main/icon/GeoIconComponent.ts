// Copyright 2015-2020 Swim inc.
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
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {View} from "@swim/view";
import type {Graphics, IconLayout} from "@swim/graphics";
import {ComponentViewTrait} from "@swim/component";
import {GeoComponent} from "../geo/GeoComponent";
import {GeoIconView} from "./GeoIconView";
import {GeoIconTrait} from "./GeoIconTrait";
import type {GeoIconComponentObserver} from "./GeoIconComponentObserver";

export class GeoIconComponent extends GeoComponent {
  declare readonly componentObservers: ReadonlyArray<GeoIconComponentObserver>;

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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetGeoTrait !== void 0) {
        componentObserver.componentWillSetGeoTrait(newGeoTrait, oldGeoTrait, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetGeoTrait !== void 0) {
        componentObserver.componentDidSetGeoTrait(newGeoTrait, oldGeoTrait, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetGeoView !== void 0) {
        componentObserver.componentWillSetGeoView(newGeoView, oldGeoView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetGeoView !== void 0) {
        componentObserver.componentDidSetGeoView(newGeoView, oldGeoView, this);
      }
    }
  }

  protected themeGeoView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, geoView: GeoIconView): void {
    // hook
  }

  protected setGeoCenter(geoCenter: GeoPoint, geoTrait: GeoIconTrait, timing?: AnyTiming | boolean): void {
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

  protected willSetGeoCenter(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint, geoView: GeoIconView): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetGeoCenter !== void 0) {
        componentObserver.componentWillSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
    }
  }

  protected onSetGeoCenter(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint, geoView: GeoIconView): void {
    // hook
  }

  protected didSetGeoCenter(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint, geoView: GeoIconView): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetGeoCenter !== void 0) {
        componentObserver.componentDidSetGeoCenter(newGeoCenter, oldGeoCenter, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetIconLayout !== void 0) {
        componentObserver.componentWillSetIconLayout(newIconLayout, oldIconLayout, this);
      }
    }
  }

  protected onSetIconLayout(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null, geoView: GeoIconView): void {
    // hook
  }

  protected didSetIconLayout(newIconLayout: IconLayout | null, oldIconLayout: IconLayout | null, geoView: GeoIconView): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetIconLayout !== void 0) {
        componentObserver.componentDidSetIconLayout(newIconLayout, oldIconLayout, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetGraphics !== void 0) {
        componentObserver.componentWillSetGraphics(newGraphics, oldGraphics, this);
      }
    }
  }

  protected onSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null, geoView: GeoIconView): void {
    // hook
  }

  protected didSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null, geoView: GeoIconView): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetGraphics !== void 0) {
        componentObserver.componentDidSetGraphics(newGraphics, oldGraphics, this);
      }
    }
  }

  /** @hidden */
  static GetFastener = ComponentViewTrait.define<GeoIconComponent, GeoIconView, GeoIconTrait>({
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
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, geoView: GeoIconView): void {
      this.owner.themeGeoView(theme, mood, timing, geoView);
    },
    viewWillSetGeoCenter(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint, geoView: GeoIconView): void {
      this.owner.willSetGeoCenter(newGeoCenter, oldGeoCenter, geoView);
    },
    viewDidSetGeoCenter(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint, geoView: GeoIconView): void {
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
    traitDidSetGeoCenter(newGeoCenter: GeoPoint, oldGeoCenter: GeoPoint, geoTrait: GeoIconTrait): void {
      this.owner.setGeoCenter(newGeoCenter, geoTrait);
    },
    traitDidSetIconLayout(newIconLayout: IconLayout, oldIconLayout: IconLayout, geoTrait: GeoIconTrait): void {
      this.owner.setIconLayout(newIconLayout, geoTrait);
    },
    traitDidSetGraphics(newGraphics: Graphics | null, oldGraphics: Graphics | null, geoTrait: GeoIconTrait): void {
      this.owner.setGraphics(newGraphics, geoTrait);
    },
  });

  @ComponentViewTrait<GeoIconComponent, GeoIconView, GeoIconTrait>({
    extends: GeoIconComponent.GetFastener,
  })
  declare geo: ComponentViewTrait<this, GeoIconView, GeoIconTrait>;
}
