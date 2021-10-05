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

import type {Class} from "@swim/util";
import type {GeoBox} from "@swim/geo";
import type {Trait} from "@swim/model";
import {ControllerFastener, TraitViewFastener, Controller} from "@swim/controller";
import type {GeoViewContext} from "../geo/GeoViewContext";
import {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import {GeoController} from "../geo/GeoController";
import {GeoTreeView} from "../tree/GeoTreeView";
import {GeoLayerTrait} from "./GeoLayerTrait";
import type {GeoLayerControllerObserver} from "./GeoLayerControllerObserver";

export class GeoLayerController extends GeoController {
  constructor() {
    super();
    this.featureFasteners = [];
  }

  override readonly observerType?: Class<GeoLayerControllerObserver>;

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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetGeoTrait !== void 0) {
        observer.controllerWillSetGeoTrait(newGeoTrait, oldGeoTrait, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetGeoTrait !== void 0) {
        observer.controllerDidSetGeoTrait(newGeoTrait, oldGeoTrait, this);
      }
    }
  }

  protected willSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetGeoBounds !== void 0) {
        observer.controllerWillSetGeoBounds(newGeoBounds, oldGeoBounds, this);
      }
    }
  }

  protected onSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    // hook
  }

  protected didSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetGeoBounds !== void 0) {
        observer.controllerDidSetGeoBounds(newGeoBounds, oldGeoBounds, this);
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
        if (featureView !== null && featureView.parent === null) {
          featureController.geo.injectView(geoView);
        }
      }
    }
  }

  protected detachGeoView(geoView: GeoView): void {
    // hook
  }

  protected willSetGeoView(newGeoView: GeoView | null, oldGeoView: GeoView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetGeoView !== void 0) {
        observer.controllerWillSetGeoView(newGeoView, oldGeoView, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetGeoView !== void 0) {
        observer.controllerDidSetGeoView(newGeoView, oldGeoView, this);
      }
    }
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

  /** @internal */
  static GeoFastener = TraitViewFastener.define<GeoLayerController, GeoLayerTrait, GeoView>({
    traitType: GeoLayerTrait,
    observesTrait: true,
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
    viewType: GeoView,
    observesView: true,
    willSetView(newGeoView: GeoView | null, oldGeoView: GeoView | null): void {
      this.owner.willSetGeoView(newGeoView, oldGeoView);
    },
    onSetView(newGeoView: GeoView | null, oldGeoView: GeoView | null): void {
      this.owner.onSetGeoView(newGeoView, oldGeoView);
    },
    didSetView(newGeoView: GeoView | null, oldGeoView: GeoView | null): void {
      this.owner.didSetGeoView(newGeoView, oldGeoView);
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
  });

  @TraitViewFastener<GeoLayerController, GeoLayerTrait, GeoView>({
    extends: GeoLayerController.GeoFastener,
  })
  readonly geo!: TraitViewFastener<this, GeoLayerTrait, GeoView>;

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
    if (this.mounted) {
      featureFastener.mount();
    }
  }

  removeFeature(featureController: GeoController): void {
    const featureFasteners = this.featureFasteners as ControllerFastener<this, GeoController>[];
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureFastener = featureFasteners[i]!;
      if (featureFastener.controller === featureController) {
        featureFastener.setController(null);
        if (this.mounted) {
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetFeature !== void 0) {
        observer.controllerWillSetFeature(newFeatureController, oldFeatureController, featureFastener);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetFeature !== void 0) {
        observer.controllerDidSetFeature(newFeatureController, oldFeatureController, featureFastener);
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
      this.insertChild(featureController, targetController);
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
        if (this.mounted) {
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetFeatureTrait !== void 0) {
        observer.controllerWillSetFeatureTrait(newFeatureTrait, oldFeatureTrait, featureFastener);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetFeatureTrait !== void 0) {
        observer.controllerDidSetFeatureTrait(newFeatureTrait, oldFeatureTrait, featureFastener);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetFeatureView !== void 0) {
        observer.controllerWillSetFeatureView(newFeatureView, oldFeatureView, featureFastener);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetFeatureView !== void 0) {
        observer.controllerDidSetFeatureView(newFeatureView, oldFeatureView, featureFastener);
      }
    }
  }

  protected willSetFeatureGeoBounds(newFeatureGeoBounds: GeoBox, oldFeatureGeoBounds: GeoBox,
                                    featureFastener: ControllerFastener<this, GeoController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetFeatureGeoBounds !== void 0) {
        observer.controllerWillSetFeatureGeoBounds(newFeatureGeoBounds, oldFeatureGeoBounds, featureFastener);
      }
    }
  }

  protected onSetFeatureGeoBounds(newFeatureGeoBounds: GeoBox, oldFeatureGeoBounds: GeoBox,
                                  featureFastener: ControllerFastener<this, GeoController>): void {
    // hook
  }

  protected didSetFeatureGeoBounds(newFeatureGeoBounds: GeoBox, oldFeatureGeoBounds: GeoBox,
                                   featureFastener: ControllerFastener<this, GeoController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetFeatureGeoBounds !== void 0) {
        observer.controllerDidSetFeatureGeoBounds(newFeatureGeoBounds, oldFeatureGeoBounds, featureFastener);
      }
    }
  }

  /** @internal */
  static FeatureFastener = ControllerFastener.define<GeoLayerController, GeoController>({
    type: GeoController,
    child: false,
    observes: true,
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
    return GeoLayerController.FeatureFastener.create(this, featureController.key ?? "feature");
  }

  /** @internal */
  readonly featureFasteners: ReadonlyArray<ControllerFastener<this, GeoController>>;

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

  /** @internal */
  protected mountFeatureFasteners(): void {
    const featureFasteners = this.featureFasteners;
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureFastener = featureFasteners[i]!;
      featureFastener.mount();
    }
  }

  /** @internal */
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

  protected override onInsertChild(childController: Controller, targetController: Controller | null): void {
    super.onInsertChild(childController, targetController);
    this.detectInsertChildController(childController, targetController);
  }

  protected detectRemoveChildController(childController: Controller): void {
    const featureController = this.detectFeatureController(childController);
    if (featureController !== null) {
      this.removeFeature(featureController);
    }
  }

  protected override onRemoveChild(childController: Controller): void {
    super.onRemoveChild(childController);
    this.detectRemoveChildController(childController);
  }

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountFeatureFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountFeatureFasteners();
    super.unmountFasteners();
  }
}
