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

import {Spec, Test, Exam} from "@swim/unit";
import {R2Curve, R2Spline} from "@swim/math";

export class R2SplineParserSpec extends Spec {
  @Test
  parseAbsoluteDegenerateSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2"), R2Spline.empty());
    exam.equal(R2Spline.parse("M 1 -2"), R2Spline.empty());
  }

  @Test
  parseRelativeDegenerateSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2"), R2Spline.empty());
    exam.equal(R2Spline.parse("m 1 -2"), R2Spline.empty());
  }

  @Test
  parseAbsoluteMoveSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2,-3,5"), R2Spline.open(R2Curve.linear(1, -2, -3, 5)));
    exam.equal(R2Spline.parse("M 1 -2 -3 5"), R2Spline.open(R2Curve.linear(1, -2, -3, 5)));
  }

  @Test
  parseExplicitAbsoluteMoveSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2,-3,5,-7,-11"),
               R2Spline.open(R2Curve.linear(1, -2, -3, 5), R2Curve.linear(-3, 5, -7, -11)));
    exam.equal(R2Spline.parse("M 1,-2 -3,5 -7,-11"),
               R2Spline.open(R2Curve.linear(1, -2, -3, 5), R2Curve.linear(-3, 5, -7, -11)));
  }

  @Test
  parseRelativeMoveSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2,-4,7"), R2Spline.open(R2Curve.linear(1, -2, -3, 5)));
    exam.equal(R2Spline.parse("m 1 -2 -4 7"), R2Spline.open(R2Curve.linear(1, -2, -3, 5)));
  }

  @Test
  parseExplicitRelativeMoveSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2,-4,7,-4,-16"),
               R2Spline.open(R2Curve.linear(1, -2, -3, 5), R2Curve.linear(-3, 5, -7, -11)));
    exam.equal(R2Spline.parse("m 1,-2 -4,7 -4,-16"),
               R2Spline.open(R2Curve.linear(1, -2, -3, 5), R2Curve.linear(-3, 5, -7, -11)));
  }

  @Test
  parseAbsoluteLinearSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2L-3,5"), R2Spline.open(R2Curve.linear(1, -2, -3, 5)));
    exam.equal(R2Spline.parse("M 1 -2 L -3 5"), R2Spline.open(R2Curve.linear(1, -2, -3, 5)));
  }

  @Test
  parseExplicitAbsoluteLinearSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2L-3,5L-7,-11"),
               R2Spline.open(R2Curve.linear(1, -2, -3, 5), R2Curve.linear(-3, 5, -7, -11)));
    exam.equal(R2Spline.parse("M 1,-2 L -3,5 L -7,-11"),
               R2Spline.open(R2Curve.linear(1, -2, -3, 5), R2Curve.linear(-3, 5, -7, -11)));
  }

  @Test
  parseImplicitAbsoluteLinearSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2L-3,5,-7,-11"),
               R2Spline.open(R2Curve.linear(1, -2, -3, 5), R2Curve.linear(-3, 5, -7, -11)));
    exam.equal(R2Spline.parse("M 1,-2 L -3,5 -7,-11"),
               R2Spline.open(R2Curve.linear(1, -2, -3, 5), R2Curve.linear(-3, 5, -7, -11)));
  }

  @Test
  parseRelativeLinearSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2l-4,7"), R2Spline.open(R2Curve.linear(1, -2, -3, 5)));
    exam.equal(R2Spline.parse("m 1 -2 l -4 7"), R2Spline.open(R2Curve.linear(1, -2, -3, 5)));
  }

  @Test
  parseExplicitRelativeLinearSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2l-4,7l-4,-16"),
               R2Spline.open(R2Curve.linear(1, -2, -3, 5), R2Curve.linear(-3, 5, -7, -11)));
    exam.equal(R2Spline.parse("m 1,-2 l -4,7 l -4,-16"),
               R2Spline.open(R2Curve.linear(1, -2, -3, 5), R2Curve.linear(-3, 5, -7, -11)));
  }

  @Test
  parseImplicitRelativeLinearSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2l-4,7,-4,-16"),
               R2Spline.open(R2Curve.linear(1, -2, -3, 5), R2Curve.linear(-3, 5, -7, -11)));
    exam.equal(R2Spline.parse("m 1,-2 l -4,7 -4,-16"),
               R2Spline.open(R2Curve.linear(1, -2, -3, 5), R2Curve.linear(-3, 5, -7, -11)));
  }

  @Test
  parseAbsoluteHorizontalSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2H-3"), R2Spline.open(R2Curve.linear(1, -2, -3, -2)));
    exam.equal(R2Spline.parse("M 1 -2 H -3"), R2Spline.open(R2Curve.linear(1, -2, -3, -2)));
  }

  @Test
  parseExplicitAbsoluteHorizontalSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2H-3H-7"),
               R2Spline.open(R2Curve.linear(1, -2, -3, -2), R2Curve.linear(-3, -2, -7, -2)));
    exam.equal(R2Spline.parse("M 1,-2 H -3 H -7"),
               R2Spline.open(R2Curve.linear(1, -2, -3, -2), R2Curve.linear(-3, -2, -7, -2)));
  }

  @Test
  parseImplicitAbsoluteHorizontalSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2H-3,-7"),
               R2Spline.open(R2Curve.linear(1, -2, -3, -2), R2Curve.linear(-3, -2, -7, -2)));
    exam.equal(R2Spline.parse("M 1,-2 H -3 -7"),
               R2Spline.open(R2Curve.linear(1, -2, -3, -2), R2Curve.linear(-3, -2, -7, -2)));
  }

  @Test
  parseRelativeHorizontalSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2h-4"), R2Spline.open(R2Curve.linear(1, -2, -3, -2)));
    exam.equal(R2Spline.parse("m 1 -2 h -4"), R2Spline.open(R2Curve.linear(1, -2, -3, -2)));
  }

  @Test
  parseExplicitRelativeHorizontalSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2h-4h-4"),
               R2Spline.open(R2Curve.linear(1, -2, -3, -2), R2Curve.linear(-3, -2, -7, -2)));
    exam.equal(R2Spline.parse("m 1,-2 h -4 h -4"),
               R2Spline.open(R2Curve.linear(1, -2, -3, -2), R2Curve.linear(-3, -2, -7, -2)));
  }

  @Test
  parseImplicitRelativeHorizontalSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2h-4,-4"),
               R2Spline.open(R2Curve.linear(1, -2, -3, -2), R2Curve.linear(-3, -2, -7, -2)));
    exam.equal(R2Spline.parse("m 1,-2 h -4 -4"),
               R2Spline.open(R2Curve.linear(1, -2, -3, -2), R2Curve.linear(-3, -2, -7, -2)));
  }

  @Test
  parseAbsoluteVerticalSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2V5"), R2Spline.open(R2Curve.linear(1, -2, 1, 5)));
    exam.equal(R2Spline.parse("M 1 -2 V 5"), R2Spline.open(R2Curve.linear(1, -2, 1, 5)));
  }

  @Test
  parseExplicitAbsoluteVerticalSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2V5V-11"),
               R2Spline.open(R2Curve.linear(1, -2, 1, 5), R2Curve.linear(1, 5, 1, -11)));
    exam.equal(R2Spline.parse("M 1,-2 V 5 V -11"),
               R2Spline.open(R2Curve.linear(1, -2, 1, 5), R2Curve.linear(1, 5, 1, -11)));
  }

  @Test
  parseImplicitAbsoluteVerticalSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2V5,-11"),
               R2Spline.open(R2Curve.linear(1, -2, 1, 5), R2Curve.linear(1, 5, 1, -11)));
    exam.equal(R2Spline.parse("M 1,-2 V 5 -11"),
               R2Spline.open(R2Curve.linear(1, -2, 1, 5), R2Curve.linear(1, 5, 1, -11)));
  }

  @Test
  parseRelativeVerticalSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2v7"), R2Spline.open(R2Curve.linear(1, -2, 1, 5)));
    exam.equal(R2Spline.parse("m 1 -2 v 7"), R2Spline.open(R2Curve.linear(1, -2, 1, 5)));
  }

  @Test
  parseExplicitRelativeVerticalSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2v7v-16"),
               R2Spline.open(R2Curve.linear(1, -2, 1, 5), R2Curve.linear(1, 5, 1, -11)));
    exam.equal(R2Spline.parse("m 1,-2 v 7 v -16"),
               R2Spline.open(R2Curve.linear(1, -2, 1, 5), R2Curve.linear(1, 5, 1, -11)));
  }

  @Test
  parseImplicitRelativeVerticalSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2v7,-16"),
               R2Spline.open(R2Curve.linear(1, -2, 1, 5), R2Curve.linear(1, 5, 1, -11)));
    exam.equal(R2Spline.parse("m 1,-2 v 7 -16"),
               R2Spline.open(R2Curve.linear(1, -2, 1, 5), R2Curve.linear(1, 5, 1, -11)));
  }

  @Test
  parseAbsoluteQuadraticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2Q-3,5,-7,-11"), R2Spline.open(R2Curve.quadratic(1, -2, -3, 5, -7, -11)));
    exam.equal(R2Spline.parse("M 1 -2 Q -3 5 -7 -11"), R2Spline.open(R2Curve.quadratic(1, -2, -3, 5, -7, -11)));
  }

  @Test
  parseExplicitAbsoluteQuadraticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M-1,0Q-1,1,0,1Q1,1,1,0"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0)));
    exam.equal(R2Spline.parse("M -1,0 Q -1,1 0,1 Q 1,1 1,0"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0)));
  }

  @Test
  parseImplicitAbsoluteQuadraticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M-1,0Q-1,1,0,1,1,1,1,0"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0)));
    exam.equal(R2Spline.parse("M -1,0 Q -1,1 0,1 1,1 1,0"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0)));
  }

  @Test
  parseRelativeQuadraticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2q-4,7,-8,-9"), R2Spline.open(R2Curve.quadratic(1, -2, -3, 5, -7, -11)));
    exam.equal(R2Spline.parse("m 1 -2 q -4 7 -8 -9"), R2Spline.open(R2Curve.quadratic(1, -2, -3, 5, -7, -11)));
  }

  @Test
  parseExplicitRelativeQuadraticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m-1,0q0,1,1,1q1,0,1,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0)));
    exam.equal(R2Spline.parse("m -1,0 q 0,1 1,1 q 1,0 1,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0)));
  }

  @Test
  parseImplicitRelativeQuadraticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m-1,0q0,1,1,1,1,0,1,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0)));
    exam.equal(R2Spline.parse("m -1,0 q 0,1 1,1 1,0 1,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0)));
  }

  @Test
  parseAbsoluteSmoothQuadraticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2T-3,5"), R2Spline.open(R2Curve.quadratic(1, -2, 1, -2, -3, 5)));
    exam.equal(R2Spline.parse("M 1 -2 T -3 5"), R2Spline.open(R2Curve.quadratic(1, -2, 1, -2, -3, 5)));

    exam.equal(R2Spline.parse("M-1,0Q-1,1,0,1T1,0"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0)));
    exam.equal(R2Spline.parse("M -1,0 Q -1,1 0,1 T 1,0"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0)));
  }

  @Test
  parseExplicitAbsoluteSmoothQuadraticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M-1,0Q-1,1,0,1T1,0T0,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0), R2Curve.quadratic(1, 0, 1, -1, 0, -1)));
    exam.equal(R2Spline.parse("M -1,0 Q -1,1 0,1 T 1,0 T 0,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0), R2Curve.quadratic(1, 0, 1, -1, 0, -1)));
  }

  @Test
  parseImplicitAbsoluteSmoothQuadraticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M-1,0Q-1,1,0,1T1,0,0,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0), R2Curve.quadratic(1, 0, 1, -1, 0, -1)));
    exam.equal(R2Spline.parse("M -1,0 Q -1,1 0,1 T 1,0 0,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0), R2Curve.quadratic(1, 0, 1, -1, 0, -1)));
  }

  @Test
  parseRelativeSmoothQuadraticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2t-4,7"), R2Spline.open(R2Curve.quadratic(1, -2, 1, -2, -3, 5)));
    exam.equal(R2Spline.parse("m 1 -2 t -4 7"), R2Spline.open(R2Curve.quadratic(1, -2, 1, -2, -3, 5)));

    exam.equal(R2Spline.parse("m-1,0q0,1,1,1t1,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0)));
    exam.equal(R2Spline.parse("m -1,0 q 0,1 1,1 t 1,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0)));
  }

  @Test
  parseExplicitRelativeSmoothQuadraticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m-1,0q0,1,1,1t1,-1t-1,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0), R2Curve.quadratic(1, 0, 1, -1, 0, -1)));
    exam.equal(R2Spline.parse("m -1,0 q 0,1 1,1 t 1,-1 t -1,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0), R2Curve.quadratic(1, 0, 1, -1, 0, -1)));
  }

  @Test
  parseImplicitRelativeSmoothQuadraticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m-1,0q0,1,1,1t1,-1,-1,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0), R2Curve.quadratic(1, 0, 1, -1, 0, -1)));
    exam.equal(R2Spline.parse("m -1,0 q 0,1 1,1 t 1,-1 -1,-1"),
               R2Spline.open(R2Curve.quadratic(-1, 0, -1, 1, 0, 1), R2Curve.quadratic(0, 1, 1, 1, 1, 0), R2Curve.quadratic(1, 0, 1, -1, 0, -1)));
  }

  @Test
  parseAbsoluteCubicSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2C-3,5,-7,-11,13,17"), R2Spline.open(R2Curve.cubic(1, -2, -3, 5, -7, -11, 13, 17)));
    exam.equal(R2Spline.parse("M 1 -2 C -3 5 -7 -11 13 17"), R2Spline.open(R2Curve.cubic(1, -2, -3, 5, -7, -11, 13, 17)));
  }

  @Test
  parseExplicitAbsoluteCubicSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M-1,0C-1,0.5,-0.5,1,0,1C0.5,1,1,0.5,1,0"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0)));
    exam.equal(R2Spline.parse("M -1,0 C -1,0.5 -0.5,1 0,1 C 0.5,1 1,0.5 1,0"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0)));
  }

  @Test
  parseImplicitAbsoluteCubicSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M-1,0C-1,0.5,-0.5,1,0,1,0.5,1,1,0.5,1,0"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0)));
    exam.equal(R2Spline.parse("M -1,0 C -1,0.5 -0.5,1 0,1 0.5,1 1,0.5 1,0"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0)));
  }

  @Test
  parseRelativeCubicSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2c-4,7,-8,-9,12,19"), R2Spline.open(R2Curve.cubic(1, -2, -3, 5, -7, -11, 13, 17)));
    exam.equal(R2Spline.parse("m 1 -2 c -4 7 -8 -9 12 19"), R2Spline.open(R2Curve.cubic(1, -2, -3, 5, -7, -11, 13, 17)));
  }

  @Test
  parseExplicitRelativeCubicSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m-1,0c0,0.5,0.5,1,1,1c0.5,0,1,-0.5,1,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0)));
    exam.equal(R2Spline.parse("m -1,0 c 0,0.5 0.5,1 1,1 c 0.5,0 1,-0.5 1,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0)));
  }

  @Test
  parseImplicitRelativeCubicSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m-1,0c0,0.5,0.5,1,1,1,0.5,0,1,-0.5,1,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0)));
    exam.equal(R2Spline.parse("m -1,0 c 0,0.5 0.5,1 1,1 0.5,0 1,-0.5 1,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0)));
  }

  @Test
  parseAbsoluteSmoothCubicSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2S-3,5,-7,-11"), R2Spline.open(R2Curve.cubic(1, -2, 1, -2, -3, 5, -7, -11)));
    exam.equal(R2Spline.parse("M 1 -2 S -3 5 -7 -11"), R2Spline.open(R2Curve.cubic(1, -2, 1, -2, -3, 5, -7, -11)));

    exam.equal(R2Spline.parse("M-1,0C-1,0.5,-0.5,1,0,1S1,0.5,1,0"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0)));
    exam.equal(R2Spline.parse("M -1,0 C -1,0.5 -0.5,1 0,1 S 1,0.5 1,0"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0)));
  }

  @Test
  parseExplicitAbsoluteSmoothCubicSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M-1,0C-1,0.5,-0.5,1,0,1S1,0.5,1,0S0.5,-1,0,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0), R2Curve.cubic(1, 0, 1, -0.5, 0.5, -1, 0, -1)));
    exam.equal(R2Spline.parse("M -1,0 C -1,0.5 -0.5,1 0,1 S 1,0.5 1,0 S 0.5,-1 0,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0), R2Curve.cubic(1, 0, 1, -0.5, 0.5, -1, 0, -1)));
  }

  @Test
  parseImplicitAbsoluteSmoothCubicSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M-1,0C-1,0.5,-0.5,1,0,1S1,0.5,1,0,0.5,-1,0,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0), R2Curve.cubic(1, 0, 1, -0.5, 0.5, -1, 0, -1)));
    exam.equal(R2Spline.parse("M -1,0 C -1,0.5 -0.5,1 0,1 S 1,0.5 1,0 0.5,-1 0,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0), R2Curve.cubic(1, 0, 1, -0.5, 0.5, -1, 0, -1)));
  }

  @Test
  parseRelativeSmoothCubicSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2s-4,7,-8,-9"), R2Spline.open(R2Curve.cubic(1, -2, 1, -2, -3, 5, -7, -11)));
    exam.equal(R2Spline.parse("m 1 -2 s -4 7 -8 -9"), R2Spline.open(R2Curve.cubic(1, -2, 1, -2, -3, 5, -7, -11)));

    exam.equal(R2Spline.parse("m-1,0c0,0.5,0.5,1,1,1s1,-0.5,1,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0)));
    exam.equal(R2Spline.parse("m -1,0 c 0,0.5 0.5,1 1,1 s 1,-0.5 1,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0)));
  }

  @Test
  parseExplicitRelativeSmoothCubicSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m-1,0c0,0.5,0.5,1,1,1s1,-0.5,1,-1s-0.5,-1,-1,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0), R2Curve.cubic(1, 0, 1, -0.5, 0.5, -1, 0, -1)));
    exam.equal(R2Spline.parse("m -1,0 c 0,0.5 0.5,1 1,1 s 1,-0.5 1,-1 s -0.5,-1 -1,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0), R2Curve.cubic(1, 0, 1, -0.5, 0.5, -1, 0, -1)));
  }

  @Test
  parseImplicitRelativeSmoothCubicSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m-1,0c0,0.5,0.5,1,1,1s1,-0.5,1,-1,-0.5,-1,-1,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0), R2Curve.cubic(1, 0, 1, -0.5, 0.5, -1, 0, -1)));
    exam.equal(R2Spline.parse("m -1,0 c 0,0.5 0.5,1 1,1 s 1,-0.5 1,-1 -0.5,-1 -1,-1"),
               R2Spline.open(R2Curve.cubic(-1, 0, -1, 0.5, -0.5, 1, 0, 1), R2Curve.cubic(0, 1, 0.5, 1, 1, 0.5, 1, 0), R2Curve.cubic(1, 0, 1, -0.5, 0.5, -1, 0, -1)));
  }

  @Test
  parseAbsoluteEllipticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M -1,0 A 1,1 0 0,1 0,-1"), R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2)));
    exam.equal(R2Spline.parse("M -1,0 A 1,1 0 1,0 0,-1"), R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, -3 * Math.PI / 2)));
    exam.equal(R2Spline.parse("M -1,0 A 1,1 0 0,0 0,-1"), R2Spline.open(R2Curve.elliptic(-1, -1, 1, 1, 0, Math.PI / 2, -Math.PI / 2)));
    exam.equal(R2Spline.parse("M -1,0 A 1,1 0 1,1 0,-1"), R2Spline.open(R2Curve.elliptic(-1, -1, 1, 1, 0, Math.PI / 2, 3 * Math.PI / 2)));
  }

  @Test
  parseExplicitAbsoluteEllipticSplines(exam: Exam): void {
    exam.equivalent(R2Spline.parse("M-1,0A1,1,0,0,0,0,1A1,1,0,0,0,1,0"),
                    R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, -Math.PI / 2), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI / 2, -Math.PI / 2)));
    exam.equivalent(R2Spline.parse("M -1,0 A 1,1 0 0,0 0,1 A 1,1 0 0,0 1,0"),
                    R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, -Math.PI / 2), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI / 2, -Math.PI / 2)));
  }

  @Test
  parseImplicitAbsoluteEllipticSplines(exam: Exam): void {
    exam.equivalent(R2Spline.parse("M-1,0A1,1,0,0,0,0,1,1,1,0,0,0,1,0"),
                    R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, -Math.PI / 2), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI / 2, -Math.PI / 2)));
    exam.equivalent(R2Spline.parse("M -1,0 A 1,1 0 0,0 0,1 1,1 0 0,0 1,0"),
                    R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, -Math.PI / 2), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI / 2, -Math.PI / 2)));
  }

  @Test
  parseRelativeEllipticSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m -1,0 a 1,1 0 0,1 1,-1"), R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2)));
    exam.equal(R2Spline.parse("m -1,0 a 1,1 0 1,0 1,-1"), R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, -3 * Math.PI / 2)));
    exam.equal(R2Spline.parse("m -1,0 a 1,1 0 0,0 1,-1"), R2Spline.open(R2Curve.elliptic(-1, -1, 1, 1, 0, Math.PI / 2, -Math.PI / 2)));
    exam.equal(R2Spline.parse("m -1,0 a 1,1 0 1,1 1,-1"), R2Spline.open(R2Curve.elliptic(-1, -1, 1, 1, 0, Math.PI / 2, 3 * Math.PI / 2)));
  }

  @Test
  parseExplicitRelativeEllipticSplines(exam: Exam): void {
    exam.equivalent(R2Spline.parse("m-1,0a1,1,0,0,0,1,1a1,1,0,0,0,1,-1"),
                    R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, -Math.PI / 2), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI / 2, -Math.PI / 2)));
    exam.equivalent(R2Spline.parse("m -1,0 a 1,1 0 0,0 1,1 a 1,1 0 0,0 1,-1"),
                    R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, -Math.PI / 2), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI / 2, -Math.PI / 2)));
  }

  @Test
  parseImplicitRelativeEllipticSplines(exam: Exam): void {
    exam.equivalent(R2Spline.parse("m-1,0a1,1,0,0,0,1,1,1,1,0,0,0,1,-1"),
                    R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, -Math.PI / 2), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI / 2, -Math.PI / 2)));
    exam.equivalent(R2Spline.parse("m -1,0 a 1,1 0 0,0 1,1 1,1 0 0,0 1,-1"),
                    R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, -Math.PI / 2), R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI / 2, -Math.PI / 2)));
  }

  @Test
  parseAbsoluteDegenerateClosedSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M1,-2Z"), R2Spline.closed(R2Curve.linear(1, -2, 1, -2)));
    exam.equal(R2Spline.parse("M 1 -2 Z"), R2Spline.closed(R2Curve.linear(1, -2, 1, -2)));
  }

  @Test
  parseRelativeDegenerateClosedSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m1,-2Z"), R2Spline.closed(R2Curve.linear(1, -2, 1, -2)));
    exam.equal(R2Spline.parse("m 1 -2 Z"), R2Spline.closed(R2Curve.linear(1, -2, 1, -2)));
  }

  @Test
  parseAbsoluteClosedSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("M-1,0L0,1L1,0Z"),
               R2Spline.closed(R2Curve.linear(-1, 0, 0, 1), R2Curve.linear(0, 1, 1, 0), R2Curve.linear(1, 0, -1, 0)));
    exam.equal(R2Spline.parse("M -1,0 L 0,1 L 1,0 Z"),
               R2Spline.closed(R2Curve.linear(-1, 0, 0, 1), R2Curve.linear(0, 1, 1, 0), R2Curve.linear(1, 0, -1, 0)));
  }

  @Test
  parseRelativeClosedSplines(exam: Exam): void {
    exam.equal(R2Spline.parse("m-1,0l1,1l1,-1z"),
               R2Spline.closed(R2Curve.linear(-1, 0, 0, 1), R2Curve.linear(0, 1, 1, 0), R2Curve.linear(1, 0, -1, 0)));
    exam.equal(R2Spline.parse("m -1,0 l 1,1 l 1,-1 z"),
               R2Spline.closed(R2Curve.linear(-1, 0, 0, 1), R2Curve.linear(0, 1, 1, 0), R2Curve.linear(1, 0, -1, 0)));
  }
}
