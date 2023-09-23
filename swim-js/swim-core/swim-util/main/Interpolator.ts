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

import type {Mutable} from "./types";
import {Values} from "./Values";
import {Range} from "./Range";
import {Interpolate} from "./Interpolate";

/** @public */
export interface Interpolator<Y = unknown> extends Range<Y>, Interpolate<Interpolator<Y>> {
  /** @override */
  readonly 0: Y;

  /** @override */
  readonly 1: Y;

  /** @override */
  union(that: Range<Y>): Interpolator<Y>;

  map<Y2>(transform: (y: Y) => Y2): Interpolator<Y2>;

  interpolateTo(that: Interpolator<Y>): Interpolator<Interpolator<Y>>;
  interpolateTo(that: unknown): Interpolator<Interpolator<Y>> | null;

  /** @override */
  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  toString(): string;
}

/** @public */
export const Interpolator = (function (_super: typeof Range) {
  const Interpolator = function (y0: unknown, y1: unknown): Interpolator {
    let interpolator: Interpolator | null;
    if (y0 === y1) {
      interpolator = IdentityInterpolator(y0);
    } else if (typeof y0 === "number" && typeof y1 === "number") {
      interpolator = NumberInterpolator(y0, y1);
    } else if (Array.isArray(y0) && Array.isArray(y1)) {
      interpolator = ArrayInterpolator(y0, y1);
    } else {
      interpolator = Interpolate(y0, y1);
      if (interpolator === null) {
        interpolator = StepInterpolator(y0, y1);
      }
    }
    return interpolator;
  } as {
    <Y>(y0: Y, y1: Y): Interpolator<Y>;
    (y0: unknown, y1: unknown): Interpolator;

    /** @internal */
    prototype: Interpolator<any>;
  };

  Interpolator.prototype = Object.create(_super.prototype);
  Interpolator.prototype.constructor = Interpolator;

  Interpolator.prototype.union = function <Y>(this: Interpolator<Y>, that: Range<Y>): Interpolator<Y> {
    const y00 = this[0];
    const y01 = this[1];
    const y10 = that[0];
    const y11 = that[1];
    const y0Order = Values.compare(y00, y01);
    const y1Order = Values.compare(y10, y11);
    let y0: Y;
    let y1: Y;
    if (y0Order <= 0 && y1Order <= 0) {
      y0 = Values.compare(y00, y10) <= 0 ? y00 : y10;
      y1 = Values.compare(y01, y11) >= 0 ? y01 : y11;
    } else if (y0Order >= 0 && y1Order >= 0) {
      y0 = Values.compare(y00, y10) >= 0 ? y00 : y10;
      y1 = Values.compare(y01, y11) <= 0 ? y01 : y11;
    } else if (y0Order <= 0 && y1Order >= 0) {
      y0 = Values.compare(y00, y11) <= 0 ? y00 : y11;
      y1 = Values.compare(y01, y10) >= 0 ? y01 : y10;
    } else { // y0Order >= 0 && y1Order <= 0
      y0 = Values.compare(y01, y10) <= 0 ? y01 : y10;
      y1 = Values.compare(y00, y11) >= 0 ? y00 : y11;
    }
    return Interpolator(y0, y1);
  };

  Interpolator.prototype.map = function <Y, Y2>(this: Interpolator<Y>, transform: (y: Y) => Y2): Interpolator<Y2> {
    return InterpolatorMap(this, transform);
  };

  Interpolator.prototype.interpolateTo = function <Y>(this: Interpolator<Y>, that: unknown): Interpolator<Interpolator<Y>> | null {
    if (that instanceof Interpolator) {
      return InterpolatorInterpolator(this, that);
    }
    return null;
  } as typeof Interpolator.prototype.interpolateTo;

  Interpolator.prototype.canEqual = function <Y>(this: Interpolator<Y>, that: unknown): boolean {
    return that instanceof this.constructor;
  };

  Interpolator.prototype.equals = function <Y>(this: Interpolator<Y>, that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Interpolator) {
      return that.canEqual(this)
          && Values.equal(this[0], that[0])
          && Values.equal(this[1], that[1]);
    }
    return false;
  };

  Interpolator.prototype.toString = function <Y>(this: Interpolator<Y>): string {
    return "Interpolator(" + this[0] + ", " + this[1] + ")";
  };

  return Interpolator;
})(Range);

/** @internal */
export interface InterpolatorMap<Y, Y2> extends Interpolator<Y2> {
  /** @internal */
  readonly interpolator: Interpolator<Y>;

  /** @internal */
  readonly transform: (y: Y) => Y2;

  /** @override */
  readonly 0: Y2;

  /** @override */
  readonly 1: Y2;

  /** @override */
  equals(that: unknown): boolean;
}

/** @internal */
export const InterpolatorMap = (function (_super: typeof Interpolator) {
  const InterpolatorMap = function <Y, Y2>(interpolator: Interpolator<Y>, transform: (y: Y) => Y2): InterpolatorMap<Y, Y2> {
    const map = function (u: number): Y2 {
      return map.transform(map.interpolator(u));
    } as InterpolatorMap<Y, Y2>;
    Object.setPrototypeOf(map, InterpolatorMap.prototype);
    (map as Mutable<typeof map>).interpolator = interpolator;
    (map as Mutable<typeof map>).transform = transform;
    return map;
  } as {
    <Y, Y2>(interpolator: Interpolator<Y>, transform: (y: Y) => Y2): InterpolatorMap<Y, Y2>;

    /** @internal */
    prototype: InterpolatorMap<any, any>;
  };

  InterpolatorMap.prototype = Object.create(_super.prototype);
  InterpolatorMap.prototype.constructor = InterpolatorMap;

  Object.defineProperty(InterpolatorMap.prototype, 0, {
    get<Y, Y2>(this: InterpolatorMap<Y, Y2>): Y2 {
      return this.transform(this.interpolator[0]);
    },
    configurable: true,
  });

  Object.defineProperty(InterpolatorMap.prototype, 1, {
    get<Y, Y2>(this: InterpolatorMap<Y, Y2>): Y2 {
      return this.transform(this.interpolator[1]);
    },
    configurable: true,
  });

  InterpolatorMap.prototype.equals = function <Y, Y2>(this: InterpolatorMap<Y, Y2>, that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof InterpolatorMap) {
      return this.interpolator.equals(that.interpolator)
          && this.transform === that.transform;
    }
    return false;
  };

  return InterpolatorMap;
})(Interpolator);

/** @internal */
export interface IdentityInterpolator<Y> extends Interpolator<Y> {
  /** @internal */
  readonly value: Y;

  /** @override */
  readonly 0: Y;

  /** @override */
  readonly 1: Y;

  /** @override */
  equals(that: unknown): boolean;
}

/** @internal */
export const IdentityInterpolator = (function (_super: typeof Interpolator) {
  const IdentityInterpolator = function <Y>(value: Y): IdentityInterpolator<Y> {
    const interpolator = function (u: number): Y {
      return interpolator.value;
    } as IdentityInterpolator<Y>;
    Object.setPrototypeOf(interpolator, IdentityInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).value = value;
    return interpolator;
  } as {
    <Y>(value: Y): IdentityInterpolator<Y>;

    /** @internal */
    prototype: IdentityInterpolator<any>;
  };

  IdentityInterpolator.prototype = Object.create(_super.prototype);
  IdentityInterpolator.prototype.constructor = IdentityInterpolator;

  Object.defineProperty(IdentityInterpolator.prototype, 0, {
    get<Y>(this: IdentityInterpolator<Y>): Y {
      return this.value;
    },
    configurable: true,
  });

  Object.defineProperty(IdentityInterpolator.prototype, 1, {
    get<Y>(this: IdentityInterpolator<Y>): Y {
      return this.value;
    },
    configurable: true,
  });

  IdentityInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof IdentityInterpolator) {
      return this.value === that.value;
    }
    return false;
  };

  return IdentityInterpolator;
})(Interpolator);

/** @internal */
export interface StepInterpolator<Y> extends Interpolator<Y> {
  /** @internal */
  readonly phase: number;

  /** @override */
  equals(that: unknown): boolean;
}

/** @internal */
export const StepInterpolator = (function (_super: typeof Interpolator) {
  const StepInterpolator = function <Y>(y0: Y, y1: Y, phase?: number): StepInterpolator<Y> {
    const interpolator = function (u: number): Y {
      return u < interpolator.phase ? interpolator[0] : interpolator[1];
    } as StepInterpolator<Y>;
    Object.setPrototypeOf(interpolator, StepInterpolator.prototype);
    if (phase === void 0) {
      phase = 1;
    }
    (interpolator as Mutable<typeof interpolator>).phase = phase;
    (interpolator as Mutable<typeof interpolator>)[0] = y0;
    (interpolator as Mutable<typeof interpolator>)[1] = y1;
    return interpolator;
  } as {
    <Y>(y0: Y, y1: Y, phase?: number): StepInterpolator<Y>;

    /** @internal */
    prototype: StepInterpolator<any>;
  };

  StepInterpolator.prototype = Object.create(_super.prototype);
  StepInterpolator.prototype.constructor = StepInterpolator;

  StepInterpolator.prototype.equals = function <Y>(this: StepInterpolator<Y>, that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof StepInterpolator) {
      return that.canEqual(this)
          && this.phase === that.phase
          && Values.equal(this[0], that[0])
          && Values.equal(this[1], that[1]);
    }
    return false;
  };

  return StepInterpolator;
})(Interpolator);

/** @internal */
export const NumberInterpolator = (function (_super: typeof Interpolator) {
  const NumberInterpolator = function (y0: number, y1: number): Interpolator<number> {
    const interpolator = function (u: number): number {
      const y0 = interpolator[0];
      const y1 = interpolator[1];
      return y0 + u * (y1 - y0);
    } as Interpolator<number>;
    Object.setPrototypeOf(interpolator, NumberInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = y0;
    (interpolator as Mutable<typeof interpolator>)[1] = y1;
    return interpolator;
  } as {
    (y0: number, y1: number): Interpolator<number>;

    /** @internal */
    prototype: Interpolator<number>;
  };

  NumberInterpolator.prototype = Object.create(_super.prototype);
  NumberInterpolator.prototype.constructor = NumberInterpolator;

  return NumberInterpolator;
})(Interpolator);

/** @internal */
export interface ArrayInterpolator<Y> extends Interpolator<readonly Y[]> {
  /** @internal */
  readonly interpolators: readonly Interpolator<Y>[];

  /** @override */
  readonly 0: readonly Y[];

  /** @override */
  readonly 1: readonly Y[];

  /** @override */
  equals(that: unknown): boolean;
}

/** @internal */
export const ArrayInterpolator = (function (_super: typeof Interpolator) {
  const ArrayInterpolator = function <Y>(y0: readonly Y[], y1: readonly Y[]): ArrayInterpolator<Y> {
    const interpolator = function (u: number): readonly Y[] {
      const interpolators = interpolator.interpolators;
      const interpolatorCount = interpolators.length;
      const array = new Array<Y>(interpolatorCount);
      for (let i = 0; i < interpolatorCount; i += 1) {
        array[i] = interpolators[i]!(u);
      }
      return array;
    } as ArrayInterpolator<Y>;
    Object.setPrototypeOf(interpolator, ArrayInterpolator.prototype);
    const interpolatorCount = Math.min(y0.length, y1.length);
    const interpolators = new Array<Interpolator<Y>>(interpolatorCount);
    for (let i = 0; i < interpolatorCount; i += 1) {
      interpolators[i] = Interpolator(y0[i]!, y1[i]!);
    }
    (interpolator as Mutable<typeof interpolator>).interpolators = interpolators;
    return interpolator;
  } as {
    <Y>(y0: readonly Y[], y1: readonly Y[]): ArrayInterpolator<Y>;

    /** @internal */
    prototype: ArrayInterpolator<any>;
  };

  ArrayInterpolator.prototype = Object.create(_super.prototype);
  ArrayInterpolator.prototype.constructor = ArrayInterpolator;

  Object.defineProperty(ArrayInterpolator.prototype, 0, {
    get<Y>(this: ArrayInterpolator<Y>): readonly Y[] {
      const interpolators = this.interpolators;
      const interpolatorCount = interpolators.length;
      const array = new Array<Y>(interpolatorCount);
      for (let i = 0; i < interpolatorCount; i += 1) {
        array[i] = interpolators[i]![0];
      }
      return array;
    },
    configurable: true,
  });

  Object.defineProperty(ArrayInterpolator.prototype, 1, {
    get<Y>(this: ArrayInterpolator<Y>): readonly Y[] {
      const interpolators = this.interpolators;
      const interpolatorCount = interpolators.length;
      const array = new Array<Y>(interpolatorCount);
      for (let i = 0; i < interpolatorCount; i += 1) {
        array[i] = interpolators[i]![1];
      }
      return array;
    },
    configurable: true,
  });

  ArrayInterpolator.prototype.equals = function <Y>(this: ArrayInterpolator<Y>, that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ArrayInterpolator) {
      const n = this.interpolators.length;
      if (n !== that.interpolators.length) {
        return false;
      }
      for (let i = 0; i < n; i += 1) {
        if (!this.interpolators[i]!.equals(that.interpolators[i]!)) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  return ArrayInterpolator;
})(Interpolator);

/** @internal */
export const InterpolatorInterpolator = (function (_super: typeof Interpolator) {
  const InterpolatorInterpolator = function <Y>(y0: Interpolator<Y>, y1: Interpolator<Y>): Interpolator<Interpolator<Y>> {
    const interpolator = function (u: number): Interpolator<Y> {
      if (u === 0) {
        return interpolator[0];
      } else if (u === 1) {
        return interpolator[1];
      }
      return Interpolator(interpolator[0](u), interpolator[1](u));
    } as Interpolator<Interpolator<Y>>;
    Object.setPrototypeOf(interpolator, InterpolatorInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = y0;
    (interpolator as Mutable<typeof interpolator>)[1] = y1;
    return interpolator;
  } as {
    <Y>(y0: Interpolator<Y>, y1: Interpolator<Y>): Interpolator<Interpolator<Y>>;

    /** @internal */
    prototype: Interpolator<any>;
  };

  InterpolatorInterpolator.prototype = Object.create(_super.prototype);
  InterpolatorInterpolator.prototype.constructor = InterpolatorInterpolator;

  return InterpolatorInterpolator;
})(Interpolator);
