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
import {Look, Feel, MoodVector, MoodMatrix} from "@swim/theme";

export class MoodMatrixSpec extends Spec {
  @Test
  testEmpty(exam: Exam): void {
    const matrix = MoodMatrix.empty();
    exam.equal(matrix.rowCount, 0);
    exam.equal(matrix.colCount, 0);
  }

  @Test
  testForCols(exam: Exam): void {
    const matrix = MoodMatrix.forCols([Look.textColor, MoodVector.of([Feel.default, 0], [Feel.selected, 1])],
                                      [Look.accentColor, MoodVector.of([Feel.default, 1], [Feel.selected, 0])]);
    exam.equal(matrix.rowCount, 2);
    exam.equal(matrix.colCount, 2);
    exam.equal(matrix.getCol(Look.textColor), MoodVector.of([Feel.default, 0], [Feel.selected, 1]));
    exam.equal(matrix.getCol(Look.accentColor), MoodVector.of([Feel.default, 1], [Feel.selected, 0]));
    exam.equal(matrix.getRow(Feel.default), MoodVector.of([Look.textColor, 0], [Look.accentColor, 1]));
    exam.equal(matrix.getRow(Feel.selected), MoodVector.of([Look.textColor, 1], [Look.accentColor, 0]));
  }

  @Test
  testInnerProduct(exam: Exam): void {
    const matrix = MoodMatrix.forCols([Look.textColor, MoodVector.of([Feel.default, 0], [Feel.selected, 1])],
                                      [Look.accentColor, MoodVector.of([Feel.default, 1], [Feel.selected, 0])]);
    exam.equal(matrix.dot(Feel.default, MoodVector.of([Look.textColor, 1], [Look.accentColor, 0])), 0);
    exam.equal(matrix.dot(Feel.default, MoodVector.of([Look.textColor, 0], [Look.accentColor, 1])), 1);
    exam.equal(matrix.dot(Feel.selected, MoodVector.of([Look.textColor, 1], [Look.accentColor, 0])), 1);
    exam.equal(matrix.dot(Feel.selected, MoodVector.of([Look.textColor, 0], [Look.accentColor, 1])), 0);
    exam.equal(matrix.dot(Feel.default, MoodVector.of([Look.textColor, 0.5], [Look.accentColor, 0.5])), 0.5);
    exam.equal(matrix.dot(Feel.selected, MoodVector.of([Look.textColor, 0.5], [Look.accentColor, 0.5])), 0.5);
  }

  @Test
  testTransformVector(exam: Exam): void {
    const matrix = MoodMatrix.forCols([Look.textColor, MoodVector.of([Feel.default, 0], [Feel.selected, 1])],
                                      [Look.accentColor, MoodVector.of([Feel.default, 1], [Feel.selected, 0])]);
    exam.equal(matrix.timesCol(MoodVector.of([Look.textColor, 1], [Look.accentColor, 0])),
               MoodVector.of([Feel.default, 0], [Feel.selected, 1]));
    exam.equal(matrix.timesCol(MoodVector.of([Look.textColor, 0], [Look.accentColor, 1])),
               MoodVector.of([Feel.default, 1], [Feel.selected, 0]));
    exam.equal(matrix.timesCol(MoodVector.of([Look.textColor, 0.5], [Look.accentColor, 0.5])),
               MoodVector.of([Feel.default, 0.5], [Feel.selected, 0.5]));
  }

  @Test
  testTransformVectorIdentity(exam: Exam): void {
    const matrix = MoodMatrix.forCols([Feel.default, MoodVector.of([Feel.default, 1], [Feel.selected, 1])]);
    exam.equal(matrix.timesCol(MoodVector.of([Feel.default, 1], [Feel.selected, 0]), true),
               MoodVector.of([Feel.default, 1], [Feel.selected, 1]));
    exam.equal(matrix.timesCol(MoodVector.of([Feel.default, 0], [Feel.selected, 1]), true),
               MoodVector.of([Feel.default, 0], [Feel.selected, 0]));
    exam.equal(matrix.timesCol(MoodVector.of([Feel.default, 0.5], [Feel.selected, 0.5]), true),
               MoodVector.of([Feel.default, 0.5], [Feel.selected, 0.5]));
    exam.equal(matrix.timesCol(MoodVector.of([Feel.default, 1], [Feel.ambient, 1.5]), true),
               MoodVector.of([Feel.default, 1], [Feel.selected, 1], [Feel.ambient, 1.5]));
    exam.equal(matrix.timesCol(MoodVector.of([Feel.ambient, 1.5]), true),
               MoodVector.of([Feel.ambient, 1.5]));
  }

  @Test
  testTransformImplicitIdentityMatrix(exam: Exam): void {
    const a = MoodMatrix.forCols([Feel.default, MoodVector.of([Look.textColor, 0],
                                                              [Look.accentColor, 0.25])],
                                 [Feel.selected, MoodVector.of([Look.textColor, 1],
                                                               [Look.accentColor, 0.75])]);
    exam.equal(a.transform(MoodMatrix.empty()),
               MoodMatrix.forCols([Feel.default, MoodVector.of([Look.textColor, 0],
                                                               [Look.accentColor, 0.25])],
                                  [Feel.selected, MoodVector.of([Look.textColor, 1],
                                                                [Look.accentColor, 0.75])]));
  }

  @Test
  testTransformExplicitIdentityMatrix(exam: Exam): void {
    const a = MoodMatrix.forCols([Feel.default, MoodVector.of([Look.textColor, 0],
                                                              [Look.accentColor, 0.25])],
                                 [Feel.selected, MoodVector.of([Look.textColor, 1],
                                                               [Look.accentColor, 0.75])]);
    const x = MoodMatrix.forCols([Feel.default, MoodVector.of([Feel.default, 1], [Feel.selected, 0])],
                                 [Feel.selected, MoodVector.of([Feel.default, 0], [Feel.selected, 1])]);
    exam.equal(a.transform(x),
               MoodMatrix.forCols([Feel.default, MoodVector.of([Look.textColor, 0],
                                                                [Look.accentColor, 0.25])],
                                   [Feel.selected, MoodVector.of([Look.textColor, 1],
                                                                 [Look.accentColor, 0.75])]));
  }
}
