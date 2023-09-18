// Copyright 2015-2023 Nstream, inc.
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

package swim.hpack;

import java.nio.charset.StandardCharsets;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

public final class HpackHeader implements Comparable<HpackHeader>, Debug {

  final byte[] name;
  final byte[] value;
  final boolean sensitive;

  HpackHeader(byte[] name, byte[] value, boolean sensitive) {
    this.name = name;
    this.value = value;
    this.sensitive = sensitive;
  }

  public boolean isBlank() {
    return this.value.length == 0;
  }

  public String lowerCaseName() {
    return this.name().toLowerCase();
  }

  public String name() {
    return new String(this.name, StandardCharsets.UTF_8);
  }

  public int nameSize() {
    return this.name.length;
  }

  public String value() {
    return new String(this.value, StandardCharsets.UTF_8);
  }

  public int valueSize() {
    return this.value.length;
  }

  public boolean isSensitive() {
    return this.sensitive;
  }

  int hpackSize() {
    return this.name.length + this.value.length + HpackHeader.ENTRY_OVERHEAD;
  }

  public int compareTo(HpackHeader that) {
    int order = this.name.length - that.name.length;
    for (int i = 0, n = Math.min(this.name.length, that.name.length); i < n; i += 1) {
      final byte b1 = this.name[i];
      final byte b2 = that.name[i];
      if (b1 != b2) {
        order = b1 - b2;
        break;
      }
    }
    if (order == 0) {
      order = this.value.length - that.value.length;
      for (int i = 0, n = Math.min(this.value.length, that.value.length); i < n; i += 1) {
        final byte b1 = this.value[i];
        final byte b2 = that.value[i];
        if (b1 != b2) {
          order = b1 - b2;
          break;
        }
      }
    }
    return order;
  }

  int compareName(byte[] name) {
    int order = this.name.length - name.length;
    for (int i = 0, n = Math.min(this.name.length, name.length); i < n; i += 1) {
      final byte b1 = this.name[i];
      final byte b2 = name[i];
      if (b1 != b2) {
        order = b1 - b2;
        break;
      }
    }
    return order;
  }

  int compareValue(byte[] value) {
    int order = this.value.length - value.length;
    for (int i = 0, n = Math.min(this.value.length, value.length); i < n; i += 1) {
      final byte b1 = this.value[i];
      final byte b2 = value[i];
      if (b1 != b2) {
        order = b1 - b2;
        break;
      }
    }
    return order;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HpackHeader) {
      final HpackHeader that = (HpackHeader) other;
      final int nameLength = this.name.length;
      final int valueLength = this.value.length;
      if (nameLength == that.name.length && valueLength == that.value.length
          && this.sensitive == that.sensitive) {
        // Don't leak timing info.
        byte b = 0;
        for (int i = 0; i < nameLength; i += 1) {
          b |= (byte) (this.name[i] ^ that.name[i]);
        }
        for (int i = 0; i < valueLength; i += 1) {
          b |= (byte) (this.value[i] ^ that.value[i]);
        }
        return b == 0;
      }
    }
    return false;
  }

  public boolean equalsName(byte[] name) {
    final int nameLength = this.name.length;
    if (nameLength == name.length) {
      // Don't leak timing info.
      byte b = 0;
      for (int i = 0; i < nameLength; i += 1) {
        b |= (byte) (this.name[i] ^ name[i]);
      }
      return b == 0;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HpackHeader.hashSeed == 0) {
      HpackHeader.hashSeed = Murmur3.seed(HpackHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(HpackHeader.hashSeed,
        Murmur3.mash(Murmur3.mix(0, this.name, 0, this.name.length))),
        Murmur3.mash(Murmur3.mix(0, this.value, 0, this.value.length))),
        Murmur3.hash(this.sensitive)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HpackHeader").write('.').write("create")
                   .write('(').debug(this.name());
    if (this.value.length != 0 || this.sensitive) {
      output = output.write(", ").debug(this.value());
    }
    if (this.sensitive) {
      output = output.write(", ").debug(this.sensitive);
    }
    output = output.write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final int ENTRY_OVERHEAD = 32;

  static final byte[] EMPTY_VALUE = new byte[0];

  public static HpackHeader create(byte[] name, byte[] value, boolean sensitive) {
    return new HpackHeader(name, value, sensitive);
  }

  public static HpackHeader create(byte[] name, byte[] value) {
    return new HpackHeader(name, value, false);
  }

  public static HpackHeader create(String name, String value, boolean sensitive) {
    return new HpackHeader(name.getBytes(StandardCharsets.UTF_8),
                           value.length() != 0 ? value.getBytes(StandardCharsets.UTF_8)
                                               : HpackHeader.EMPTY_VALUE,
                           sensitive);
  }

  public static HpackHeader create(String name, String value) {
    return new HpackHeader(name.getBytes(StandardCharsets.UTF_8),
                           value.length() != 0 ? value.getBytes(StandardCharsets.UTF_8)
                                               : HpackHeader.EMPTY_VALUE,
                           false);
  }

  public static HpackHeader create(String name) {
    return new HpackHeader(name.getBytes(StandardCharsets.UTF_8),
                           HpackHeader.EMPTY_VALUE, false);
  }

}
