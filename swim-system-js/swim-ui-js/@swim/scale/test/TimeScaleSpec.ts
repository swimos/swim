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
import {DateTime} from "@swim/time";
import {Scale} from "@swim/scale";

export class TimeScaleSpec extends Spec {
  @Test
  temporallyScaleNumbers(exam: Exam): void {
    const d0 = DateTime.from({year: 2000, month: 0, day: 1});
    const d1 = DateTime.from({year: 2000, month: 0, day: 2});
    const scale = Scale.from(d0, d1, 0, 86400);
    const noon = DateTime.from({year: 2000, month: 0, day: 1, hour: 12});
    exam.equal(scale.scale(noon), 43200);
  }
}
