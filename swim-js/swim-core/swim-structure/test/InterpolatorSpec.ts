// Copyright 2015-2024 Nstream, inc.
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

import {Attr} from "@swim/structure";
import {Record} from "@swim/structure";
import type {Exam} from "@swim/unit";
import {Test} from "@swim/unit";
import {Suite} from "@swim/unit";

export class InterpolatorSpec extends Suite {
  @Test
  interpolateRecords(exam: Exam): void {
    const v0 = Record.of(Attr.of("test", -1), 0, "%");
    const v1 = Record.of(Attr.of("test", 1), 1, "%");
    const interpolator = v0.interpolateTo(v1);
    exam.equal(interpolator(0), v0);
    exam.equal(interpolator(0.5), Record.of(Attr.of("test", 0), 0.5, "%"));
    exam.equal(interpolator(1), v1);
  }
}
