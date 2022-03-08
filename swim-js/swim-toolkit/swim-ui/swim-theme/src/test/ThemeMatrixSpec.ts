// Copyright 2015-2022 Swim.inc
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
import {Color} from "@swim/style";
import {Look, LookVector, Feel, FeelVector, MoodVector, MoodMatrix, ThemeMatrix} from "@swim/theme";

export class ThemeMatrixSpec extends Spec {
  @Test
  testEmpty(exam: Exam): void {
    const matrix = ThemeMatrix.empty();
    exam.equal(matrix.rowCount, 0);
    exam.equal(matrix.colCount, 0);
  }

  @Test
  testForCols(exam: Exam): void {
    const matrix = ThemeMatrix.forCols([Feel.default, FeelVector.of([Look.textColor, Color.black()])],
                                       [Feel.selected, FeelVector.of([Look.textColor, Color.white()])]);
    exam.equal(matrix.rowCount, 1);
    exam.equal(matrix.colCount, 2);
    exam.equal(matrix.getCol(Feel.default), FeelVector.of([Look.textColor, Color.black()]));
    exam.equal(matrix.getCol(Feel.selected), FeelVector.of([Look.textColor, Color.white()]));
    exam.equal(matrix.getRow(Look.textColor), LookVector.of([Feel.default, Color.black()],
                                                               [Feel.selected, Color.white()]));
  }

  @Test
  testInnerProduct(exam: Exam): void {
    const matrix = ThemeMatrix.forCols([Feel.default, FeelVector.of([Look.opacity, 1])],
                                       [Feel.warning, FeelVector.of([Look.opacity, 0.8])]);
    exam.equal(matrix.dot(Look.opacity, MoodVector.of([Feel.default, 1], [Feel.warning, 0])), 1);
    exam.equal(matrix.dot(Look.opacity, MoodVector.of([Feel.default, 0], [Feel.warning, 1])), 0.8);
    exam.equal(matrix.dot(Look.opacity, MoodVector.of([Feel.default, 1], [Feel.warning, 0.5])), 0.9);
  }

  @Test
  testTransformVector(exam: Exam): void {
    const matrix = ThemeMatrix.forCols([Feel.default, FeelVector.of([Look.opacity, 1])],
                                       [Feel.warning, FeelVector.of([Look.opacity, 0.8])]);
    exam.equal(matrix.timesCol(MoodVector.of([Feel.default, 1], [Feel.warning, 0])),
               FeelVector.of([Look.opacity, 1]));
    exam.equal(matrix.timesCol(MoodVector.of([Feel.default, 0], [Feel.warning, 1])),
               FeelVector.of([Look.opacity, 0.8]));
    exam.equal(matrix.timesCol(MoodVector.of([Feel.default, 1], [Feel.warning, 0.5])),
               FeelVector.of([Look.opacity, 0.9]));
  }

  @Test
  testTransformImplicitIdentityMatrix(exam: Exam): void {
    const a = ThemeMatrix.forCols([Feel.default, FeelVector.of([Look.textColor, Color.black()],
                                                               [Look.accentColor, Color.rgb(0, 127, 0)])],
                                  [Feel.selected, FeelVector.of([Look.textColor, Color.white()],
                                                                [Look.accentColor, Color.rgb(0, 0, 127)])]);
    exam.equal(a.transform(MoodMatrix.empty()),
               ThemeMatrix.forCols([Feel.default, FeelVector.of([Look.textColor, Color.black()],
                                                                [Look.accentColor, Color.rgb(0, 127, 0)])],
                                   [Feel.selected, FeelVector.of([Look.textColor, Color.white()],
                                                                 [Look.accentColor, Color.rgb(0, 0, 127)])]));
  }

  @Test
  testTransformExplicitIdentityMatrix(exam: Exam): void {
    const a = ThemeMatrix.forCols([Feel.default, FeelVector.of([Look.textColor, Color.black()],
                                                               [Look.accentColor, Color.rgb(0, 127, 0)])],
                                  [Feel.selected, FeelVector.of([Look.textColor, Color.white()],
                                                                [Look.accentColor, Color.rgb(0, 0, 127)])]);
    const x = MoodMatrix.forCols([Feel.default, MoodVector.of([Feel.default, 1], [Feel.selected, 0])],
                                 [Feel.selected, MoodVector.of([Feel.default, 0], [Feel.selected, 1])]);
    exam.equal(a.transform(x),
               ThemeMatrix.forCols([Feel.default, FeelVector.of([Look.textColor, Color.black()],
                                                                [Look.accentColor, Color.rgb(0, 127, 0)])],
                                   [Feel.selected, FeelVector.of([Look.textColor, Color.white()],
                                                                 [Look.accentColor, Color.rgb(0, 0, 127)])]));
  }

  @Test
  testTransformPermutationMatrix(exam: Exam): void {
    const a = ThemeMatrix.forCols([Feel.default, FeelVector.of([Look.textColor, Color.black()],
                                                               [Look.accentColor, Color.rgb(0, 127, 0)])],
                                  [Feel.selected, FeelVector.of([Look.textColor, Color.white()],
                                                                [Look.accentColor, Color.rgb(0, 0, 127)])]);
    const x = MoodMatrix.forCols([Feel.default, MoodVector.of([Feel.default, 0], [Feel.selected, 1])],
                                 [Feel.selected, MoodVector.of([Feel.default, 1], [Feel.selected, 0])]);
    exam.equal(a.transform(x),
               ThemeMatrix.forCols([Feel.default, FeelVector.of([Look.textColor, Color.white()],
                                                                [Look.accentColor, Color.rgb(0, 0, 127)])],
                                   [Feel.selected, FeelVector.of([Look.textColor, Color.black()],
                                                                 [Look.accentColor, Color.rgb(0, 127, 0)])]));
  }
}
