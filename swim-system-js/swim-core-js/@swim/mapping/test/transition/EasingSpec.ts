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
import {Mapping, Domain, Range, Timing, Easing} from "@swim/mapping";

export class EasingSpec extends Spec {
  @Test
  testLinearEasing(exam: Exam): void {
    const easing = Easing.linear;
    exam.instanceOf(easing, Easing);
    exam.instanceOf(easing, Timing);
    exam.instanceOf(easing, Domain);
    exam.instanceOf(easing, Mapping);
    exam.identical(easing.domain, easing);
    exam.identical(easing.range, Range.unit);
    exam.equal(easing[0], 0);
    exam.equal(easing[1], 1);
    exam.equal(easing(0), 0);
    exam.equal(easing(0.5), 0.5);
    exam.equal(easing(1), 1);
  }

  @Test
  testQuadInEasing(exam: Exam): void {
    exam.equal(Easing.quadIn(0.5), 0.25);
  }

  @Test
  testQuadOutEasing(exam: Exam): void {
    exam.equal(Easing.quadOut(0.5), 0.75);
  }

  @Test
  testQuadInOutEasing(exam: Exam): void {
    exam.equal(Easing.quadInOut(0.25), 0.125);
    exam.equal(Easing.quadInOut(0.5), 0.5);
    exam.equal(Easing.quadInOut(0.75), 0.875);
  }
}
