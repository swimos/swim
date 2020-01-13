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

export class InterpolatorFormSpec extends Spec {
  @Test
  noldInterpolators(exam: Exam): void {
    exam.equal(Interpolator.form().mold(Interpolator.from(1, 2)),
               Record.of(Attr.of("interpolate", Record.of(1, 2))));
  }

  @Test
  castInterpolators(exam: Exam): void {
    exam.equal(Interpolator.form().cast(Record.of(Attr.of("interpolate", Record.of(1, 2)))),
               Interpolator.from(1, 2));
  }
}
