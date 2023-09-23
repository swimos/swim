// Copyright 2015-2023 Nstream, inc.
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

import type {Output} from "../output/Output";

/**
 * Type that can output a developer readable debug string. `Debug`
 * implementations may use [[Output.settings]] to tailor the format of their
 * debug strings. For example, debug strings may be stylized when
 * [[OutputSettings.isStyled]] returns `true`.
 * @public
 */
export interface Debug {
  /**
   * Writes a developer readable, debug-formatted string representation of this
   * object to `output`.
   *
   * @returns the continuation of the `output`.
   * @throws [[OutputException]] if the `output` exits the _cont_ state before
   *         the full debug string has been written.
   */
  debug<T>(output: Output<T>): Output<T>;
}
