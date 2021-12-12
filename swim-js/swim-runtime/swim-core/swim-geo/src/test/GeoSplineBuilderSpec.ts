// Copyright 2015-2021 Swim.inc
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
import {GeoSegment, GeoSpline} from "@swim/geo";

export class GeoSplineBuilderSpec extends Spec {
  @Test
  buildLinearSplines(exam: Exam): void {
    const builder = GeoSpline.builder();
    builder.moveTo(0, 1);
    builder.lineTo(1, 0);
    const spline = builder.bind();
    exam.equal(spline, GeoSpline.open(GeoSegment.of(0, 1, 1, 0)));
  }
}
