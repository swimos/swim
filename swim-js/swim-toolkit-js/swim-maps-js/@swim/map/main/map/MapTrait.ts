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

import {GeoBox} from "@swim/geo";
import {Model, TraitModelType, Trait, TraitProperty, TraitFastener} from "@swim/model";
import {GeoTrait} from "../geo/GeoTrait";
import {AnyGeoPerspective, GeoPerspective} from "../geo/GeoPerspective";
import type {MapTraitObserver} from "./MapTraitObserver";

export class MapTrait extends GeoTrait {
  constructor() {
    super();
    Object.defineProperty(this, "layerFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly traitObservers!: ReadonlyArray<MapTraitObserver>;

  override get geoBounds(): GeoBox {
    return GeoBox.globe();
  }

  protected willSetGeoPerspective(newGeoPerspective: GeoPerspective | null, oldGeoPerspective: GeoPerspective | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetGeoPerspective !== void 0) {
        traitObserver.traitWillSetGeoPerspective(newGeoPerspective, oldGeoPerspective, this);
      }
    }
  }

  protected onSetGeoPerspective(newGeoPerspective: GeoPerspective | null, oldGeoPerspective: GeoPerspective | null): void {
    // hook
  }

  protected didSetGeoPerspective(newGeoPerspective: GeoPerspective | null, oldGeoPerspective: GeoPerspective | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetGeoPerspective !== void 0) {
        traitObserver.traitDidSetGeoPerspective(newGeoPerspective, oldGeoPerspective, this);
      }
    }
  }

  @TraitProperty<MapTrait, GeoPerspective | null, AnyGeoPerspective | null>({
    type: GeoPerspective,
    state: null,
    willSetState(newGeoPerspective: GeoPerspective | null, oldGeoPerspective: GeoPerspective | null): void {
      this.owner.willSetGeoPerspective(newGeoPerspective, oldGeoPerspective);
    },
    didSetState(newGeoPerspective: GeoPerspective | null, oldGeoPerspective: GeoPerspective | null): void {
      this.owner.onSetGeoPerspective(newGeoPerspective, oldGeoPerspective);
      this.owner.didSetGeoPerspective(newGeoPerspective, oldGeoPerspective);
    },
  })
  readonly geoPerspective!: TraitProperty<this, GeoPerspective | null, AnyGeoPerspective | null>;

  insertLayer(layerTrait: GeoTrait, targetTrait: Trait | null = null): void {
    const layerFasteners = this.layerFasteners as TraitFastener<this, GeoTrait>[];
    let targetIndex = layerFasteners.length;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      if (layerFastener.trait === layerTrait) {
        return;
      } else if (layerFastener.trait === targetTrait) {
        targetIndex = i;
      }
    }
    const layerFastener = this.createLayerFastener(layerTrait);
    layerFasteners.splice(targetIndex, 0, layerFastener);
    layerFastener.setTrait(layerTrait, targetTrait);
    if (this.isMounted()) {
      layerFastener.mount();
    }
  }

  removeLayer(layerTrait: GeoTrait): void {
    const layerFasteners = this.layerFasteners as TraitFastener<this, GeoTrait>[];
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      if (layerFastener.trait === layerTrait) {
        layerFastener.setTrait(null);
        if (this.isMounted()) {
          layerFastener.unmount();
        }
        layerFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initLayer(layerTrait: GeoTrait, layerFastener: TraitFastener<this, GeoTrait>): void {
    // hook
  }

  protected attachLayer(layerTrait: GeoTrait, layerFastener: TraitFastener<this, GeoTrait>): void {
    if (this.isConsuming()) {
      layerTrait.addTraitConsumer(this);
    }
  }

  protected detachLayer(layerTrait: GeoTrait, layerFastener: TraitFastener<this, GeoTrait>): void {
    if (this.isConsuming()) {
      layerTrait.removeTraitConsumer(this);
    }
  }

  protected willSetLayer(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null,
                         targetTrait: Trait | null, layerFastener: TraitFastener<this, GeoTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetLayer !== void 0) {
        traitObserver.traitWillSetLayer(newLayerTrait, oldLayerTrait, targetTrait, this);
      }
    }
  }

  protected onSetLayer(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null,
                       targetTrait: Trait | null, layerFastener: TraitFastener<this, GeoTrait>): void {
    if (oldLayerTrait !== null) {
      this.detachLayer(oldLayerTrait, layerFastener);
    }
    if (newLayerTrait !== null) {
      this.attachLayer(newLayerTrait, layerFastener);
      this.initLayer(newLayerTrait, layerFastener);
    }
  }

  protected didSetLayer(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null,
                        targetTrait: Trait | null, layerFastener: TraitFastener<this, GeoTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetLayer !== void 0) {
        traitObserver.traitDidSetLayer(newLayerTrait, oldLayerTrait, targetTrait, this);
      }
    }
  }

  /** @hidden */
  static LayerFastener = TraitFastener.define<MapTrait, GeoTrait>({
    type: GeoTrait,
    sibling: false,
    willSetTrait(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null, targetTrait: Trait | null): void {
      this.owner.willSetLayer(newLayerTrait, oldLayerTrait, targetTrait, this);
    },
    onSetTrait(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null, targetTrait: Trait | null): void {
      this.owner.onSetLayer(newLayerTrait, oldLayerTrait, targetTrait, this);
    },
    didSetTrait(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null, targetTrait: Trait | null): void {
      this.owner.didSetLayer(newLayerTrait, oldLayerTrait, targetTrait, this);
    },
  });

  protected createLayerFastener(layerTrait: GeoTrait): TraitFastener<this, GeoTrait> {
    return new MapTrait.LayerFastener(this, layerTrait.key, "layer");
  }

  /** @hidden */
  readonly layerFasteners!: ReadonlyArray<TraitFastener<this, GeoTrait>>;

  /** @hidden */
  protected mountLayerFasteners(): void {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      layerFastener.mount();
    }
  }

  /** @hidden */
  protected unmountLayerFasteners(): void {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      layerFastener.unmount();
    }
  }

  /** @hidden */
  protected startConsumingLayers(): void {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerTrait = layerFasteners[i]!.trait;
      if (layerTrait !== null) {
        layerTrait.addTraitConsumer(this);
      }
    }
  }

  /** @hidden */
  protected stopConsumingLayers(): void {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerTrait = layerFasteners[i]!.trait;
      if (layerTrait !== null) {
        layerTrait.removeTraitConsumer(this);
      }
    }
  }

  protected detectLayerModel(model: Model): GeoTrait | null {
    return model.getTrait(GeoTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const childModels = model.childModels;
    for (let i = 0, n = childModels.length; i < n; i += 1) {
      const childModel = childModels[i]!;
      const layerTrait = this.detectLayerModel(childModel);
      if (layerTrait !== null) {
        this.insertLayer(layerTrait);
      }
    }
  }

  protected override didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    if (newModel !== null) {
      this.detectModels(newModel);
    }
    super.didSetModel(newModel, oldModel);
  }

  protected override onInsertChildModel(childModel: Model, targetModel: Model | null): void {
    super.onInsertChildModel(childModel, targetModel);
    const layerTrait = this.detectLayerModel(childModel);
    if (layerTrait !== null) {
      const targetTrait = targetModel !== null ? this.detectLayerModel(targetModel) : null;
      this.insertLayer(layerTrait, targetTrait);
    }
  }

  protected override onRemoveChildModel(childModel: Model): void {
    super.onRemoveChildModel(childModel);
    const layerTrait = this.detectLayerModel(childModel);
    if (layerTrait !== null) {
      this.removeLayer(layerTrait);
    }
  }

  /** @hidden */
  protected override mountTraitFasteners(): void {
    super.mountTraitFasteners();
    this.mountLayerFasteners();
  }

  /** @hidden */
  protected override unmountTraitFasteners(): void {
    this.unmountLayerFasteners();
    super.unmountTraitFasteners();
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingLayers();
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingLayers();
  }
}
