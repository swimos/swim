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
import {Interpolator} from "@swim/interpolate";
import {Scale} from "@swim/scale";

export class ScaleInterpolatorSpec extends Spec {
  @Test
  interpolateScales(exam: Exam): void {
    const s0 = Scale.from(2, 4, 10, 12);
    const s1 = Scale.from(6, 8, 14, 16);
    const interpolator = Interpolator.from(s0, s1);
    exam.equal(interpolator.interpolate(0.5), Scale.from(4, 6, 12, 14));
  }
}
