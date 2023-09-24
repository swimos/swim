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
import {Property} from "@swim/component";
import {GeoPoint} from "@swim/geo";
import type {ColorOrLook} from "@swim/theme";
import {ColorLook} from "@swim/theme";
import {Graphics} from "@swim/graphics";
import {IconLayout} from "@swim/graphics";
import {TraitViewRef} from "@swim/controller";
import type {GeoFeatureControllerObserver} from "./GeoFeatureController";
import {GeoFeatureController} from "./GeoFeatureController";
import {GeoIconView} from "./GeoIconView";
import {GeoIconTrait} from "./GeoIconTrait";

/** @public */
export interface GeoIconControllerObserver<C extends GeoIconController = GeoIconController> extends GeoFeatureControllerObserver<C> {
  controllerWillAttachGeoTrait?(geoTrait: GeoIconTrait, controller: C): void;

  controllerDidDetachGeoTrait?(geoTrait: GeoIconTrait, controller: C): void;

  controllerWillAttachGeoView?(geoView: GeoIconView, controller: C): void;

  controllerDidDetachGeoView?(geoView: GeoIconView, controller: C): void;

  controllerDidSetGeoCenter?(geoCenter: GeoPoint | null, controller: C): void;
}

/** @public */
export class GeoIconController extends GeoFeatureController {
  declare readonly observerType?: Class<GeoIconControllerObserver>;

  @TraitViewRef({
    extends: true,
    traitType: GeoIconTrait,
    initTrait(geoTrait: GeoIconTrait): void {
      super.initTrait(geoTrait);
      this.owner.geoPerspective.bindInlet(geoTrait.geoPerspective);
      this.owner.geoCenter.bindInlet(geoTrait.geoCenter);
      this.owner.iconLayout.bindInlet(geoTrait.iconLayout);
      this.owner.iconColor.bindInlet(geoTrait.iconColor);
      this.owner.graphics.bindInlet(geoTrait.graphics);
    },
    deinitTrait(geoTrait: GeoIconTrait): void {
      this.owner.geoPerspective.unbindInlet(geoTrait.geoPerspective);
      this.owner.geoCenter.unbindInlet(geoTrait.geoCenter);
      this.owner.iconLayout.unbindInlet(geoTrait.iconLayout);
      this.owner.iconColor.unbindInlet(geoTrait.iconColor);
      this.owner.graphics.unbindInlet(geoTrait.graphics);
      super.deinitTrait(geoTrait);
    },
    viewType: GeoIconView,
    initView(geoView: GeoIconView): void {
      super.initView(geoView);
      geoView.geoCenter.bindInlet(this.owner.geoCenter);
      geoView.iconLayout.bindInlet(this.owner.iconLayout);
      geoView.iconColor.bindInlet(this.owner.iconColor);
      geoView.graphics.bindInlet(this.owner.graphics);
    },
    deinitView(geoView: GeoIconView): void {
      geoView.geoCenter.unbindInlet(this.owner.geoCenter);
      geoView.iconLayout.unbindInlet(this.owner.iconLayout);
      geoView.iconColor.unbindInlet(this.owner.iconColor);
      geoView.graphics.unbindInlet(this.owner.graphics);
      super.deinitView(geoView);
    },
  })
  override readonly geo!: TraitViewRef<this, GeoIconTrait, GeoIconView> & GeoFeatureController["geo"];

  @Property({
    valueType: GeoPoint,
    value: null,
    transition: true,
    didSetValue(geoCenter: GeoPoint | null): void {
      this.owner.callObservers("controllerDidSetGeoCenter", geoCenter, this.owner);
      this.owner.geoPerspective.setIntrinsic(geoCenter);
    },
  })
  readonly geoCenter!: Property<this, GeoPoint | null>;

  @Property({
    valueType: IconLayout,
    value: null,
  })
  readonly iconLayout!: Property<this, IconLayout | null>;

  @Property({
    valueType: ColorLook,
    value: null,
    transition: true,
  })
  readonly iconColor!: Property<this, ColorOrLook | null>;

  @Property({
    valueType: Graphics,
    value: null,
  })
  readonly graphics!: Property<this, Graphics | null>;
}
