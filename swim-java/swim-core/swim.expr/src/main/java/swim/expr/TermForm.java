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

package swim.expr;

import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public interface TermForm<T> {

  Term intoTerm(@Nullable T value);

  @Nullable T fromTerm(Term term);

  default @Nullable StringTermForm<?, ? extends T> stringForm() {
    return null;
  }

  default @Nullable NumberTermForm<? extends T> numberForm() {
    return null;
  }

  default @Nullable IdentifierTermForm<? extends T> identifierForm() {
    return null;
  }

  static <T> TermForm<T> forType(Type javaType) {
    final TermForm<T> termForm = Term.registry().forType(javaType);
    if (termForm != null) {
      return termForm;
    } else {
      throw new IllegalArgumentException("No term form for type: " + javaType);
    }
  }

  static <T> TermForm<T> forValue(@Nullable T value) {
    final TermForm<T> termForm = Term.registry().forValue(value);
    if (termForm != null) {
      return termForm;
    } else {
      throw new IllegalArgumentException("No term form for value: " + value);
    }
  }

}
