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

import {Diagnostic} from "../source/Diagnostic";

/**
 * Thrown when a [[Parser]] parses invalid syntax.
 * @public
 */
export class ParserException extends Error {
  constructor(message?: Diagnostic | string) {
    super(message instanceof Diagnostic ? message.message : message);
    Object.setPrototypeOf(this, ParserException.prototype);
    this.diagnostic = message instanceof Diagnostic ? message : null;
  }

  readonly diagnostic: Diagnostic | null;

  override toString(): string {
    if (this.diagnostic !== null) {
      return this.diagnostic.toString();
    } else {
      return super.toString();
    }
  }
}
