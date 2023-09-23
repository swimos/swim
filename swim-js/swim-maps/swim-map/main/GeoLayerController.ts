// Copyright 2015-2023 Nstream, inc.
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
import type {Observes} from "@swim/util";
import type {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import type {Uri} from "@swim/uri";
import type {Trait} from "@swim/model";
import type {PositionGestureInput} from "@swim/view";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import type {GeoPerspective} from "./GeoPerspective";
import type {GeoViewport} from "./GeoViewport";
import type {GeoView} from "./GeoView";
import type {GeoControllerObserver} from "./GeoController";
import {GeoController} from "./GeoController";
import type {GeoFeatureView} from "./GeoFeatureView";
import type {GeoFeatureTrait} from "./GeoFeatureTrait";
import {GeoFeatureController} from "./GeoFeatureController";
import {GeoTreeView} from "./GeoTreeView";
import {GeoLayerTrait} from "./GeoLayerTrait";

/** @public */
export interface GeoLayerControllerObserver<C extends GeoLayerController = GeoLayerController> extends GeoControllerObserver<C> {
  controllerWillAttachGeoTrait?(geoTrait: GeoLayerTrait, controller: C): void;

  controllerDidDetachGeoTrait?(geoTrait: GeoLayerTrait, controller: C): void;

  controllerWillAttachLayer?(layerController: GeoLayerController, controller: C): void;

  controllerDidDetachLayer?(layerController: GeoLayerController, controller: C): void;

  controllerWillAttachLayerTrait?(layerTrait: GeoLayerTrait, layerController: GeoLayerController, controller: C): void;

  controllerDidDetachLayerTrait?(layerTrait: GeoLayerTrait, layerController: GeoLayerController, controller: C): void;

  controllerWillAttachLayerView?(layerView: GeoView, layerController: GeoLayerController, controller: C): void;

  controllerDidDetachLayerView?(layerView: GeoView, layerController: GeoLayerController, controller: C): void;

  controllerWillAttachFeature?(featureController: GeoFeatureController, controller: C): void;

  controllerDidDetachFeature?(featureController: GeoFeatureController, controller: C): void;

  controllerWillAttachFeatureTrait?(featureTrait: GeoFeatureTrait, featureController: GeoFeatureController, controller: C): void;

  controllerDidDetachFeatureTrait?(featureTrait: GeoFeatureTrait, featureController: GeoFeatureController, controller: C): void;

  controllerWillAttachFeatureView?(featureView: GeoFeatureView, featureController: GeoFeatureController, controller: C): void;

  controllerDidDetachFeatureView?(featureView: GeoFeatureView, featureController: GeoFeatureController, controller: C): void;

  controllerDidSetFeatureGeoPerspective?(geoPerspective: GeoPerspective | null, featureController: GeoFeatureController, controller: C): void;

  controllerDidEnterFeatureView?(featureView: GeoFeatureView, featureController: GeoFeatureController, controller: C): void;

  controllerDidLeaveFeatureView?(featureView: GeoFeatureView, featureController: GeoFeatureController, controller: C): void;

  controllerDidPressFeatureView?(input: PositionGestureInput, event: Event | null, featureView: GeoFeatureView, featureController: GeoFeatureController, controller: C): void;

  controllerDidLongPressFeatureView?(input: PositionGestureInput, featureView: GeoFeatureView, featureController: GeoFeatureController, controller: C): void;
}

/** @public */
export class GeoLayerController extends GeoController {
  declare readonly observerType?: Class<GeoLayerControllerObserver>;

  @Property({extends: true, inherits: false})
  override get nodeUri(): Property<this, Uri | null> {
    return Property.getter();
  }

  @Property({
    inherits: true,
    value: [0, Infinity],
    didSetValue(range: readonly [minZoom: number, maxZoom: number] | boolean): void {
      this.owner.visible.decohere();
    },
    setMin(minZoom: number, affinity?: Affinity): void {
      this.setValue([minZoom, this.value[1]], affinity);
    },
    setMax(maxZoom: number, affinity?: Affinity): void {
      this.setValue([this.value[0], maxZoom], affinity);
    },
  })
  get visibleRange(): Property<this, readonly [minZoom: number, maxZoom: number]> & {
    setMin(minZoom: number, affinity?: Affinity): void;
    setMax(maxZoom: number, affinity?: Affinity): void;
  } {
    return Property.getter();
  }

  @Property({
    inherits: true,
    value: [0, Infinity],
    didSetValue(range: readonly [minZoom: number, maxZoom: number] | boolean): void {
      this.owner.consumable.decohere();
    },
    setMin(minZoom: number, affinity?: Affinity): void {
      this.setValue([minZoom, this.value[1]], affinity);
    },
    setMax(maxZoom: number, affinity?: Affinity): void {
      this.setValue([this.value[0], maxZoom], affinity);
    },
  })
  get consumeRange(): Property<this, readonly [minZoom: number, maxZoom: number]> & {
    setMin(minZoom: number, affinity?: Affinity): void;
    setMax(maxZoom: number, affinity?: Affinity): void;
  } {
    return Property.getter();
  }

  @Property({
    valueType: Boolean,
    value: false,
    inletKeys: [],
    deriveValue(): boolean {
      let geoView: GeoView | null;
      let geoViewport: GeoViewport | null;
      if (!this.owner.mounted || (geoView = this.owner.geo.view) === null
          || (geoViewport = geoView.geoViewport.value) === null) {
        return false;
      }
      return geoViewport.geoFrame.intersects(geoView.geoBounds);
    },
  })
  readonly intersectsViewport!: Property<this, boolean>;

  @Property({
    valueType: Boolean,
    value: false,
    inletKeys: ["intersectsViewport"],
    deriveValue(intersectsViewport: boolean): boolean {
      let geoView: GeoView | null;
      let geoViewport: GeoViewport | null;
      if (!this.owner.mounted || (geoView = this.owner.geo.view) === null
          || (geoViewport = geoView.geoViewport.value) === null) {
        return false;
      }
      const [minVisibleZoom, ] = this.owner.visibleRange.value;
      return intersectsViewport
          && geoViewport.zoom >= minVisibleZoom;
    },
    didSetValue(visible: boolean): void {
      const geoView = this.owner.geo.view;
      if (geoView !== null) {
        geoView.setCulled(!visible);
      }
    }
  })
  readonly visible!: Property<this, boolean>;

  @Property({
    valueType: Boolean,
    value: false,
    inletKeys: ["intersectsViewport"],
    deriveValue(intersectsViewport: boolean): boolean {
      let geoView: GeoView | null;
      let geoViewport: GeoViewport | null;
      if (!this.owner.mounted || (geoView = this.owner.geo.view) === null
          || (geoViewport = geoView.geoViewport.value) === null) {
        return false;
      }
      const [minZoom, maxZoom] = this.owner.consumeRange.value;
      if (intersectsViewport && geoViewport.zoom >= maxZoom) {
        const geoTrait = this.owner.geo.trait;
        if (geoTrait !== null) {
          geoTrait.consumeLayers();
        }
        this.owner.consumeLayers();
      } else if (!intersectsViewport || geoViewport.zoom < minZoom) {
        const geoTrait = this.owner.geo.trait;
        if (geoTrait !== null) {
          geoTrait.unconsumeLayers();
        }
        this.owner.unconsumeLayers();
      }
      return intersectsViewport
          && geoViewport.zoom >= minZoom
          && geoViewport.zoom < maxZoom;
    },
    didSetValue(consumable: boolean): void {
      const geoView = this.owner.geo.view;
      if (geoView !== null) {
        if (consumable) {
          this.owner.consume(geoView);
        } else {
          this.owner.unconsume(geoView);
        }
      }
    }
  })
  readonly consumable!: Property<this, boolean>;

  @TraitViewRef({
    extends: true,
    consumed: true,
    traitType: GeoLayerTrait,
    observesTrait: true,
    initTrait(geoTrait: GeoLayerTrait): void {
      super.initTrait(geoTrait);
      this.owner.layers.addTraits(geoTrait.layers.traits);
      this.owner.features.addTraits(geoTrait.features.traits);
    },
    deinitTrait(geoTrait: GeoLayerTrait): void {
      this.owner.features.deleteTraits(geoTrait.features.traits);
      this.owner.layers.deleteTraits(geoTrait.layers.traits);
      super.deinitTrait(geoTrait);
    },
    traitWillAttachLayer(layerTrait: GeoLayerTrait, targetTrait: Trait): void {
      this.owner.layers.addTrait(layerTrait, targetTrait);
    },
    traitDidDetachLayer(layerTrait: GeoLayerTrait): void {
      this.owner.layers.deleteTrait(layerTrait);
    },
    traitWillAttachFeature(featureTrait: GeoFeatureTrait, targetTrait: Trait | null): void {
      this.owner.features.addTrait(featureTrait, targetTrait);
    },
    traitDidDetachFeature(featureTrait: GeoFeatureTrait): void {
      this.owner.features.deleteTrait(featureTrait);
    },
    viewType: GeoTreeView,
    observesView: true,
    initView(geoView: GeoView): void {
      super.initView(geoView);
      const layerControllers = this.owner.layers.controllers;
      for (const controllerId in layerControllers) {
        const layerController = layerControllers[controllerId]!;
        layerController.geo.insertView(geoView);
      }
      const featureControllers = this.owner.features.controllers;
      for (const controllerId in featureControllers) {
        const featureController = featureControllers[controllerId]!;
        featureController.geo.insertView(geoView);
      }
    },
    deinitView(geoView: GeoView): void {
      this.owner.unconsume(geoView);
      super.deinitView(geoView);
    },
    viewDidProject(geoView: GeoView): void {
      this.owner.intersectsViewport.decohere();
      this.owner.visible.decohere();
      this.owner.consumable.decohere();
    },
  })
  override readonly geo!: TraitViewRef<this, GeoLayerTrait, GeoView> & GeoController["geo"] & Observes<GeoLayerTrait> & Observes<GeoView>;

  @TraitViewControllerSet({
    get controllerType(): typeof GeoLayerController {
      return GeoLayerController;
    },
    binds: true,
    observes: true,
    get parentView(): GeoView | null {
      return this.owner.geo.attachView();
    },
    getTraitViewRef(layerController: GeoLayerController): TraitViewRef<unknown, GeoLayerTrait, GeoView> {
      return layerController.geo;
    },
    willAttachController(layerController: GeoLayerController): void {
      this.owner.callObservers("controllerWillAttachLayer", layerController, this.owner);
    },
    didAttachController(layerController: GeoLayerController): void {
      const layerTrait = layerController.geo.trait;
      if (layerTrait !== null) {
        this.attachLayerTrait(layerTrait, layerController);
      }
      const layerView = layerController.geo.attachView();
      this.attachLayerView(layerView, layerController);
    },
    willDetachController(layerController: GeoLayerController): void {
      const layerView = layerController.geo.view;
      if (layerView !== null) {
        this.detachLayerView(layerView, layerController);
      }
      const layerTrait = layerController.geo.trait;
      if (layerTrait !== null) {
        this.detachLayerTrait(layerTrait, layerController);
      }
    },
    didDetachController(layerController: GeoLayerController): void {
      this.owner.callObservers("controllerDidDetachLayer", layerController, this.owner);
    },
    controllerWillAttachGeoTrait(layerTrait: GeoLayerTrait, layerController: GeoLayerController): void {
      this.owner.callObservers("controllerWillAttachLayerTrait", layerTrait, layerController, this.owner);
      this.attachLayerTrait(layerTrait, layerController);
    },
    controllerDidDetachGeoTrait(layerTrait: GeoLayerTrait, layerController: GeoLayerController): void {
      this.detachLayerTrait(layerTrait, layerController);
      this.owner.callObservers("controllerDidDetachLayerTrait", layerTrait, layerController, this.owner);
    },
    attachLayerTrait(layerTrait: GeoLayerTrait, layerController: GeoLayerController): void {
      // hook
    },
    detachLayerTrait(layerTrait: GeoLayerTrait, layerController: GeoLayerController): void {
      this.deleteController(layerController);
    },
    controllerWillAttachGeoView(layerView: GeoView, layerController: GeoLayerController): void {
      this.owner.callObservers("controllerWillAttachLayerView", layerView, layerController, this.owner);
      this.attachLayerView(layerView, layerController);
    },
    controllerDidDetachGeoView(layerView: GeoView, layerController: GeoLayerController): void {
      this.detachLayerView(layerView, layerController);
      this.owner.callObservers("controllerDidDetachLayerView", layerView, layerController, this.owner);
    },
    attachLayerView(layerView: GeoView, layerController: GeoLayerController): void {
      const geoView = this.owner.geo.attachView();
      layerController.geo.insertView(geoView);
    },
    detachLayerView(layerView: GeoView, layerController: GeoLayerController): void {
      layerView.remove();
    },
    createController(layerTrait?: GeoLayerTrait): GeoLayerController {
      if (layerTrait !== void 0) {
        return layerTrait.createGeoController();
      }
      return super.createController();
    },
  })
  readonly layers!: TraitViewControllerSet<this, GeoLayerTrait, GeoView, GeoLayerController> & Observes<GeoLayerController> & {
    attachLayerTrait(layerTrait: GeoLayerTrait, layerController: GeoLayerController): void;
    detachLayerTrait(layerTrait: GeoLayerTrait, layerController: GeoLayerController): void;
    attachLayerView(layerView: GeoView, layerController: GeoLayerController): void;
    detachLayerView(layerView: GeoView, layerController: GeoLayerController): void;
  };

  @TraitViewControllerSet({
    controllerType: GeoFeatureController,
    binds: true,
    observes: true,
    get parentView(): GeoView | null {
      return this.owner.geo.attachView();
    },
    getTraitViewRef(featureController: GeoFeatureController): TraitViewRef<unknown, GeoFeatureTrait, GeoFeatureView> {
      return featureController.geo;
    },
    willAttachController(featureController: GeoFeatureController): void {
      this.owner.callObservers("controllerWillAttachFeature", featureController, this.owner);
    },
    didAttachController(featureController: GeoFeatureController): void {
      const featureTrait = featureController.geo.trait;
      if (featureTrait !== null) {
        this.attachFeatureTrait(featureTrait, featureController);
      }
      const featureView = featureController.geo.attachView();
      this.attachFeatureView(featureView, featureController);
    },
    willDetachController(featureController: GeoFeatureController): void {
      const featureView = featureController.geo.view;
      if (featureView !== null) {
        this.detachFeatureView(featureView, featureController);
      }
      const featureTrait = featureController.geo.trait;
      if (featureTrait !== null) {
        this.detachFeatureTrait(featureTrait, featureController);
      }
    },
    didDetachController(featureController: GeoFeatureController): void {
      this.owner.callObservers("controllerDidDetachFeature", featureController, this.owner);
    },
    controllerWillAttachGeoTrait(featureTrait: GeoFeatureTrait, featureController: GeoFeatureController): void {
      this.owner.callObservers("controllerWillAttachFeatureTrait", featureTrait, featureController, this.owner);
      this.attachFeatureTrait(featureTrait, featureController);
    },
    controllerDidDetachGeoTrait(featureTrait: GeoFeatureTrait, featureController: GeoFeatureController): void {
      this.detachFeatureTrait(featureTrait, featureController);
      this.owner.callObservers("controllerDidDetachFeatureTrait", featureTrait, featureController, this.owner);
    },
    attachFeatureTrait(featureTrait: GeoFeatureTrait, featureController: GeoFeatureController): void {
      // hook
    },
    detachFeatureTrait(featureTrait: GeoFeatureTrait, featureController: GeoFeatureController): void {
      this.deleteController(featureController);
    },
    controllerWillAttachGeoView(featureView: GeoFeatureView, featureController: GeoFeatureController): void {
      this.owner.callObservers("controllerWillAttachFeatureView", featureView, featureController, this.owner);
      this.attachFeatureView(featureView, featureController);
    },
    controllerDidDetachGeoView(featureView: GeoFeatureView, featureController: GeoFeatureController): void {
      this.detachFeatureView(featureView, featureController);
      this.owner.callObservers("controllerDidDetachFeatureView", featureView, featureController, this.owner);
    },
    attachFeatureView(featureView: GeoFeatureView, featureController: GeoFeatureController): void {
      const geoView = this.owner.geo.attachView();
      featureController.geo.insertView(geoView);
    },
    detachFeatureView(featureView: GeoFeatureView, featureController: GeoFeatureController): void {
      featureView.remove();
    },
    controllerDidSetGeoPerspective(geoPerspective: GeoPerspective | null, featureController: GeoFeatureController): void {
      this.owner.callObservers("controllerDidSetFeatureGeoPerspective", geoPerspective, featureController, this.owner);
    },
    controllerDidEnterGeoView(geoView: GeoFeatureView, featureController: GeoFeatureController): void {
      this.owner.callObservers("controllerDidEnterFeatureView", geoView, featureController, this.owner);
    },
    controllerDidLeaveGeoView(geoView: GeoFeatureView, featureController: GeoFeatureController): void {
      this.owner.callObservers("controllerDidLeaveFeatureView", geoView, featureController, this.owner);
    },
    controllerDidPressGeoView(input: PositionGestureInput, event: Event | null, geoView: GeoFeatureView, featureController: GeoFeatureController): void {
      this.owner.callObservers("controllerDidPressFeatureView", input, event, geoView, featureController, this.owner);
    },
    controllerDidLongPressGeoView(input: PositionGestureInput, geoView: GeoFeatureView, featureController: GeoFeatureController): void {
      this.owner.callObservers("controllerDidLongPressFeatureView", input, geoView, featureController, this.owner);
    },
    createController(featureTrait?: GeoFeatureTrait): GeoFeatureController {
      if (featureTrait !== void 0) {
        return featureTrait.createGeoController();
      }
      return super.createController();
    },
  })
  readonly features!: TraitViewControllerSet<this, GeoFeatureTrait, GeoFeatureView, GeoFeatureController> & Observes<GeoFeatureController> & {
    attachFeatureTrait(featureTrait: GeoFeatureTrait, featureController: GeoFeatureController): void,
    detachFeatureTrait(featureTrait: GeoFeatureTrait, featureController: GeoFeatureController): void,
    attachFeatureView(featureView: GeoFeatureView, featureController: GeoFeatureController): void,
    detachFeatureView(featureView: GeoFeatureView, featureController: GeoFeatureController): void,
  };

  consumeLayers(): void {
    // hook
  }

  unconsumeLayers(): void {
    // hook
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.consumeLayers();
  }
}
