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
    return copy(name, this.parallelism, this.scheduleDef);
  }

  public final int parallelism() {
    return this.parallelism;
  }

  public TheaterDef parallelism(int parallelism) {
    return copy(this.name, parallelism, this.scheduleDef);
  }

  public final ScheduleDef scheduleDef() {
    return this.scheduleDef;
  }

  public TheaterDef scheduleDef(ScheduleDef scheduleDef) {
    return copy(this.name, this.parallelism, scheduleDef);
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

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(TheaterDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.name)), this.parallelism), Murmur3.hash(this.scheduleDef)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("TheaterDef").write('.').write("standard").write('(').write(')');
    if (this.name != null) {
      output = output.write('.').write("name").write('(').debug(name).write(')');
    }
    if (this.parallelism != 0) {
      output = output.write('.').write("parallelism").write('(').debug(parallelism).write(')');
    }
    if (this.scheduleDef != null) {
      output = output.write('.').write("scheduleDef").write('(').debug(scheduleDef).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static TheaterDef standard;

  public static TheaterDef standard() {
    if (standard == null) {
      standard = new TheaterDef(null, 0, null);
    }
    return standard;
  }
}
