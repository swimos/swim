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

export class PathR2ParserSpec extends Spec {
  @Test
  parseEmptyPaths(exam: Exam): void {
    exam.equal(PathR2.parse(""), PathR2.empty());
    exam.equal(PathR2.parse("none"), PathR2.empty());
  }

  @Test
  parseDegeneratePaths(exam: Exam): void {
    exam.equal(PathR2.parse("M1,-2"), PathR2.empty());
    exam.equal(PathR2.parse("M 1 -2"), PathR2.empty());
    exam.equal(PathR2.parse("m1,-2"), PathR2.empty());
    exam.equal(PathR2.parse("m 1 -2"), PathR2.empty());
  }

  @Test
  parseMultipleDegeneratePaths(exam: Exam): void {
    exam.equal(PathR2.parse("M1,-2M-3,5"), PathR2.empty());
    exam.equal(PathR2.parse("M 1 -2 M -3 5"), PathR2.empty());
    exam.equal(PathR2.parse("m1,-2m-3,5"), PathR2.empty());
    exam.equal(PathR2.parse("m 1 -2 m -3 5"), PathR2.empty());
  }

  @Test
  parseDegenerateClosedPaths(exam: Exam): void {
    exam.equal(PathR2.parse("M1,-2Z"), PathR2.closed(CurveR2.linear(1, -2, 1, -2)));
    exam.equal(PathR2.parse("M 1 -2 Z"), PathR2.closed(CurveR2.linear(1, -2, 1, -2)));
    exam.equal(PathR2.parse("m1,-2z"), PathR2.closed(CurveR2.linear(1, -2, 1, -2)));
    exam.equal(PathR2.parse("m 1 -2 z"), PathR2.closed(CurveR2.linear(1, -2, 1, -2)));
  }

  @Test
  parseMultipleDegenerateClosedPaths(exam: Exam): void {
    exam.equal(PathR2.parse("M1,-2ZM-3,5Z"), PathR2.of(SplineR2.closed(CurveR2.linear(1, -2, 1, -2)), SplineR2.closed(CurveR2.linear(-3, 5, -3, 5))));
    exam.equal(PathR2.parse("M 1 -2 Z M -3 5 Z"), PathR2.of(SplineR2.closed(CurveR2.linear(1, -2, 1, -2)), SplineR2.closed(CurveR2.linear(-3, 5, -3, 5))));
    exam.equal(PathR2.parse("m1,-2zm-3,5z"), PathR2.of(SplineR2.closed(CurveR2.linear(1, -2, 1, -2)), SplineR2.closed(CurveR2.linear(-3, 5, -3, 5))));
    exam.equal(PathR2.parse("m 1 -2 z m -3 5 z"), PathR2.of(SplineR2.closed(CurveR2.linear(1, -2, 1, -2)), SplineR2.closed(CurveR2.linear(-3, 5, -3, 5))));
  }

  @Test
  parseLinearPaths(exam: Exam): void {
    exam.equal(PathR2.parse("M0,1L1,0"), PathR2.open(CurveR2.linear(0, 1, 1, 0)));
    exam.equal(PathR2.parse("M 0 1 L 1 0"), PathR2.open(CurveR2.linear(0, 1, 1, 0)));
  }

  @Test
  parseMultipleLinearPaths(exam: Exam): void {
    exam.equal(PathR2.parse("M0,1L1,0M-1,0L0,-1"), PathR2.of(SplineR2.open(CurveR2.linear(0, 1, 1, 0)), SplineR2.open(CurveR2.linear(-1, 0, 0, -1))));
    exam.equal(PathR2.parse("M 0 1 L 1 0 M -1 0 L 0 -1"), PathR2.of(SplineR2.open(CurveR2.linear(0, 1, 1, 0)), SplineR2.open(CurveR2.linear(-1, 0, 0, -1))));
  }

  @Test
  parseClosedLinearPaths(exam: Exam): void {
    exam.equal(PathR2.parse("M0,1L1,0L0,0Z"), PathR2.closed(CurveR2.linear(0, 1, 1, 0), CurveR2.linear(1, 0, 0, 0), CurveR2.linear(0, 0, 0, 1)));
    exam.equal(PathR2.parse("M 0 1 L 1 0 L 0 0 Z"), PathR2.closed(CurveR2.linear(0, 1, 1, 0), CurveR2.linear(1, 0, 0, 0), CurveR2.linear(0, 0, 0, 1)));
  }

  @Test
  parseMultipleClosedLinearPaths(exam: Exam): void {
    exam.equal(PathR2.parse("M0,1L1,0L0,0ZM-1,0L0,-1L0,0Z"),
               PathR2.of(SplineR2.closed(CurveR2.linear(0, 1, 1, 0), CurveR2.linear(1, 0, 0, 0), CurveR2.linear(0, 0, 0, 1)),
                         SplineR2.closed(CurveR2.linear(-1, 0, 0, -1), CurveR2.linear(0, -1, 0, 0), CurveR2.linear(0, 0, -1, 0))));
    exam.equal(PathR2.parse("M 0 1 L 1 0 L 0 0 Z M -1 0 L 0 -1 L 0 0 Z"),
               PathR2.of(SplineR2.closed(CurveR2.linear(0, 1, 1, 0), CurveR2.linear(1, 0, 0, 0), CurveR2.linear(0, 0, 0, 1)),
                         SplineR2.closed(CurveR2.linear(-1, 0, 0, -1), CurveR2.linear(0, -1, 0, 0), CurveR2.linear(0, 0, -1, 0))));
  }
}
