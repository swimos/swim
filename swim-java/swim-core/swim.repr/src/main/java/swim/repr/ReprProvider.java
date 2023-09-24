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

package swim.repr;

import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A resolver of {@code ReprForm} instances from Java types.
 *
 * @see ReprForm
 * @see ReprRegistry
 */
@Public
@Since("5.0")
public interface ReprProvider {

  /**
   * Returns the precedence of this provider relative to all other providers
   * registered with a {@link ReprRegistry} instance. Higher priority providers
   * are consulted before lower priority providers when resolving Java types
   * to {@code ReprForm} instances.
   *
   * @return the priority of this provider; the greater the numeric value,
   *         the higher the priority
   */
  default int priority() {
    return DEFAULT_PRIORITY;
  }

  /**
   * Returns a {@code ReprForm} that converts between instances of
   * the given {@code type} and {@code Repr} instances.
   *
   * @param type the type of {@code ReprForm} to resolve
   * @return a {@code ReprForm<T>} whose type parameter {@code T} conforms
   *         to the given {@code type}, or {@code null} if this provider
   *         can't resolve the given {@code type}
   * @throws ReprProviderException if this provider could have resolved
   *         the given {@code type}, but was unable to do so because
   *         of a potentially inadvertent error
   */
  @Nullable ReprForm<?> resolveReprForm(Type type) throws ReprProviderException;

  static final int BUILTIN_PRIORITY = 100;

  static final int DEFAULT_PRIORITY = 0;

  static final int GENERIC_PRIORITY = -100;

}
