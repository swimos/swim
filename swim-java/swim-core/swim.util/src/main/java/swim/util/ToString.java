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

package swim.util;

import java.io.IOException;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * An object with a human readable string representation.
 */
@Public
@Since("5.0")
public interface ToString {

  /**
   * Appends a human readable string representation of this object
   * to the given {@code output}.
   */
  void writeString(Appendable output) throws IOException;

  /**
   * Returns a human readable string representation of this object,
   * formatted using the provided {@code options}.
   */
  default String toString(@Nullable NotationOptions options) {
    final Appendable output;
    if (options != null) {
      output = new Notation(options);
    } else {
      output = new StringBuilder();
    }
    try {
      this.writeString(output);
    } catch (IOException cause) {
      throw new RuntimeException(cause); // never actually throws
    }
    return output.toString();
  }

}
