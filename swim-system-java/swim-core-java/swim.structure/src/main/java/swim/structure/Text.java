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

import java.math.BigInteger;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputSettings;
import swim.util.HashGenCacheMap;

public class Text extends Value {
  protected final String value;

  protected Text(String value) {
    this.value = value;
  }

  @Override
  public boolean isConstant() {
    return true;
  }

  public int size() {
    return this.value.length();
  }

  @Override
  public String stringValue() {
    return this.value;
  }

  @Override
  public String stringValue(String orElse) {
    return this.value;
  }

  @Override
  public byte byteValue() {
    try {
      return Byte.parseByte(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public byte byteValue(byte orElse) {
    try {
      return Byte.parseByte(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public short shortValue() {
    try {
      return Short.parseShort(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public short shortValue(short orElse) {
    try {
      return Short.parseShort(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public int intValue() {
    try {
      return Integer.parseInt(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public int intValue(int orElse) {
    try {
      return Integer.parseInt(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public long longValue() {
    try {
      return Long.parseLong(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public long longValue(long orElse) {
    try {
      return Long.parseLong(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public float floatValue() {
    try {
      return Float.parseFloat(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public float floatValue(float orElse) {
    try {
      return Float.parseFloat(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public double doubleValue() {
    try {
      return Double.parseDouble(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public double doubleValue(double orElse) {
    try {
      return Double.parseDouble(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public BigInteger integerValue() {
    try {
      return new BigInteger(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public BigInteger integerValue(BigInteger orElse) {
    try {
      return new BigInteger(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public Number numberValue() {
    return Num.from(this.value).numberValue();
  }

  @Override
  public Number numberValue(Number orElse) {
    try {
      return Num.from(this.value).numberValue();
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public char charValue() {
    if (this.value.length() == 1) {
      return this.value.charAt(0);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public char charValue(char orElse) {
    try {
      return charValue();
    } catch (UnsupportedOperationException cause) {
      return orElse;
    }
  }

  @Override
  public boolean booleanValue() {
    if ("true".equals(this.value)) {
      return true;
    } else if ("false".equals(this.value)) {
      return false;
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public boolean booleanValue(boolean orElse) {
    if ("true".equals(this.value)) {
      return true;
    } else if ("false".equals(this.value)) {
      return false;
    } else {
      return orElse;
    }
  }

  @Override
  public Value plus(Value that) {
    if (that instanceof Text) {
      return plus((Text) that);
    }
    return super.plus(that);
  }

  public Text plus(Text that) {
    return Text.from(this.value + that.value);
  }

  @Override
  public Text branch() {
    return this;
  }

  @Override
  public Text commit() {
    return this;
  }

  @Override
  public int typeOrder() {
    return 5;
  }

  @Override
  public final int compareTo(Item other) {
    if (other instanceof Text) {
      return this.value.compareTo(((Text) other).value);
    }
    return Integer.compare(typeOrder(), other.typeOrder());
  }

  @Override
  public final boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Text) {
      return this.value.equals(((Text) other).value);
    }
    return false;
  }

  @Override
  public final int hashCode() {
    // Text hashCode *must* equal String hashCode to ensure that RecordMap
    // hashtable lookups work with String keys.
    return this.value.hashCode();
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Text").write('.');
    if (this.value.length() == 0) {
      output = output.write("empty").write('(').write(')');
    } else {
      output = output.write("from").write('(').debug(this.value).write(')');
    }
  }

  @Override
  public void display(Output<?> output) {
    Format.debug(this.value, output);
  }

  private static ThreadLocal<HashGenCacheMap<String, Text>> cache = new ThreadLocal<>();

  private static Text empty;

  public static Output<Text> output(OutputSettings settings) {
    return new TextOutput(new StringBuilder(), settings);
  }

  public static Output<Text> output() {
    return new TextOutput(new StringBuilder(), OutputSettings.standard());
  }

  public static Text empty() {
    if (empty == null) {
      empty = new Text("");
    }
    return empty;
  }

  public static Text from(String value) {
    final int n = value.length();
    if (n == 0) {
      return empty();
    } else if (n <= 64) {
      final HashGenCacheMap<String, Text> cache = cache();
      Text text = cache.get(value);
      if (text == null) {
        text = cache.put(value, new Text(value));
      }
      return text;
    } else {
      return new Text(value);
    }
  }

  public static Text fromObject(Object object) {
    if (object instanceof Text) {
      return (Text) object;
    } else if (object instanceof String) {
      return Text.from((String) object);
    } else {
      throw new IllegalArgumentException(object.toString());
    }
  }

  static HashGenCacheMap<String, Text> cache() {
    HashGenCacheMap<String, Text> cache = Text.cache.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.structure.text.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 128;
      }
      cache = new HashGenCacheMap<String, Text>(cacheSize);
      Text.cache.set(cache);
    }
    return cache;
  }
}
