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

import {Attr, Slot, Record} from "@swim/structure";
import {Spec, Test, Exam} from "@swim/unit";
import {Interpolator} from "@swim/interpolate";
import {Ease, Transition} from "@swim/transition";

export class TransitionFormSpec extends Spec {
  @Test
  moldTransitions(exam: Exam): void {
    exam.equal(Transition.form().mold(Transition.from(250, Ease.quadOut, Interpolator.from(1, 2))),
               Record.of(Attr.of("transition", Record.of(Slot.of("duration", 250), Slot.of("ease", "quad-out"))), Attr.of("interpolate", Record.of(1, 2))));
  }

  @Test
  castTransitions(exam: Exam): void {
    exam.equal(Transition.form().cast(Record.of(Attr.of("transition", Record.of(Slot.of("duration", 250), Slot.of("ease", "quad-out"))), Attr.of("interpolate", Record.of(1, 2)))),
               Transition.from(250, Ease.quadOut, Interpolator.from(1, 2)));
  }
}
