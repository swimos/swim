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

package swim.repr;

import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.term.TermForm;

/**
 * A conversion between {@code Repr} instances and values of type {@code T}.
 *
 * @param <T> the type of values to convert to and from {@code Repr} instances
 */
@Public
@Since("5.0")
public interface ReprForm<T> extends TermForm<T>, IntoRepr<T>, FromRepr<T> {

  static <T> ReprForm<T> get(Type type) throws ReprProviderException {
    return Repr.registry().getReprForm(type);
  }

  static <T> ReprForm<T> get(@Nullable T value) throws ReprProviderException {
    return Repr.registry().getReprForm(value);
  }

}
