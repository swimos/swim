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

import {Equals} from "@swim/util";
import {AnyItem, Item, Form} from "@swim/structure";
import {AnyShape, R2Shape} from "@swim/math";
import {AnyDateTime, DateTime} from "@swim/time";
import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyTransform, Transform} from "@swim/transform";
import {StepInterpolator} from "./StepInterpolator";
import {NumberInterpolator} from "./NumberInterpolator";
import {ShapeInterpolator} from "./ShapeInterpolator";
import {DateTimeInterpolator} from "./DateTimeInterpolator";
import {AngleInterpolator} from "./AngleInterpolator";
import {LengthInterpolator} from "./LengthInterpolator";
import {TransformInterpolator} from "./TransformInterpolator";
import {ColorInterpolator} from "./ColorInterpolator";
import {StructureInterpolator} from "./StructureInterpolator";
import {ArrayInterpolator} from "./ArrayInterpolator";
import {InterpolatorInterpolator} from "./InterpolatorInterpolator";
import {InterpolatorMap} from "./InterpolatorMap";
import {InterpolatorForm} from "./InterpolatorForm";

export type InterpolatorType = "step" | "number" | "shape" | "time" | "angle"
                             | "length" | "transform" | "color" | "array";

export type AnyInterpolator<T extends U, U = T> = Interpolator<T, U> | InterpolatorType;

export abstract class Interpolator<T extends U, U = T> implements Equals {
  abstract interpolate(u: number): T;

  abstract deinterpolate(y: U): number;

  abstract range(): T[];
  abstract range(ys: ReadonlyArray<U>): Interpolator<T>;
  abstract range(y0: U, y1?: U): Interpolator<T>;

  map<U>(f: (value: T) => U): Interpolator<U> {
    return new Interpolator.Map(this, f);
  }

  abstract equals(that: unknown): boolean;

  static step<T>(y0?: T, y1?: T): StepInterpolator<T> {
    return new Interpolator.Step(y0, y1);
  }

  static number(y0?: number | string, y1?: number | string): NumberInterpolator {
    return new Interpolator.Number(y0, y1);
  }

  static shape: (s0?: AnyShape, s1?: AnyShape) => ShapeInterpolator; // defined by ShapeInterpolator

  static time(d0?: AnyDateTime, d1?: AnyDateTime): DateTimeInterpolator {
    return new Interpolator.DateTime(d0, d1);
  }

  static angle(a0?: AnyAngle, a1?: AnyAngle): AngleInterpolator {
    return new Interpolator.Angle(a0, a1);
  }

  static len(l0?: AnyLength, l1?: AnyLength): LengthInterpolator {
    return new Interpolator.Length(l0, l1);
  }

  static color: (c0?: AnyColor, c1?: AnyColor) => ColorInterpolator; // defined by ColorInterpolator

  static transform: (f0?: AnyTransform, f1?: AnyTransform) => TransformInterpolator; // defined by TransformInterpolator

  static structure: <I extends Item>(i0?: AnyItem, i1?: AnyItem) => StructureInterpolator<I>; // defined by StructureInterpolator

  static array<T>(a0?: ReadonlyArray<T>, a1?: ReadonlyArray<T>): ArrayInterpolator<T> {
    return new Interpolator.Array(a0, a1);
  }

  static map<S, T>(a: S, b: S, f: (value: S) => T): Interpolator<T> {
    return new Interpolator.Map(Interpolator.from(a, b), f);
  }

  static interpolator<T extends U, U = T>(i0?: Interpolator<T, U>, i1?: Interpolator<T, U>): InterpolatorInterpolator<T, U> {
    return new Interpolator.Interpolator(i0, i1);
  }

  static from<T extends U, U = T>(a?: U, b?: U): Interpolator<T, U> {
    if (a instanceof R2Shape || b instanceof R2Shape) {
      return Interpolator.shape(a as any, b as any) as unknown as Interpolator<T, U>;
    } else if (a instanceof DateTime || a instanceof Date || b instanceof DateTime || b instanceof Date) {
      return Interpolator.time(a as any, b as any) as unknown as Interpolator<T, U>;
    } else if (a instanceof Angle || b instanceof Angle) {
      return Interpolator.angle(a as any, b as any) as unknown as Interpolator<T, U>;
    } else if (a instanceof Length || b instanceof Length) {
      return Interpolator.len(a as any, b as any) as unknown as Interpolator<T, U>;
    } else if (a instanceof Color || b instanceof Color) {
      return Interpolator.color(a as any, b as any) as unknown as Interpolator<T, U>;
    } else if (a instanceof Transform || b instanceof Transform) {
      return Interpolator.transform(a as any, b as any) as unknown as Interpolator<T, U>;
    } else if (a instanceof Item || b instanceof Item) {
      return Interpolator.structure(a as any, b as any) as unknown as Interpolator<T, U>;
    } else if (typeof a === "number" || typeof b === "number") {
      return Interpolator.number(a as any, b as any) as unknown as Interpolator<T, U>;
    } else if (Array.isArray(a) || Array.isArray(b)) {
      return Interpolator.array(a as any, b as any) as unknown as Interpolator<T, U>;
    } else if (a instanceof Interpolator && b instanceof Interpolator) {
      return Interpolator.interpolator(a, b) as unknown as Interpolator<T, U>;
    } else {
      return Interpolator.step(a, b) as unknown as Interpolator<T, U>;
    }
  }

  static fromAny<T extends U, U = T>(value: AnyInterpolator<T, U>): Interpolator<T, U> {
    if (value instanceof Interpolator) {
      return value;
    } else if (typeof value === "string") {
      switch (value) {
        case "step": return Interpolator.step() as unknown as Interpolator<T, U>;
        case "number": return Interpolator.number() as unknown as Interpolator<T, U>;
        case "shape": return Interpolator.shape() as unknown as Interpolator<T, U>;
        case "time": return Interpolator.time() as unknown as Interpolator<T, U>;
        case "angle": return Interpolator.angle() as unknown as Interpolator<T, U>;
        case "length": return Interpolator.len() as unknown as Interpolator<T, U>;
        case "transform": return Interpolator.transform() as unknown as Interpolator<T, U>;
        case "color": return Interpolator.color() as unknown as Interpolator<T, U>;
        case "array": return Interpolator.array() as unknown as Interpolator<T, U>;
      }
    }
    throw new TypeError("" + value);
  }

  private static _form?: Form<Interpolator<any>, AnyInterpolator<any>>;
  static form<T extends U, U = T>(valueForm?: Form<T, U>, unit?: AnyInterpolator<T, U>)
                                : Form<Interpolator<T, U>, AnyInterpolator<T, U>> {
    if (valueForm === void 0) {
      valueForm = Interpolator.valueForm();
    }
    if (valueForm !== Interpolator.valueForm() || unit !== void 0) {
      return new Interpolator.Form(valueForm, unit !== void 0 ? Interpolator.fromAny(unit) : void 0);
    } else {
      if (!Interpolator._form) {
        Interpolator._form = new Interpolator.Form(valueForm);
      }
      return Interpolator._form;
    }
  }
  /** @hidden */
  static valueForm(): Form<any> {
    throw new Error(); // overridden by StyleForm
  }

  // Forward type declarations
  /** @hidden */
  static Step: typeof StepInterpolator; // defined by StepInterpolator
  /** @hidden */
  static Number: typeof NumberInterpolator; // defined by NumberInterpolator
  /** @hidden */
  static Shape: typeof ShapeInterpolator; // defined by ShapeInterpolator
  /** @hidden */
  static DateTime: typeof DateTimeInterpolator; // defined by DateTimeInterpolator
  /** @hidden */
  static Angle: typeof AngleInterpolator; // defined by AngleInterpolator
  /** @hidden */
  static Length: typeof LengthInterpolator; // defined by LengthInterpolator
  /** @hidden */
  static Color: typeof ColorInterpolator; // defined by ColorInterpolator
  /** @hidden */
  static Transform: typeof TransformInterpolator; // defined by TransformInterpolator
  /** @hidden */
  static Structure: typeof StructureInterpolator; // defined by StructureInterpolator
  /** @hidden */
  static Array: typeof ArrayInterpolator; // defined by ArrayInterpolator
  /** @hidden */
  static Interpolator: typeof InterpolatorInterpolator; // defined by InterpolatorInterpolator
  /** @hidden */
  static Map: typeof InterpolatorMap; // defined by InterpolatorMap
  /** @hidden */
  static Form: typeof InterpolatorForm; // defined by InterpolatorForm
}
