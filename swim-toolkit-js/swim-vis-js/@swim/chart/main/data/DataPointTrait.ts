// Copyright 2015-2021 Swim inc.
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

import {AnyLength, Length} from "@swim/math";
import {TraitProperty, GenericTrait} from "@swim/model";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import type {GraphicsView} from "@swim/graphics";
import type {DataPointTraitObserver} from "./DataPointTraitObserver";

export type DataPointLabel<X, Y> = DataPointLabelFunction<X, Y> | string;
export type DataPointLabelFunction<X, Y> = (dataPointTrait: DataPointTrait<X, Y>) => GraphicsView | string | null;

export class DataPointTrait<X, Y> extends GenericTrait {
  constructor(x: X, y: Y) {
    super();
    Object.defineProperty(this.x, "ownState", {
      value: x,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this.y, "ownState", {
      value: y,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly traitObservers!: ReadonlyArray<DataPointTraitObserver<X, Y>>;

  protected willSetX(newX: X, oldX: X): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetDataPointX !== void 0) {
        traitObserver.traitWillSetDataPointX(newX, oldX, this);
      }
    }
  }

  protected onSetX(newX: X, oldX: X): void {
    // hook
  }

  protected didSetX(newX: X, oldX: X): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetDataPointX !== void 0) {
        traitObserver.traitDidSetDataPointX(newX, oldX, this);
      }
    }
  }

  @TraitProperty<DataPointTrait<X, Y>, X>({
    willSetState(newX: X, oldX: X): void {
      this.owner.willSetX(newX, oldX);
    },
    didSetState(newX: X, oldX: X): void {
      this.owner.onSetX(newX, oldX);
      this.owner.didSetX(newX, oldX);
    },
  })
  readonly x!: TraitProperty<this, X>;

  protected willSetY(newY: Y, oldY: Y): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetDataPointY !== void 0) {
        traitObserver.traitWillSetDataPointY(newY, oldY, this);
      }
    }
  }

  protected onSetY(newY: Y, oldY: Y): void {
    // hook
  }

  protected didSetY(newY: Y, oldY: Y): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetDataPointY !== void 0) {
        traitObserver.traitDidSetDataPointY(newY, oldY, this);
      }
    }
  }

  @TraitProperty<DataPointTrait<X, Y>, Y>({
    willSetState(newY: Y, oldY: Y): void {
      this.owner.willSetY(newY, oldY);
    },
    didSetState(newY: Y, oldY: Y): void {
      this.owner.onSetY(newY, oldY);
      this.owner.didSetY(newY, oldY);
    },
  })
  readonly y!: TraitProperty<this, Y>;

  protected willSetY2(newY2: Y | undefined, oldY2: Y | undefined): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetDataPointY2 !== void 0) {
        traitObserver.traitWillSetDataPointY2(newY2, oldY2, this);
      }
    }
  }

  protected onSetY2(newY2: Y | undefined, oldY2: Y | undefined): void {
    // hook
  }

  protected didSetY2(newY2: Y | undefined, oldY2: Y | undefined): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetDataPointY2 !== void 0) {
        traitObserver.traitDidSetDataPointY2(newY2, oldY2, this);
      }
    }
  }

  @TraitProperty<DataPointTrait<X, Y>, Y | undefined>({
    willSetState(newY2: Y | undefined, oldY2: Y | undefined): void {
      this.owner.willSetY2(newY2, oldY2);
    },
    didSetState(newY2: Y | undefined, oldY2: Y | undefined): void {
      this.owner.onSetY2(newY2, oldY2);
      this.owner.didSetY2(newY2, oldY2);
    },
  })
  readonly y2!: TraitProperty<this, Y | undefined>;

  protected willSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetDataPointRadius !== void 0) {
        traitObserver.traitWillSetDataPointRadius(newRadius, oldRadius, this);
      }
    }
  }

  protected onSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    // hook
  }

  protected didSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetDataPointRadius !== void 0) {
        traitObserver.traitDidSetDataPointRadius(newRadius, oldRadius, this);
      }
    }
  }

  @TraitProperty<DataPointTrait<X, Y>, Length | null, AnyLength | null>({
    type: Length,
    state: null,
    willSetState(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.willSetRadius(newRadius, oldRadius);
    },
    didSetState(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.onSetRadius(newRadius, oldRadius);
      this.owner.didSetRadius(newRadius, oldRadius);
    },
  })
  readonly radius!: TraitProperty<this, Length | null, AnyLength | null>;

  protected willSetColor(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetDataPointColor !== void 0) {
        traitObserver.traitWillSetDataPointColor(newColor, oldColor, this);
      }
    }
  }

  protected onSetColor(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null): void {
    // hook
  }

  protected didSetColor(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetDataPointColor !== void 0) {
        traitObserver.traitDidSetDataPointColor(newColor, oldColor, this);
      }
    }
  }

  @TraitProperty<DataPointTrait<X, Y>, Look<Color> | Color | null, Look<Color> | AnyColor | null>({
    state: null,
    willSetState(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null): void {
      this.owner.willSetColor(newColor, oldColor);
    },
    didSetState(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null): void {
      this.owner.onSetColor(newColor, oldColor);
      this.owner.didSetColor(newColor, oldColor);
    },
    fromAny(color: Look<Color> | AnyColor | null): Look<Color> | Color | null {
      if (color !== null && !(color instanceof Look)) {
        color = Color.fromAny(color);
      }
      return color;
    },
  })
  readonly color!: TraitProperty<this, Look<Color> | Color | null, Look<Color> | AnyColor | null>;

  protected willSetOpacity(newOpacity: number | undefined, oldOpacity: number | undefined): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetDataPointOpacity !== void 0) {
        traitObserver.traitWillSetDataPointOpacity(newOpacity, oldOpacity, this);
      }
    }
  }

  protected onSetOpacity(newOpacity: number | undefined, oldOpacity: number | undefined): void {
    // hook
  }

  protected didSetOpacity(newOpacity: number | undefined, oldOpacity: number | undefined): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetDataPointOpacity !== void 0) {
        traitObserver.traitDidSetDataPointOpacity(newOpacity, oldOpacity, this);
      }
    }
  }

  @TraitProperty<DataPointTrait<X, Y>, number | undefined>({
    type: Number,
    willSetState(newOpacity: number | undefined, oldOpacity: number | undefined): void {
      this.owner.willSetOpacity(newOpacity, oldOpacity);
    },
    didSetState(newOpacity: number | undefined, oldOpacity: number | undefined): void {
      this.owner.onSetOpacity(newOpacity, oldOpacity);
      this.owner.didSetOpacity(newOpacity, oldOpacity);
    },
  })
  readonly opacity!: TraitProperty<this, number | undefined>;

  protected willSetLabel(newLabel: DataPointLabel<X, Y> | null, oldLabel: DataPointLabel<X, Y> | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetDataPointLabel !== void 0) {
        traitObserver.traitWillSetDataPointLabel(newLabel, oldLabel, this);
      }
    }
  }

  protected onSetLabel(newLabel: DataPointLabel<X, Y> | null, oldLabel: DataPointLabel<X, Y> | null): void {
    // hook
  }

  protected didSetLabel(newLabel: DataPointLabel<X, Y> | null, oldLabel: DataPointLabel<X, Y> | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetDataPointLabel !== void 0) {
        traitObserver.traitDidSetDataPointLabel(newLabel, oldLabel, this);
      }
    }
  }

  formatLabel(x: X | undefined, y: Y | undefined): string | undefined {
    return void 0;
  }

  @TraitProperty<DataPointTrait<X, Y>, DataPointLabel<X, Y> | null>({
    state: null,
    willSetState(newLabel: DataPointLabel<X, Y> | null, oldLabel: DataPointLabel<X, Y> | null): void {
      this.owner.willSetLabel(newLabel, oldLabel);
    },
    didSetState(newLabel: DataPointLabel<X, Y> | null, oldLabel: DataPointLabel<X, Y> | null): void {
      this.owner.onSetLabel(newLabel, oldLabel);
      this.owner.didSetLabel(newLabel, oldLabel);
    },
  })
  readonly label!: TraitProperty<this, DataPointLabel<X, Y> | null>;
}
