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

import type {Exam} from "@swim/unit";
import {Test} from "@swim/unit";
import {Suite} from "@swim/unit";
import {Color} from "@swim/style";
import {BoxShadow} from "@swim/style";

export class BoxShadowSpec extends Suite {
  @Test
  parseBoxShadows(exam: Exam): void {
    exam.equal(BoxShadow.parse("none"), null);
    exam.equal(BoxShadow.parse("0px 2px 3px 0px rgb(0, 0, 0, 0.3)"),
               BoxShadow.create(0, 2, 3, 0, Color.rgb(0, 0, 0, 0.3)));
    exam.equal(BoxShadow.parse("0px 2px 4px 0px rgb(0, 0, 0, 0.12), 0px 0px 4px 0px rgb(0, 0, 0, 0.08)"),
               BoxShadow.create(0, 2, 4, 0, Color.rgb(0, 0, 0, 0.12)).and(0, 0, 4, 0, Color.rgb(0, 0, 0, 0.08)));
    exam.equal(BoxShadow.parse("inset 1px 2px 3px 4px rgb(255, 255, 255, 0.5)"),
               BoxShadow.create(true, 1, 2, 3, 4, Color.rgb(255, 255, 255, 0.5)));
  }

  @Test
  writeBoxShadows(exam: Exam): void {
    exam.equal(BoxShadow.create(0, 2, 3, 0, Color.rgb(0, 0, 0, 0.3)).toString(),
               "0px 2px 3px 0px rgba(0,0,0,0.3)");
    exam.equal(BoxShadow.create(0, 2, 4, 0, Color.rgb(0, 0, 0, 0.12)).and(0, 0, 4, 0, Color.rgb(0, 0, 0, 0.08)).toString(),
              "0px 2px 4px 0px rgba(0,0,0,0.12), 0px 0px 4px 0px rgba(0,0,0,0.08)");
    exam.equal(BoxShadow.create(true, 1, 2, 3, 4, Color.rgb(255, 255, 255, 0.5)).toString(),
              "inset 1px 2px 3px 4px rgba(255,255,255,0.5)");
  }
}
