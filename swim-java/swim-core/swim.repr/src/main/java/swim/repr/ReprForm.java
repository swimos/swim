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

@Public
@Since("5.0")
public interface ReprForm<T> {

  Repr intoRepr(@Nullable T value);

  @Nullable T fromRepr(Repr term);

  static <T> ReprForm<T> forType(Type javaType) {
    final ReprForm<T> reprForm = Repr.registry().forType(javaType);
    if (reprForm != null) {
      return reprForm;
    } else {
      throw new IllegalArgumentException("No repr form for type: " + javaType);
    }
  }

  static <T> ReprForm<T> forValue(@Nullable T value) {
    final ReprForm<T> reprForm = Repr.registry().forValue(value);
    if (reprForm != null) {
      return reprForm;
    } else {
      throw new IllegalArgumentException("No repr form for value: " + value);
    }
  }

}
