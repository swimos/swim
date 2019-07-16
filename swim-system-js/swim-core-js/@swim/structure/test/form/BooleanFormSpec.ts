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
import {Attr, Record, Text, Bool, Form} from "@swim/structure";

export class BooleanFormSpec extends Spec {
  @Test
  moldBooleans(exam: Exam): void {
    exam.equal(Form.forBoolean().mold(true), Bool.from(true));
    exam.equal(Form.forBoolean().mold(false), Bool.from(false));
  }

  @Test
  castBoolsToBooleans(exam: Exam): void {
    exam.equal(Form.forBoolean().cast(Bool.from(true)), true);
    exam.equal(Form.forBoolean().cast(Bool.from(false)), false);
  }

  @Test
  castStringsToBooleans(exam: Exam): void {
    exam.equal(Form.forBoolean().cast(Text.from("true")), true);
    exam.equal(Form.forBoolean().cast(Text.from("false")), false);
  }

  @Test
  castAttributedBoolToBoolean(exam: Exam): void {
    exam.equal(Form.forBoolean().cast(Record.of(Attr.of("test"), Bool.from(true))), true);
    exam.equal(Form.forBoolean().cast(Record.of(Attr.of("test"), Bool.from(false))), false);
  }
}
