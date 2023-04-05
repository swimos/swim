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

package swim.json;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public interface JsonFieldForm<K, V, B> {

  JsonForm<K> keyForm();

  JsonForm<V> valueForm();

  B updateField(B builder, K key, @Nullable V value) throws JsonException;

  default <T> @Nullable JsonObjectForm<K, V, B, T> refineForm(JsonObjectForm<K, V, B, T> form, K key, @Nullable V value) throws JsonException {
    return null;
  }

}
