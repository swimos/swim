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

import swim.util.Murmur3;

/**
 * Unicode transformation format error handling mode.
 */
public abstract class UtfErrorMode implements Debug {
  UtfErrorMode() {
  }

  /**
   * Returns {@code true} if a Unicode decoding should abort with an error when
   * an invalid code unit sequence is encountered.
   */
  public boolean isFatal() {
    return false;
  }

  /**
   * Returns {@code true} if a Unicode decoding should substitute invalid code
   * unit sequences with a replacement character.
   */
  public boolean isReplacement() {
    return false;
  }

  /**
   * Returns the Unicode code point of the replacement character to substitute
   * for invalid code unit sequences.  Defaults to {@code U+FFFD}.
   */
  public int replacementChar() {
    return 0xfffd;
  }

  /**
   * Returns {@code true} if Unicode decoding should abort with an error when
   * a {@code NUL} byte is encountered.
   */
  public abstract boolean isNonZero();

  /**
   * Returns a {@code UtfErrorMode} that, if {@code isNonZero} is {@code true},
   * aborts when Unicode decoding encounters a {@code NUL} byte.
   */
  public abstract UtfErrorMode isNonZero(boolean isNonZero);

  @Override
  public abstract void debug(Output<?> output);

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static UtfErrorMode fatal;
  private static UtfErrorMode fatalNonZero;
  private static UtfErrorMode replacement;
  private static UtfErrorMode replacementNonZero;

  /**
   * Returns a {@code UtfErrorMode} that aborts Unicode decoding with an error
   * when invalid code unit sequences are encountered.
   */
  public static UtfErrorMode fatal() {
    if (fatal == null) {
      fatal = new UtfFatalErrorMode(false);
    }
    return fatal;
  }

  /**
   * Returns a {@code UtfErrorMode} that aborts Unicode decoding with an error
   * when invalid code unit sequences, and {@code NUL} bytes, are encountered.
   */
  public static UtfErrorMode fatalNonZero() {
    if (fatalNonZero == null) {
      fatalNonZero = new UtfFatalErrorMode(true);
    }
    return fatalNonZero;
  }

  /**
   * Returns a {@code UtfErrorMode} that substitutes invalid code unit
   * sequences with the replacement character ({@code U+FFFD}).
   */
  public static UtfErrorMode replacement() {
    if (replacement == null) {
      replacement = new UtfReplacementErrorMode(0xfffd, false);
    }
    return replacement;
  }

  /**
   * Returns a {@code UtfErrorMode} that substitutes invalid code unit
   * sequences with the given {@code replacementChar}.
   */
  public static UtfErrorMode replacement(int replacementChar) {
    if (replacementChar == 0xfffd) {
      return replacement();
    } else {
      return new UtfReplacementErrorMode(replacementChar, false);
    }
  }

  /**
   * Returns a {@code UtfErrorMode} that substitutes invalid code unit
   * sequences with the replacement character ({@code U+FFFD}), and aborts
   * decoding with an error when {@code NUL} bytes are encountered.
   */
  public static UtfErrorMode replacementNonZero() {
    if (replacementNonZero == null) {
      replacementNonZero = new UtfReplacementErrorMode(0xfffd, true);
    }
    return replacementNonZero;
  }

  /**
   * Returns a {@code UtfErrorMode} that substitutes invalid code unit
   * sequences with the given {@code replacementChar}, and aborts decoding
   * with an error when {@code NUL} bytes are encountered.
   */
  public static UtfErrorMode replacementNonZero(int replacementChar) {
    if (replacementChar == 0xfffd) {
      return replacementNonZero();
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
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UtfFatalErrorMode) {
      final UtfFatalErrorMode that = (UtfFatalErrorMode) other;
      return this.isNonZero == that.isNonZero;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(UtfFatalErrorMode.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, Murmur3.hash(this.isNonZero)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("UtfErrorMode").write('.')
        .write(this.isNonZero ? "fatalNonZero" : "fatal")
        .write('(').write(')');
  }

  private static int hashSeed;
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
    if (this.replacementChar == 0xfffd) {
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
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UtfReplacementErrorMode) {
      final UtfReplacementErrorMode that = (UtfReplacementErrorMode) other;
      return this.replacementChar == that.replacementChar
          && this.isNonZero == that.isNonZero;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(UtfReplacementErrorMode.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.replacementChar), Murmur3.hash(this.isNonZero)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("UtfErrorMode").write('.')
        .write(this.isNonZero ? "replacementNonZero" : "replacement")
        .write('(');
    if (this.replacementChar != 0xfffd) {
      Format.debugChar(this.replacementChar, output);
    }
    output = output.write(')');
  }

  private static int hashSeed;
}
