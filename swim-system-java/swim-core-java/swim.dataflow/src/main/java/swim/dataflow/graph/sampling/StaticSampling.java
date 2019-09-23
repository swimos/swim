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

import java.time.Duration;
import java.util.function.Function;
import java.util.function.Supplier;

public class StaticSampling implements DelaySpecifier {

  private final Duration interval;

  StaticSampling(final Duration dur) {
    interval = dur;
  }

  public Duration getInterval() {
    return interval;
  }

  @Override
  public boolean equals(final Object obj) {
    if (this == obj) {
      return true;
    } else if (obj instanceof StaticSampling) {
      final StaticSampling other = (StaticSampling) obj;
      return interval.equals(other.interval);
    } else {
      return false;
    }
  }

  @Override
  public int hashCode() {
    return interval.hashCode();
  }


  @Override
  public <T> T matchDelay(final Function<StaticSampling, T> onStatic, final Function<DynamicSampling, T> onDynamic) {
    return onStatic.apply(this);
  }

  @Override
  public <T> T match(final Supplier<T> onEager, final Function<StaticSampling, T> onStatic,
                     final Function<DynamicSampling, T> onDynamic) {
    return onStatic.apply(this);
  }
}
