// Copyright 2015-2020 SWIM.AI inc.
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

import {Form} from "@swim/structure";
import {EaseForm} from "./EaseForm";

export type EaseType = "linear" | "quad-in" | "quad-out" | "quad-in-out"
                     | "cubic-in" | "cubic-out" | "cubic-in-out"
                     | "quart-in" | "quart-out" | "quart-in-out"
                     | "expo-in" | "expo-out" | "expo-in-out"
                     | "circ-in" | "circ-out" | "circ-in-out"
                     | "back-in" | "back-out" | "back-in-out"
                     | "elastic-in" | "elastic-out" | "elastic-in-out"
                     | "bounce-in" | "bounce-out" | "bounce-in-out";

export type AnyEase = Ease | EaseType;

export interface Ease {
  (t: number): number;
  type?: EaseType;
}

function linear(t: number): number {
  return t;
}
linear.type = "linear";

function quadIn(t: number): number {
  return t * t;
}
quadIn.type = "quad-in";

function quadOut(t: number): number {
  return t * (2 - t);
}
quadOut.type = "quad-out";

function quadInOut(t: number): number {
  t *= 2;
  if (t <= 1) {
    t = t * t;
  } else {
    t -= 1;
    t = t * (2 - t);
    t += 1;
  }
  t /= 2;
  return t;
}
quadInOut.type = "quad-in-out";

function cubicIn(t: number): number {
  return t * t * t;
}
cubicIn.type = "cubic-in";

function cubicOut(t: number): number {
  t -= 1;
  t = t * t * t;
  t += 1;
  return t;
}
cubicOut.type = "cubic-out";

function cubicInOut(t: number): number {
  t *= 2;
  if (t <= 1) {
    t = t * t * t;
  } else {
    t -= 2;
    t = t * t * t;
    t += 2;
  }
  t /= 2;
  return t;
}
cubicInOut.type = "cubic-in-out";

function quartIn(t: number): number {
  return t * t * t * t;
}
quartIn.type = "quart-in";

function quartOut(t: number): number {
  t -= 1;
  return 1 - t * t * t * t;
}
quartOut.type = "quart-out";

function quartInOut(t: number): number {
  const t1 = t - 1;
  return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * t1 * t1 * t1 * t1;
}
quartInOut.type = "quart-in-out";

function expoIn(t: number): number {
  if (t === 0) {
    return 0;
  }
  return Math.pow(2, 10 * ( t - 1) );
}
expoIn.type = "expo-in";

function expoOut(t: number): number {
  if (t === 1) {
    return 1;
  }
  return (-Math.pow(2, -10 * t) + 1);
}
expoOut.type = "expo-out";

function expoInOut(t: number): number {
  if (t === 1 || t === 0) {
    return t;
  }
  t *= 2;
  if (t < 1) {
    return 0.5 * Math.pow(2, 10 * (t - 1));
  }
  return 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);
}
expoInOut.type = "expo-in-out";

function circIn(t: number): number {
  return -1 * (Math.sqrt(1 - (t / 1) * t) - 1);
}
circIn.type = "circ-in";

function circOut(t: number): number {
  t -= 1;
  return Math.sqrt(1 - t * t);
}
circOut.type = "circ-out";

function circInOut(t: number): number {
  t *= 2;
  if (t < 1) {
    return -0.5 * (Math.sqrt(1 - t * t) - 1);
  }
  const st = t - 2;
  return 0.5 * (Math.sqrt(1 - st * st) + 1);
}
circInOut.type = "circ-in-out";

function backIn(t: number): number {
  const m = 1.70158; // m - Magnitude
  return t * t * (( m + 1) * t - m);
}
backIn.type = "back-in";

function backOut(t: number): number {
  const m = 1.70158;
  const st = (t / 1) - 1;
  return (st * st * ((m + 1) * m + m)) + 1;
}
backOut.type = "back-out";

function backInOut(t: number): number {
  const m = 1.70158;
  const s = m * 1.525;
  if ((t *= 2) < 1) {
    return 0.5 * t * t * (((s + 1) * t) - s);
  }
  const st = t - 2;
  return 0.5 * (st * st * ((s + 1) * st + s) + 2);
}
backInOut.type = "back-in-out";
function elasticIn(t: number): number {
  if (t === 0 || t === 1) {
    return t;
  }
  const m = 0.7;
  const st = (t / 1) - 1;
  const s = (1 - m) / 2 * Math.PI * Math.asin(1);
  return -(Math.pow(2, 10 * st) * Math.sin((st - s) * 2 * Math.PI / (1 - m)));
}
elasticIn.type = "elastic-in";

function elasticOut(t: number): number {
  if (t === 0 || t === 1) {
    return t;
  }
  const m = 0.7;
  const s = (1 -  m) / (2 * Math.PI) * Math.asin(1);
  t *= 2;
  return (Math.pow(2, -10 * t) * Math.sin((t - s) * 2 * Math.PI / (1 - m))) + 1;
}
elasticOut.type = "elastic-out";

function elasticInOut(t: number): number {
  if (t === 0 || t === 1) {
    return t;
  }
  const m = 0.65;
  const s = (1 - m) / (2 * Math.PI) * Math.asin(1);
  const st = t * 2;
  const st1 = st - 1;
  if(st < 1) {
    return -0.5 * (Math.pow(2, 10 * st1) * Math.sin((st1 - s) * 2 * Math.PI / (1 - m)));
  }
  return (Math.pow(2, -10 * st1) * Math.sin((st1 - s) * 2 * Math.PI / (1 - m)) * 0.5) + 1;
}
elasticInOut.type = "elastic-in-out";

function bounceIn(t: number): number {
  const p = 7.5625;
  if ((t = 1 - t) < 1 / 2.75) {
    return 1 - (p * t * t);
  } else if (t < 2 / 2.75) {
    return 1 - (p * (t -= 1.5 / 2.75) * t + 0.75);
  } else if (t < 2.5 / 2.75) {
    return 1 - (p * (t -= 2.25 / 2.75) * t + 0.9375);
  }
  return 1 - (p * (t -= 2.625 / 2.75) * t + 0.984375);
}
bounceIn.type = "bounce-in";

function bounceOut(t: number): number {
  const p = 7.5625;
  if (t < 1 / 2.75) {
    return p * t * t;
  } else if (t < 2 / 2.75) {
    return p * (t -= 1.5 / 2.75) * t + 0.75;
  } else if (t < 2.5 / 2.75) {
    return p * (t -= 2.25 / 2.75) * t + 0.9375;
  }
  return p * (t -= 2.625 / 2.75) * t + 0.984375;
}
bounceOut.type = "bounce-out";

function bounceInOut(t: number): number {
  const invert = t < 0.5;
  t = invert ? 1 - (t * 2) : (t * 2) - 1;
  const p = 7.5625;
  if (t < 1 / 2.75) {
    t = p * t * t;
  } else if (t < 2 / 2.75) {
    t = p * (t -= 1.5 / 2.75) * t + 0.75;
  } else if (t < 2.5 / 2.75) {
    t = p * (t -= 2.25 / 2.75) * t + 0.9375;
  } else {
    t = p * (t -= 2.625 / 2.75) * t + 0.984375;
  }
  return invert ? (1 - t) * 0.5 : t * 0.5 + 0.5;
}
bounceInOut.type = "bounce-in-out";

export const Ease = {
  linear: linear as Ease,
  quadIn: quadIn as Ease,
  quadOut: quadOut as Ease,
  quadInOut: quadInOut as Ease,
  cubicIn: cubicIn as Ease,
  cubicOut: cubicOut as Ease,
  cubicInOut: cubicInOut as Ease,
  quartIn: quartIn as Ease,
  quartOut: quartOut as Ease,
  quartInOut: quartInOut as Ease,
  expoIn: expoIn as Ease,
  expoOut: expoOut as Ease,
  expoInOut: expoInOut as Ease,
  circIn: circIn as Ease,
  circOut: circOut as Ease,
  circInOut: circInOut as Ease,
  backIn: backIn as Ease,
  backOut: backOut as Ease,
  backInOut: backInOut as Ease,
  elasticIn: elasticIn as Ease,
  elasticOut: elasticOut as Ease,
  elasticInOut: elasticInOut as Ease,
  bounceIn: bounceIn as Ease,
  bounceOut: bounceOut as Ease,
  bounceInOut: bounceInOut as Ease,

  fromAny(value: AnyEase): Ease {
    if (typeof value === "function") {
      return value;
    } else if (typeof value === "string") {
      switch (value) {
        case "linear": return Ease.linear;
        case "quad-in": return Ease.quadIn;
        case "quad-out": return Ease.quadOut;
        case "quad-in-out": return Ease.quadInOut;
        case "cubic-in": return Ease.cubicIn;
        case "cubic-out": return Ease.cubicOut;
        case "cubic-in-out": return Ease.cubicInOut;
        case "quart-in": return Ease.quartIn;
        case "quart-out": return Ease.quartOut;
        case "quart-in-out": return Ease.quartInOut;
        case "expo-in": return Ease.expoIn;
        case "expo-out": return Ease.expoOut;
        case "expo-in-out": return Ease.expoInOut;
        case "circ-in": return Ease.circIn;
        case "circ-out": return Ease.circOut;
        case "circ-in-out": return Ease.circInOut;
        case "back-in": return Ease.backIn;
        case "back-out": return Ease.backOut;
        case "back-in-out": return Ease.backInOut;
        case "elastic-in": return Ease.elasticIn;
        case "elastic-out": return Ease.elasticOut;
        case "elastic-in-out": return Ease.elasticInOut;
        case "bounce-in": return Ease.bounceIn;
        case "bounce-out": return Ease.bounceOut;
        case "bounce-in-out": return Ease.bounceInOut;
      }
    }
    throw new Error(value);
  },

  /** @hidden */
  _form: void 0 as Form<Ease, AnyEase> | undefined,
  form(unit?: AnyEase): Form<Ease, AnyEase> {
    if (unit !== void 0) {
      unit = Ease.fromAny(unit);
    }
    if (unit !== Ease.linear) {
      return new Ease.Form(unit);
    } else {
      if (!Ease._form) {
        Ease._form = new Ease.Form(Ease.linear);
      }
      return Ease._form;
    }
  },

  // Forward type declarations
  /** @hidden */
  Form: void 0 as any as typeof EaseForm, // defined by EaseForm
};
