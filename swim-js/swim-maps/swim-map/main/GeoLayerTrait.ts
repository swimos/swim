// Copyright 2015-2024 Nstream, inc.
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
import type {Uri} from "@swim/uri";
import {GeoBox} from "@swim/geo";
import {Model} from "@swim/model";
import {TraitModelSet} from "@swim/model";
import type {GeoTraitObserver} from "./GeoTrait";
import {GeoTrait} from "./GeoTrait";
import {GeoFeatureTrait} from "./GeoFeatureTrait";
import {GeoLayerController} from "./"; // forward import

/** @public */
export interface GeoLayerTraitObserver<T extends GeoLayerTrait = GeoLayerTrait> extends GeoTraitObserver<T> {
  traitDidSetGeoBounds?(geoBoubnds: GeoBox | null, trait: T): void;

  traitWillAttachLayer?(layerTrait: GeoLayerTrait, trait: T): void;

  traitDidDetachLayer?(layerTrait: GeoLayerTrait, trait: T): void;

  traitWillAttachFeature?(featureTrait: GeoFeatureTrait, trait: T): void;

  traitDidDetachFeature?(featureTrait: GeoFeatureTrait, trait: T): void;
}

/** @public */
export class GeoLayerTrait extends GeoTrait {
  declare readonly observerType?: Class<GeoLayerTraitObserver>;

  @Property({extends: true, inherits: false})
  override get nodeUri(): Property<this, Uri | null> {
    return Property.getter();
  }

  @Property({
    valueType: GeoBox,
    value: null,
    didSetValue(geoBounds: GeoBox | null): void {
      this.owner.callObservers("traitDidSetGeoBounds", geoBounds, this.owner);
      this.owner.geoPerspective.setIntrinsic(geoBounds);
    },
  })
  readonly geoBounds!: Property<this, GeoBox | null>;

  @TraitModelSet({
    get traitType(): typeof GeoLayerTrait {
      return GeoLayerTrait;
    },
    traitKey: "layer",
    modelType: Model,
    binds: true,
    willAttachTrait(layerTrait: GeoLayerTrait): void {
      this.owner.callObservers("traitWillAttachLayer", layerTrait, this.owner);
    },
    didDetachTrait(layerTrait: GeoLayerTrait): void {
      this.owner.callObservers("traitDidDetachLayer", layerTrait, this.owner);
    },
  })
  readonly layers!: TraitModelSet<this, GeoLayerTrait, Model>;

  @TraitModelSet({
    traitType: GeoFeatureTrait,
    traitKey: "feature",
    modelType: Model,
    binds: true,
    willAttachTrait(featureTrait: GeoFeatureTrait): void {
      this.owner.callObservers("traitWillAttachFeature", featureTrait, this.owner);
    },
    didAttachTrait(featureTrait: GeoFeatureTrait): void {
      if (this.owner.consuming) {
        featureTrait.consume(this.owner);
      }
    },
    willDetachTrait(featureTrait: GeoFeatureTrait): void {
      if (this.owner.consuming) {
        featureTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(featureTrait: GeoFeatureTrait): void {
      this.owner.callObservers("traitDidDetachFeature", featureTrait, this.owner);
    },
  })
  readonly features!: TraitModelSet<this, GeoFeatureTrait, Model>;

  consumeLayers(): void {
    // hook
  }

  unconsumeLayers(): void {
    // hook
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.features.consumeTraits(this);
    this.consumeLayers();
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.features.unconsumeTraits(this);
  }

  override createGeoController(): GeoLayerController {
    return new GeoLayerController();
  }
}
