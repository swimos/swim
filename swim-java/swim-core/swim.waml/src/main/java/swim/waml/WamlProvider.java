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

package swim.waml;

import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A resolver of {@code WamlForm} instances from Java types.
 *
 * @see WamlForm
 * @see WamlCodec
 */
@Public
@Since("5.0")
public interface WamlProvider {

  /**
   * Returns the precedence of this provider relative to all other providers
   * registered with a {@link WamlCodec} instance. Higher priority providers
   * are consulted before lower priority providers when resolving Java types
   * to {@code TermForm} instances.
   *
   * @return the priority of this provider; the greater the numeric value,
   *         the higher the priority
   */
  default int priority() {
    return DEFAULT_PRIORITY;
  }

  /**
   * Returns a {@code WamlForm} that transcodes WAML
   * to instances of the given {@code javaType}.
   *
   * @param javaType the type of {@code WamlForm} to resolve
   * @return a {@code WamlForm<T>} whose type parameter {@code T} conforms
   *         to the given {@code javaType}, or {@code null} if this provider
   *         can't resolve the given {@code javaType}
   * @throws WamlFormException if this provider could have resolved the given
   *         {@code javaType}, but was unable to do so because of a potentially
   *         inadvertent error
   */
  @Nullable WamlForm<?> resolveWamlForm(Type javaType) throws WamlFormException;

  static final int BUILTIN_PRIORITY = 100;

  static final int DEFAULT_PRIORITY = 0;

  static final int GENERIC_PRIORITY = -100;

}
