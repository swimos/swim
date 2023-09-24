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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public abstract class CacheSet<T> {

  protected CacheSet() {
    // nop
  }

  public abstract int capacity();

  public abstract int size();

  public abstract boolean contains(T value);

  public abstract @Nullable T peek(T value);

  public abstract @Nullable T get(T value);

  public abstract T put(T value);

  public abstract @Nullable T remove(T value);

}
