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
import type {PositionGestureInput} from "@swim/view";
import {TraitViewRef} from "@swim/controller";
import {Hyperlink} from "@swim/controller";
import type {GeoViewport} from "./GeoViewport";
import {GeoFeatureView} from "./GeoFeatureView";
import {GeoFeatureTrait} from "./GeoFeatureTrait";
import type {GeoControllerObserver} from "./GeoController";
import {GeoController} from "./GeoController";

/** @public */
export interface GeoFeatureControllerObserver<C extends GeoFeatureController = GeoFeatureController> extends GeoControllerObserver<C> {
  controllerWillAttachGeoTrait?(geoTrait: GeoFeatureTrait, controller: C): void;

  controllerDidDetachGeoTrait?(geoTrait: GeoFeatureTrait, controller: C): void;

  controllerWillAttachGeoView?(geoView: GeoFeatureView, controller: C): void;

  controllerDidDetachGeoView?(geoView: GeoFeatureView, controller: C): void;

  controllerDidEnterGeoView?(geoView: GeoFeatureView, controller: C): void;

  controllerDidLeaveGeoView?(geoView: GeoFeatureView, controller: C): void;

  controllerDidPressGeoView?(input: PositionGestureInput, event: Event | null, geoView: GeoFeatureView, controller: C): void;

  controllerDidLongPressGeoView?(input: PositionGestureInput, geoView: GeoFeatureView, controller: C): void;
}

/** @public */
export class GeoFeatureController extends GeoController {
  declare readonly observerType?: Class<GeoFeatureControllerObserver>;

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
      let geoView: GeoFeatureView | null;
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
      let geoView: GeoFeatureView | null;
      let geoViewport: GeoViewport | null;
      if (!this.owner.mounted || (geoView = this.owner.geo.view) === null
          || (geoViewport = geoView.geoViewport.value) === null) {
        return false;
      }
      const [minVisibleZoom, maxVisibleZoom] = this.owner.visibleRange.value;
      return intersectsViewport
          && geoViewport.zoom >= minVisibleZoom
          && geoViewport.zoom < maxVisibleZoom;
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
      let geoView: GeoFeatureView | null;
      let geoViewport: GeoViewport | null;
      if (!this.owner.mounted || (geoView = this.owner.geo.view) === null
          || (geoViewport = geoView.geoViewport.value) === null) {
        return false;
      }
      const [minZoom, maxZoom] = this.owner.consumeRange.value;
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
    traitType: GeoFeatureTrait,
    initTrait(geoTrait: GeoFeatureTrait): void {
      this.owner.hyperlink.bindInlet(geoTrait.hyperlink);
    },
    deinitTrait(geoTrait: GeoFeatureTrait): void {
      this.owner.hyperlink.unbindInlet(geoTrait.hyperlink);
    },
    viewType: GeoFeatureView,
    observesView: true,
    willAttachView(geoView: GeoFeatureView): void {
      geoView.setCulled(true);
      super.willAttachView(geoView);
    },
    initView(geoView: GeoFeatureView): void {
      super.initView(geoView);
      geoView.hyperlink.bindInlet(this.owner.hyperlink);
    },
    deinitView(geoView: GeoFeatureView): void {
      geoView.hyperlink.unbindInlet(this.owner.hyperlink);
      super.deinitView(geoView);
    },
    viewDidProject(geoView: GeoFeatureView): void {
      this.owner.intersectsViewport.decohere();
      this.owner.visible.decohere();
      this.owner.consumable.decohere();
    },
    viewDidEnter(geoView: GeoFeatureView): void {
      this.owner.callObservers("controllerDidEnterGeoView", geoView, this.owner);
    },
    viewDidLeave(geoView: GeoFeatureView): void {
      this.owner.callObservers("controllerDidLeaveGeoView", geoView, this.owner);
    },
    viewDidPress(input: PositionGestureInput, event: Event | null, geoView: GeoFeatureView): void {
      this.owner.callObservers("controllerDidPressGeoView", input, event, geoView, this.owner);
    },
    viewDidLongPress(input: PositionGestureInput, geoView: GeoFeatureView): void {
      this.owner.callObservers("controllerDidLongPressGeoView", input, geoView, this.owner);
    },
  })
  override readonly geo!: TraitViewRef<this, GeoFeatureTrait, GeoFeatureView> & GeoController["geo"] & Observes<GeoFeatureView>;

  @Property({valueType: Hyperlink, value: null})
  get hyperlink(): Property<this, Hyperlink | null> {
    return Property.getter();
  }
}
