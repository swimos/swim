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
import {Transform, AffineTransform} from "@swim/math";

export class TransformParserSpec extends Spec {
  @Test
  parseIdentityTransform(exam: Exam): void {
    exam.equal(Transform.parse("none"), Transform.identity());
  }

  @Test
  parseTranslateXTransforms(exam: Exam): void {
    exam.equal(Transform.parse("translateX(2)"), Transform.translateX(2));
    exam.equal(Transform.parse("translateX(2px)"), Transform.translateX(2));
    exam.equal(Transform.parse("translateX  (  2  )"), Transform.translateX(2));
    exam.equal(Transform.parse("translateX  (  2px  )"), Transform.translateX(2));
  }

  @Test
  parseTranslateYTransforms(exam: Exam): void {
    exam.equal(Transform.parse("translateY(3)"), Transform.translateY(3));
    exam.equal(Transform.parse("translateY(3px)"), Transform.translateY(3));
    exam.equal(Transform.parse("translateY  (  3  )"), Transform.translateY(3));
    exam.equal(Transform.parse("translateY  (  3px  )"), Transform.translateY(3));
  }

  @Test
  parseTranslateTransforms(exam: Exam): void {
    exam.equal(Transform.parse("translate(5,7)"), Transform.translate(5, 7));
    exam.equal(Transform.parse("translate(5px,7px)"), Transform.translate(5, 7));
    exam.equal(Transform.parse("translate  (  5  ,  7  )"), Transform.translate(5, 7));
    exam.equal(Transform.parse("translate  (  5px  ,  7px  )"), Transform.translate(5, 7));
  }

  @Test
  parseScaleXTransforms(exam: Exam): void {
    exam.equal(Transform.parse("scaleX(2)"), Transform.scaleX(2));
    exam.equal(Transform.parse("scaleX  (  2  )"), Transform.scaleX(2));
  }

  @Test
  parseScaleYTransforms(exam: Exam): void {
    exam.equal(Transform.parse("scaleY(3)"), Transform.scaleY(3));
    exam.equal(Transform.parse("scaleY  (  3  )"), Transform.scaleY(3));
  }

  @Test
  parseScaleTransforms(exam: Exam): void {
    exam.equal(Transform.parse("scale(5,7)"), Transform.scale(5, 7));
    exam.equal(Transform.parse("scale  (  5  ,  7  )"), Transform.scale(5, 7));
  }

  @Test
  parseRotateTransforms(exam: Exam): void {
    exam.equal(Transform.parse("rotate(45)"), Transform.rotate(45));
    exam.equal(Transform.parse("rotate(45deg)"), Transform.rotate(45));
    exam.equal(Transform.parse("rotate  (  45  )"), Transform.rotate(45));
    exam.equal(Transform.parse("rotate  (  45deg  )"), Transform.rotate(45));
  }

  @Test
  parseSkewXTransforms(exam: Exam): void {
    exam.equal(Transform.parse("skewX(30)"), Transform.skewX(30));
    exam.equal(Transform.parse("skewX(30deg)"), Transform.skewX(30));
    exam.equal(Transform.parse("skewX  (  30  )"), Transform.skewX(30));
    exam.equal(Transform.parse("skewX  (  30deg  )"), Transform.skewX(30));
  }

  @Test
  parseSkewYTransforms(exam: Exam): void {
    exam.equal(Transform.parse("skewY(60)"), Transform.skewY(60));
    exam.equal(Transform.parse("skewY(60deg)"), Transform.skewY(60));
    exam.equal(Transform.parse("skewY  (  60  )"), Transform.skewY(60));
    exam.equal(Transform.parse("skewY  (  60deg  )"), Transform.skewY(60));
  }

  @Test
  parseSkewTransforms(exam: Exam): void {
    exam.equal(Transform.parse("skew(30,60)"), Transform.skew(30, 60));
    exam.equal(Transform.parse("skew(30deg,60deg)"), Transform.skew(30, 60));
    exam.equal(Transform.parse("skew  (  30  ,  60  )"), Transform.skew(30, 60));
    exam.equal(Transform.parse("skew  (  30deg  ,  60deg  )"), Transform.skew(30, 60));
  }

  @Test
  parseAffineTransforms(exam: Exam): void {
    exam.equal(Transform.parse("matrix(1,0,0,1,0,0)"), AffineTransform.identity());
    exam.equal(Transform.parse("matrix(1,0,0,1)"), AffineTransform.identity());
    exam.equal(Transform.parse("matrix(2,3,5,7,11,13)"), Transform.affine(2, 3, 5, 7, 11, 13));
    exam.equal(Transform.parse("matrix  (  1  ,  0  ,  0  ,  1  ,  0  ,  0  )"), AffineTransform.identity());
    exam.equal(Transform.parse("matrix  (  1  ,  0  ,  0  ,  1  )"), AffineTransform.identity());
    exam.equal(Transform.parse("matrix  (  2  ,  3  ,  5  ,  7  ,  11  ,  13  )"), Transform.affine(2, 3, 5, 7, 11, 13));
  }

  @Test
  parseTransformLists(exam: Exam): void {
    exam.equal(Transform.parse("translate(2,3)rotate(45)"),
               Transform.list(Transform.translate(2, 3), Transform.rotate(45)));
    exam.equal(Transform.parse("translate  (  2  ,  3  )  rotate  (  45  )"),
               Transform.list(Transform.translate(2, 3), Transform.rotate(45)));
  }
}
