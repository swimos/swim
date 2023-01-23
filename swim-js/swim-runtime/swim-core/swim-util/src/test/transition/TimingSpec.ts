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
import {Mapping, Domain, Range, Timing, Easing} from "@swim/util";

export class TimingSpec extends Spec {
  @Test
  testLinearTiming(exam: Exam): void {
    const timing = Easing.linear.withDomain(-2, 2);
    exam.instanceOf(timing, Timing);
    exam.instanceOf(timing, Domain);
    exam.instanceOf(timing, Mapping);
    exam.identical(timing.easing, Easing.linear);
    exam.identical(timing.domain, timing);
    exam.identical(timing.range, Range.unit);
    exam.equal(timing.duration, 4);
    exam.equal(timing[0], -2);
    exam.equal(timing[1], 2);
    exam.equal(timing(-2), 0);
    exam.equal(timing(0), 0.5);
    exam.equal(timing(2), 1);
  }
}
