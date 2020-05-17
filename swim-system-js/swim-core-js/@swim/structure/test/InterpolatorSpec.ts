// Copyright 2015-2020 SWIM.AI inc.
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

import {Attr, Record} from "@swim/structure";
import {Spec, Test, Exam} from "@swim/unit";
import {Interpolator} from "@swim/interpolate";

export class InterpolatorSpec extends Spec {
  @Test
  interpolateRecords(exam: Exam): void {
    const v0 = Record.of(Attr.of("test", -1), 0, "%");
    const v1 = Record.of(Attr.of("test", 1), 1, "%");
    const interpolator = Interpolator.between(v0, v1);
    exam.equal(interpolator.interpolate(0), v0);
    exam.equal(interpolator.interpolate(0.5), Record.of(Attr.of("test", 0), 0.5, "%"));
    exam.equal(interpolator.interpolate(1), v1);
  }
}
