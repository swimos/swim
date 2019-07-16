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

public final class Bool extends Value {
  final boolean value;

  private Bool(boolean value) {
    this.value = value;
  }

  @Override
  public boolean isConstant() {
    return true;
  }

  @Override
  public String stringValue() {
    return this.value ? "true" : "false";
  }

  @Override
  public boolean booleanValue() {
    return this.value;
  }

  @Override
  public boolean booleanValue(boolean orElse) {
    return this.value;
  }

  @Override
  public Item conditional(Item thenTerm, Item elseTerm) {
    return this.value ? thenTerm : elseTerm;
  }

  public Value conditional(Value thenTerm, Value elseTerm) {
    return this.value ? thenTerm : elseTerm;
  }

  @Override
  public Item or(Item that) {
    return this.value ? this : that;
  }

  public Value or(Value that) {
    return this.value ? this : that;
  }

  @Override
  public Item and(Item that) {
    return this.value ? that : this;
  }

  public Value and(Value that) {
    return this.value ? that : this;
  }

  @Override
  public Value not() {
    return Bool.from(!this.value);
  }

  @Override
  public int typeOrder() {
    return 7;
  }

  @Override
  public int compareTo(Item other) {
    if (other instanceof Bool) {
      return compareTo((Bool) other);
    }
    return Integer.compare(typeOrder(), other.typeOrder());
  }

  int compareTo(Bool that) {
    if (this.value && !that.value) {
      return -1;
    } else if (!this.value && that.value) {
      return 1;
    } else {
      return 0;
    }
  }

  @Override
  public boolean equals(Object other) {
    return this == other;
  }

  @Override
  public int hashCode() {
    return Boolean.valueOf(this.value).hashCode();
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Bool").write('.').write("from")
        .write('(').write(this.value ? "true" : "false").write(')');
  }

  @Override
  public void display(Output<?> output) {
    output = output.write(this.value ? "true" : "false");
  }

  private static final Bool TRUE = new Bool(true);

  private static final Bool FALSE = new Bool(false);

  public static Bool from(boolean value) {
    return value ? TRUE : FALSE;
  }
}
