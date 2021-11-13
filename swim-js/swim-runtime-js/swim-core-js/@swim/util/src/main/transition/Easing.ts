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

import type {Mutable} from "../types/Mutable";
import {Timing} from "./Timing";

export type AnyEasing = Easing | EasingType;

export type EasingType = "linear" | "quad-in" | "quad-out" | "quad-in-out"
                       | "cubic-in" | "cubic-out" | "cubic-in-out"
                       | "quart-in" | "quart-out" | "quart-in-out"
                       | "expo-in" | "expo-out" | "expo-in-out"
                       | "circ-in" | "circ-out" | "circ-in-out"
                       | "back-in" | "back-out" | "back-in-out"
                       | "elastic-in" | "elastic-out" | "elastic-in-out"
                       | "bounce-in" | "bounce-out" | "bounce-in-out";

export interface Easing extends Timing {
  readonly type: string;

  readonly 0: 0;

  readonly 1: 1;

  readonly easing: this;

  equivalentTo(that: unknown, epsilon?: number): boolean;

  canEqual(that: unknown): boolean;

  equals(that: unknown): boolean;

  toString(): string;
}

export const Easing = (function (_super: typeof Timing) {
  const Easing = function (type: string): Easing {
    switch (type) {
      case "linear": return Easing.linear;
      case "quad-in": return Easing.quadIn;
      case "quad-out": return Easing.quadOut;
      case "quad-in-out": return Easing.quadInOut;
      case "cubic-in": return Easing.cubicIn;
      case "cubic-out": return Easing.cubicOut;
      case "cubic-in-out": return Easing.cubicInOut;
      case "quart-in": return Easing.quartIn;
      case "quart-out": return Easing.quartOut;
      case "quart-in-out": return Easing.quartInOut;
      case "expo-in": return Easing.expoIn;
      case "expo-out": return Easing.expoOut;
      case "expo-in-out": return Easing.expoInOut;
      case "circ-in": return Easing.circIn;
      case "circ-out": return Easing.circOut;
      case "circ-in-out": return Easing.circInOut;
      case "back-in": return Easing.backIn;
      case "back-out": return Easing.backOut;
      case "back-in-out": return Easing.backInOut;
      case "elastic-in": return Easing.elasticIn;
      case "elastic-out": return Easing.elasticOut;
      case "elastic-in-out": return Easing.elasticInOut;
      case "bounce-in": return Easing.bounceIn;
      case "bounce-out": return Easing.bounceOut;
      case "bounce-in-out": return Easing.bounceInOut;
      default: throw new Error("unknown easing: " + type);
    }
  } as {
    (type: string): Easing;

    /** @internal */
    prototype: Easing;

    readonly linear: Easing;
    readonly quadIn: Easing;
    readonly quadOut: Easing;
    readonly quadInOut: Easing;
    readonly cubicIn: Easing;
    readonly cubicOut: Easing;
    readonly cubicInOut: Easing;
    readonly quartIn: Easing;
    readonly quartOut: Easing;
    readonly quartInOut: Easing;
    readonly expoIn: Easing;
    readonly expoOut: Easing;
    readonly expoInOut: Easing;
    readonly circIn: Easing;
    readonly circOut: Easing;
    readonly circInOut: Easing;
    readonly backIn: Easing;
    readonly backOut: Easing;
    readonly backInOut: Easing;
    readonly elasticIn: Easing;
    readonly elasticOut: Easing;
    readonly elasticInOut: Easing;
    readonly bounceIn: Easing;
    readonly bounceOut: Easing;
    readonly bounceInOut: Easing;

    fromAny(value: AnyEasing): Easing;
  };

  Easing.prototype = Object.create(_super.prototype);
  Easing.prototype.constructor = Easing;

  Object.defineProperty(Easing.prototype, 0, {
    value: 0,
  });

  Object.defineProperty(Easing.prototype, 1, {
    value: 1,
  });

  Object.defineProperty(Easing.prototype, "easing", {
    get(this: Easing): Easing {
      return this;
    },
  });

  Easing.prototype.equivalentTo = function (that: unknown, epsilon?: number): boolean {
    return this === that;
  };

  Easing.prototype.canEqual = function (that: unknown): boolean {
    return that instanceof Easing;
  };

  Easing.prototype.equals = function (that: unknown): boolean {
    return this === that;
  };

  Easing.prototype.toString = function (): string {
    return "Easing(\"" + this.type + "\")";
  };

  Easing.fromAny = function (value: AnyEasing): Easing {
    if (value instanceof Easing) {
      return value;
    } else if (typeof value === "string") {
      return Easing(value);
    }
    throw new TypeError("" + value);
  };

  (Easing as Mutable<typeof Easing>).linear = function (u: number): number {
    return u;
  } as unknown as Easing;
  Object.setPrototypeOf(Easing.linear, Easing.prototype);
  (Easing.linear as Mutable<Easing>).type = "linear";

  (Easing as Mutable<typeof Easing>).quadIn = function (u: number): number {
    return u * u;
  } as Easing;
  Object.setPrototypeOf(Easing.quadIn, Easing.prototype);
  (Easing.quadIn as Mutable<Easing>).type = "quad-in";

  (Easing as Mutable<typeof Easing>).quadOut = function (u: number): number {
    return u * (2 - u);
  } as Easing;
  Object.setPrototypeOf(Easing.quadOut, Easing.prototype);
  (Easing.quadOut as Mutable<Easing>).type = "quad-out";

  (Easing as Mutable<typeof Easing>).quadInOut = function (u: number): number {
    u *= 2;
    if (u <= 1) {
      u = u * u;
    } else {
      u -= 1;
      u = u * (2 - u);
      u += 1;
    }
    u /= 2;
    return u;
  } as Easing;
  Object.setPrototypeOf(Easing.quadInOut, Easing.prototype);
  (Easing.quadInOut as Mutable<Easing>).type = "quad-in-out";

  (Easing as Mutable<typeof Easing>).cubicIn = function (u: number): number {
    return u * u * u;
  } as Easing;
  Object.setPrototypeOf(Easing.cubicIn, Easing.prototype);
  (Easing.cubicIn as Mutable<Easing>).type = "cubic-in";

  (Easing as Mutable<typeof Easing>).cubicOut = function (u: number): number {
    u -= 1;
    u = u * u * u;
    u += 1;
    return u;
  } as Easing;
  Object.setPrototypeOf(Easing.cubicOut, Easing.prototype);
  (Easing.cubicOut as Mutable<Easing>).type = "cubic-out";

  (Easing as Mutable<typeof Easing>).cubicInOut = function (u: number): number {
    u *= 2;
    if (u <= 1) {
      u = u * u * u;
    } else {
      u -= 2;
      u = u * u * u;
      u += 2;
    }
    u /= 2;
    return u;
  } as Easing;
  Object.setPrototypeOf(Easing.cubicInOut, Easing.prototype);
  (Easing.cubicInOut as Mutable<Easing>).type = "cubic-in-out";

  (Easing as Mutable<typeof Easing>).quartIn = function (u: number): number {
    return u * u * u * u;
  } as Easing;
  Object.setPrototypeOf(Easing.quartIn, Easing.prototype);
  (Easing.quartIn as Mutable<Easing>).type = "quart-in";

  (Easing as Mutable<typeof Easing>).quartOut = function (u: number): number {
    u -= 1;
    return 1 - u * u * u * u;
  } as Easing;
  Object.setPrototypeOf(Easing.quartOut, Easing.prototype);
  (Easing.quartOut as Mutable<Easing>).type = "quart-out";

  (Easing as Mutable<typeof Easing>).quartInOut = function (u: number): number {
    const v = u - 1;
    return u < 0.5 ? 8 * u * u * u * u : 1 - 8 * v * v * v * v;
  } as Easing;
  Object.setPrototypeOf(Easing.quartInOut, Easing.prototype);
  (Easing.quartInOut as Mutable<Easing>).type = "quart-in-out";

  (Easing as Mutable<typeof Easing>).expoIn = function (u: number): number {
    if (u === 0) {
      return 0;
    }
    return Math.pow(2, 10 * (u - 1) );
  } as Easing;
  Object.setPrototypeOf(Easing.expoIn, Easing.prototype);
  (Easing.expoIn as Mutable<Easing>).type = "expo-in";

  (Easing as Mutable<typeof Easing>).expoOut = function (u: number): number {
    if (u === 1) {
      return 1;
    }
    return (-Math.pow(2, -10 * u) + 1);
  } as Easing;
  Object.setPrototypeOf(Easing.expoOut, Easing.prototype);
  (Easing.expoOut as Mutable<Easing>).type = "expo-out";

  (Easing as Mutable<typeof Easing>).expoInOut = function (u: number): number {
    if (u === 1 || u === 0) {
      return u;
    }
    u *= 2;
    if (u < 1) {
      return 0.5 * Math.pow(2, 10 * (u - 1));
    }
    return 0.5 * (-Math.pow(2, -10 * (u - 1)) + 2);
  } as Easing;
  Object.setPrototypeOf(Easing.expoInOut, Easing.prototype);
  (Easing.expoInOut as Mutable<Easing>).type = "expo-in-out";

  (Easing as Mutable<typeof Easing>).circIn = function (u: number): number {
    return -1 * (Math.sqrt(1 - (u / 1) * u) - 1);
  } as Easing;
  Object.setPrototypeOf(Easing.circIn, Easing.prototype);
  (Easing.circIn as Mutable<Easing>).type = "circ-in";

  (Easing as Mutable<typeof Easing>).circOut = function (u: number): number {
    u -= 1;
    return Math.sqrt(1 - u * u);
  } as Easing;
  Object.setPrototypeOf(Easing.circOut, Easing.prototype);
  (Easing.circOut as Mutable<Easing>).type = "circ-out";

  (Easing as Mutable<typeof Easing>).circInOut = function (u: number): number {
    u *= 2;
    if (u < 1) {
      return -0.5 * (Math.sqrt(1 - u * u) - 1);
    }
    const st = u - 2;
    return 0.5 * (Math.sqrt(1 - st * st) + 1);
  } as Easing;
  Object.setPrototypeOf(Easing.circInOut, Easing.prototype);
  (Easing.circInOut as Mutable<Easing>).type = "circ-in-out";

  (Easing as Mutable<typeof Easing>).backIn = function (u: number): number {
    const m = 1.70158; // m - Magnitude
    return u * u * (( m + 1) * u - m);
  } as Easing;
  Object.setPrototypeOf(Easing.backIn, Easing.prototype);
  (Easing.backIn as Mutable<Easing>).type = "back-in";

  (Easing as Mutable<typeof Easing>).backOut = function (u: number): number {
    const m = 1.70158;
    const st = (u / 1) - 1;
    return (st * st * ((m + 1) * m + m)) + 1;
  } as Easing;
  Object.setPrototypeOf(Easing.backOut, Easing.prototype);
  (Easing.backOut as Mutable<Easing>).type = "back-out";

  (Easing as Mutable<typeof Easing>).backInOut = function (u: number): number {
    const m = 1.70158;
    const s = m * 1.525;
    if ((u *= 2) < 1) {
      return 0.5 * u * u * (((s + 1) * u) - s);
    }
    const st = u - 2;
    return 0.5 * (st * st * ((s + 1) * st + s) + 2);
  } as Easing;
  Object.setPrototypeOf(Easing.backInOut, Easing.prototype);
  (Easing.backInOut as Mutable<Easing>).type = "back-in-out";

  (Easing as Mutable<typeof Easing>).elasticIn = function (u: number): number {
    if (u === 0 || u === 1) {
      return u;
    }
    const m = 0.7;
    const st = (u / 1) - 1;
    const s = (1 - m) / 2 * Math.PI * Math.asin(1);
    return -(Math.pow(2, 10 * st) * Math.sin((st - s) * 2 * Math.PI / (1 - m)));
  } as Easing;
  Object.setPrototypeOf(Easing.elasticIn, Easing.prototype);
  (Easing.elasticIn as Mutable<Easing>).type = "elastic-in";

  (Easing as Mutable<typeof Easing>).elasticOut = function (u: number): number {
    if (u === 0 || u === 1) {
      return u;
    }
    const m = 0.7;
    const s = (1 -  m) / (2 * Math.PI) * Math.asin(1);
    u *= 2;
    return (Math.pow(2, -10 * u) * Math.sin((u - s) * 2 * Math.PI / (1 - m))) + 1;
  } as Easing;
  Object.setPrototypeOf(Easing.elasticOut, Easing.prototype);
  (Easing.elasticOut as Mutable<Easing>).type = "elastic-out";

  (Easing as Mutable<typeof Easing>).elasticInOut = function (u: number): number {
    if (u === 0 || u === 1) {
      return u;
    }
    const m = 0.65;
    const s = (1 - m) / (2 * Math.PI) * Math.asin(1);
    const st = u * 2;
    const st1 = st - 1;
    if(st < 1) {
      return -0.5 * (Math.pow(2, 10 * st1) * Math.sin((st1 - s) * 2 * Math.PI / (1 - m)));
    }
    return (Math.pow(2, -10 * st1) * Math.sin((st1 - s) * 2 * Math.PI / (1 - m)) * 0.5) + 1;
  } as Easing;
  Object.setPrototypeOf(Easing.elasticInOut, Easing.prototype);
  (Easing.elasticInOut as Mutable<Easing>).type = "elastic-in-out";

  (Easing as Mutable<typeof Easing>).bounceIn = function (u: number): number {
    const p = 7.5625;
    if ((u = 1 - u) < 1 / 2.75) {
      return 1 - (p * u * u);
    } else if (u < 2 / 2.75) {
      return 1 - (p * (u -= 1.5 / 2.75) * u + 0.75);
    } else if (u < 2.5 / 2.75) {
      return 1 - (p * (u -= 2.25 / 2.75) * u + 0.9375);
    }
    return 1 - (p * (u -= 2.625 / 2.75) * u + 0.984375);
  } as Easing;
  Object.setPrototypeOf(Easing.bounceIn, Easing.prototype);
  (Easing.bounceIn as Mutable<Easing>).type = "bounce-in";

  (Easing as Mutable<typeof Easing>).bounceOut = function (u: number): number {
    const p = 7.5625;
    if (u < 1 / 2.75) {
      return p * u * u;
    } else if (u < 2 / 2.75) {
      return p * (u -= 1.5 / 2.75) * u + 0.75;
    } else if (u < 2.5 / 2.75) {
      return p * (u -= 2.25 / 2.75) * u + 0.9375;
    }
    return p * (u -= 2.625 / 2.75) * u + 0.984375;
  } as Easing;
  Object.setPrototypeOf(Easing.bounceOut, Easing.prototype);
  (Easing.bounceOut as Mutable<Easing>).type = "bounce-out";

  (Easing as Mutable<typeof Easing>).bounceInOut = function (u: number): number {
    const invert = u < 0.5;
    u = invert ? 1 - (u * 2) : (u * 2) - 1;
    const p = 7.5625;
    if (u < 1 / 2.75) {
      u = p * u * u;
    } else if (u < 2 / 2.75) {
      u = p * (u -= 1.5 / 2.75) * u + 0.75;
    } else if (u < 2.5 / 2.75) {
      u = p * (u -= 2.25 / 2.75) * u + 0.9375;
    } else {
      u = p * (u -= 2.625 / 2.75) * u + 0.984375;
    }
    return invert ? (1 - u) * 0.5 : u * 0.5 + 0.5;
  } as Easing;
  Object.setPrototypeOf(Easing.bounceInOut, Easing.prototype);
  (Easing.bounceInOut as Mutable<Easing>).type = "bounce-in-out";

  return Easing;
})(Timing);
