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

package swim.term;

import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A conversion between {@code Term} instances and values of type {@code T}.
 *
 * @param <T> the type of values to convert to and from {@code Term} instances
 */
@Public
@Since("5.0")
public interface TermForm<T> extends IntoTerm<T>, FromTerm<T> {

  static <T> TermForm<T> get(Type type) throws TermProviderException {
    return Term.registry().getTermForm(type);
  }

  static <T> TermForm<T> get(@Nullable T value) throws TermProviderException {
    return Term.registry().getTermForm(value);
  }

}
