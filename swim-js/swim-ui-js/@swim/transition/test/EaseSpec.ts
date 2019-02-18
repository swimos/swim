// Copyright 2015-2019 SWIM.AI inc.
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
import {Ease} from "@swim/transition";

export class EaseSpec extends Spec {
  @Test
  easeLinear(exam: Exam): void {
    exam.equal(Ease.linear(0.5), 0.5);
  }

  @Test
  easeQuadIn(exam: Exam): void {
    exam.equal(Ease.quadIn(0.5), 0.25);
  }

  @Test
  easeQuadOut(exam: Exam): void {
    exam.equal(Ease.quadOut(0.5), 0.75);
  }

  @Test
  easeQuadInOut(exam: Exam): void {
    exam.equal(Ease.quadInOut(0.25), 0.125);
    exam.equal(Ease.quadInOut(0.5), 0.5);
    exam.equal(Ease.quadInOut(0.75), 0.875);
  }
}
