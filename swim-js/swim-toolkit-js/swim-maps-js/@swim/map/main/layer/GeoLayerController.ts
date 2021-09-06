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

import type {Timing} from "@swim/mapping";
import type {GeoBox} from "@swim/geo";
import type {Trait} from "@swim/model";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import {Controller, ControllerViewTrait, ControllerFastener} from "@swim/controller";
import type {GeoViewContext} from "../geo/GeoViewContext";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import {GeoController} from "../geo/GeoController";
import {GeoTreeView} from "../tree/GeoTreeView";
import {GeoLayerTrait} from "./GeoLayerTrait";
import type {GeoLayerControllerObserver} from "./GeoLayerControllerObserver";

export class GeoLayerController extends GeoController {
  constructor() {
    super();
    Object.defineProperty(this, "featureFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly controllerObservers!: ReadonlyArray<GeoLayerControllerObserver>;

  protected initGeoTrait(geoTrait: GeoLayerTrait): void {
    // hook
  }

  protected attachGeoTrait(geoTrait: GeoLayerTrait): void {
    const featureFasteners = geoTrait.featureFasteners;
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureTrait = featureFasteners[i]!.trait;
      if (featureTrait !== null) {
        this.insertFeatureTrait(featureTrait);
      }
    }
  }

  protected detachGeoTrait(geoTrait: GeoLayerTrait): void {
    const featureFasteners = geoTrait.featureFasteners;
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureTrait = featureFasteners[i]!.trait;
      if (featureTrait !== null) {
        this.removeFeatureTrait(featureTrait);
      }
    }
  }

  protected willSetGeoTrait(newGeoTrait: GeoLayerTrait | null, oldGeoTrait: GeoLayerTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGeoTrait !== void 0) {
        controllerObserver.controllerWillSetGeoTrait(newGeoTrait, oldGeoTrait, this);
      }
    }
  }

  protected onSetGeoTrait(newGeoTrait: GeoLayerTrait | null, oldGeoTrait: GeoLayerTrait | null): void {
    if (oldGeoTrait !== null) {
      this.detachGeoTrait(oldGeoTrait);
    }
    if (newGeoTrait !== null) {
      this.attachGeoTrait(newGeoTrait);
      this.initGeoTrait(newGeoTrait);
    }
  }

  protected didSetGeoTrait(newGeoTrait: GeoLayerTrait | null, oldGeoTrait: GeoLayerTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGeoTrait !== void 0) {
        controllerObserver.controllerDidSetGeoTrait(newGeoTrait, oldGeoTrait, this);
      }
    }
  }

  protected willSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGeoBounds !== void 0) {
        controllerObserver.controllerWillSetGeoBounds(newGeoBounds, oldGeoBounds, this);
      }
    }
  }

  protected onSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    // hook
  }

  protected didSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGeoBounds !== void 0) {
        controllerObserver.controllerDidSetGeoBounds(newGeoBounds, oldGeoBounds, this);
      }
    }
  }

  protected createGeoView(): GeoView | null {
    return GeoTreeView.create();
  }

  protected initGeoView(geoView: GeoView): void {
    // hook
  }

  protected attachGeoView(geoView: GeoView): void {
    const featureFasteners = this.featureFasteners;
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureController = featureFasteners[i]!.controller;
      if (featureController !== null) {
        const featureView = featureController.geo.view;
        if (featureView !== null && featureView.parentView === null) {
          featureController.geo.injectView(geoView);
        }
      }
    }
  }

  protected detachGeoView(geoView: GeoView): void {
    // hook
  }

  protected willSetGeoView(newGeoView: GeoView | null, oldGeoView: GeoView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGeoView !== void 0) {
        controllerObserver.controllerWillSetGeoView(newGeoView, oldGeoView, this);
      }
    }
  }

  protected onSetGeoView(newGeoView: GeoView | null, oldGeoView: GeoView | null): void {
    if (oldGeoView !== null) {
      this.detachGeoView(oldGeoView);
    }
    if (newGeoView !== null) {
      this.attachGeoView(newGeoView);
      this.initGeoView(newGeoView);
    }
  }

  protected didSetGeoView(newGeoView: GeoView | null, oldGeoView: GeoView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGeoView !== void 0) {
        controllerObserver.controllerDidSetGeoView(newGeoView, oldGeoView, this);
      }
    }
  }

  protected themeGeoView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, geoView: GeoView): void {
    // hook
  }

  protected projectGeoView(viewContext: GeoViewContext, geoView: GeoView): void {
    // hook
  }

  protected cullGeoView(geoView: GeoView): void {
    // hook
  }

  protected uncullGeoView(geoView: GeoView): void {
    // hook
  }

  /** @hidden */
  static GeoFastener = ControllerViewTrait.define<GeoLayerController, GeoView, GeoLayerTrait>({
    observeView: true,
    willSetView(newGeoView: GeoView | null, oldGeoView: GeoView | null): void {
      this.owner.willSetGeoView(newGeoView, oldGeoView);
    },
    onSetView(newGeoView: GeoView | null, oldGeoView: GeoView | null): void {
      this.owner.onSetGeoView(newGeoView, oldGeoView);
    },
    didSetView(newGeoView: GeoView | null, oldGeoView: GeoView | null): void {
      this.owner.didSetGeoView(newGeoView, oldGeoView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, geoView: GeoView): void {
      this.owner.themeGeoView(theme, mood, timing, geoView);
    },
    viewWillProject(viewContext: GeoViewContext, geoView: GeoView): void {
      this.owner.projectGeoView(viewContext, geoView);
    },
    viewDidCull(geoView: GeoView): void {
      this.owner.cullGeoView(geoView);
    },
    viewWillUncull(geoView: GeoView): void {
      this.owner.uncullGeoView(geoView);
    },
    createView(): GeoView | null {
      return this.owner.createGeoView();
    },
    traitType: GeoLayerTrait,
    observeTrait: true,
    willSetTrait(newGeoTrait: GeoLayerTrait | null, oldGeoTrait: GeoLayerTrait | null): void {
      this.owner.willSetGeoTrait(newGeoTrait, oldGeoTrait);
    },
    onSetTrait(newGeoTrait: GeoLayerTrait | null, oldGeoTrait: GeoLayerTrait | null): void {
      this.owner.onSetGeoTrait(newGeoTrait, oldGeoTrait);
    },
    didSetTrait(newGeoTrait: GeoLayerTrait | null, oldGeoTrait: GeoLayerTrait | null): void {
      this.owner.didSetGeoTrait(newGeoTrait, oldGeoTrait);
    },
    traitWillSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
      this.owner.willSetGeoBounds(newGeoBounds, oldGeoBounds);
    },
    traitDidSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
      this.owner.onSetGeoBounds(newGeoBounds, oldGeoBounds);
      this.owner.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    },
    traitWillSetFeature(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null, targetTrait: Trait): void {
      if (oldFeatureTrait !== null) {
        this.owner.removeFeatureTrait(oldFeatureTrait);
      }
    },
    traitDidSetFeature(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null, targetTrait: Trait): void {
      if (newFeatureTrait !== null) {
        this.owner.insertFeatureTrait(newFeatureTrait, targetTrait);
      }
    },
  });

  @ControllerViewTrait<GeoLayerController, GeoView, GeoLayerTrait>({
    extends: GeoLayerController.GeoFastener,
  })
  readonly geo!: ControllerViewTrait<this, GeoView, GeoLayerTrait>;

  insertFeature(featureController: GeoController, targetController: Controller | null = null): void {
    const featureFasteners = this.featureFasteners as ControllerFastener<this, GeoController>[];
    let targetIndex = featureFasteners.length;
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureFastener = featureFasteners[i]!;
      if (featureFastener.controller === featureController) {
        return;
      } else if (featureFastener.controller === targetController) {
        targetIndex = i;
      }
    }
    const featureFastener = this.createFeatureFastener(featureController);
    featureFasteners.splice(targetIndex, 0, featureFastener);
    featureFastener.setController(featureController, targetController);
    if (this.isMounted()) {
      featureFastener.mount();
    }
  }

  removeFeature(featureController: GeoController): void {
    const featureFasteners = this.featureFasteners as ControllerFastener<this, GeoController>[];
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureFastener = featureFasteners[i]!;
      if (featureFastener.controller === featureController) {
        featureFastener.setController(null);
        if (this.isMounted()) {
          featureFastener.unmount();
        }
        featureFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createFeature(featureTrait: GeoTrait): GeoController | null {
    return GeoController.fromTrait(featureTrait);
  }

  protected initFeature(featureController: GeoController, featureFastener: ControllerFastener<this, GeoController>): void {
    const featureTrait = featureController.geo.trait;
    if (featureTrait !== null) {
      this.initFeatureTrait(featureTrait, featureFastener);
    }
    const featureView = featureController.geo.view;
    if (featureView !== null) {
      this.initFeatureView(featureView, featureFastener);
    }
  }

  protected attachFeature(featureController: GeoController, featureFastener: ControllerFastener<this, GeoController>): void {
    const featureTrait = featureController.geo.trait;
    if (featureTrait !== null) {
      this.attachFeatureTrait(featureTrait, featureFastener);
    }
    const featureView = featureController.geo.view;
    if (featureView !== null) {
      this.attachFeatureView(featureView, featureFastener);
    }
  }

  protected detachFeature(featureController: GeoController, featureFastener: ControllerFastener<this, GeoController>): void {
    const featureView = featureController.geo.view;
    if (featureView !== null) {
      this.detachFeatureView(featureView, featureFastener);
    }
    const featureTrait = featureController.geo.trait;
    if (featureTrait !== null) {
      this.detachFeatureTrait(featureTrait, featureFastener);
    }
  }

  protected willSetFeature(newFeatureController: GeoController | null, oldFeatureController: GeoController | null,
                           featureFastener: ControllerFastener<this, GeoController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetFeature !== void 0) {
        controllerObserver.controllerWillSetFeature(newFeatureController, oldFeatureController, featureFastener);
      }
    }
  }

  protected onSetFeature(newFeatureController: GeoController | null, oldFeatureController: GeoController | null,
                         featureFastener: ControllerFastener<this, GeoController>): void {
    if (oldFeatureController !== null) {
      this.detachFeature(oldFeatureController, featureFastener);
    }
    if (newFeatureController !== null) {
      this.attachFeature(newFeatureController, featureFastener);
      this.initFeature(newFeatureController, featureFastener);
    }
  }

  protected didSetFeature(newFeatureController: GeoController | null, oldFeatureController: GeoController | null,
                          featureFastener: ControllerFastener<this, GeoController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetFeature !== void 0) {
        controllerObserver.controllerDidSetFeature(newFeatureController, oldFeatureController, featureFastener);
      }
    }
  }

  insertFeatureTrait(featureTrait: GeoTrait, targetTrait: Trait | null = null): void {
    const featureFasteners = this.featureFasteners as ControllerFastener<this, GeoController>[];
    let targetController: GeoController | null = null;
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureController = featureFasteners[i]!.controller;
      if (featureController !== null) {
        if (featureController.geo.trait === featureTrait) {
          return;
        } else if (featureController.geo.trait === targetTrait) {
          targetController = featureController;
        }
      }
    }
    const featureController = this.createFeature(featureTrait);
    if (featureController !== null) {
      featureController.geo.setTrait(featureTrait);
      this.insertChildController(featureController, targetController);
      if (featureController.geo.view === null) {
        const featureView = this.createFeatureView(featureController);
        let targetView: GeoView | null = null;
        if (targetController !== null) {
          targetView = targetController.geo.view;
        }
        const geoView = this.geo.view;
        if (geoView !== null) {
          featureController.geo.injectView(geoView, featureView, targetView, null);
        } else {
          featureController.geo.setView(featureView, targetView);
        }
      }
    }
  }

  removeFeatureTrait(featureTrait: GeoTrait): void {
    const featureFasteners = this.featureFasteners as ControllerFastener<this, GeoController>[];
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureFastener = featureFasteners[i]!;
      const featureController = featureFastener.controller;
      if (featureController !== null && featureController.geo.trait === featureTrait) {
        featureFastener.setController(null);
        if (this.isMounted()) {
          featureFastener.unmount();
        }
        featureFasteners.splice(i, 1);
        featureController.remove();
        return;
      }
    }
  }

  protected initFeatureTrait(featureTrait: GeoTrait, featureFastener: ControllerFastener<this, GeoController>): void {
    // hook
  }

  protected attachFeatureTrait(featureTrait: GeoTrait, featureFastener: ControllerFastener<this, GeoController>): void {
    // hook
  }

  protected detachFeatureTrait(featureTrait: GeoTrait, featureFastener: ControllerFastener<this, GeoController>): void {
    // hook
  }

  protected willSetFeatureTrait(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null,
                                featureFastener: ControllerFastener<this, GeoController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetFeatureTrait !== void 0) {
        controllerObserver.controllerWillSetFeatureTrait(newFeatureTrait, oldFeatureTrait, featureFastener);
      }
    }
  }

  protected onSetFeatureTrait(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null,
                              featureFastener: ControllerFastener<this, GeoController>): void {
    if (oldFeatureTrait !== null) {
      this.detachFeatureTrait(oldFeatureTrait, featureFastener);
    }
    if (newFeatureTrait !== null) {
      this.attachFeatureTrait(newFeatureTrait, featureFastener);
      this.initFeatureTrait(newFeatureTrait, featureFastener);
    }
  }

  protected didSetFeatureTrait(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null,
                               featureFastener: ControllerFastener<this, GeoController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetFeatureTrait !== void 0) {
        controllerObserver.controllerDidSetFeatureTrait(newFeatureTrait, oldFeatureTrait, featureFastener);
      }
    }
  }

  protected createFeatureView(featureController: GeoController): GeoView | null {
    return featureController.geo.createView();
  }

  protected initFeatureView(featureView: GeoView, featureFastener: ControllerFastener<this, GeoController>): void {
    // hook
  }

  protected attachFeatureView(featureView: GeoView, featureFastener: ControllerFastener<this, GeoController>): void {
    // hook
  }

  protected detachFeatureView(featureView: GeoView, featureFastener: ControllerFastener<this, GeoController>): void {
    featureView.remove();
  }

  protected willSetFeatureView(newFeatureView: GeoView | null, oldFeatureView: GeoView | null,
                               featureFastener: ControllerFastener<this, GeoController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetFeatureView !== void 0) {
        controllerObserver.controllerWillSetFeatureView(newFeatureView, oldFeatureView, featureFastener);
      }
    }
  }

  protected onSetFeatureView(newFeatureView: GeoView | null, oldFeatureView: GeoView | null,
                             featureFastener: ControllerFastener<this, GeoController>): void {
    if (oldFeatureView !== null) {
      this.detachFeatureView(oldFeatureView, featureFastener);
    }
    if (newFeatureView !== null) {
      this.attachFeatureView(newFeatureView, featureFastener);
      this.initFeatureView(newFeatureView, featureFastener);
    }
  }

  protected didSetFeatureView(newFeatureView: GeoView | null, oldFeatureView: GeoView | null,
                              featureFastener: ControllerFastener<this, GeoController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetFeatureView !== void 0) {
        controllerObserver.controllerDidSetFeatureView(newFeatureView, oldFeatureView, featureFastener);
      }
    }
  }

  protected willSetFeatureGeoBounds(newFeatureGeoBounds: GeoBox, oldFeatureGeoBounds: GeoBox,
                                    featureFastener: ControllerFastener<this, GeoController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetFeatureGeoBounds !== void 0) {
        controllerObserver.controllerWillSetFeatureGeoBounds(newFeatureGeoBounds, oldFeatureGeoBounds, featureFastener);
      }
    }
  }

  protected onSetFeatureGeoBounds(newFeatureGeoBounds: GeoBox, oldFeatureGeoBounds: GeoBox,
                                  featureFastener: ControllerFastener<this, GeoController>): void {
    // hook
  }

  protected didSetFeatureGeoBounds(newFeatureGeoBounds: GeoBox, oldFeatureGeoBounds: GeoBox,
                                   featureFastener: ControllerFastener<this, GeoController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetFeatureGeoBounds !== void 0) {
        controllerObserver.controllerDidSetFeatureGeoBounds(newFeatureGeoBounds, oldFeatureGeoBounds, featureFastener);
      }
    }
  }

  /** @hidden */
  static FeatureFastener = ControllerFastener.define<GeoLayerController, GeoController>({
    type: GeoController,
    child: false,
    observe: true,
    willSetController(newFeatureController: GeoController | null, oldFeatureController: GeoController | null): void {
      this.owner.willSetFeature(newFeatureController, oldFeatureController, this);
    },
    onSetController(newFeatureController: GeoController | null, oldFeatureController: GeoController | null): void {
      this.owner.onSetFeature(newFeatureController, oldFeatureController, this);
    },
    didSetController(newFeatureController: GeoController | null, oldFeatureController: GeoController | null): void {
      this.owner.didSetFeature(newFeatureController, oldFeatureController, this);
    },
    controllerWillSetGeoTrait(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null): void {
      this.owner.willSetFeatureTrait(newFeatureTrait, oldFeatureTrait, this);
    },
    controllerDidSetGeoTrait(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null): void {
      this.owner.onSetFeatureTrait(newFeatureTrait, oldFeatureTrait, this);
      this.owner.didSetFeatureTrait(newFeatureTrait, oldFeatureTrait, this);
    },
    controllerWillSetGeoView(newFeatureView: GeoView | null, oldFeatureView: GeoView | null): void {
      this.owner.willSetFeatureView(newFeatureView, oldFeatureView, this);
    },
    controllerDidSetGeoView(newFeatureView: GeoView | null, oldFeatureView: GeoView | null): void {
      this.owner.onSetFeatureView(newFeatureView, oldFeatureView, this);
      this.owner.didSetFeatureView(newFeatureView, oldFeatureView, this);
    },
    controllerWillSetGeoBounds(newFeatureGeoBounds: GeoBox, oldFeatureGeoBounds: GeoBox): void {
      this.owner.willSetFeatureGeoBounds(newFeatureGeoBounds, oldFeatureGeoBounds, this);
    },
    controllerDidSetGeoBounds(newFeatureGeoBounds: GeoBox, oldFeatureGeoBounds: GeoBox): void {
      this.owner.onSetFeatureGeoBounds(newFeatureGeoBounds, oldFeatureGeoBounds, this);
      this.owner.didSetFeatureGeoBounds(newFeatureGeoBounds, oldFeatureGeoBounds, this);
    },
  });

  protected createFeatureFastener(featureController: GeoController): ControllerFastener<this, GeoController> {
    return new GeoLayerController.FeatureFastener(this, featureController.key, "feature");
  }

  /** @hidden */
  readonly featureFasteners!: ReadonlyArray<ControllerFastener<this, GeoController>>;

  protected getFeatureFastener(featureTrait: GeoTrait): ControllerFastener<this, GeoController> | null {
    const featureFasteners = this.featureFasteners;
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureFastener = featureFasteners[i]!;
      const featureController = featureFastener.controller;
      if (featureController !== null && featureController.geo.trait === featureTrait) {
        return featureFastener;
      }
    }
    return null;
  }

  /** @hidden */
  protected mountFeatureFasteners(): void {
    const featureFasteners = this.featureFasteners;
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureFastener = featureFasteners[i]!;
      featureFastener.mount();
    }
  }

  /** @hidden */
  protected unmountFeatureFasteners(): void {
    const featureFasteners = this.featureFasteners;
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureFastener = featureFasteners[i]!;
      featureFastener.unmount();
    }
  }

  protected detectFeatureController(controller: Controller): GeoController | null {
    return controller instanceof GeoController ? controller : null;
  }

  protected detectInsertChildController(childController: Controller, targetController: Controller | null): void {
    const featureController = this.detectFeatureController(childController);
    if (featureController !== null) {
      this.insertFeature(featureController, targetController);
    }
  }

  protected override onInsertChildController(childController: Controller, targetController: Controller | null): void {
    super.onInsertChildController(childController, targetController);
    this.detectInsertChildController(childController, targetController);
  }

  protected detectRemoveChildController(childController: Controller): void {
    const featureController = this.detectFeatureController(childController);
    if (featureController !== null) {
      this.removeFeature(featureController);
    }
  }

  protected override onRemoveChildController(childController: Controller): void {
    super.onRemoveChildController(childController);
    this.detectRemoveChildController(childController);
  }

  /** @hidden */
  protected override mountControllerFasteners(): void {
    super.mountControllerFasteners();
    this.mountFeatureFasteners();
  }

  /** @hidden */
  protected override unmountControllerFasteners(): void {
    this.unmountFeatureFasteners();
    super.unmountControllerFasteners();
  }
}
