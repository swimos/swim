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
import {GeoSegment} from "@swim/geo";
import {GeoSpline} from "@swim/geo";
import {GeoPath} from "@swim/geo";

export class GeoPathBuilderSpec extends Suite {
  @Test
  buildLinearPaths(exam: Exam): void {
    const builder = GeoPath.builder();
    builder.moveTo(0, 1);
    builder.lineTo(1, 0);
    const spline = builder.build();
    exam.equal(spline, GeoPath.of(GeoSpline.open(GeoSegment.of(0, 1, 1, 0))));
  }
}
