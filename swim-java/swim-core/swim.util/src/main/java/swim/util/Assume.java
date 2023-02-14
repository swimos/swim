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

import swim.annotations.NonNull;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class Assume {

  private Assume() {
    // static
  }

  @SuppressWarnings({"TypeParameterUnusedInFormals", "unchecked"})
  public static <T> @NonNull T conforms(@NonNull Object value) {
    return (T) value;
  }

  @SuppressWarnings({"NullAway", "TypeParameterUnusedInFormals", "unchecked"})
  public static <T> @NonNull T conformsNonNull(@Nullable Object value) {
    return (T) value;
  }

  @SuppressWarnings({"TypeParameterUnusedInFormals", "unchecked"})
  public static <T> @Nullable T conformsNullable(@Nullable Object value) {
    return (T) value;
  }

  @SuppressWarnings("NullAway")
  public static <T> @NonNull T nonNull(@Nullable T value) {
    return value;
  }

}
