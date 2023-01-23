// Copyright 2015-2023 Swim.inc
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
import {ConstraintSolver} from "@swim/constraint";

export class ConstraintSolverSpec extends Spec {
  @Test
  solveRight(exam: Exam): void {
    const solver = new ConstraintSolver();

    const left = solver.constraintVariable("left");
    const width = solver.constraintVariable("width");
    const right = solver.constraintVariable("right");
    solver.constraint(right.constrain(), "eq", left.plus(width));

    left.setValue(100);
    width.setValue(400);
    exam.equal(right.value, 500);

    left.setValue(150);
    width.setValue(250);
    exam.equal(right.value, 400);
  }

  @Test
  solveCenter(exam: Exam): void {
    const solver = new ConstraintSolver();

    const left = solver.constraintVariable("left");
    const width = solver.constraintVariable("width");
    const center = solver.constraintVariable("center");
    solver.constraint(center.constrain(), "eq", left.plus(width.times(0.5)));

    left.setValue(0);
    width.setValue(500);
    exam.equal(center.value, 250);

    left.setValue(100);
    width.setValue(400);
    exam.equal(center.value, 300);
  }
}
