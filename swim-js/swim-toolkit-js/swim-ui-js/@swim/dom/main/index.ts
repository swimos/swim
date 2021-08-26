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

export * from "./style";

export * from "./css";

export * from "./node";

export * from "./text";

export * from "./attribute";

export * from "./element";

export * from "./html";

export * from "./svg";

export * from "./manager";

declare global { // CSS Typed OM shim
  /* eslint-disable no-var */

  interface CSSStyleValue {
  }
  var CSSStyleValue: {
    new(): CSSStyleValue;
    parse(property: string, cssText: string): CSSStyleValue;
  };

  interface CSSNumericValue extends CSSStyleValue {
    to(unit: string): CSSUnitValue;
  }
  var CSSNumericValue: {
    new(): CSSNumericValue;
  };

  interface CSSUnitValue extends CSSNumericValue {
    value: number;
    readonly unit: string;
  }
  var CSSUnitValue: {
    new(value: number, unit: string): CSSUnitValue;
  };

  interface StylePropertyMapReadOnly {
    readonly size: number;
    has(property: string): boolean;
    get(property: string): CSSStyleValue | undefined;
    getAll(property: string): CSSStyleValue[];
  }
  interface StylePropertyMap extends StylePropertyMapReadOnly {
    set(property: string, ...values: (CSSStyleValue | string)[]): void;
    append(property: string, ...values: (CSSStyleValue | string)[]): void;
    delete(property: string): void;
    clear(): void;
  }

  interface ElementCSSInlineStyle {
    readonly attributeStyleMap: StylePropertyMap;
  }

  interface CSSStyleRule {
    readonly styleMap: StylePropertyMap;
  }
}
