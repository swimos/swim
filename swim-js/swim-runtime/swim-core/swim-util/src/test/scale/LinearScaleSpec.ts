// Copyright 2015-2022 Swim.inc
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
import {Mapping, LinearDomain, LinearRange, Scale, ContinuousScale, LinearScale} from "@swim/util";

export class LinearScaleSpec extends Spec {
  @Test
  testLinearScale(exam: Exam): void {
    const scale = LinearScale(LinearDomain(1, 2), LinearRange(10, 20));
    exam.instanceOf(scale, LinearScale);
    exam.instanceOf(scale, ContinuousScale);
    exam.instanceOf(scale, Scale);
    exam.instanceOf(scale, Mapping);
    exam.equal(scale.domain, LinearDomain(1, 2));
    exam.equal(scale.range,LinearRange(10, 20));
    exam.equal(scale(1), 10);
    exam.equal(scale(1.5), 15);
    exam.equal(scale(2), 20);
  }

  @Test
  interpolateLinearScales(exam: Exam): void {
    const a = LinearScale(LinearDomain(1, 2), LinearRange(10, 20));
    const b = LinearScale(LinearDomain(3, 4), LinearRange(30, 40));
    const interpolator = a.interpolateTo(b);
    exam.equal(interpolator(0), a);
    exam.equal(interpolator(0.5), LinearScale(LinearDomain(2, 3), LinearRange(20, 30)));
    exam.equal(interpolator(1), b);
  }
}
