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

import {Attr, Record} from "@swim/structure";
import {Spec, Test, Exam} from "@swim/unit";
import {Scale} from "@swim/scale";

export class ScaleFormSpec extends Spec {
  @Test
  moldLinearScales(exam: Exam): void {
    exam.equal(Scale.form().mold(Scale.linear(5, 11, 13, 17)),
               Record.of(Attr.of("scale", Record.of(5, 11)),
                         Attr.of("interpolate", Record.of(13, 17))));
  }

  @Test
  castLinearScales(exam: Exam): void {
    exam.equal(Record.of(Attr.of("scale", Record.of(5, 11)),
                         Attr.of("interpolate", Record.of(13, 17))),
                Scale.form().mold(Scale.linear(5, 11, 13, 17)));
  }

  @Test
  moldTimeScales(exam: Exam): void {
    exam.equal(Scale.form().mold(Scale.time("2017-02-21T00:00:00.000Z", "2017-02-22T00:00:00.000Z", 13, 17)),
               Record.of(Attr.of("scale", Record.of("2017-02-21T00:00:00.000Z", "2017-02-22T00:00:00.000Z")),
                         Attr.of("interpolate", Record.of(13, 17))));
  }

  @Test
  castTimeScales(exam: Exam): void {
    exam.equal(Record.of(Attr.of("scale", Record.of("2017-02-21T00:00:00.000Z", "2017-02-22T00:00:00.000Z")),
                         Attr.of("interpolate", Record.of(13, 17))),
               Scale.form().mold(Scale.time("2017-02-21T00:00:00.000Z", "2017-02-22T00:00:00.000Z", 13, 17)));
  }
}
