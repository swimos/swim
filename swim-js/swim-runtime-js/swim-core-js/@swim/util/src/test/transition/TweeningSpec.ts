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
import {Mapping, Easing, Tweening} from "@swim/util";

export class TweeningSpec extends Spec {
  @Test
  testLinearTweening(exam: Exam): void {
    const tweening = Easing.linear.withDomain(6, 8).overRange(2, 4);
    exam.instanceOf(tweening, Tweening);
    exam.instanceOf(tweening, Mapping);
    exam.equal(tweening.domain[0], 6);
    exam.equal(tweening.domain[1], 8);
    exam.equal(tweening.range[0], 2);
    exam.equal(tweening.range[1], 4);
    exam.equal(tweening(6), 2);
    exam.equal(tweening(7), 3);
    exam.equal(tweening(8), 4);
  }
}
