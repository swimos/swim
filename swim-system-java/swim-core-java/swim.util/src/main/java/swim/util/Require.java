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

package swim.util;

/**
 * Convenient exception throwing assertions to check preconditions.
 */
public final class Require {

  private Require() {
  }

  public static void that(final boolean condition, final String message) {
    if (!condition) {
      throw new IllegalArgumentException(message);
    }
  }

  public static void that(final boolean condition, final String format, final Object... params) {
    if (!condition) {
      throw new IllegalArgumentException(String.format(format, params));
    }
  }

}
