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

package swim.repr;

import java.util.Map;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.term.Term;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class Attr implements Term, Map.Entry<String, Repr>, ToSource {

  int flags;

  final String key;

  Repr value;

  Attr(int flags, String key, Repr value) {
    this.flags = flags;
    this.key = key;
    this.value = value;
  }

  @Override
  public String getKey() {
    return this.key;
  }

  @Override
  public Repr getValue() {
    return this.value;
  }

  @Override
  public Repr setValue(Repr value) {
    Objects.requireNonNull(value);
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final Repr oldValue = this.value;
    this.value = value;
    return oldValue;
  }

  public Attr letValue(Repr value) {
    Objects.requireNonNull(value);
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      return Attr.of(this.key, value);
    }
    this.value = value;
    return this;
  }

  public Attr withValue(Repr value) {
    Objects.requireNonNull(value);
    return Attr.of(this.key, value);
  }

  @Override
  public boolean isValidObject() {
    return true;
  }

  @Override
  public Object objectValue() {
    return this;
  }

  public boolean isMutable() {
    return (this.flags & IMMUTABLE_FLAG) == 0;
  }

  public Attr asMutable() {
    if ((this.flags & IMMUTABLE_FLAG) == 0) {
      return this;
    }
    return Attr.of(this.key, this.value);
  }

  void alias() {
    this.flags |= IMMUTABLE_FLAG;
  }

  @Override
  public Attr commit() {
    if ((this.flags & IMMUTABLE_FLAG) == 0) {
      this.flags |= IMMUTABLE_FLAG;
      this.value.commit();
    }
    return this;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Attr that) {
      return this.key.equals(that.key) && this.value.equals(that.value);
    }
    return false;
  }

  @Override
  public int hashCode() {
    return this.key.hashCode() ^ this.value.hashCode();
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Attr", "of")
            .appendArgument(this.key);
    if (!(this.value instanceof UnitRepr)) {
      notation.appendArgument(this.value);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final int IMMUTABLE_FLAG = 1 << 0;

  public static Attr of(String key, Repr value) {
    Objects.requireNonNull(key, "key");
    Objects.requireNonNull(value, "value");
    return new Attr(0, key, value);
  }

  public static Attr of(String key) {
    Objects.requireNonNull(key, "key");
    return new Attr(0, key, UnitRepr.unit());
  }

}
