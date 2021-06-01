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

import {Spec, Test, Exam} from "@swim/unit";
import {R2Curve} from "@swim/math";

export class R2CurveParserSpec extends Spec {
  @Test
  parseAbsoluteMoveCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("M1,-2,-3,5"), R2Curve.linear(1, -2, -3, 5));
    exam.equal(R2Curve.parse("M 1 , -2 , -3 , 5"), R2Curve.linear(1, -2, -3, 5));
    exam.equal(R2Curve.parse("M1-2-3+5"), R2Curve.linear(1, -2, -3, 5));
    exam.equal(R2Curve.parse("M 1 -2 -3 5"), R2Curve.linear(1, -2, -3, 5));
  }

  @Test
  parseRelativeMoveCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("m1,-2,-4,7"), R2Curve.linear(1, -2, -3, 5));
    exam.equal(R2Curve.parse("m 1 , -2 , -4 , 7"), R2Curve.linear(1, -2, -3, 5));
    exam.equal(R2Curve.parse("m1-2-4+7"), R2Curve.linear(1, -2, -3, 5));
    exam.equal(R2Curve.parse("m 1 -2 -4 7"), R2Curve.linear(1, -2, -3, 5));
  }

  @Test
  parseAbsoluteLinearCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("M1,-2L-3,5"), R2Curve.linear(1, -2, -3, 5));
    exam.equal(R2Curve.parse("M 1 , -2 L -3 , 5"), R2Curve.linear(1, -2, -3, 5));
    exam.equal(R2Curve.parse("M1-2L-3+5"), R2Curve.linear(1, -2, -3, 5));
    exam.equal(R2Curve.parse("M 1 -2 L -3 5"), R2Curve.linear(1, -2, -3, 5));
  }

  @Test
  parseRelativeLinearCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("m1,-2l-4,7"), R2Curve.linear(1, -2, -3, 5));
    exam.equal(R2Curve.parse("m 1 , -2 l -4 , 7"), R2Curve.linear(1, -2, -3, 5));
    exam.equal(R2Curve.parse("m1-2l-4+7"), R2Curve.linear(1, -2, -3, 5));
    exam.equal(R2Curve.parse("m 1 -2 l -4 7"), R2Curve.linear(1, -2, -3, 5));
  }

  @Test
  parseAbsoluteHorizontalCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("M1,-2H-3"), R2Curve.linear(1, -2, -3, -2));
    exam.equal(R2Curve.parse("M 1 , -2 H -3"), R2Curve.linear(1, -2, -3, -2));
    exam.equal(R2Curve.parse("M1-2H-3"), R2Curve.linear(1, -2, -3, -2));
    exam.equal(R2Curve.parse("M 1 -2 H -3"), R2Curve.linear(1, -2, -3, -2));
  }

  @Test
  parseRelativeHorizontalCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("m1,-2h-4"), R2Curve.linear(1, -2, -3, -2));
    exam.equal(R2Curve.parse("m 1 , -2 h -4"), R2Curve.linear(1, -2, -3, -2));
    exam.equal(R2Curve.parse("m1-2h-4"), R2Curve.linear(1, -2, -3, -2));
    exam.equal(R2Curve.parse("m 1 -2 h -4"), R2Curve.linear(1, -2, -3, -2));
  }

  @Test
  parseAbsoluteVerticalCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("M1,-2V5"), R2Curve.linear(1, -2, 1, 5));
    exam.equal(R2Curve.parse("M 1 , -2 V 5"), R2Curve.linear(1, -2, 1, 5));
    exam.equal(R2Curve.parse("M1-2V5"), R2Curve.linear(1, -2, 1, 5));
    exam.equal(R2Curve.parse("M 1 -2 V 5"), R2Curve.linear(1, -2, 1, 5));
  }

  @Test
  parseRelativeVerticalCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("m1,-2v7"), R2Curve.linear(1, -2, 1, 5));
    exam.equal(R2Curve.parse("m 1 , -2 v 7"), R2Curve.linear(1, -2, 1, 5));
    exam.equal(R2Curve.parse("m1-2v7"), R2Curve.linear(1, -2, 1, 5));
    exam.equal(R2Curve.parse("m 1 -2 v 7"), R2Curve.linear(1, -2, 1, 5));
  }

  @Test
  parseAbsoluteQuadraticCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("M1,-2Q-3,5,-7,-11"), R2Curve.quadratic(1, -2, -3, 5, -7, -11));
    exam.equal(R2Curve.parse("M 1 , -2 Q -3 , 5 , -7 , -11"), R2Curve.quadratic(1, -2, -3, 5, -7, -11));
    exam.equal(R2Curve.parse("M1-2Q-3+5-7-11"), R2Curve.quadratic(1, -2, -3, 5, -7, -11));
    exam.equal(R2Curve.parse("M 1 -2 Q -3 5 -7 -11"), R2Curve.quadratic(1, -2, -3, 5, -7, -11));
  }

  @Test
  parseRelativeQuadraticCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("m1,-2q-4,7,-8,-9"), R2Curve.quadratic(1, -2, -3, 5, -7, -11));
    exam.equal(R2Curve.parse("m 1 , -2 q -4 , 7 , -8 , -9"), R2Curve.quadratic(1, -2, -3, 5, -7, -11));
    exam.equal(R2Curve.parse("m1-2q-4+7-8-9"), R2Curve.quadratic(1, -2, -3, 5, -7, -11));
    exam.equal(R2Curve.parse("m 1 -2 q -4 7 -8 -9"), R2Curve.quadratic(1, -2, -3, 5, -7, -11));
  }

  @Test
  parseAbsoluteSmoothQuadraticCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("M1,-2T-3,5"), R2Curve.quadratic(1, -2, 1, -2, -3, 5));
    exam.equal(R2Curve.parse("M 1 , -2 T -3 , 5"), R2Curve.quadratic(1, -2, 1, -2, -3, 5));
    exam.equal(R2Curve.parse("M1-2T-3+5"), R2Curve.quadratic(1, -2, 1, -2, -3, 5));
    exam.equal(R2Curve.parse("M 1 -2 T -3 5"), R2Curve.quadratic(1, -2, 1, -2, -3, 5));
  }

  @Test
  parseRelativeSmoothQuadraticCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("m1,-2t-4,7"), R2Curve.quadratic(1, -2, 1, -2, -3, 5));
    exam.equal(R2Curve.parse("m 1 , -2 t -4 , 7"), R2Curve.quadratic(1, -2, 1, -2, -3, 5));
    exam.equal(R2Curve.parse("m1-2t-4+7"), R2Curve.quadratic(1, -2, 1, -2, -3, 5));
    exam.equal(R2Curve.parse("m 1 -2 t -4 7"), R2Curve.quadratic(1, -2, 1, -2, -3, 5));
  }

  @Test
  parseAbsoluteCubicCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("M1,-2C-3,5,-7,-11,13,17"), R2Curve.cubic(1, -2, -3, 5, -7, -11, 13, 17));
    exam.equal(R2Curve.parse("M 1 , -2 C -3 , 5 , -7 , -11 , 13 , 17"), R2Curve.cubic(1, -2, -3, 5, -7, -11, 13, 17));
    exam.equal(R2Curve.parse("M1-2C-3+5-7-11+13+17"), R2Curve.cubic(1, -2, -3, 5, -7, -11, 13, 17));
    exam.equal(R2Curve.parse("M 1 -2 C -3 5 -7 -11 13 17"), R2Curve.cubic(1, -2, -3, 5, -7, -11, 13, 17));
  }

  @Test
  parseRelativeCubicCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("m1,-2c-4,7,-8,-9,12,19"), R2Curve.cubic(1, -2, -3, 5, -7, -11, 13, 17));
    exam.equal(R2Curve.parse("m 1 , -2 c -4 , 7 , -8 , -9 , 12 , 19"), R2Curve.cubic(1, -2, -3, 5, -7, -11, 13, 17));
    exam.equal(R2Curve.parse("m1-2c-4+7-8-9+12+19"), R2Curve.cubic(1, -2, -3, 5, -7, -11, 13, 17));
    exam.equal(R2Curve.parse("m 1 -2 c -4 7 -8 -9 12 19"), R2Curve.cubic(1, -2, -3, 5, -7, -11, 13, 17));
  }

  @Test
  parseAbsoluteSmoothCubicCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("M1,-2S-3,5,-7,-11"), R2Curve.cubic(1, -2, 1, -2, -3, 5, -7, -11));
    exam.equal(R2Curve.parse("M 1 , -2 S -3 , 5 , -7 , -11"), R2Curve.cubic(1, -2, 1, -2, -3, 5, -7, -11));
    exam.equal(R2Curve.parse("M1-2S-3+5-7-11"), R2Curve.cubic(1, -2, 1, -2, -3, 5, -7, -11));
    exam.equal(R2Curve.parse("M 1 -2 S -3 5 -7 -11"), R2Curve.cubic(1, -2, 1, -2, -3, 5, -7, -11));
  }

  @Test
  parseRelativeSmoothCubicCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("m1,-2s-4,7,-8,-9"), R2Curve.cubic(1, -2, 1, -2, -3, 5, -7, -11));
    exam.equal(R2Curve.parse("m 1 , -2 s -4 , 7 , -8 , -9"), R2Curve.cubic(1, -2, 1, -2, -3, 5, -7, -11));
    exam.equal(R2Curve.parse("m1-2s-4+7-8-9"), R2Curve.cubic(1, -2, 1, -2, -3, 5, -7, -11));
    exam.equal(R2Curve.parse("m 1 -2 s -4 7 -8 -9"), R2Curve.cubic(1, -2, 1, -2, -3, 5, -7, -11));
  }

  @Test
  parseAbsoluteEllipticCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("M-1,0A1,1,0,0,1,0,-1"), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2));
    exam.equal(R2Curve.parse("M -1 , 0 A 1 , 1 , 0 , 0 , 1 , 0 , -1"), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2));
    exam.equal(R2Curve.parse("M-1+0A1+1+0 0 1+0-1"), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2));
    exam.equal(R2Curve.parse("M -1 0 A 1 1 0 0 1 0 -1"), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2));

    exam.equal(R2Curve.parse("M -1,0 A 1,1 0 0,1 0,-1"), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2));
    exam.equal(R2Curve.parse("M -1,0 A 1,1 0 1,0 0,-1"), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, -3 * Math.PI / 2));
    exam.equal(R2Curve.parse("M -1,0 A 1,1 0 0,0 0,-1"), R2Curve.elliptic(-1, -1, 1, 1, 0, Math.PI / 2, -Math.PI / 2));
    exam.equal(R2Curve.parse("M -1,0 A 1,1 0 1,1 0,-1"), R2Curve.elliptic(-1, -1, 1, 1, 0, Math.PI / 2, 3 * Math.PI / 2));
  }

  @Test
  parseRelativeEllipticCurves(exam: Exam): void {
    exam.equal(R2Curve.parse("m-1,0a1,1,0,0,1,1,-1"), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2));
    exam.equal(R2Curve.parse("m -1 , 0 a 1 , 1 , 0 , 0 , 1 , 1 , -1"), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2));
    exam.equal(R2Curve.parse("m-1+0a1+1+0 0 1+1-1"), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2));
    exam.equal(R2Curve.parse("m -1 0 a 1 1 0 0 1 1 -1"), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2));

    exam.equal(R2Curve.parse("m -1,0 a 1,1 0 0,1 1,-1"), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2));
    exam.equal(R2Curve.parse("m -1,0 a 1,1 0 1,0 1,-1"), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, -3 * Math.PI / 2));
    exam.equal(R2Curve.parse("m -1,0 a 1,1 0 0,0 1,-1"), R2Curve.elliptic(-1, -1, 1, 1, 0, Math.PI / 2, -Math.PI / 2));
    exam.equal(R2Curve.parse("m -1,0 a 1,1 0 1,1 1,-1"), R2Curve.elliptic(-1, -1, 1, 1, 0, Math.PI / 2, 3 * Math.PI / 2));
  }
}
