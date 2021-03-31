// Copyright 2015-2020 Swim inc.
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

    left.setState(100);
    width.setState(400);
    exam.equal(right.state, 500);

    left.setState(150);
    width.setState(250);
    exam.equal(right.state, 400);
  }

  @Test
  solveCenter(exam: Exam): void {
    const solver = new ConstraintSolver();

    const left = solver.constraintVariable("left");
    const width = solver.constraintVariable("width");
    const center = solver.constraintVariable("center");
    solver.constraint(center.constrain(), "eq", left.plus(width.times(0.5)));

    left.setState(0);
    width.setState(500);
    exam.equal(center.state, 250);

    left.setState(100);
    width.setState(400);
    exam.equal(center.state, 300);
  }
}
