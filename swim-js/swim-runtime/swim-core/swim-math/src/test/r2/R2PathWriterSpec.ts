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

import {Spec, Test, Exam} from "@swim/unit";
import {R2Curve, R2Spline, R2Path} from "@swim/math";

export class R2PathWriterSpec extends Spec {
  @Test
  writeEmptyPaths(exam: Exam): void {
    exam.equal(R2Path.empty().toPathString(), "");
  }

  @Test
  writeDegenerateClosedPaths(exam: Exam): void {
    exam.equal(R2Path.closed(R2Curve.linear(1, -2, 1, -2)).toPathString(), "M1,-2Z");
  }

  @Test
  writeMultipleDegenerateClosedPaths(exam: Exam): void {
    exam.equal(R2Path.of(R2Spline.closed(R2Curve.linear(1, -2, 1, -2)),
                         R2Spline.closed(R2Curve.linear(-3, 5, -3, 5))).toPathString(),
               "M1,-2ZM-3,5Z");
  }

  @Test
  writeLinearPaths(exam: Exam): void {
    exam.equal(R2Path.open(R2Curve.linear(0, 1, 1, 0)).toPathString(), "M0,1L1,0");
  }

  @Test
  writeQuadraticPaths(exam: Exam): void {
    exam.equal(R2Spline.open(R2Curve.quadratic(1, -2, -3, 5, -7, -11)).toPathString(),
               "M1,-2Q-3,5,-7,-11");
  }

  @Test
  writeCubicPaths(exam: Exam): void {
    exam.equal(R2Spline.open(R2Curve.cubic(1, -2, -3, 5, -7, -11, 13, 17)).toPathString(),
               "M1,-2C-3,5,-7,-11,13,17");
  }

  @Test
  writeEllipticPaths(exam: Exam): void {
    exam.equal(R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2)).toPathString({precision: 12}),
               "M-1,0A1,1 0 0,1 0,-1");
    exam.equal(R2Spline.open(R2Curve.elliptic(0, 0, 1, 1, 0, Math.PI, -3 * Math.PI / 2)).toPathString({precision: 12}),
               "M-1,0A1,1 0 1,0 0,-1");
    exam.equal(R2Spline.open(R2Curve.elliptic(-1, -1, 1, 1, 0, Math.PI / 2, -Math.PI / 2)).toPathString({precision: 12}),
               "M-1,0A1,1 0 0,0 0,-1");
    exam.equal(R2Spline.open(R2Curve.elliptic(-1, -1, 1, 1, 0, Math.PI / 2, 3 * Math.PI / 2)).toPathString({precision: 12}),
               "M-1,0A1,1 0 1,1 0,-1");
  }

  @Test
  writeMultipleLinearPaths(exam: Exam): void {
    exam.equal(R2Path.of(R2Spline.open(R2Curve.linear(0, 1, 1, 0)),
                         R2Spline.open(R2Curve.linear(-1, 0, 0, -1))).toPathString(),
               "M0,1L1,0M-1,0L0,-1");
  }

  @Test
  writeClosedLinearPaths(exam: Exam): void {
    exam.equal(R2Path.closed(R2Curve.linear(0, 1, 1, 0), R2Curve.linear(1, 0, 0, 0), R2Curve.linear(0, 0, 0, 1)).toPathString(),
               "M0,1L1,0L0,0Z");
  }

  @Test
  writeMultipleClosedLinearPaths(exam: Exam): void {
    exam.equal(R2Path.of(R2Spline.closed(R2Curve.linear(0, 1, 1, 0), R2Curve.linear(1, 0, 0, 0), R2Curve.linear(0, 0, 0, 1)),
                         R2Spline.closed(R2Curve.linear(-1, 0, 0, -1), R2Curve.linear(0, -1, 0, 0), R2Curve.linear(0, 0, -1, 0))).toPathString(),
               "M0,1L1,0L0,0ZM-1,0L0,-1L0,0Z");
  }
}
