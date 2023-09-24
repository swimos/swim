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
  public static <U> @NonNull U conforms(@NonNull Object value) {
    return (U) value;
  }

  @SuppressWarnings({"NullAway", "TypeParameterUnusedInFormals", "unchecked"})
  public static <U> @NonNull U conformsNonNull(@Nullable Object value) {
    return (U) value;
  }

  @SuppressWarnings({"TypeParameterUnusedInFormals", "unchecked"})
  public static <U> @Nullable U conformsNullable(@Nullable Object value) {
    return (U) value;
  }

  @SuppressWarnings("NullAway")
  public static <T> @NonNull T nonNull(@Nullable T value) {
    return value;
  }

  /**
   * Covariantly casts {@code C<T>} to {@code C<U>}, where {@code C<_>} is
   * a type constructor with a covariant type parameter, and {@code U} is
   * a supertype of {@code T}. Casting {@code C<T>} to {@code C<U>} is
   * safe when {@code C} only uses type {@code T} in covariant positions.
   * <p>
   * Because Java lacks variance annotations and higher kinded types,
   * this method is unable to verify the correctness of the cast.
   *
   * @param value the instance to covariantly cast
   * @return a covariantly casted reference to {@code value}
   */
  @SuppressWarnings({"TypeParameterUnusedInFormals", "unchecked"})
  public static <U> @NonNull U covariant(@NonNull Object value) {
    return (U) value;
  }

  /**
   * Contravariantly casts {@code C<T>} to {@code C<U>}, where {@code C<_>} is
   * a type constructor with a contravariant type parameter, and {@code U} is
   * a subtype of {@code T}. Casting {@code C<T>} to {@code C<U>} is safe
   * when {@code C} only uses type {@code T} in contravariant positions.
   * <p>
   * Because Java lacks variance annotations and higher kinded types,
   * this method is unable to verify the correctness of the cast.
   *
   * @param value the instance to contravariantly cast
   * @return a contravariantly casted reference to {@code value}
   */
  @SuppressWarnings({"TypeParameterUnusedInFormals", "unchecked"})
  public static <U> @NonNull U contravariant(@NonNull Object value) {
    return (U) value;
  }

}
