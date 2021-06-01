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
import {Feel, MoodVector} from "@swim/theme";

export class MoodVectorSpec extends Spec {
  @Test
  testEmpty(exam: Exam): void {
    const vector = MoodVector.empty();
    exam.equal(vector.size, 0);
  }

  @Test
  testOf(exam: Exam): void {
    const vector = MoodVector.of([Feel.default, 1]);
    exam.equal(vector.size, 1);
    exam.equal(vector.get(Feel.default), 1);
  }
}
