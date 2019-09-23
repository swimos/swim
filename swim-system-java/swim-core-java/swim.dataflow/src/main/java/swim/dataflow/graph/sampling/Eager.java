// Copyright 2015-2019 SWIM.AI inc.
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

package swim.dataflow.graph.sampling;

import java.util.function.Function;
import java.util.function.Supplier;

public final class Eager implements Sampling {

  private Eager() {
  }

  public static final Eager INSTANCE = new Eager();

  @Override
  public boolean equals(final Object other) {
    if (other instanceof Eager) {
      return other == this;
    } else {
      return false;
    }
  }

  private static final int HASH = 13;

  @Override
  public int hashCode() {
    return HASH;
  }

  @Override
  public <T> T match(final Supplier<T> onEager, final Function<StaticSampling, T> onStatic,
                     final Function<DynamicSampling, T> onDynamic) {
    return onEager.get();
  }
}
