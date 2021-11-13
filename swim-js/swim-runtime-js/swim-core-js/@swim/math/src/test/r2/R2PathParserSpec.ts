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
import {R2Curve, R2Spline, R2Path} from "@swim/math";

export class R2PathParserSpec extends Spec {
  @Test
  parseEmptyPaths(exam: Exam): void {
    exam.equal(R2Path.parse(""), R2Path.empty());
    exam.equal(R2Path.parse("none"), R2Path.empty());
  }

  @Test
  parseDegeneratePaths(exam: Exam): void {
    exam.equal(R2Path.parse("M1,-2"), R2Path.empty());
    exam.equal(R2Path.parse("M 1 -2"), R2Path.empty());
    exam.equal(R2Path.parse("m1,-2"), R2Path.empty());
    exam.equal(R2Path.parse("m 1 -2"), R2Path.empty());
  }

  @Test
  parseMultipleDegeneratePaths(exam: Exam): void {
    exam.equal(R2Path.parse("M1,-2M-3,5"), R2Path.empty());
    exam.equal(R2Path.parse("M 1 -2 M -3 5"), R2Path.empty());
    exam.equal(R2Path.parse("m1,-2m-3,5"), R2Path.empty());
    exam.equal(R2Path.parse("m 1 -2 m -3 5"), R2Path.empty());
  }

  @Test
  parseDegenerateClosedPaths(exam: Exam): void {
    exam.equal(R2Path.parse("M1,-2Z"), R2Path.closed(R2Curve.linear(1, -2, 1, -2)));
    exam.equal(R2Path.parse("M 1 -2 Z"), R2Path.closed(R2Curve.linear(1, -2, 1, -2)));
    exam.equal(R2Path.parse("m1,-2z"), R2Path.closed(R2Curve.linear(1, -2, 1, -2)));
    exam.equal(R2Path.parse("m 1 -2 z"), R2Path.closed(R2Curve.linear(1, -2, 1, -2)));
  }

  @Test
  parseMultipleDegenerateClosedPaths(exam: Exam): void {
    exam.equal(R2Path.parse("M1,-2ZM-3,5Z"), R2Path.of(R2Spline.closed(R2Curve.linear(1, -2, 1, -2)), R2Spline.closed(R2Curve.linear(-3, 5, -3, 5))));
    exam.equal(R2Path.parse("M 1 -2 Z M -3 5 Z"), R2Path.of(R2Spline.closed(R2Curve.linear(1, -2, 1, -2)), R2Spline.closed(R2Curve.linear(-3, 5, -3, 5))));
    exam.equal(R2Path.parse("m1,-2zm-3,5z"), R2Path.of(R2Spline.closed(R2Curve.linear(1, -2, 1, -2)), R2Spline.closed(R2Curve.linear(-3, 5, -3, 5))));
    exam.equal(R2Path.parse("m 1 -2 z m -3 5 z"), R2Path.of(R2Spline.closed(R2Curve.linear(1, -2, 1, -2)), R2Spline.closed(R2Curve.linear(-3, 5, -3, 5))));
  }

  @Test
  parseLinearPaths(exam: Exam): void {
    exam.equal(R2Path.parse("M0,1L1,0"), R2Path.open(R2Curve.linear(0, 1, 1, 0)));
    exam.equal(R2Path.parse("M 0 1 L 1 0"), R2Path.open(R2Curve.linear(0, 1, 1, 0)));
  }

  @Test
  parseMultipleLinearPaths(exam: Exam): void {
    exam.equal(R2Path.parse("M0,1L1,0M-1,0L0,-1"), R2Path.of(R2Spline.open(R2Curve.linear(0, 1, 1, 0)), R2Spline.open(R2Curve.linear(-1, 0, 0, -1))));
    exam.equal(R2Path.parse("M 0 1 L 1 0 M -1 0 L 0 -1"), R2Path.of(R2Spline.open(R2Curve.linear(0, 1, 1, 0)), R2Spline.open(R2Curve.linear(-1, 0, 0, -1))));
  }

  @Test
  parseClosedLinearPaths(exam: Exam): void {
    exam.equal(R2Path.parse("M0,1L1,0L0,0Z"), R2Path.closed(R2Curve.linear(0, 1, 1, 0), R2Curve.linear(1, 0, 0, 0), R2Curve.linear(0, 0, 0, 1)));
    exam.equal(R2Path.parse("M 0 1 L 1 0 L 0 0 Z"), R2Path.closed(R2Curve.linear(0, 1, 1, 0), R2Curve.linear(1, 0, 0, 0), R2Curve.linear(0, 0, 0, 1)));
  }

  @Test
  parseMultipleClosedLinearPaths(exam: Exam): void {
    exam.equal(R2Path.parse("M0,1L1,0L0,0ZM-1,0L0,-1L0,0Z"),
               R2Path.of(R2Spline.closed(R2Curve.linear(0, 1, 1, 0), R2Curve.linear(1, 0, 0, 0), R2Curve.linear(0, 0, 0, 1)),
                         R2Spline.closed(R2Curve.linear(-1, 0, 0, -1), R2Curve.linear(0, -1, 0, 0), R2Curve.linear(0, 0, -1, 0))));
    exam.equal(R2Path.parse("M 0 1 L 1 0 L 0 0 Z M -1 0 L 0 -1 L 0 0 Z"),
               R2Path.of(R2Spline.closed(R2Curve.linear(0, 1, 1, 0), R2Curve.linear(1, 0, 0, 0), R2Curve.linear(0, 0, 0, 1)),
                         R2Spline.closed(R2Curve.linear(-1, 0, 0, -1), R2Curve.linear(0, -1, 0, 0), R2Curve.linear(0, 0, -1, 0))));
  }
}
