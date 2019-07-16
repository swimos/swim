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

package swim.args;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

public class Arg implements Cloneable, Debug {
  final String name;
  String value;
  boolean optional;

  public Arg(String name, String value, boolean optional) {
    this.name = name;
    this.value = value;
    this.optional = optional;
  }

  public String name() {
    return this.name;
  }

  public String value() {
    return this.value;
  }

  public Arg value(String value) {
    this.value = value;
    return this;
  }

  public boolean optional() {
    return this.optional;
  }

  public Arg optional(boolean optional) {
    this.optional = optional;
    return this;
  }

  public boolean canEqual(Object other) {
    return other instanceof Arg;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Arg) {
      final Arg that = (Arg) other;
      return that.canEqual(this) && this.name.equals(that.name)
          && (this.value == null ? that.value == null : this.value.equals(that.value))
          && this.optional == that.optional;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Arg.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.name.hashCode()), Murmur3.hash(this.value)), Murmur3.hash(this.optional)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Arg").write('.').write("of").write('(').debug(this.name);
    if (this.value != null) {
      output = output.write(", ").debug(this.value);
    }
    output = output.write(')');
    if (this.optional) {
      output = output.write('.').write("optional").write('(').write("true").write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  @Override
  public Arg clone() {
    return new Arg(this.name, this.value, this.optional);
  }

  private static int hashSeed;

  public static Arg of(String name, String value, boolean optional) {
    return new Arg(name, value, optional);
  }

  public static Arg of(String name, String value) {
    return new Arg(name, value, false);
  }

  public static Arg of(String name) {
    return new Arg(name, null, false);
  }
}
