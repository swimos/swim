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
import {StyleAnimatorClass, StyleAnimator} from "./StyleAnimator";
import {StyleContext} from "../"; // forward import

/** @public */
export interface LengthStyleAnimator<O = unknown, T extends Length | null = Length | null, U extends AnyLength | null = AnyLength | T> extends StyleAnimator<O, T, U>, LengthBasis {
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
export const LengthStyleAnimator = (function (_super: typeof StyleAnimator) {
  const LengthStyleAnimator = _super.extend("LengthStyleAnimator", {
    valueType: Length,
    value: null,
  }) as StyleAnimatorClass<LengthStyleAnimator<any, any, any>>;

  Object.defineProperty(LengthStyleAnimator.prototype, "units", {
    get(this: LengthStyleAnimator): LengthUnits {
      const value = this.cssValue;
      return value !== null ? value.units : "";
    },
    configurable: true,
  });

  LengthStyleAnimator.prototype.pxValue = function (this: LengthStyleAnimator, basis?: LengthBasis | number): number {
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

  LengthStyleAnimator.prototype.emValue = function (this: LengthStyleAnimator, basis?: LengthBasis | number): number {
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

  LengthStyleAnimator.prototype.remValue = function (this: LengthStyleAnimator, basis?: LengthBasis | number): number {
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

  LengthStyleAnimator.prototype.pctValue = function (this: LengthStyleAnimator, basis?: LengthBasis | number): number {
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

  LengthStyleAnimator.prototype.pxState = function (this: LengthStyleAnimator, basis?: LengthBasis | number): number {
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

  LengthStyleAnimator.prototype.emState = function (this: LengthStyleAnimator, basis?: LengthBasis | number): number {
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

  LengthStyleAnimator.prototype.remState = function (this: LengthStyleAnimator, basis?: LengthBasis | number): number {
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

  LengthStyleAnimator.prototype.pctState = function (this: LengthStyleAnimator, basis?: LengthBasis | number): number {
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

  LengthStyleAnimator.prototype.px = function (this: LengthStyleAnimator, basis?: LengthBasis | number): PxLength {
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

  LengthStyleAnimator.prototype.em = function (this: LengthStyleAnimator, basis?: LengthBasis | number): EmLength {
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

  LengthStyleAnimator.prototype.rem = function (this: LengthStyleAnimator, basis?: LengthBasis | number): RemLength {
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

  LengthStyleAnimator.prototype.pct = function (this: LengthStyleAnimator, basis?: LengthBasis | number): PctLength {
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

  LengthStyleAnimator.prototype.to = function (this: LengthStyleAnimator, units: LengthUnits, basis?: LengthBasis | number): Length {
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

  Object.defineProperty(LengthStyleAnimator.prototype, "emUnit", {
    get(this: LengthStyleAnimator): Node | number | undefined {
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

  Object.defineProperty(LengthStyleAnimator.prototype, "remUnit", {
    value: 0,
    configurable: true,
  });

  Object.defineProperty(LengthStyleAnimator.prototype, "pctUnit", {
    value: 0,
    configurable: true,
  });

  LengthStyleAnimator.prototype.equalValues = function (newValue: Length | null, oldValue: Length | null): boolean {
    if (newValue !== void 0 && newValue !== null) {
      return newValue.equals(oldValue);
    } else {
      return newValue === oldValue;
    }
  };

  LengthStyleAnimator.prototype.parse = function (value: string): Length | null {
    return Length.parse(value);
  };

  LengthStyleAnimator.prototype.fromCssValue = function (value: CSSStyleValue): Length | null {
    return Length.fromCssValue(value);
  };

  LengthStyleAnimator.prototype.fromAny = function (value: AnyLength | string): Length | null {
    try {
      return Length.fromAny(value);
    } catch (swallow) {
      return null;
    }
  };

  return LengthStyleAnimator;
})(StyleAnimator);
