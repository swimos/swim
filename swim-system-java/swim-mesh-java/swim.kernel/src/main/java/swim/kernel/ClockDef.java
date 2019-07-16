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

package swim.kernel;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.concurrent.Clock;
import swim.util.Murmur3;

public class ClockDef implements ScheduleDef, Debug {
  final int tickMillis;
  final int tickCount;

  public ClockDef(int tickMillis, int tickCount) {
    this.tickMillis = tickMillis;
    this.tickCount = tickCount;
  }

  public final int tickMillis() {
    return this.tickMillis;
  }

  public ClockDef tickMillis(int tickMillis) {
    return copy(tickMillis, this.tickCount);
  }

  public final int tickCount() {
    return this.tickCount;
  }

  public ClockDef tickCount(int tickCount) {
    return copy(this.tickMillis, tickCount);
  }

  protected ClockDef copy(int tickMillis, int tickCount) {
    return new ClockDef(tickMillis, tickCount);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ClockDef) {
      final ClockDef that = (ClockDef) other;
      return this.tickMillis == that.tickMillis
          && this.tickCount == that.tickCount;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(ClockDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.tickMillis), this.tickCount));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("ClockDef").write('.').write("standard").write('(').write(')');
    if (this.tickMillis != Clock.TICK_MILLIS) {
      output = output.write('.').write("tickMillis").write('(').debug(tickMillis).write(')');
    }
    if (this.tickCount != Clock.TICK_COUNT) {
      output = output.write('.').write("tickCount").write('(').debug(tickCount).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static ClockDef standard;

  public static ClockDef standard() {
    if (standard == null) {
      standard = new ClockDef(Clock.TICK_MILLIS, Clock.TICK_COUNT);
    }
    return standard;
  }
}
