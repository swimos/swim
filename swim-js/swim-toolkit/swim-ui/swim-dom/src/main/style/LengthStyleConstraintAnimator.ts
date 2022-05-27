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

import {
  LengthUnits,
  LengthBasis,
  AnyLength,
  Length,
  PxLength,
  EmLength,
  RemLength,
  PctLength,
} from "@swim/math";
import {StyleConstraintAnimatorClass, StyleConstraintAnimator} from "./StyleConstraintAnimator";
import {StyleContext} from "../"; // forward import

/** @public */
export interface LengthStyleConstraintAnimator<O = unknown, T extends Length | null = Length | null, U extends AnyLength | null = AnyLength | T> extends StyleConstraintAnimator<O, T, U>, LengthBasis {
  get units(): LengthUnits;

  pxValue(basis?: LengthBasis | number): number;

  emValue(basis?: LengthBasis | number): number;

  remValue(basis?: LengthBasis | number): number;

  pctValue(basis?: LengthBasis | number): number;

  pxState(basis?: LengthBasis | number): number;

  emState(basis?: LengthBasis | number): number;

  remState(basis?: LengthBasis | number): number;

  pctState(basis?: LengthBasis | number): number;

  px(basis?: LengthBasis | number): PxLength;

  em(basis?: LengthBasis | number): EmLength;

  rem(basis?: LengthBasis | number): RemLength;

  pct(basis?: LengthBasis | number): PctLength;

  to(units: LengthUnits, basis?: LengthBasis | number): Length;

  /** @override */
  get emUnit(): Node | number | undefined;

  /** @override */
  get remUnit(): number | undefined;

  /** @override */
  get pctUnit(): number | undefined;

  /** @override */
  parse(value: string): T;

  /** @override */
  fromCssValue(value: CSSStyleValue): T;

  /** @override */
  equalValues(newValue: T, oldValue: T | undefined): boolean;

  /** @override */
  fromAny(value: T | U): T;
}

/** @public */
export const LengthStyleConstraintAnimator = (function (_super: typeof StyleConstraintAnimator) {
  const LengthStyleConstraintAnimator = _super.extend("LengthStyleConstraintAnimator", {
    valueType: Length,
    value: null,
  }) as StyleConstraintAnimatorClass<LengthStyleConstraintAnimator<any, any, any>>;

  Object.defineProperty(LengthStyleConstraintAnimator.prototype, "units", {
    get(this: LengthStyleConstraintAnimator): LengthUnits {
      const value = this.cssValue;
      return value !== null ? value.units : "";
    },
    configurable: true,
  });

  LengthStyleConstraintAnimator.prototype.pxValue = function (this: LengthStyleConstraintAnimator, basis?: LengthBasis | number): number {
    const value = this.cssValue;
    if (value !== null) {
      if (basis === void 0) {
        basis = this;
      }
      return value.pxValue(basis);
    } else {
      return 0;
    }
  };

  LengthStyleConstraintAnimator.prototype.emValue = function (this: LengthStyleConstraintAnimator, basis?: LengthBasis | number): number {
    const value = this.cssValue;
    if (value !== null) {
      if (basis === void 0) {
        basis = this;
      }
      return value.emValue(basis);
    } else {
      return 0;
    }
  };

  LengthStyleConstraintAnimator.prototype.remValue = function (this: LengthStyleConstraintAnimator, basis?: LengthBasis | number): number {
    const value = this.cssValue;
    if (value !== null) {
      if (basis === void 0) {
        basis = this;
      }
      return value.remValue(basis);
    } else {
      return 0;
    }
  };

  LengthStyleConstraintAnimator.prototype.pctValue = function (this: LengthStyleConstraintAnimator, basis?: LengthBasis | number): number {
    const value = this.cssValue;
    if (value !== null) {
      if (basis === void 0) {
        basis = this;
      }
      return value.pctValue(basis);
    } else {
      return 0;
    }
  };

  LengthStyleConstraintAnimator.prototype.pxState = function (this: LengthStyleConstraintAnimator, basis?: LengthBasis | number): number {
    const value = this.cssState;
    if (value !== null) {
      if (basis === void 0) {
        basis = this;
      }
      return value.pxValue(basis);
    } else {
      return 0;
    }
  };

  LengthStyleConstraintAnimator.prototype.emState = function (this: LengthStyleConstraintAnimator, basis?: LengthBasis | number): number {
    const value = this.cssState;
    if (value !== null) {
      if (basis === void 0) {
        basis = this;
      }
      return value.emValue(basis);
    } else {
      return 0;
    }
  };

  LengthStyleConstraintAnimator.prototype.remState = function (this: LengthStyleConstraintAnimator, basis?: LengthBasis | number): number {
    const value = this.cssState;
    if (value !== null) {
      if (basis === void 0) {
        basis = this;
      }
      return value.remValue(basis);
    } else {
      return 0;
    }
  };

  LengthStyleConstraintAnimator.prototype.pctState = function (this: LengthStyleConstraintAnimator, basis?: LengthBasis | number): number {
    const value = this.cssState;
    if (value !== null) {
      if (basis === void 0) {
        basis = this;
      }
      return value.pctValue(basis);
    } else {
      return 0;
    }
  };

  LengthStyleConstraintAnimator.prototype.px = function (this: LengthStyleConstraintAnimator, basis?: LengthBasis | number): PxLength {
    const value = this.cssValue;
    if (value !== null) {
      if (basis === void 0) {
        basis = this;
      }
      return value.px(basis);
    } else {
      return PxLength.zero();
    }
  };

  LengthStyleConstraintAnimator.prototype.em = function (this: LengthStyleConstraintAnimator, basis?: LengthBasis | number): EmLength {
    const value = this.cssValue;
    if (value !== null) {
      if (basis === void 0) {
        basis = this;
      }
      return value.em(basis);
    } else {
      return EmLength.zero();
    }
  };

  LengthStyleConstraintAnimator.prototype.rem = function (this: LengthStyleConstraintAnimator, basis?: LengthBasis | number): RemLength {
    const value = this.cssValue;
    if (value !== null) {
      if (basis === void 0) {
        basis = this;
      }
      return value.rem(basis);
    } else {
      return RemLength.zero();
    }
  };

  LengthStyleConstraintAnimator.prototype.pct = function (this: LengthStyleConstraintAnimator, basis?: LengthBasis | number): PctLength {
    const value = this.cssValue;
    if (value !== null) {
      if (basis === void 0) {
        basis = this;
      }
      return value.pct(basis);
    } else {
      return PctLength.zero();
    }
  };

  LengthStyleConstraintAnimator.prototype.to = function (this: LengthStyleConstraintAnimator, units: LengthUnits, basis?: LengthBasis | number): Length {
    const value = this.cssValue;
    if (value !== null) {
      if (basis === void 0) {
        basis = this;
      }
      return value.to(units, basis);
    } else {
      return Length.zero(units);
    }
  };

  Object.defineProperty(LengthStyleConstraintAnimator.prototype, "emUnit", {
    get(this: LengthStyleConstraintAnimator): Node | number | undefined {
      const styleContext = this.owner;
      if (StyleContext.is(styleContext)) {
        const node = styleContext.node;
        if (node !== void 0) {
          return node;
        }
      }
      return 0;
    },
    configurable: true,
  });

  Object.defineProperty(LengthStyleConstraintAnimator.prototype, "remUnit", {
    value: 0,
    configurable: true,
  });

  Object.defineProperty(LengthStyleConstraintAnimator.prototype, "pctUnit", {
    value: 0,
    configurable: true,
  });

  LengthStyleConstraintAnimator.prototype.toNumber = function (value: Length): number {
    return this.pxValue();
  };

  LengthStyleConstraintAnimator.prototype.equalValues = function (newValue: Length | null, oldValue: Length | null): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldValue);
    } else {
      return newValue === oldValue;
    }
  };

  LengthStyleConstraintAnimator.prototype.parse = function (value: string): Length | null {
    return Length.parse(value);
  };

  LengthStyleConstraintAnimator.prototype.fromCssValue = function (value: CSSStyleValue): Length | null {
    return Length.fromCssValue(value);
  };

  LengthStyleConstraintAnimator.prototype.fromAny = function (value: AnyLength | string): Length | null {
    try {
      return Length.fromAny(value);
    } catch (swallow) {
      return null;
    }
  };

  return LengthStyleConstraintAnimator;
})(StyleConstraintAnimator);
