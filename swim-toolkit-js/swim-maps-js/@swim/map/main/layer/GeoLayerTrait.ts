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

import {GeoBox} from "@swim/geo";
import {Model, TraitModelType, Trait, TraitFastener} from "@swim/model";
import {GeoTrait} from "../geo/GeoTrait";
import type {GeoLayerTraitObserver} from "./GeoLayerTraitObserver";

export class GeoLayerTrait extends GeoTrait {
  constructor() {
    super();
    Object.defineProperty(this, "geoBounds", {
      value: GeoBox.globe(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "featureFasteners", {
      value: [],
      enumerable: true,
    });
  }

  declare readonly traitObservers: ReadonlyArray<GeoLayerTraitObserver>;

  declare readonly geoBounds: GeoBox;

  setGeoBounds(newGeoBounds: GeoBox): void {
    const oldGeoBounds = this.geoBounds;
    if (!newGeoBounds.equals(oldGeoBounds)) {
      this.willSetGeoBounds(newGeoBounds, oldGeoBounds);
      Object.defineProperty(this, "geoBounds", {
        value: newGeoBounds,
        enumerable: true,
        configurable: true,
      });
      this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
  }

  protected willSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetGeoBounds !== void 0) {
        traitObserver.traitWillSetGeoBounds(newGeoBounds, oldGeoBounds, this);
      }
    }
  }

  protected onSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    // hook
  }

  protected didSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetGeoBounds !== void 0) {
        traitObserver.traitDidSetGeoBounds(newGeoBounds, oldGeoBounds, this);
      }
    }
  }

  insertFeature(featureTrait: GeoTrait, targetTrait: Trait | null = null): void {
    const featureFasteners = this.featureFasteners as TraitFastener<this, GeoTrait>[];
    let targetIndex = featureFasteners.length;
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureFastener = featureFasteners[i]!;
      if (featureFastener.trait === featureTrait) {
        return;
      } else if (featureFastener.trait === targetTrait) {
        targetIndex = i;
      }
    }
    const featureFastener = this.createFeatureFastener(featureTrait);
    featureFasteners.splice(targetIndex, 0, featureFastener);
    featureFastener.setTrait(featureTrait, targetTrait);
    if (this.isMounted()) {
      featureFastener.mount();
    }
  }

  removeFeature(featureTrait: GeoTrait): void {
    const featureFasteners = this.featureFasteners as TraitFastener<this, GeoTrait>[];
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureFastener = featureFasteners[i]!;
      if (featureFastener.trait === featureTrait) {
        featureFastener.setTrait(null);
        if (this.isMounted()) {
          featureFastener.unmount();
        }
        featureFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initFeature(featureTrait: GeoTrait, featureFastener: TraitFastener<this, GeoTrait>): void {
    // hook
  }

  protected attachFeature(featureTrait: GeoTrait, featureFastener: TraitFastener<this, GeoTrait>): void {
    if (this.isConsuming()) {
      featureTrait.addTraitConsumer(this);
    }
  }

  protected detachFeature(featureTrait: GeoTrait, featureFastener: TraitFastener<this, GeoTrait>): void {
    if (this.isConsuming()) {
      featureTrait.removeTraitConsumer(this);
    }
  }

  protected willSetFeature(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null,
                           targetTrait: Trait | null, featureFastener: TraitFastener<this, GeoTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetFeature !== void 0) {
        traitObserver.traitWillSetFeature(newFeatureTrait, oldFeatureTrait, targetTrait, this);
      }
    }
  }

  protected onSetFeature(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null,
                         targetTrait: Trait | null, featureFastener: TraitFastener<this, GeoTrait>): void {
    if (oldFeatureTrait !== null) {
      this.detachFeature(oldFeatureTrait, featureFastener);
    }
    if (newFeatureTrait !== null) {
      this.attachFeature(newFeatureTrait, featureFastener);
      this.initFeature(newFeatureTrait, featureFastener);
    }
  }

  protected didSetFeature(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null,
                          targetTrait: Trait | null, featureFastener: TraitFastener<this, GeoTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetFeature !== void 0) {
        traitObserver.traitDidSetFeature(newFeatureTrait, oldFeatureTrait, targetTrait, this);
      }
    }
  }

  /** @hidden */
  static FeatureFastener = TraitFastener.define<GeoLayerTrait, GeoTrait>({
    type: GeoTrait,
    sibling: false,
    willSetTrait(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null, targetTrait: Trait | null): void {
      this.owner.willSetFeature(newFeatureTrait, oldFeatureTrait, targetTrait, this);
    },
    onSetTrait(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null, targetTrait: Trait | null): void {
      this.owner.onSetFeature(newFeatureTrait, oldFeatureTrait, targetTrait, this);
    },
    didSetTrait(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null, targetTrait: Trait | null): void {
      this.owner.didSetFeature(newFeatureTrait, oldFeatureTrait, targetTrait, this);
    },
  });

  protected createFeatureFastener(featureTrait: GeoTrait): TraitFastener<this, GeoTrait> {
    return new GeoLayerTrait.FeatureFastener(this, featureTrait.key, "feature");
  }

  /** @hidden */
  declare readonly featureFasteners: ReadonlyArray<TraitFastener<this, GeoTrait>>;

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

  /** @hidden */
  protected startConsumingFeatures(): void {
    const featureFasteners = this.featureFasteners;
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureTrait = featureFasteners[i]!.trait;
      if (featureTrait !== null) {
        featureTrait.addTraitConsumer(this);
      }
    }
  }

  /** @hidden */
  protected stopConsumingFeatures(): void {
    const featureFasteners = this.featureFasteners;
    for (let i = 0, n = featureFasteners.length; i < n; i += 1) {
      const featureTrait = featureFasteners[i]!.trait;
      if (featureTrait !== null) {
        featureTrait.removeTraitConsumer(this);
      }
    }
  }

  protected detectFeatureModel(model: Model): GeoTrait | null {
    return model.getTrait(GeoTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const childModels = model.childModels;
    for (let i = 0, n = childModels.length; i < n; i += 1) {
      const childModel = childModels[i]!;
      const featureTrait = this.detectFeatureModel(childModel);
      if (featureTrait !== null) {
        this.insertFeature(featureTrait);
      }
    }
  }

  protected didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    if (newModel !== null) {
      this.detectModels(newModel);
    }
    super.didSetModel(newModel, oldModel);
  }

  protected onInsertChildModel(childModel: Model, targetModel: Model | null): void {
    super.onInsertChildModel(childModel, targetModel);
    const featureTrait = this.detectFeatureModel(childModel);
    if (featureTrait !== null) {
      const targetTrait = targetModel !== null ? this.detectFeatureModel(targetModel) : null;
      this.insertFeature(featureTrait, targetTrait);
    }
  }

  protected onRemoveChildModel(childModel: Model): void {
    super.onRemoveChildModel(childModel);
    const featureTrait = this.detectFeatureModel(childModel);
    if (featureTrait !== null) {
      this.removeFeature(featureTrait);
    }
  }

  /** @hidden */
  protected mountTraitFasteners(): void {
    super.mountTraitFasteners();
    this.mountFeatureFasteners();
  }

  /** @hidden */
  protected unmountTraitFasteners(): void {
    this.unmountFeatureFasteners();
    super.unmountTraitFasteners();
  }

  protected onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingFeatures();
  }

  protected onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingFeatures();
  }
}
