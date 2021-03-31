// Copyright 2015-2020 Swim inc.
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
import {CurveR2, SplineR2, PathR2} from "@swim/math";

export class PathR2WriterSpec extends Spec {
  @Test
  writeEmptyPaths(exam: Exam): void {
    exam.equal(PathR2.empty().toPathString(), "");
  }

  @Test
  writeDegenerateClosedPaths(exam: Exam): void {
    exam.equal(PathR2.closed(CurveR2.linear(1, -2, 1, -2)).toPathString(), "M1,-2Z");
  }

  @Test
  writeMultipleDegenerateClosedPaths(exam: Exam): void {
    exam.equal(PathR2.of(SplineR2.closed(CurveR2.linear(1, -2, 1, -2)),
                         SplineR2.closed(CurveR2.linear(-3, 5, -3, 5))).toPathString(),
               "M1,-2ZM-3,5Z");
  }

  @Test
  writeLinearPaths(exam: Exam): void {
    exam.equal(PathR2.open(CurveR2.linear(0, 1, 1, 0)).toPathString(), "M0,1L1,0");
  }

  @Test
  writeQuadraticPaths(exam: Exam): void {
    exam.equal(SplineR2.open(CurveR2.quadratic(1, -2, -3, 5, -7, -11)).toPathString(),
               "M1,-2Q-3,5,-7,-11");
  }

  @Test
  writeCubicPaths(exam: Exam): void {
    exam.equal(SplineR2.open(CurveR2.cubic(1, -2, -3, 5, -7, -11, 13, 17)).toPathString(),
               "M1,-2C-3,5,-7,-11,13,17");
  }

  @Test
  writeEllipticPaths(exam: Exam): void {
    exam.equal(SplineR2.open(CurveR2.elliptic(0, 0, 1, 1, 0, Math.PI, Math.PI / 2)).toPathString({precision: 12}),
               "M-1,0A1,1 0 0,1 0,-1");
    exam.equal(SplineR2.open(CurveR2.elliptic(0, 0, 1, 1, 0, Math.PI, -3 * Math.PI / 2)).toPathString({precision: 12}),
               "M-1,0A1,1 0 1,0 0,-1");
    exam.equal(SplineR2.open(CurveR2.elliptic(-1, -1, 1, 1, 0, Math.PI / 2, -Math.PI / 2)).toPathString({precision: 12}),
               "M-1,0A1,1 0 0,0 0,-1");
    exam.equal(SplineR2.open(CurveR2.elliptic(-1, -1, 1, 1, 0, Math.PI / 2, 3 * Math.PI / 2)).toPathString({precision: 12}),
               "M-1,0A1,1 0 1,1 0,-1");
  }

  @Test
  writeMultipleLinearPaths(exam: Exam): void {
    exam.equal(PathR2.of(SplineR2.open(CurveR2.linear(0, 1, 1, 0)),
                         SplineR2.open(CurveR2.linear(-1, 0, 0, -1))).toPathString(),
               "M0,1L1,0M-1,0L0,-1");
  }

  @Test
  writeClosedLinearPaths(exam: Exam): void {
    exam.equal(PathR2.closed(CurveR2.linear(0, 1, 1, 0), CurveR2.linear(1, 0, 0, 0), CurveR2.linear(0, 0, 0, 1)).toPathString(),
               "M0,1L1,0L0,0Z");
  }

  @Test
  writeMultipleClosedLinearPaths(exam: Exam): void {
    exam.equal(PathR2.of(SplineR2.closed(CurveR2.linear(0, 1, 1, 0), CurveR2.linear(1, 0, 0, 0), CurveR2.linear(0, 0, 0, 1)),
                         SplineR2.closed(CurveR2.linear(-1, 0, 0, -1), CurveR2.linear(0, -1, 0, 0), CurveR2.linear(0, 0, -1, 0))).toPathString(),
               "M0,1L1,0L0,0ZM-1,0L0,-1L0,0Z");
  }
}
