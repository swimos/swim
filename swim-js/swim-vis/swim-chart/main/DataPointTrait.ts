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
import {Length} from "@swim/math";
import type {TraitObserver} from "@swim/model";
import {Trait} from "@swim/model";
import type {ColorOrLook} from "@swim/theme";
import {ColorLook} from "@swim/theme";

/** @public */
export interface DataPointTraitObserver<X = unknown, Y = unknown, T extends DataPointTrait<X, Y> = DataPointTrait<X, Y>> extends TraitObserver<T> {
  traitDidSetX?(x: X, trait: T): void;

  traitDidSetY?(y: Y, trait: T): void;

  traitDidSetY2?(y2: Y | undefined, trait: T): void;

  traitDidSetRadius?(radius: Length | null, trait: T): void;

  traitDidSetColor?(color: ColorOrLook | null, trait: T): void;

  traitDidSetOpacity?(opacity: number | undefined, trait: T): void;

  traitDidSetLabel?(label: string | undefined, trait: T): void;
}

/** @public */
export class DataPointTrait<X = unknown, Y = unknown> extends Trait {
  constructor(x?: X, y?: Y) {
    super();
    if (x !== void 0) {
      this.x.set(x);
    }
    if (y !== void 0) {
      this.y.set(y);
    }
  }

  declare readonly observerType?: Class<DataPointTraitObserver<X, Y>>;

  @Property({
    didSetValue(x: X): void {
      this.owner.callObservers("traitDidSetX", x, this.owner);
    },
  })
  readonly x!: Property<this, X>;

  @Property({
    didSetValue(y: Y): void {
      this.owner.callObservers("traitDidSetY", y, this.owner);
    },
  })
  readonly y!: Property<this, Y>;

  @Property({
    didSetValue(y2: Y | undefined): void {
      this.owner.callObservers("traitDidSetY2", y2, this.owner);
    },
  })
  get y2(): Property<this, Y | undefined> {
    return Property.getter();
  }

  @Property({
    valueType: Length,
    value: null,
    didSetValue(radius: Length | null): void {
      this.owner.callObservers("traitDidSetRadius", radius, this.owner);
    },
  })
  get radius(): Property<this, Length | null> {
    return Property.getter();
  }

  @Property({
    valueType: ColorLook,
    value: null,
    didSetValue(color: ColorOrLook | null): void {
      this.owner.callObservers("traitDidSetColor", color, this.owner);
    },
  })
  get color(): Property<this, ColorOrLook | null> {
    return Property.getter();
  }

  @Property({
    valueType: Number,
    didSetValue(opacity: number | undefined): void {
      this.owner.callObservers("traitDidSetOpacity", opacity, this.owner);
    },
  })
  get opacity(): Property<this, number | undefined> {
    return Property.getter();
  }

  formatLabel(x: X | undefined, y: Y | undefined): string | undefined {
    return void 0;
  }

  @Property({
    valueType: String,
    didSetValue(label: string | undefined): void {
      this.owner.callObservers("traitDidSetLabel", label, this.owner);
    },
  })
  get label(): Property<this, string | undefined> {
    return Property.getter();
  }
}
