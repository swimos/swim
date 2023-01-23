// Copyright 2015-2023 Swim.inc
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

import type {Class, Observes} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import type {GeoBox} from "@swim/geo";
import type {Trait} from "@swim/model";
import {TraitViewRef, TraitViewControllerSet} from "@swim/controller";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import {GeoController} from "../geo/GeoController";
import {GeoTreeView} from "../tree/GeoTreeView";
import {GeoLayerTrait} from "./GeoLayerTrait";
import type {GeoLayerControllerObserver} from "./GeoLayerControllerObserver";

/** @public */
export class GeoLayerController extends GeoController {
  override readonly observerType?: Class<GeoLayerControllerObserver>;

  @TraitViewRef<GeoLayerController["geo"]>({
    traitType: GeoLayerTrait,
    observesTrait: true,
    willAttachTrait(geoTrait: GeoLayerTrait): void {
      this.owner.callObservers("controllerWillAttachGeoTrait", geoTrait, this.owner);
    },
    didAttachTrait(geoTrait: GeoLayerTrait): void {
      this.owner.features.addTraits(geoTrait.features.traits);
    },
    willDetachTrait(geoTrait: GeoLayerTrait): void {
      this.owner.features.deleteTraits(geoTrait.features.traits);
    },
    didDetachTrait(geoTrait: GeoLayerTrait): void {
      this.owner.callObservers("controllerDidDetachGeoTrait", geoTrait, this.owner);
    },
    traitWillSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
      this.owner.callObservers("controllerWillSetGeoBounds", newGeoBounds, oldGeoBounds, this.owner);
    },
    traitDidSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
      this.owner.callObservers("controllerDidSetGeoBounds", newGeoBounds, oldGeoBounds, this.owner);
    },
    traitWillAttachFeature(featureTrait: GeoTrait, targetTrait: Trait | null): void {
      this.owner.features.addTrait(featureTrait, targetTrait);
    },
    traitDidDetachFeature(featureTrait: GeoTrait): void {
      this.owner.features.deleteTrait(featureTrait);
    },
    viewType: GeoTreeView,
    willAttachView(geoView: GeoView): void {
      this.owner.callObservers("controllerWillAttachGeoView", geoView, this.owner);
    },
    didAttachView(geoView: GeoView): void {
      const featureControllers = this.owner.features.controllers;
      for (const controllerId in featureControllers) {
        const featureController = featureControllers[controllerId]!;
        const featureView = featureController.geo.view;
        if (featureView !== null && featureView.parent === null) {
          featureController.geo.insertView(geoView);
        }
      }
    },
    didDetachView(geoView: GeoView): void {
      this.owner.callObservers("controllerDidDetachGeoView", geoView, this.owner);
    },
  })
  readonly geo!: TraitViewRef<this, GeoLayerTrait, GeoView> & Observes<GeoLayerTrait>;
  static readonly geo: FastenerClass<GeoLayerController["geo"]>;

  @TraitViewControllerSet<GeoLayerController["features"]>({
    controllerType: GeoController,
    binds: true,
    observes: true,
    get parentView(): GeoView | null {
      return this.owner.geo.view;
    },
    getTraitViewRef(featureController: GeoController): TraitViewRef<unknown, GeoTrait, GeoView> {
      return featureController.geo;
    },
    willAttachController(featureController: GeoController): void {
      this.owner.callObservers("controllerWillAttachFeature", featureController, this.owner);
    },
    didAttachController(featureController: GeoController): void {
      const featureTrait = featureController.geo.trait;
      if (featureTrait !== null) {
        this.attachFeatureTrait(featureTrait, featureController);
      }
      const featureView = featureController.geo.view;
      if (featureView !== null) {
        this.attachFeatureView(featureView, featureController);
      }
    },
    willDetachController(featureController: GeoController): void {
      const featureView = featureController.geo.view;
      if (featureView !== null) {
        this.detachFeatureView(featureView, featureController);
      }
      const featureTrait = featureController.geo.trait;
      if (featureTrait !== null) {
        this.detachFeatureTrait(featureTrait, featureController);
      }
    },
    didDetachController(featureController: GeoController): void {
      this.owner.callObservers("controllerDidDetachFeature", featureController, this.owner);
    },
    controllerWillAttachGeoTrait(featureTrait: GeoTrait, featureController: GeoController): void {
      this.owner.callObservers("controllerWillAttachFeatureTrait", featureTrait, featureController, this.owner);
      this.attachFeatureTrait(featureTrait, featureController);
    },
    controllerDidDetachGeoTrait(featureTrait: GeoTrait, featureController: GeoController): void {
      this.detachFeatureTrait(featureTrait, featureController);
      this.owner.callObservers("controllerDidDetachFeatureTrait", featureTrait, featureController, this.owner);
    },
    attachFeatureTrait(featureTrait: GeoTrait, featureController: GeoController): void {
      // hook
    },
    detachFeatureTrait(featureTrait: GeoTrait, featureController: GeoController): void {
      // hook
    },
    controllerWillAttachGeoView(featureView: GeoView, featureController: GeoController): void {
      this.owner.callObservers("controllerWillAttachFeatureView", featureView, featureController, this.owner);
      this.attachFeatureView(featureView, featureController);
    },
    controllerDidDetachGeoView(featureView: GeoView, featureController: GeoController): void {
      this.detachFeatureView(featureView, featureController);
      this.owner.callObservers("controllerDidDetachFeatureView", featureView, featureController, this.owner);
    },
    attachFeatureView(featureView: GeoView, featureController: GeoController): void {
      // hook
    },
    detachFeatureView(featureView: GeoView, featureController: GeoController): void {
      featureView.remove();
    },
    controllerWillSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, featureController: GeoController): void {
      this.owner.callObservers("controllerWillSetFeatureGeoBounds", newGeoBounds, oldGeoBounds, featureController, this.owner);
    },
    controllerDidSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, featureController: GeoController): void {
      this.owner.callObservers("controllerDidSetFeatureGeoBounds", newGeoBounds, oldGeoBounds, featureController, this.owner);
    },
    createController(featureTrait?: GeoTrait): GeoController {
      if (featureTrait !== void 0) {
        return featureTrait.createGeoController();
      } else {
        return TraitViewControllerSet.prototype.createController.call(this);
      }
    },
  })
  readonly features!: TraitViewControllerSet<this, GeoTrait, GeoView, GeoController> & Observes<GeoController> & {
    attachFeatureTrait(featureTrait: GeoTrait, featureController: GeoController): void,
    detachFeatureTrait(featureTrait: GeoTrait, featureController: GeoController): void,
    attachFeatureView(featureView: GeoView, featureController: GeoController): void,
    detachFeatureView(featureView: GeoView, featureController: GeoController): void,
  };
  static readonly features: FastenerClass<GeoLayerController["features"]>;
}
