// Copyright 2015-2021 Swim.inc
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

import {Strings} from "./Strings";

/**
 * Utilities for working with ECMAScript identifiers.
 * @public
 */
export const Identifiers = (function () {
  const Identifiers = {} as {
    /** @internal */
    isStartChar(c: number): boolean;

    /** @internal */
    isPartChar(c: number): boolean;

    isValid(identifier: string): boolean;

    isReserved(identifier: string): boolean;
  };

  Identifiers.isStartChar = function (c: number): boolean {
    return c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c === 95/*'_'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/
        || c >= 0xc0 && c <= 0xd6
        || c >= 0xd8 && c <= 0xf6
        || c >= 0xf8 && c <= 0x2ff
        || c >= 0x370 && c <= 0x37d
        || c >= 0x37f && c <= 0x1fff
        || c >= 0x200c && c <= 0x200d
        || c >= 0x2070 && c <= 0x218f
        || c >= 0x2c00 && c <= 0x2fef
        || c >= 0x3001 && c <= 0xd7ff
        || c >= 0xf900 && c <= 0xfdcf
        || c >= 0xfdf0 && c <= 0xfffd
        || c >= 0x10000 && c <= 0xeffff;
  };

  Identifiers.isPartChar = function (c: number): boolean {
    return c === 45/*'-'*/
        || c >= 48/*'0'*/ && c <= 57/*'9'*/
        || c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c === 95/*'_'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/
        || c === 0xb7
        || c >= 0xc0 && c <= 0xd6
        || c >= 0xd8 && c <= 0xf6
        || c >= 0xf8 && c <= 0x37d
        || c >= 0x37f && c <= 0x1fff
        || c >= 0x200c && c <= 0x200d
        || c >= 0x203f && c <= 0x2040
        || c >= 0x2070 && c <= 0x218f
        || c >= 0x2c00 && c <= 0x2fef
        || c >= 0x3001 && c <= 0xd7ff
        || c >= 0xf900 && c <= 0xfdcf
        || c >= 0xfdf0 && c <= 0xfffd
        || c >= 0x10000 && c <= 0xeffff;
  };

  Identifiers.isValid = function (identifier: string): boolean {
    const n = identifier.length;
    if (n !== 0) {
      let c = identifier.codePointAt(0);
      if (c !== void 0 && Identifiers.isStartChar(c)) {
        let i = Strings.offsetByCodePoints(identifier, 0, 1);
        while (i < n && (c = identifier.codePointAt(0), c !== void 0 && Identifiers.isPartChar(c))) {
          i = Strings.offsetByCodePoints(identifier, i, 1);
        }
        return i === n && !Identifiers.isReserved(identifier);
      }
    }
    return false;
  };

  Identifiers.isReserved = function (identifier: string): boolean {
    switch (identifier) {
      case "await":
      case "break":
      case "case":
      case "catch":
      case "class":
      case "const":
      case "continue":
      case "debugger":
      case "default":
      case "delete":
      case "do":
      case "else":
      case "enum":
      case "export":
      case "extends":
      case "false":
      case "finally":
      case "for":
      case "function":
      case "if":
      case "import":
      case "in":
      case "instanceof":
      case "new":
      case "null":
      case "return":
      case "super":
      case "switch":
      case "this":
      case "throw":
      case "true":
      case "try":
      case "typeof":
      case "var":
      case "void":
      case "while":
      case "with":
      case "yield":
        return true;
      default:
        return false;
    }
  };

  return Identifiers;
})();
