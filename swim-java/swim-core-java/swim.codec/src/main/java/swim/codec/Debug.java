// Copyright 2015-2019 SWIM.AI inc.
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

package swim.codec;

/**
 * Type that can output a developer readable debug string.  {@code Debug}
 * implementations may use {@link Output#settings()} to tailor the format of
 * their debug strings.  For example, debug strings may be stylized when
 * {@link OutputSettings#isStyled()} returns {@code true}.
 */
public interface Debug {
  /**
   * Writes a developer readable, debug-formatted string representation of this
   * object to {@code output}.
   *
   * @throws OutputException if the {@code output} exits the <em>cont</em>
   *         state before the full debug string has been written.
   */
  void debug(Output<?> output);
}
