// Copyright 2015-2024 Nstream, inc.
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

import type {Exam} from "@swim/unit";
import {Test} from "@swim/unit";
import {Suite} from "@swim/unit";
import {Mapping} from "@swim/util";
import {Domain} from "@swim/util";
import {Range} from "@swim/util";
import {LinearRange} from "@swim/util";

export class LinearRangeSpec extends Suite {
  @Test
  testUnitRange(exam: Exam): void {
    const range = Range.unit();
    exam.instanceOf(range, LinearRange);
    exam.instanceOf(range, Range);
    exam.instanceOf(range, Mapping);
    exam.identical(range.domain, Domain.unit());
    exam.identical(range.range, range);
    exam.equal(range[0], 0);
    exam.equal(range[1], 1);
    exam.equal(range(0), 0);
    exam.equal(range(0.5), 0.5);
    exam.equal(range(1), 1);
  }

  @Test
  testLinearRange(exam: Exam): void {
    const range = LinearRange(-2, 2);
    exam.instanceOf(range, LinearRange);
    exam.instanceOf(range, Range);
    exam.instanceOf(range, Mapping);
    exam.identical(range.domain, Domain.unit());
    exam.identical(range.range, range);
    exam.equal(range[0], -2);
    exam.equal(range[1], 2);
    exam.equal(range(0), -2);
    exam.equal(range(0.5), 0);
    exam.equal(range(1), 2);
  }

  @Test
  interpolateLinearRanges(exam: Exam): void {
    const a = LinearRange(-1, 1);
    const b = LinearRange(-2, 2);
    const interpolator = a.interpolateTo(b);
    exam.equal(interpolator(0), a);
    exam.equal(interpolator(0.5), LinearRange(-1.5, 1.5));
    exam.equal(interpolator(1), b);
  }
}
