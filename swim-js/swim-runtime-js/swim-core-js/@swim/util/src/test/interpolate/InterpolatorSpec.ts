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
import {
  Mapping,
  Domain,
  Range,
  Interpolator, 
  NumberInterpolator,
  ArrayInterpolator,
  InterpolatorInterpolator,
  StepInterpolator,
} from "@swim/util";

export class InterpolatorSpec extends Spec {
  @Test
  testNumberInterpolator(exam: Exam): void {
    const interpolator = NumberInterpolator(-2, 2);
    exam.instanceOf(interpolator, Interpolator);
    exam.instanceOf(interpolator, Range);
    exam.instanceOf(interpolator, Mapping);
    exam.identical(interpolator.domain, Domain.unit);
    exam.identical(interpolator.range, interpolator);
    exam.equal(interpolator[0], -2);
    exam.equal(interpolator[1], 2);
    exam.equal(interpolator(0), -2);
    exam.equal(interpolator(0.5), 0);
    exam.equal(interpolator(1), 2);
  }

  @Test
  testArrayInterpolator(exam: Exam): void {
    const y0 = [2, 3];
    const y1 = [5, 7];
    const interpolator = ArrayInterpolator(y0, y1);
    exam.instanceOf(interpolator, Interpolator);
    exam.instanceOf(interpolator, Range);
    exam.instanceOf(interpolator, Mapping);
    exam.identical(interpolator.domain, Domain.unit);
    exam.identical(interpolator.range, interpolator);
    exam.equal(interpolator[0], y0);
    exam.equal(interpolator[1], y1);
    exam.equal(interpolator(0), y0);
    exam.equal(interpolator(0.5), [3.5, 5]);
    exam.equal(interpolator(1), y1);
  }

  @Test
  testInterpolatorInterpolator(exam: Exam): void {
    const y0 = Interpolator(2, 3);
    const y1 = Interpolator(5, 7);
    const interpolator = InterpolatorInterpolator(y0, y1);
    exam.instanceOf(interpolator, Interpolator);
    exam.instanceOf(interpolator, Range);
    exam.instanceOf(interpolator, Mapping);
    exam.identical(interpolator.domain, Domain.unit);
    exam.identical(interpolator.range, interpolator);
    exam.equal(interpolator[0], y0);
    exam.equal(interpolator[1], y1);
    exam.equal(interpolator(0), y0);
    exam.equal(interpolator(0.5), Interpolator(2.5, 6));
    exam.equal(interpolator(1), y1);
  }

  @Test
  testStepInterpolator(exam: Exam): void {
    const y0 = {};
    const y1 = {};
    const interpolator = StepInterpolator(y0, y1);
    exam.instanceOf(interpolator, Interpolator);
    exam.instanceOf(interpolator, Range);
    exam.instanceOf(interpolator, Mapping);
    exam.identical(interpolator.domain, Domain.unit);
    exam.identical(interpolator.range, interpolator);
    exam.equal(interpolator[0], y0);
    exam.equal(interpolator[1], y1);
    exam.equal(interpolator(0), y0);
    exam.equal(interpolator(0.5), y0);
    exam.equal(interpolator(1), y1);
  }

  @Test
  testInterpolatorMap(exam: Exam): void {
    const interpolator = NumberInterpolator(-2, 2).map(function (y: number): string {
      return y.toFixed();
    });
    exam.instanceOf(interpolator, Interpolator);
    exam.instanceOf(interpolator, Range);
    exam.instanceOf(interpolator, Mapping);
    exam.identical(interpolator.domain, Domain.unit);
    exam.identical(interpolator.range, interpolator);
    exam.equal(interpolator[0], "-2");
    exam.equal(interpolator[1], "2");
    exam.equal(interpolator(0), "-2");
    exam.equal(interpolator(0.5), "0");
    exam.equal(interpolator(1), "2");
  }
}
