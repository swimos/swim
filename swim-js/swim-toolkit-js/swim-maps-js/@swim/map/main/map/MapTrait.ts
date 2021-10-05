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
import {Property} from "@swim/fastener";
import {GeoBox} from "@swim/geo";
import {Model, TraitModelType, Trait, TraitFastener} from "@swim/model";
import {GeoTrait} from "../geo/GeoTrait";
import {AnyGeoPerspective, GeoPerspective} from "../geo/GeoPerspective";
import type {MapTraitObserver} from "./MapTraitObserver";

export class MapTrait extends GeoTrait {
  constructor() {
    super();
    this.layerFasteners = [];
  }

  override readonly observerType?: Class<MapTraitObserver>;

  override get geoBounds(): GeoBox {
    return GeoBox.globe();
  }

  protected willSetGeoPerspective(newGeoPerspective: GeoPerspective | null, oldGeoPerspective: GeoPerspective | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetGeoPerspective !== void 0) {
        traitObserver.traitWillSetGeoPerspective(newGeoPerspective, oldGeoPerspective, this);
      }
    }
  }

  protected onSetGeoPerspective(newGeoPerspective: GeoPerspective | null, oldGeoPerspective: GeoPerspective | null): void {
    // hook
  }

  protected didSetGeoPerspective(newGeoPerspective: GeoPerspective | null, oldGeoPerspective: GeoPerspective | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetGeoPerspective !== void 0) {
        traitObserver.traitDidSetGeoPerspective(newGeoPerspective, oldGeoPerspective, this);
      }
    }
  }

  @Property<MapTrait, GeoPerspective | null, AnyGeoPerspective | null>({
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
  readonly geoPerspective!: Property<this, GeoPerspective | null, AnyGeoPerspective | null>;

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
    if (this.mounted) {
      layerFastener.mount();
    }
  }

  removeLayer(layerTrait: GeoTrait): void {
    const layerFasteners = this.layerFasteners as TraitFastener<this, GeoTrait>[];
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      if (layerFastener.trait === layerTrait) {
        layerFastener.setTrait(null);
        if (this.mounted) {
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
    if (this.consuming) {
      layerTrait.consume(this);
    }
  }

  protected detachLayer(layerTrait: GeoTrait, layerFastener: TraitFastener<this, GeoTrait>): void {
    if (this.consuming) {
      layerTrait.unconsume(this);
    }
  }

  protected willSetLayer(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null,
                         targetTrait: Trait | null, layerFastener: TraitFastener<this, GeoTrait>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetLayer !== void 0) {
        traitObserver.traitDidSetLayer(newLayerTrait, oldLayerTrait, targetTrait, this);
      }
    }
  }

  /** @internal */
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
    return MapTrait.LayerFastener.create(this, layerTrait.key ?? "layer");
  }

  /** @internal */
  readonly layerFasteners: ReadonlyArray<TraitFastener<this, GeoTrait>>;

  /** @internal */
  protected mountLayerFasteners(): void {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      layerFastener.mount();
    }
  }

  /** @internal */
  protected unmountLayerFasteners(): void {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      layerFastener.unmount();
    }
  }

  /** @internal */
  protected startConsumingLayers(): void {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerTrait = layerFasteners[i]!.trait;
      if (layerTrait !== null) {
        layerTrait.consume(this);
      }
    }
  }

  /** @internal */
  protected stopConsumingLayers(): void {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerTrait = layerFasteners[i]!.trait;
      if (layerTrait !== null) {
        layerTrait.unconsume(this);
      }
    }
  }

  protected detectLayerModel(model: Model): GeoTrait | null {
    return model.getTrait(GeoTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const children = model.children;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const child = children[i]!;
      const layerTrait = this.detectLayerModel(child);
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

  /** @protected */
  override onInsertChild(child: Model, target: Model | null): void {
    super.onInsertChild(child, target);
    const layerTrait = this.detectLayerModel(child);
    if (layerTrait !== null) {
      const targetTrait = target !== null ? this.detectLayerModel(target) : null;
      this.insertLayer(layerTrait, targetTrait);
    }
  }

  /** @protected */
  override onRemoveChild(child: Model): void {
    super.onRemoveChild(child);
    const layerTrait = this.detectLayerModel(child);
    if (layerTrait !== null) {
      this.removeLayer(layerTrait);
    }
  }

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountLayerFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountLayerFasteners();
    super.unmountFasteners();
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
