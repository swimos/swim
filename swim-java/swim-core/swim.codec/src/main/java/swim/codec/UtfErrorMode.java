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

package swim.codec;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

/**
 * Unicode transformation format error handling mode.
 */
@Public
@Since("5.0")
public abstract class UtfErrorMode implements WriteSource {

  UtfErrorMode() {
    // sealed
  }

  /**
   * Returns {@code true} if a Unicode decoding should abort with an error
   * when an invalid code unit sequence is encountered.
   */
  public boolean isFatal() {
    return false;
  }

  /**
   * Returns {@code true} if a Unicode decoding should substitute invalid
   * code unit sequences with a replacement character.
   */
  public boolean isReplacement() {
    return false;
  }

  /**
   * Returns the Unicode code point of the replacement character to substitute
   * for invalid code unit sequences. Defaults to {@code U+FFFD}.
   */
  public int replacementChar() {
    return 0xFFFD;
  }

  /**
   * Returns {@code true} if Unicode decoding should abort with an error
   * when a {@code NUL} byte is encountered.
   */
  public abstract boolean isNonZero();

  /**
   * Returns a {@code UtfErrorMode} that, if {@code isNonZero} is {@code true},
   * aborts when Unicode decoding encounters a {@code NUL} byte.
   */
  public abstract UtfErrorMode isNonZero(boolean isNonZero);

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final UtfErrorMode FATAL = new UtfFatalErrorMode(false);

  /**
   * Returns a {@code UtfErrorMode} that aborts Unicode decoding with an error
   * when invalid code unit sequences are encountered.
   */
  public static UtfErrorMode fatal() {
    return FATAL;
  }

  static final UtfErrorMode FATAL_NON_ZERO = new UtfFatalErrorMode(true);

  /**
   * Returns a {@code UtfErrorMode} that aborts Unicode decoding with an error
   * when invalid code unit sequences, and {@code NUL} bytes, are encountered.
   */
  public static UtfErrorMode fatalNonZero() {
    return FATAL_NON_ZERO;
  }

  static final UtfErrorMode REPLACEMENT = new UtfReplacementErrorMode(0xFFFD, false);

  /**
   * Returns a {@code UtfErrorMode} that substitutes invalid code unit
   * sequences with the replacement character ({@code U+FFFD}).
   */
  public static UtfErrorMode replacement() {
    return REPLACEMENT;
  }

  /**
   * Returns a {@code UtfErrorMode} that substitutes invalid code unit
   * sequences with the given {@code replacementChar}.
   */
  public static UtfErrorMode replacement(int replacementChar) {
    if (replacementChar == 0xFFFD) {
      return UtfErrorMode.replacement();
    } else {
      return new UtfReplacementErrorMode(replacementChar, false);
    }
  }

  static final UtfErrorMode REPLACEMENT_NON_ZERO = new UtfReplacementErrorMode(0xFFFD, true);

  /**
   * Returns a {@code UtfErrorMode} that substitutes invalid code unit
   * sequences with the replacement character ({@code U+FFFD}), and aborts
   * decoding with an error when {@code NUL} bytes are encountered.
   */
  public static UtfErrorMode replacementNonZero() {
    return REPLACEMENT_NON_ZERO;
  }

  /**
   * Returns a {@code UtfErrorMode} that substitutes invalid code unit
   * sequences with the given {@code replacementChar}, and aborts decoding
   * with an error when {@code NUL} bytes are encountered.
   */
  public static UtfErrorMode replacementNonZero(int replacementChar) {
    if (replacementChar == 0xFFFD) {
      return UtfErrorMode.replacementNonZero();
    } else {
      return new UtfReplacementErrorMode(replacementChar, true);
    }
  }

}

final class UtfFatalErrorMode extends UtfErrorMode {

  private final boolean isNonZero;

  UtfFatalErrorMode(boolean isNonZero) {
    this.isNonZero = isNonZero;
  }

  @Override
  public boolean isFatal() {
    return true;
  }

  @Override
  public boolean isNonZero() {
    return this.isNonZero;
  }

  @Override
  public UtfErrorMode isNonZero(boolean isNonZero) {
    if (isNonZero) {
      return UtfErrorMode.fatalNonZero();
    } else {
      return UtfErrorMode.fatal();
    }
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UtfFatalErrorMode that) {
      return this.isNonZero == that.isNonZero;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(UtfFatalErrorMode.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, Murmur3.hash(this.isNonZero)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.isNonZero) {
      notation.beginInvoke("UtfErrorMode", "fatalNonZero");
    } else {
      notation.beginInvoke("UtfErrorMode", "fatal");
    }
    notation.endInvoke();
  }

}

final class UtfReplacementErrorMode extends UtfErrorMode {

  private final int replacementChar;
  private final boolean isNonZero;

  UtfReplacementErrorMode(int replacementChar, boolean isNonZero) {
    this.replacementChar = replacementChar;
    this.isNonZero = isNonZero;
  }

  @Override
  public boolean isReplacement() {
    return true;
  }

  @Override
  public int replacementChar() {
    return this.replacementChar;
  }

  @Override
  public boolean isNonZero() {
    return this.isNonZero;
  }

  @Override
  public UtfErrorMode isNonZero(boolean isNonZero) {
    if (this.replacementChar == 0xFFFD) {
      if (isNonZero) {
        return UtfErrorMode.replacementNonZero();
      } else {
        return UtfErrorMode.replacement();
      }
    } else {
      return new UtfReplacementErrorMode(this.replacementChar, isNonZero);
    }
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UtfReplacementErrorMode that) {
      return this.replacementChar == that.replacementChar
          && this.isNonZero == that.isNonZero;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(UtfReplacementErrorMode.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.replacementChar), Murmur3.hash(this.isNonZero)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.isNonZero) {
      notation.beginInvoke("UtfErrorMode", "replacementNonZero");
    } else {
      notation.beginInvoke("UtfErrorMode", "replacement");
    }
    if (this.replacementChar != 0xFFFD) {
      notation.beginArgument()
              .appendSourceCodePoint(this.replacementChar)
              .endArgument();
    }
    notation.endInvoke();
  }

}
