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

package swim.codec;

/**
 * Text format utility functions.
 */
public final class Format {
  private Format() {
  }

  /**
   * Writes the code points of the human-readable {@link Display} string for
   * the given {@code object} to {@code output}.  Assumes {@code output} is
   * a Unicode {@code Output} writer with sufficient capacity.  Delegates to
   * {@link Display#display(Output)}, if {@code object} implements {@code
   * Display}; otherwise writes the result of {@link Object#toString()}.
   *
   * @throws OutputException if the {@code output} exits the <em>cont</em>
   *         state before the full display string has been written.
   */
  public static void display(Object object, Output<?> output) {
    if (object == null) {
      output = output.write("null");
    } else if (object instanceof Integer) {
      displayInt(((Integer) object).intValue(), output);
    } else if (object instanceof Long) {
      displayLong(((Long) object).longValue(), output);
    } else if (object instanceof Display) {
      ((Display) object).display(output);
    } else {
      output = output.write(object.toString());
    }
  }

  /**
   * Returns the human-readable {@link Display} string for the givem {@code
   * object}, output using the given {@code settings}.  Delegates to {@link
   * Display#display(Output)}, if {@code object} implements {@code Display};
   * otherwise returns the result of {@link Object#toString()}.
   */
  public static String display(Object object, OutputSettings settings) {
    final Output<String> output;
    if (object == null) {
      return "null";
    } else if (object instanceof Display) {
      output = Unicode.stringOutput(settings);
      ((Display) object).display(output);
      return output.bind();
    } else {
      return object.toString();
    }
  }

  /**
   * Returns the human-readable {@link Display} string for the givem {@code
   * object}, output using {@link OutputSettings#standard() standard} settings.
   *
   * @see #display(Object, OutputSettings)
   */
  public static String display(Object object) {
    return display(object, OutputSettings.standard());
  }

  /**
   * Writes the code points of the developer-readable {@link Debug} string for
   * the given {@code object} to {@code output}.  Assumes {@code output} is a
   * Unicode {@code Output} writer with sufficient capacity.  Delegates to
   * {@link Debug#debug(Output)}, if {@code object} implements {@code Debug};
   * writes a Java string literal, if {@code object} is a {@code String}, and
   * writes a Java number literal, if {@code object} is a {@code Number};
   * otherwise writes the result of {@link Object#toString()}.
   *
   * @throws OutputException if the {@code output} exits the <em>cont</em>
   *         state before the full debug string has been written.
   */
  public static void debug(Object object, Output<?> output) {
    if (object == null) {
      output = output.write("null");
    } else if (object instanceof Integer) {
      debugInt(((Integer) object).intValue(), output);
    } else if (object instanceof Long) {
      debugLong(((Long) object).longValue(), output);
    } else if (object instanceof Float) {
      debugFloat(((Float) object).floatValue(), output);
    } else if (object instanceof Character) {
      debugChar((int) ((Character) object).charValue(), output);
    } else if (object instanceof String) {
      debugString((String) object, output);
    } else if (object instanceof Debug) {
      ((Debug) object).debug(output);
    } else {
      output = output.write(object.toString());
    }
  }

  /**
   * Returns the developer-readable {@link Display} string for the givem {@code
   * object}, output using the given {@code settings}.  Delegates to {@link
   * Debug#debug(Output)}, if {@code object} implements {@code Debug}; returns
   * a Java string literal, if {@code object} is a {@code String}, and returns
   * a Java number literal, if {@code object} is a {@code Number}; otherwise
   * returns the result of {@link Object#toString()}.
   */
  public static String debug(Object object, OutputSettings settings) {
    final Output<String> output;
    if (object == null) {
      return "null";
    } else if (object instanceof Integer) {
      output = Unicode.stringOutput(settings);
      debugInt(((Integer) object).intValue(), output);
      return output.bind();
    } else if (object instanceof Long) {
      output = Unicode.stringOutput(settings);
      debugLong(((Long) object).longValue(), output);
      return output.bind();
    } else if (object instanceof Float) {
      output = Unicode.stringOutput(settings);
      debugFloat(((Float) object).floatValue(), output);
      return output.bind();
    } else if (object instanceof Character) {
      output = Unicode.stringOutput(settings);
      debugChar((int) ((Character) object).charValue(), output);
      return output.bind();
    } else if (object instanceof String) {
      output = Unicode.stringOutput(settings);
      debugString((String) object, output);
      return output.bind();
    } else if (object instanceof Debug) {
      output = Unicode.stringOutput(settings);
      ((Debug) object).debug(output);
      return output.bind();
    } else {
      return object.toString();
    }
  }

  /**
   * Returns the human-readable {@link Debug} string for the givem {@code
   * object}, output using {@link OutputSettings#standard() standard} settings.
   *
   * @see #debug(Object, OutputSettings)
   */
  public static String debug(Object object) {
    return debug(object, OutputSettings.standard());
  }

  /**
   * Writes the code points of the numeric string for the given {@code value}
   * to {@code output}.
   *
   * @throws OutputException if the {@code output} exits the <em>cont</em>
   *         state before the full numeric string has been written.
   */
  public static void displayInt(int value, Output<?> output) {
    if (value < 0) {
      output = output.write('-');
    }
    if (value > -10 && value < 10) {
      output = output.write('0' + Math.abs(value));
    } else {
      final byte[] digits = new byte[10];
      long x = value;
      int i = 9;
      while (x != 0) {
        digits[i] = (byte) Math.abs(x % 10);
        x /= 10;
        i -= 1;
      }
      i += 1;
      while (i < 10) {
        output = output.write('0' + digits[i]);
        i += 1;
      }
    }
  }

  /**
   * Writes the code points of the numeric string for the given {@code value}
   * to {@code output}.
   *
   * @throws OutputException if the {@code output} exits the <em>cont</em>
   *         state before the full numeric string has been written.
   */
  public static void displayLong(long value, Output<?> output) {
    if (value < 0L) {
      output = output.write('-');
    }
    if (value > -10L && value < 10L) {
      output = output.write('0' + Math.abs((int) value));
    } else {
      final byte[] digits = new byte[19];
      long x = value;
      int i = 18;
      while (x != 0L) {
        digits[i] = (byte) Math.abs((int) (x % 10L));
        x /= 10L;
        i -= 1;
      }
      i += 1;
      while (i < 19) {
        output = output.write('0' + digits[i]);
        i += 1;
      }
    }
  }

  /**
   * Writes the code points of the numeric string for the given {@code value}
   * to {@code output}.
   *
   * @throws OutputException if the {@code output} exits the <em>cont</em>
   *         state before the full numeric string has been written.
   */
  public static void displayFloat(float value, Output<?> output) {
    output = output.write(Float.toString(value)).write('f');
  }

  /**
   * Writes the code points of the numeric string for the given {@code value}
   * to {@code output}.
   *
   * @throws OutputException if the {@code output} exits the <em>cont</em>
   *         state before the full numeric string has been written.
   */
  public static void displayDouble(double value, Output<?> output) {
    output = output.write(Double.toString(value));
  }

  /**
   * Writes the code points of the Java numeric literal for the given
   * {@code value} to {@code output}.
   *
   * @throws OutputException if the {@code output} exits the <em>cont</em>
   *         state before the full numeric literal has been written.
   */
  public static void debugInt(int value, Output<?> output) {
    displayInt(value, output);
  }

  /**
   * Writes the code points of the Java numeric literal for the given
   * {@code value} to {@code output}.
   *
   * @throws OutputException if the {@code output} exits the <em>cont</em>
   *         state before the full numeric literal has been written.
   */
  public static void debugLong(long value, Output<?> output) {
    displayLong(value, output);
    output = output.write('L');
  }

  /**
   * Writes the code points of the Java numeric literal for the given
   * {@code value} to {@code output}.
   *
   * @throws OutputException if the {@code output} exits the <em>cont</em>
   *         state before the full numeric literal has been written.
   */
  public static void debugFloat(float value, Output<?> output) {
    output = output.write(Float.toString(value)).write('f');
  }

  /**
   * Writes the code points of the Java numeric literal for the given
   * {@code value} to {@code output}.
   *
   * @throws OutputException if the {@code output} exits the <em>cont</em>
   *         state before the full numeric literal has been written.
   */
  public static void debugDouble(double value, Output<?> output) {
    output = output.write(Double.toString(value));
  }

  /**
   * Writes the code points of the Java character literal for the given
   * {@code character} to {@code output}.
   *
   * @throws OutputException if the {@code output} exits the <em>cont</em>
   *         state before the full character literal has been written.
   */
  public static void debugChar(int character, Output<?> output) {
    output = output.write('\'');
    switch (character) {
      case '\b': output.write('\\').write('b'); break;
      case '\t': output.write('\\').write('t'); break;
      case '\n': output.write('\\').write('n'); break;
      case '\f': output.write('\\').write('f'); break;
      case '\r': output.write('\\').write('r'); break;
      case '\"': output.write('\\').write('\"'); break;
      case '\'': output.write('\\').write('\''); break;
      case '\\': output.write('\\').write('\\'); break;
      default:
        if (character >= 0x0000 && character <= 0x001f
            || character >= 0x007f && character <= 0x009f) {
          output = output.write('\\').write('u')
            .write(encodeHex(character >>> 12 & 0xf))
            .write(encodeHex(character >>>  8 & 0xf))
            .write(encodeHex(character >>>  4 & 0xf))
            .write(encodeHex(character        & 0xf));
        } else {
          output = output.write(character);
        }
    }
    output = output.write('\'');
  }

  /**
   * Writes the code points of the Java string literal for the given
   * {@code string} to {@code output}.
   *
   * @throws OutputException if the {@code output} exits the <em>cont</em>
   *         state before the full string literal has been written.
   */
  public static void debugString(String string, Output<?> output) {
    output = output.write('\"');
    final int n = string.length();
    for (int i = 0; i < n; i = string.offsetByCodePoints(i, 1)) {
      final int c = string.codePointAt(i);
      switch (c) {
        case '\b': output.write('\\').write('b'); break;
        case '\t': output.write('\\').write('t'); break;
        case '\n': output.write('\\').write('n'); break;
        case '\f': output.write('\\').write('f'); break;
        case '\r': output.write('\\').write('r'); break;
        case '\"': output.write('\\').write('\"'); break;
        case '\\': output.write('\\').write('\\'); break;
        default:
          if (c >= 0x0000 && c <= 0x001f || c >= 0x007f && c <= 0x009f) {
            output = output.write('\\').write('u')
              .write(encodeHex(c >>> 12 & 0xf))
              .write(encodeHex(c >>>  8 & 0xf))
              .write(encodeHex(c >>>  4 & 0xf))
              .write(encodeHex(c        & 0xf));
          } else {
            output = output.write(c);
          }
      }
    }
    output = output.write('\"');
  }

  private static char encodeHex(int x) {
    if (x < 10) {
      return (char) ('0' + x);
    } else {
      return (char) ('A' + (x - 10));
    }
  }

  private static String lineSeparator;

  /**
   * Returns the operting system specific string used to separate lines of text.
   */
  public static String lineSeparator() {
    if (lineSeparator == null) {
      lineSeparator = System.getProperty("line.separator", "\n");
    }
    return lineSeparator;
  }
}
