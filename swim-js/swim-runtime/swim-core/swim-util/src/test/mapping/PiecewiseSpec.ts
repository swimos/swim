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
import {Mapping, Piecewise, LinearDomain, LinearRange} from "@swim/util";

export class PiecewiseSpec extends Spec {
  @Test
  testPiecewiseIntervals(exam: Exam): void {
    const interval0 = Mapping(LinearDomain(0, 3), LinearRange(0, 2));
    const interval1 = Mapping(LinearDomain(3, 4), LinearRange(1, 0));
    const interval2 = Mapping(LinearDomain(4, 6), LinearRange(3, -1));
    const piecewise = Piecewise(interval0, interval1, interval2);
    exam.equal(piecewise.domain, LinearDomain(0, 6));
    exam.equal(piecewise.range, LinearRange(-1, 3));
    exam.identical(piecewise.interval(0), interval0);
    exam.identical(piecewise.interval(1.5), interval0);
    exam.identical(piecewise.interval(3), interval1);
    exam.identical(piecewise.interval(3.5), interval1);
    exam.identical(piecewise.interval(4), interval2);
    exam.identical(piecewise.interval(5), interval2);
    exam.identical(piecewise.interval(6), interval2);
  }

  @Test
  testPiecewiseMappings(exam: Exam): void {
    const interval0 = Mapping(LinearDomain(0, 3), LinearRange(0, 2));
    const interval1 = Mapping(LinearDomain(3, 4), LinearRange(1, 0));
    const interval2 = Mapping(LinearDomain(4, 6), LinearRange(3, -1));
    const piecewise = Piecewise(interval0, interval1, interval2);
    exam.equal(piecewise(0), 0);
    exam.equal(piecewise(1.5), 1);
    exam.equal(piecewise(3), 1);
    exam.equal(piecewise(3.5), 0.5);
    exam.equal(piecewise(4), 3);
    exam.equal(piecewise(5), 1);
    exam.equal(piecewise(6), -1);
  }
}
