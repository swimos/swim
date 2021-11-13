// Copyright 2015-2021 Swim Inc.
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

export * from "./length";

export * from "./angle";

export * from "./r2";

export * from "./transform";

declare global { // CSS Typed OM shim
  /* eslint-disable no-var */

  interface CSSStyleValue {
  }
  var CSSStyleValue: {
    new(): CSSStyleValue;
    parse(property: string, cssText: string): CSSStyleValue;
  };

  interface CSSKeywordValue extends CSSStyleValue {
    value: string;
  }
  var CSSKeywordValue: {
    new(value: string): CSSKeywordValue;
  };

  interface CSSNumericValue extends CSSStyleValue {
    to(unit: string): CSSUnitValue;
  }

  interface CSSUnitValue extends CSSNumericValue {
    value: number;
    readonly unit: string;
  }
  var CSSUnitValue: {
    new(value: number, unit: string): CSSUnitValue;
  };

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
    x: CSSNumericValue;
    y: CSSNumericValue;
  }
  var CSSTranslate: {
    new(x: CSSNumericValue, y: CSSNumericValue): CSSTranslate;
  };

  interface CSSRotate extends CSSTransformComponent {
    angle: CSSNumericValue;
  }
  var CSSRotate: {
    new(angle: CSSNumericValue): CSSRotate;
  };

  interface CSSScale extends CSSTransformComponent {
    x: number | CSSNumericValue;
    y: number | CSSNumericValue;
  }
  var CSSScale: {
    new(x: number | CSSNumericValue, y: number | CSSNumericValue): CSSScale;
  };

  interface CSSSkew extends CSSTransformComponent {
    ax: CSSNumericValue;
    ay: CSSNumericValue;
  }
  var CSSSkew: {
    new(ax: CSSNumericValue, ay: CSSNumericValue): CSSSkew;
  };

  interface CSSSkewX extends CSSTransformComponent {
    ax: CSSNumericValue;
  }
  var CSSSkewX: {
    new(ax: CSSNumericValue): CSSSkewX;
  };

  interface CSSSkewY extends CSSTransformComponent {
    ay: CSSNumericValue;
  }
  var CSSSkewY: {
    new(ay: CSSNumericValue): CSSSkewY;
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
