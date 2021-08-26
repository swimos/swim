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
import {GeoPoint} from "@swim/geo";

export class GeoPointSpec extends Spec {
  @Test
  interpolateEastAcrossAntiMeridian(exam: Exam): void {
    const a = new GeoPoint(178, -10);
    const b = new GeoPoint(-174, 10);
    const interpolator = a.interpolateTo(b);
    exam.equal(interpolator(0), a);
    exam.equal(interpolator(0.25), new GeoPoint(-180, -5));
    exam.equal(interpolator(0.5), new GeoPoint(-178, 0));
    exam.equal(interpolator(1), b);
  }

  @Test
  interpolateWestAcrossAntiMeridian(exam: Exam): void {
    const a = new GeoPoint(-178, 10);
    const b = new GeoPoint(174, -10);
    const interpolator = a.interpolateTo(b);
    exam.equal(interpolator(0), a);
    exam.equal(interpolator(0.25), new GeoPoint(180, 5));
    exam.equal(interpolator(0.5), new GeoPoint(178, 0));
    exam.equal(interpolator(1), b);
  }
}
