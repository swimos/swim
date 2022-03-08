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
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.Murmur3;

public class TheaterDef implements StageDef, Debug {

  final String name;
  final int parallelism;
  final ScheduleDef scheduleDef;

  public TheaterDef(String name, int parallelism, ScheduleDef scheduleDef) {
    this.name = name;
    this.parallelism = parallelism;
    this.scheduleDef = scheduleDef;
  }

  public final String name() {
    return this.name;
  }

  public TheaterDef name(String name) {
    return this.copy(name, this.parallelism, this.scheduleDef);
  }

  public final int parallelism() {
    return this.parallelism;
  }

  public TheaterDef parallelism(int parallelism) {
    return this.copy(this.name, parallelism, this.scheduleDef);
  }

  public final ScheduleDef scheduleDef() {
    return this.scheduleDef;
  }

  public TheaterDef scheduleDef(ScheduleDef scheduleDef) {
    return this.copy(this.name, this.parallelism, scheduleDef);
  }

  protected TheaterDef copy(String name, int parallelism, ScheduleDef scheduleDef) {
    return new TheaterDef(name, parallelism, scheduleDef);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TheaterDef) {
      final TheaterDef that = (TheaterDef) other;
      return (this.name == null ? that.name == null : this.name.equals(that.name))
          && this.parallelism == that.parallelism
          && (this.scheduleDef == null ? that.scheduleDef == null : this.scheduleDef.equals(that.scheduleDef));
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (TheaterDef.hashSeed == 0) {
      TheaterDef.hashSeed = Murmur3.seed(TheaterDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(TheaterDef.hashSeed,
        Murmur3.hash(this.name)), this.parallelism), Murmur3.hash(this.scheduleDef)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("TheaterDef").write('.').write("standard").write('(').write(')');
    if (this.name != null) {
      output = output.write('.').write("name").write('(').debug(this.name).write(')');
    }
    output = output.write('.').write("parallelism").write('(').debug(this.parallelism).write(')');
    if (this.scheduleDef != null) {
      output = output.write('.').write("scheduleDef").write('(').debug(this.scheduleDef).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static TheaterDef standard;

  public static TheaterDef standard() {
    if (TheaterDef.standard == null) {
      TheaterDef.standard = new TheaterDef(null, 0, null);
    }
    return TheaterDef.standard;
  }

  private static Form<TheaterDef> theaterForm;

  @Kind
  public static Form<TheaterDef> theaterForm() {
    if (TheaterDef.theaterForm == null) {
      TheaterDef.theaterForm = new TheaterForm(ScheduleDef.form(), TheaterDef.standard());
    }
    return TheaterDef.theaterForm;
  }

  public static Form<TheaterDef> theaterForm(Form<ScheduleDef> scheduleForm) {
    return new TheaterForm(scheduleForm, TheaterDef.standard());
  }

}

final class TheaterForm extends Form<TheaterDef> {

  final Form<ScheduleDef> scheduleForm;
  final TheaterDef unit;

  TheaterForm(Form<ScheduleDef> scheduleForm, TheaterDef unit) {
    this.scheduleForm = scheduleForm;
    this.unit = unit;
  }

  @Override
  public String tag() {
    return "theater";
  }

  @Override
  public TheaterDef unit() {
    return this.unit;
  }

  @Override
  public Form<TheaterDef> unit(TheaterDef unit) {
    return new TheaterForm(this.scheduleForm, unit);
  }

  @Override
  public Class<TheaterDef> type() {
    return TheaterDef.class;
  }

  @Override
  public Item mold(TheaterDef theaterDef) {
    if (theaterDef != null) {
      final Record record = Record.create(3).attr(this.tag());
      record.slot("parallelism", theaterDef.parallelism);
      if (theaterDef.scheduleDef != null) {
        record.add(this.scheduleForm.mold(theaterDef.scheduleDef));
      }
      return theaterDef.name != null ? Slot.of(theaterDef.name, record) : record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public TheaterDef cast(Item item) {
    final Value value = item.toValue();
    final Value header = value.getAttr(this.tag());
    if (header.isDefined()) {
      final String name = item.key().stringValue(null);
      int parallelism = 2 * Runtime.getRuntime().availableProcessors();
      ScheduleDef scheduleDef = null;
      for (int i = 0, n = value.length(); i < n; i += 1) {
        final Item member = value.getItem(i);
        if (member.keyEquals("parallelism")) {
          parallelism = member.toValue().intValue(parallelism);
          continue;
        }
        final ScheduleDef newScheduleDef = this.scheduleForm.cast(member);
        if (newScheduleDef != null) {
          scheduleDef = newScheduleDef;
          continue;
        }
      }
      return new TheaterDef(name, parallelism, scheduleDef);
    }
    return null;
  }

}
