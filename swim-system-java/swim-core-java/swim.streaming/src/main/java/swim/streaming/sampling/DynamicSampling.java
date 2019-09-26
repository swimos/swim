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

package swim.streaming.sampling;

import java.time.Duration;
import java.util.function.Function;
import java.util.function.Supplier;
import swim.streaming.SwimStream;
import swim.util.Murmur3;

public class DynamicSampling implements DelaySpecifier {

  private final Duration initial;
  private final SwimStream<Duration> intervals;
  private final boolean isTransient;

  DynamicSampling(final Duration init, final SwimStream<Duration> following, final boolean isTransient) {
    initial = init;
    intervals = following;
    this.isTransient = isTransient;
  }

  public Duration getInitial() {
    return initial;
  }

  public SwimStream<Duration> getIntervalStream() {
    return intervals;
  }

  public boolean isTransient() {
    return isTransient;
  }

  @Override
  public boolean equals(final Object obj) {
    if (this == obj) {
      return true;
    } else if (obj instanceof DynamicSampling) {
      final DynamicSampling other = (DynamicSampling) obj;
      return initial.equals(other.initial) && intervals.equals(other.intervals);
    } else {
      return false;
    }
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(DynamicSampling.class);
    }
    int hash = Murmur3.mix(hashSeed, Murmur3.hash(initial));
    hash = Murmur3.mix(hash, Murmur3.hash(intervals.id()));
    hash = Murmur3.mix(hash, Murmur3.hash(isTransient));
    return Murmur3.mash(hash);
  }

  private static int hashSeed;

  @Override
  public <T> T matchDelay(final Function<StaticSampling, T> onStatic, final Function<DynamicSampling, T> onDynamic) {
    return onDynamic.apply(this);
  }

  @Override
  public <T> T match(final Supplier<T> onEager, final Function<StaticSampling, T> onStatic,
                     final Function<DynamicSampling, T> onDynamic) {
    return onDynamic.apply(this);
  }
}
