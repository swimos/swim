// Copyright 2015-2022 Swim.inc
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
import {AnyLength, Length} from "@swim/math";
import {Trait} from "@swim/model";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import type {GraphicsView} from "@swim/graphics";
import type {DataPointTraitObserver} from "./DataPointTraitObserver";

/** @public */
export type DataPointLabel<X = unknown, Y = unknown> = DataPointLabelFunction<X, Y> | string;
/** @public */
export type DataPointLabelFunction<X, Y> = (dataPointTrait: DataPointTrait<X, Y>) => GraphicsView | string | null;

/** @public */
export class DataPointTrait<X = unknown, Y = unknown> extends Trait {
  constructor(x: X, y: Y) {
    super();
    this.x.setValue(x);
    this.y.setValue(y);
  }

  override readonly observerType?: Class<DataPointTraitObserver<X, Y>>;

  @Property<DataPointTrait<X, Y>, X>({
    willSetValue(newX: X, oldX: X): void {
      this.owner.callObservers("traitWillSetDataPointX", newX, oldX, this.owner);
    },
    didSetValue(newX: X, oldX: X): void {
      this.owner.callObservers("traitDidSetDataPointX", newX, oldX, this.owner);
    },
  })
  readonly x!: Property<this, X>;

  @Property<DataPointTrait<X, Y>, Y>({
    willSetValue(newY: Y, oldY: Y): void {
      this.owner.callObservers("traitWillSetDataPointY", newY, oldY, this.owner);
    },
    didSetValue(newY: Y, oldY: Y): void {
      this.owner.callObservers("traitDidSetDataPointY", newY, oldY, this.owner);
    },
  })
  readonly y!: Property<this, Y>;

  @Property<DataPointTrait<X, Y>, Y | undefined>({
    willSetValue(newY2: Y | undefined, oldY2: Y | undefined): void {
      this.owner.callObservers("traitWillSetDataPointY2", newY2, oldY2, this.owner);
    },
    didSetValue(newY2: Y | undefined, oldY2: Y | undefined): void {
      this.owner.callObservers("traitDidSetDataPointY2", newY2, oldY2, this.owner);
    },
  })
  readonly y2!: Property<this, Y | undefined>;

  @Property<DataPointTrait<X, Y>, Length | null, AnyLength | null>({
    type: Length,
    value: null,
    willSetValue(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.callObservers("traitWillSetDataPointRadius", newRadius, oldRadius, this.owner);
    },
    didSetValue(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.callObservers("traitDidSetDataPointRadius", newRadius, oldRadius, this.owner);
    },
  })
  readonly radius!: Property<this, Length | null, AnyLength | null>;

  @Property<DataPointTrait<X, Y>, Look<Color> | Color | null, Look<Color> | AnyColor | null>({
    value: null,
    willSetValue(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null): void {
      this.owner.callObservers("traitWillSetDataPointColor", newColor, oldColor, this.owner);
    },
    didSetValue(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null): void {
      this.owner.callObservers("traitDidSetDataPointColor", newColor, oldColor, this.owner);
    },
    fromAny(color: Look<Color> | AnyColor | null): Look<Color> | Color | null {
      if (color !== null && !(color instanceof Look)) {
        color = Color.fromAny(color);
      }
      return color;
    },
  })
  readonly color!: Property<this, Look<Color> | Color | null, Look<Color> | AnyColor | null>;

  @Property<DataPointTrait<X, Y>, number | undefined>({
    type: Number,
    willSetValue(newOpacity: number | undefined, oldOpacity: number | undefined): void {
      this.owner.callObservers("traitWillSetDataPointOpacity", newOpacity, oldOpacity, this.owner);
    },
    didSetValue(newOpacity: number | undefined, oldOpacity: number | undefined): void {
      this.owner.callObservers("traitDidSetDataPointOpacity", newOpacity, oldOpacity, this.owner);
    },
  })
  readonly opacity!: Property<this, number | undefined>;

  formatLabel(x: X | undefined, y: Y | undefined): string | undefined {
    return void 0;
  }

  @Property<DataPointTrait<X, Y>, DataPointLabel<X, Y> | null>({
    value: null,
    willSetValue(newLabel: DataPointLabel<X, Y> | null, oldLabel: DataPointLabel<X, Y> | null): void {
      this.owner.callObservers("traitWillSetDataPointLabel", newLabel, oldLabel, this.owner);
    },
    didSetValue(newLabel: DataPointLabel<X, Y> | null, oldLabel: DataPointLabel<X, Y> | null): void {
      this.owner.callObservers("traitDidSetDataPointLabel", newLabel, oldLabel, this.owner);
    },
  })
  readonly label!: Property<this, DataPointLabel<X, Y> | null>;
}
