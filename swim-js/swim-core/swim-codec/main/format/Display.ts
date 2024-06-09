// Copyright 2015-2024 Nstream, inc.
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
 * Type that can output a human readable display string. `Display`
 * implementations may use [[Output.settings]] to tailor the format of their
 * display strings. For example, display strings may be stylized when
 * [[OutputSettings.isStyled]] returns `true`.
 * @public
 */
export interface Display {
  /**
   * Writes a human readable, display-formatted string representation of this
   * object to `output`.
   *
   * @returns the continuation of the `output`.
   * @throws [[OutputException]] if the `output` exits the _cont_ state before
   *         the full display string has been written.
   */
  display<T>(output: Output<T>): Output<T>;
}
