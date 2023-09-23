// Copyright 2015-2023 Nstream, inc.
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
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {LookVector} from "@swim/theme";
import {Feel} from "@swim/theme";
import {MoodVector} from "@swim/theme";

export class LookVectorSpec extends Suite {
  @Test
  testEmpty(exam: Exam): void {
    const vector = LookVector.empty();
    exam.equal(vector.size, 0);
  }

  @Test
  testOf(exam: Exam): void {
    const vector = LookVector.of([Feel.default, Color.black()]);
    exam.equal(vector.size, 1);
    exam.equal(vector.get(Feel.default), Color.black());
  }

  @Test
  testDot(exam: Exam): void {
    const vector = LookVector.of([Feel.default, 1], [Feel.warning, 0.8]);
    exam.equal(Look.opacity.dot(vector, MoodVector.of([Feel.default, 1], [Feel.warning, 0])), 1);
    exam.equal(Look.opacity.dot(vector, MoodVector.of([Feel.default, 0], [Feel.warning, 1])), 0.8);
    exam.equal(Look.opacity.dot(vector, MoodVector.of([Feel.default, 1], [Feel.warning, 0.5])), 0.9);
  }
}
