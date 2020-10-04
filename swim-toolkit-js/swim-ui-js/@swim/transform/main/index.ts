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

export {
  AnyTransform,
  Transformation,
  Transform,
} from "./Transform";
export {IdentityTransform} from "./IdentityTransform";
export {TranslateTransform} from "./TranslateTransform";
export {ScaleTransform} from "./ScaleTransform";
export {RotateTransform} from "./RotateTransform";
export {SkewTransform} from "./SkewTransform";
export {AffineTransform} from "./AffineTransform";
export {TransformList} from "./TransformList";

export {TranslateTransformParser} from "./TranslateTransformParser";
export {ScaleTransformParser} from "./ScaleTransformParser";
export {RotateTransformParser} from "./RotateTransformParser";
export {SkewTransformParser} from "./SkewTransformParser";
export {AffineTransformParser} from "./AffineTransformParser";
export {TransformListParser} from "./TransformListParser";
export {TransformParser} from "./TransformParser";

export {TransformInterpolator} from "./TransformInterpolator";
export {TranslateTransformInterpolator} from "./TranslateTransformInterpolator";
export {ScaleTransformInterpolator} from "./ScaleTransformInterpolator";
export {RotateTransformInterpolator} from "./RotateTransformInterpolator";
export {SkewTransformInterpolator} from "./SkewTransformInterpolator";
export {AffineTransformInterpolator} from "./AffineTransformInterpolator";
export {TransformListInterpolator} from "./TransformListInterpolator";

export {TransformForm} from "./TransformForm";

declare global { // CSS Typed OM shim
  interface CSSStyleValue {
  }

  interface CSSKeywordValue extends CSSStyleValue {
    value: string;
  }
  var CSSKeywordValue: {
    new(value: string): CSSKeywordValue;
  };

  interface CSSNumericValue extends CSSStyleValue {
    to(unit: string): CSSUnitValue;
  }
  type CSSNumberish = number | CSSNumericValue;

  interface CSSTransformValue extends CSSStyleValue {
    readonly length: number;
    [index: number]: CSSTransformComponent | undefined;
    readonly is2D: boolean;
    toMatrix(): DOMMatrix;
  }
  var CSSTransformValue: {
    new(transform: CSSTransformComponent[]): CSSTransformValue;
  };

  interface CSSTransformComponent {
    readonly is2D: boolean;
    toMatrix(): DOMMatrix;
  }

  interface CSSTranslate extends CSSTransformComponent {
    x: CSSNumberish;
    y: CSSNumberish;
  }
  var CSSTranslate: {
    new(x: CSSNumberish, y: CSSNumberish): CSSTranslate;
  };

  interface CSSRotate extends CSSTransformComponent {
    angle: CSSNumericValue;
  }
  var CSSRotate: {
    new(angle: CSSNumericValue): CSSRotate;
  };

  interface CSSScale extends CSSTransformComponent {
    x: CSSNumberish;
    y: CSSNumberish;
  }
  var CSSScale: {
    new(x: CSSNumberish, y: CSSNumberish): CSSScale;
  };

  interface CSSSkew extends CSSTransformComponent {
    ax: CSSNumberish;
    ay: CSSNumberish;
  }
  var CSSSkew: {
    new(ax: CSSNumberish, ay: CSSNumberish): CSSSkew;
  };

  interface CSSSkewX extends CSSTransformComponent {
    ax: CSSNumberish;
  }
  var CSSSkewX: {
    new(ax: CSSNumberish): CSSSkewX;
  };

  interface CSSSkewY extends CSSTransformComponent {
    ay: CSSNumberish;
  }
  var CSSSkewY: {
    new(ay: CSSNumberish): CSSSkewY;
  };

  interface CSSMatrixComponent extends CSSTransformComponent {
    matrix: DOMMatrix;
  }
  var CSSMatrixComponent: {
    new(matrix: DOMMatrixReadOnly, options?: CSSMatrixComponentOptions): CSSMatrixComponent;
  };

  interface CSSMatrixComponentOptions {
    is2D?: boolean;
  }
}
