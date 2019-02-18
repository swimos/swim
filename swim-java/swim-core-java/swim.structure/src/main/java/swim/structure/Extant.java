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

package swim.structure;

import swim.codec.Output;
import swim.util.Murmur3;

public final class Extant extends Value {
  private Extant() {
    // stub
  }

  /**
   * Always returns {@code true} because {@code Extant} is a defined value.
   */
  @Override
  public boolean isDefined() {
    return true;
  }

  /**
   * Always returns {@code false} because {@code Extant} is not a distinct
   * value.
   */
  @Override
  public boolean isDistinct() {
    return false;
  }

  @Override
  public boolean isConstant() {
    return true;
  }

  /**
   * Always returns an empty {@code Record} because {@code Extant} is not a
   * distinct value.
   */
  @Override
  public Record unflattened() {
    return Record.empty();
  }

  @Override
  public Value not() {
    return Value.absent();
  }

  /**
   * Always returns the empty {@code String} because {@code Extant} behaves
   * like an empty {@code Record}, which converts to a {@code String} by
   * concatenating the string values of all its members, if all its members
   * convert to string values.
   */
  @Override
  public String stringValue() {
    return "";
  }

  /**
   * Always returns the empty {@code String} because {@code Extant} behaves
   * like an empty {@code Record}, which converts to a {@code String} by
   * concatenating the string values of all its members, if all its members
   * convert to string values.
   */
  @Override
  public String stringValue(String orElse) {
    return "";
  }

  /**
   * Always returns {@code true} because {@code Extant} behaves like a truthy
   * value.
   */
  @Override
  public boolean booleanValue() {
    return true;
  }

  /**
   * Always returns {@code true} because {@code Extant} behaves like a truthy
   * value.
   */
  @Override
  public boolean booleanValue(boolean orElse) {
    return true;
  }

  @Override
  public int typeOrder() {
    return 98;
  }

  @Override
  public int compareTo(Item other) {
    return Integer.compare(typeOrder(), other.typeOrder());
  }

  @Override
  public boolean equals(Object other) {
    return this == other;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Extant.class);
    }
    return hashSeed;
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Value").write('.').write("extant").write('(').write(')');
  }

  private static int hashSeed;

  private static final Extant VALUE = new Extant();

  public static Extant extant() {
    return VALUE;
  }
}
