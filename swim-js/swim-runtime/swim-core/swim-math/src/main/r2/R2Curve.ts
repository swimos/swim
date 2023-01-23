 // Copyright 2015-2023 Swim.inc
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

import type {Equivalent, Equals} from "@swim/util";
import {AnyOutputSettings, Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import type {R2Function} from "./R2Function";
import {R2Shape} from "./R2Shape";
import type {R2Point} from "./R2Point";
import type {R2CurveContext} from "./R2CurveContext";
import {R2CurveParser} from "../"; // forward import
import {R2Segment} from "../"; // forward import
import {R2QuadraticCurve} from "../"; // forward import
import {R2CubicCurve} from "../"; // forward import
import {R2EllipticCurve} from "../"; // forward import

/** @public */
export abstract class R2Curve extends R2Shape implements Equals, Equivalent {
  abstract interpolateX(u: number): number;

  abstract interpolateY(u: number): number;

  abstract interpolate(u: number): R2Point;

  abstract split(u: number): [R2Curve, R2Curve];

  abstract override transform(f: R2Function): R2Curve;

  abstract drawMove(context: R2CurveContext): void;

  abstract drawRest(context: R2CurveContext): void;

  draw(context: R2CurveContext): void {
    this.drawMove(context);
    this.drawRest(context);
  }

  abstract transformDrawMove(context: R2CurveContext, f: R2Function): void;

  abstract transformDrawRest(context: R2CurveContext, f: R2Function): void;

  transformDraw(context: R2CurveContext, f: R2Function): void {
    this.transformDrawMove(context, f);
    this.transformDrawRest(context, f);
  }

  abstract writeMove<T>(output: Output<T>): Output<T>;

  abstract writeRest<T>(output: Output<T>): Output<T>;

  writePath<T>(output: Output<T>): Output<T> {
    output = this.writeMove(output);
    output = this.writeRest(output);
    return output;
  }

  toPathString(outputSettings?: AnyOutputSettings): string {
    let output = Unicode.stringOutput(outputSettings);
    output = this.writePath(output);
    return output.toString();
  }

  abstract equivalentTo(that: unknown, epsilon?: number): boolean;

  abstract equals(that: unknown): boolean;

  static linear(x0: number, y0: number, x1: number, y1: number): R2Curve {
    return new R2Segment(x0, y0, x1, y1);
  }

  static quadratic(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): R2Curve {
    return new R2QuadraticCurve(x0, y0, x1, y1, x2, y2);
  }

  static cubic(x0: number, y0: number, x1: number, y1: number,
               x2: number, y2: number, x3: number, y3: number): R2Curve {
    return new R2CubicCurve(x0, y0, x1, y1, x2, y2, x3, y3);
  }

  static elliptic(cx: number, cy: number, rx: number, ry: number,
                  phi: number, a0: number, da: number): R2Curve {
    return new R2EllipticCurve(cx, cy, rx, ry, phi, a0, da);
  }

  static parse(string: string): R2Curve {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = R2CurveParser.parse(input);
    if (parser.isDone()) {
      while (input.isCont() && Unicode.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }
}
