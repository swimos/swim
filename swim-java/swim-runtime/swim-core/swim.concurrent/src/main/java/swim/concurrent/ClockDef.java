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

package swim.concurrent;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
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
    return this.copy(tickMillis, this.tickCount);
  }

  public final int tickCount() {
    return this.tickCount;
  }

  public ClockDef tickCount(int tickCount) {
    return this.copy(this.tickMillis, tickCount);
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

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (ClockDef.hashSeed == 0) {
      ClockDef.hashSeed = Murmur3.seed(ClockDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(ClockDef.hashSeed,
        this.tickMillis), this.tickCount));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("ClockDef").write('.').write("standard").write('(').write(')');
    if (this.tickMillis != Clock.TICK_MILLIS) {
      output = output.write('.').write("tickMillis").write('(').debug(this.tickMillis).write(')');
    }
    if (this.tickCount != Clock.TICK_COUNT) {
      output = output.write('.').write("tickCount").write('(').debug(this.tickCount).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static ClockDef standard;

  public static ClockDef standard() {
    if (ClockDef.standard == null) {
      ClockDef.standard = new ClockDef(Clock.TICK_MILLIS, Clock.TICK_COUNT);
    }
    return ClockDef.standard;
  }

  private static Form<ClockDef> clockForm;

  @Kind
  public static Form<ClockDef> clockForm() {
    if (ClockDef.clockForm == null) {
      ClockDef.clockForm = new ClockForm(ClockDef.standard());
    }
    return ClockDef.clockForm;
  }

}

final class ClockForm extends Form<ClockDef> {

  final ClockDef unit;

  ClockForm(ClockDef unit) {
    this.unit = unit;
  }

  @Override
  public String tag() {
    return "clock";
  }

  @Override
  public ClockDef unit() {
    return this.unit;
  }

  @Override
  public Form<ClockDef> unit(ClockDef unit) {
    return new ClockForm(unit);
  }

  @Override
  public Class<ClockDef> type() {
    return ClockDef.class;
  }

  @Override
  public Item mold(ClockDef clockDef) {
    if (clockDef != null) {
      final Record record = Record.create(3).attr(this.tag());
      record.slot("tickMillis", clockDef.tickMillis);
      record.slot("tickCount", clockDef.tickCount);
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public ClockDef cast(Item item) {
    final Value value = item.toValue();
    final Value header = value.getAttr(this.tag());
    if (header.isDefined()) {
      final int tickMillis = value.get("tickMillis").intValue(Clock.TICK_MILLIS);
      final int tickCount = value.get("tickCount").intValue(Clock.TICK_COUNT);
      return new ClockDef(tickMillis, tickCount);
    }
    return null;
  }

}
