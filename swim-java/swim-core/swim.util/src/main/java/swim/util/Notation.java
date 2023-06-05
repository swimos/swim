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

package swim.util;

import java.io.IOException;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public class Notation implements Appendable {

  protected final Appendable output;
  protected NotationOptions options;
  protected @Nullable IOException error;
  NotationFrame stack;

  protected Notation(Appendable output, @Nullable NotationOptions options,
                     @Nullable IOException error) {
    if (options == null) {
      options = NotationOptions.readable();
    }
    this.output = output;
    this.options = options;
    this.error = error;
    this.stack = new NotationFrame(0, 0, 0, null);
  }

  public Notation(Appendable output, @Nullable NotationOptions options) {
    this(output, options, null);
  }

  public Notation(Appendable output) {
    this(output, null, null);
  }

  public Notation(@Nullable NotationOptions options) {
    this(new StringBuilder(), options, null);
  }

  public Notation() {
    this(new StringBuilder(), null, null);
  }

  public final Appendable output() {
    return this.output;
  }

  public final NotationOptions options() {
    return this.options;
  }

  public void setOptions(NotationOptions options) {
    this.options = options;
  }

  public final int getIndent() {
    return this.stack.depth;
  }

  public void setIndent(int depth) {
    if (depth < 0) {
      throw new IllegalArgumentException(Integer.toString(depth));
    }
    this.stack.depth = depth;
  }

  public Notation indent() {
    this.stack.depth += 1;
    return this;
  }

  public Notation unindent() {
    this.stack.depth = Math.max(0, this.stack.depth - 1);
    return this;
  }

  NotationFrame pushStack(int state, int flags) {
    final NotationFrame frame = new NotationFrame(state, flags, this.stack.depth, this.stack);
    this.stack = frame;
    return frame;
  }

  NotationFrame popStack() {
    final NotationFrame frame = this.stack.next;
    if (frame == null) {
      throw new IllegalStateException();
    }
    this.stack = frame;
    return frame;
  }

  public Notation checkError() throws IOException {
    if (this.error != null) {
      throw this.error;
    } else {
      return this;
    }
  }

  public Notation appendCodePoint(int c) {
    if (this.error == null) {
      try {
        if (c < 0) {
          this.output.append((char) 0xFFFD); // invalid code point
        } else if (c <= 0xD7FF) { // U+0000 to U+D7FF
          this.output.append((char) c);
        } else if (c <= 0xDFFF) { // U+D800 to U+DFFF
          this.output.append((char) 0xFFFD); // invalid code point in surrogate range
        } else if (c <= 0xFFFF) { // U+E000 to U+FFFF
          this.output.append((char) c);
        } else if (c <= 0x10FFFF) { // U+10000 to U+10FFFF
          this.output.append((char) (0xD800 | ((c - 0x10000) >>> 10 & 0x3FF))); // high surrogate
          this.output.append((char) (0xDC00 | ((c - 0x10000) & 0x3FF))); // low surrogate
        } else {
          this.output.append((char) 0xFFFD); // invalid code point
        }
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  @Override
  public Notation append(char c) {
    if (this.error == null) {
      try {
        this.output.append(c);
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  @Override
  public Notation append(@Nullable CharSequence csq) {
    if (this.error == null) {
      try {
        this.output.append(csq);
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  @Override
  public Notation append(@Nullable CharSequence csq, int start, int end) {
    if (this.error == null) {
      try {
        this.output.append(csq, start, end);
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  public Notation append(@Nullable Object object) {
    if (this.error == null) {
      try {
        this.output.append(object != null ? object.toString() : "null");
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  public Notation appendLine() {
    if (this.error == null) {
      try {
        final String lineSeparator = this.options.lineSeparator();
        if (lineSeparator != null) {
          this.output.append(lineSeparator);
        }
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  public Notation appendIndent() {
    if (this.error == null) {
      try {
        final String indentation = this.options.indentation();
        final String lineSeparator = this.options.lineSeparator();
        if (indentation != null && lineSeparator != null) {
          int depth = this.stack.depth;
          while (depth > 0) {
            this.output.append(indentation);
            depth -= 1;
          }
        }
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  public Notation appendLineIndent() {
    if (this.error == null) {
      try {
        final String indentation = this.options.indentation();
        final String lineSeparator = this.options.lineSeparator();
        if (indentation != null && lineSeparator != null) {
          int depth = this.stack.depth;
          this.output.append(lineSeparator);
          while (depth > 0) {
            this.output.append(indentation);
            depth -= 1;
          }
        }
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  public Notation appendLineIndentOrSpace() {
    if (this.error == null) {
      final String indentation = this.options.indentation();
      final String lineSeparator = this.options.lineSeparator();
      try {
        if (indentation != null && lineSeparator != null) {
          int depth = this.stack.depth;
          this.output.append(lineSeparator);
          while (depth > 0) {
            this.output.append(indentation);
            depth -= 1;
          }
        } else if (this.options.whitespace()) {
          this.output.append(' ');
        }
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  public Notation appendSpace() {
    if (this.error == null) {
      if (this.options.whitespace()) {
        try {
          this.output.append(' ');
        } catch (IOException cause) {
          this.error = cause;
        }
      }
    }
    return this;
  }

  /**
   * Appends a source code string representation of the given {@code object}.
   * Delegates to {@link ToSource#writeSource(Appendable)}, if {@code object}
   * implements {@code ToSource}; appends a Java source code literal,
   * if {@code object} is a {@code String} or boxed primitive; otherwise
   * appends the {@code toString} representation of {@code object}.
   */
  public Notation appendSource(@Nullable Object object) {
    if (object instanceof ToSource) {
      if (this.error == null) {
        try {
          ((ToSource) object).writeSource(this);
        } catch (IOException cause) {
          this.error = cause;
        }
      }
    } else if (object instanceof Boolean) {
      this.appendSource(((Boolean) object).booleanValue());
    } else if (object instanceof Byte) {
      this.appendSource(((Byte) object).byteValue());
    } else if (object instanceof Short) {
      this.appendSource(((Short) object).shortValue());
    } else if (object instanceof Integer) {
      this.appendSource(((Integer) object).intValue());
    } else if (object instanceof Long) {
      this.appendSource(((Long) object).longValue());
    } else if (object instanceof Float) {
      this.appendSource(((Float) object).floatValue());
    } else if (object instanceof Double) {
      this.appendSource(((Double) object).doubleValue());
    } else if (object instanceof Character) {
      this.appendSource(((Character) object).charValue());
    } else if (object instanceof String) {
      this.appendSource((String) object);
    } else if (object instanceof Class<?>) {
      this.appendSource((Class<?>) object);
    } else {
      this.append(object);
    }
    return this;
  }

  /**
   * Appends the Java boolean literal representation of the given
   * primitive {@code boolean} {@code value}.
   */
  public Notation appendSource(boolean value) {
    if (this.error == null) {
      try {
        this.output.append(value ? "true" : "false");
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  /**
   * Appends the Java numeric literal representation of the given
   * primitive {@code byte} {@code value}.
   */
  public Notation appendSource(byte value) {
    if (this.error == null) {
      try {
        this.output.append('(').append("byte").append(')').append(' ').append(Byte.toString(value));
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  /**
   * Appends the Java numeric literal representation of the given
   * primitive {@code short} {@code value}.
   */
  public Notation appendSource(short value) {
    if (this.error == null) {
      try {
        this.output.append('(').append("short").append(')').append(' ').append(Short.toString(value));
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  /**
   * Appends the Java numeric literal representation of the given
   * primitive {@code int} {@code value}.
   */
  public Notation appendSource(int value) {
    if (this.error == null) {
      try {
        this.output.append(Integer.toString(value));
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  /**
   * Appends the Java numeric literal representation of the given
   * primitive {@code long} {@code value}.
   */
  public Notation appendSource(long value) {
    if (this.error == null) {
      try {
        this.output.append(Long.toString(value)).append('L');
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  /**
   * Appends the Java numeric literal representation of the given
   * primitive {@code float} {@code value}.
   */
  public Notation appendSource(float value) {
    if (this.error == null) {
      try {
        this.output.append(Float.toString(value)).append('f');
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  /**
   * Appends the Java numeric literal representation of the given
   * primitive {@code double} {@code value}.
   */
  public Notation appendSource(double value) {
    if (this.error == null) {
      try {
        this.output.append(Double.toString(value));
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  /**
   * Appends the Java character literal representation of the given
   * primitive {@code char} {@code value}.
   */
  public Notation appendSource(char value) {
    if (this.error == null) {
      try {
        this.output.append('\'');
        if (value == '\b') {
          this.output.append('\\').append('b');
        } else if (value == '\t') {
          this.output.append('\\').append('t');
        } else if (value == '\n') {
          this.output.append('\\').append('n');
        } else if (value == '\f') {
          this.output.append('\\').append('f');
        } else if (value == '\r') {
          this.output.append('\\').append('r');
        } else if (value == '\"') {
          this.output.append('\\').append('\"');
        } else if (value == '\'') {
          this.output.append('\\').append('\'');
        } else if (value == '\\') {
          this.output.append('\\').append('\\');
        } else if (value <= 0x1F || (value >= 0x7F && value <= 0x9F)) {
          this.output.append('\\').append('u')
                     .append("0123456789ABCDEF".charAt(value >>> 12 & 0xF))
                     .append("0123456789ABCDEF".charAt(value >>> 8 & 0xF))
                     .append("0123456789ABCDEF".charAt(value >>> 4 & 0xF))
                     .append("0123456789ABCDEF".charAt(value & 0xF));
        } else {
          this.output.append(value);
        }
        this.output.append('\'');
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  /**
   * Appends the Java string literal representation of the given
   * {@code String} {@code value}.
   */
  public Notation appendSource(@Nullable String value) {
    if (this.error == null) {
      try {
        if (value != null) {
          this.output.append('\"');
          for (int i = 0, n = value.length(); i < n; i = value.offsetByCodePoints(i, 1)) {
            final int c = value.codePointAt(i);
            if (c < 0) {
              this.output.append((char) 0xFFFD); // invalid code point
            } else if (c == '\b') {
              this.output.append('\\').append('b');
            } else if (c == '\t') {
              this.output.append('\\').append('t');
            } else if (c == '\n') {
              this.output.append('\\').append('n');
            } else if (c == '\f') {
              this.output.append('\\').append('f');
            } else if (c == '\r') {
              this.output.append('\\').append('r');
            } else if (c == '\"') {
              this.output.append('\\').append('\"');
            } else if (c == '\\') {
              this.output.append('\\').append('\\');
            } else if (c <= 0x1F || (c >= 0x7F && c <= 0x9F)) {
              this.output.append('\\').append('u')
                         .append("0123456789ABCDEF".charAt(c >>> 12 & 0xF))
                         .append("0123456789ABCDEF".charAt(c >>> 8 & 0xF))
                         .append("0123456789ABCDEF".charAt(c >>> 4 & 0xF))
                         .append("0123456789ABCDEF".charAt(c & 0xF));
            } else if (c <= 0xD7FF) { // U+0000 to U+D7FF
              this.output.append((char) c);
            } else if (c <= 0xDFFF) { // U+D800 to U+DFFF
              this.output.append((char) 0xFFFD); // invalid code point in surrogate range
            } else if (c <= 0xFFFF) { // U+E000 to U+FFFF
              this.output.append((char) c);
            } else if (c <= 0x10FFFF) { // U+10000 to U+10FFFF
              this.output.append((char) (0xD800 | ((c - 0x10000) >>> 10 & 0x3FF))) // high surrogate
                         .append((char) (0xDC00 | ((c - 0x10000) & 0x3FF))); // low surrogate
            } else {
              this.output.append((char) 0xFFFD); // invalid code point
            }
          }
          this.output.append('\"');
        } else {
          this.output.append("null");
        }
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  /**
   * Appends the Java literal representation of the given
   * Unicode code point {@code c}.
   */
  public Notation appendSourceCodePoint(int c) {
    if (this.error == null) {
      try {
        if (c < 0) {
          this.output.append('\'').append((char) 0xFFFD).append('\''); // invalid code point
        } else if (c == '\b') {
          this.output.append('\'').append('\\').append('b').append('\'');
        } else if (c == '\t') {
          this.output.append('\'').append('\\').append('t').append('\'');
        } else if (c == '\n') {
          this.output.append('\'').append('\\').append('n').append('\'');
        } else if (c == '\f') {
          this.output.append('\'').append('\\').append('f').append('\'');
        } else if (c == '\r') {
          this.output.append('\'').append('\\').append('r').append('\'');
        } else if (c == '\"') {
          this.output.append('\'').append('\\').append('\"').append('\'');
        } else if (c == '\'') {
          this.output.append('\'').append('\\').append('\'').append('\'');
        } else if (c == '\\') {
          this.output.append('\'').append('\\').append('\\').append('\'');
        } else if (c <= 0x1F || (c >= 0x7F && c <= 0x9F)) {
          this.output.append('\'').append('\\').append('u')
                     .append("0123456789ABCDEF".charAt(c >>> 12 & 0xF))
                     .append("0123456789ABCDEF".charAt(c >>> 8 & 0xF))
                     .append("0123456789ABCDEF".charAt(c >>> 4 & 0xF))
                     .append("0123456789ABCDEF".charAt(c & 0xF))
                     .append('\'');
        } else if (c <= 0xD7FF) { // U+0000 to U+D7FF
          this.output.append('\'').append((char) c).append('\'');
        } else if (c <= 0xDFFF) { // U+D800 to U+DFFF
          this.output.append('\'').append((char) 0xFFFD).append('\''); // invalid code point in surrogate range
        } else if (c <= 0xFFFF) { // U+E000 to U+FFFF
          this.output.append('\'').append((char) c).append('\'');
        } else if (c <= 0x10FFFF) { // U+10000 to U+10FFFF
          this.output.append("0x").append(Integer.toHexString(c)); // non-bmp code point
        } else {
          this.output.append('\'').append((char) 0xFFFD).append('\''); // invalid code point
        }
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  /**
   * Appends the Java class literal representation of the given
   * {@code Class} {@code value}.
   */
  public Notation appendSource(@Nullable Class<?> value) {
    if (this.error == null) {
      try {
        if (value != null) {
          this.output.append("Class").append('.').append("forName").append('(')
                     .append('"').append(value.getName()).append('"').append(')');
        } else {
          this.output.append("null");
        }
      } catch (IOException cause) {
        this.error = cause;
      }
    }
    return this;
  }

  public Notation appendMarkup(@Nullable Object object) {
    if (object instanceof ToMarkup) {
      if (this.error == null) {
        try {
          ((ToMarkup) object).writeMarkup(this);
        } catch (IOException cause) {
          this.error = cause;
        }
      }
    } else if (object instanceof Object[]) {
      this.appendMarkup((Object[]) object);
    } else {
      this.appendSource(object);
    }
    return this;
  }

  public Notation appendMarkup(Object @Nullable [] array) {
    if (array != null) {
      this.beginArray();
      for (int i = 0; i < array.length; i += 1) {
        this.appendElement(array[i]);
      }
      this.endArray();
    } else {
      this.append("null");
    }
    return this;
  }

  public Notation appendIdentifier(@Nullable Object value) {
    if (value instanceof String && this.isIdentifier((String) value)) {
      this.append((String) value);
    } else {
      this.appendMarkup(value);
    }
    return this;
  }

  public boolean isIdentifier(String value) {
    final int n = value.length();
    if (n == 0 || !Notation.isIdentifierStartChar(value.codePointAt(0))) {
      return false;
    }
    for (int i = value.offsetByCodePoints(0, 1); i < n; i = value.offsetByCodePoints(i, 1)) {
      if (!Notation.isIdentifierChar(value.codePointAt(i))) {
        return false;
      }
    }
    return true;
  }

  static boolean isIdentifierStartChar(int c) {
    return (c >= 'A' && c <= 'Z')
        || c == '_'
        || (c >= 'a' && c <= 'z')
        || (c >= 0xC0 && c <= 0xD6)
        || (c >= 0xD8 && c <= 0xF6)
        || (c >= 0xF8 && c <= 0x2FF)
        || (c >= 0x370 && c <= 0x37D)
        || (c >= 0x37F && c <= 0x1FFF)
        || (c >= 0x200C && c <= 0x200D)
        || (c >= 0x2070 && c <= 0x218F)
        || (c >= 0x2C00 && c <= 0x2FEF)
        || (c >= 0x3001 && c <= 0xD7FF)
        || (c >= 0xF900 && c <= 0xFDCF)
        || (c >= 0xFDF0 && c <= 0xFFFD)
        || (c >= 0x10000 && c <= 0xEFFFF);
  }

  static boolean isIdentifierChar(int c) {
    return (c >= '0' && c <= '9')
        || (c >= 'A' && c <= 'Z')
        || c == '_'
        || (c >= 'a' && c <= 'z')
        || c == 0xB7
        || (c >= 0xC0 && c <= 0xD6)
        || (c >= 0xD8 && c <= 0xF6)
        || (c >= 0xF8 && c <= 0x37D)
        || (c >= 0x37F && c <= 0x1FFF)
        || (c >= 0x200C && c <= 0x200D)
        || (c >= 0x203F && c <= 0x2040)
        || (c >= 0x2070 && c <= 0x218F)
        || (c >= 0x2C00 && c <= 0x2FEF)
        || (c >= 0x3001 && c <= 0xD7FF)
        || (c >= 0xF900 && c <= 0xFDCF)
        || (c >= 0xFDF0 && c <= 0xFFFD)
        || (c >= 0x10000 && c <= 0xEFFFF);
  }

  /**
   * Appends a human readable string representation of the given {@code object}.
   * Delegates to {@link ToString#writeString(Appendable)}, if {@code object}
   * implements {@code ToString}; otherwise appends the {@code toString}
   * representation of {@code object}.
   */
  public Notation appendString(@Nullable Object object) {
    if (object instanceof ToString) {
      if (this.error == null) {
        try {
          ((ToString) object).writeString(this);
        } catch (IOException cause) {
          this.error = cause;
        }
      }
    } else {
      this.append(object);
    }
    return this;
  }

  public Notation beginArray() {
    this.pushStack(ARRAY_BEGIN, this.stack.flags & INLINE_FLAG);
    this.append('[');
    this.indent();
    return this;
  }

  public Notation beginArray(@Nullable String tag) {
    this.pushStack(ARRAY_BEGIN, this.stack.flags & INLINE_FLAG);
    if (tag != null) {
      this.append('@');
      this.appendIdentifier(tag);
      this.appendSpace();
    }
    this.append('[');
    this.indent();
    return this;
  }

  public Notation beginInlineArray() {
    this.pushStack(ARRAY_BEGIN, INLINE_FLAG);
    this.append('[');
    this.indent();
    return this;
  }

  public Notation beginInlineArray(@Nullable String tag) {
    this.pushStack(ARRAY_BEGIN, INLINE_FLAG);
    if (tag != null) {
      this.append('@');
      this.appendIdentifier(tag);
      this.appendSpace();
    }
    this.append('[');
    this.indent();
    return this;
  }

  public Notation beginElement() {
    final NotationFrame frame = this.stack;
    if (frame.state != ARRAY_BEGIN && frame.state != ARRAY_ELEMENT_END) {
      throw new IllegalStateException();
    }
    if (frame.state == ARRAY_ELEMENT_END) {
      this.append(',');
    }
    if (frame.state == ARRAY_BEGIN && (frame.flags & INLINE_FLAG) == 0) {
      this.appendLineIndent();
    } else if ((frame.flags & INLINE_FLAG) == 0) {
      this.appendLineIndentOrSpace();
    } else if (frame.state == ARRAY_ELEMENT_END) {
      this.appendSpace();
    }
    frame.state = ARRAY_ELEMENT_BEGIN;
    return this;
  }

  public Notation endElement() {
    final NotationFrame frame = this.stack;
    if (frame.state != ARRAY_ELEMENT_BEGIN) {
      throw new IllegalStateException();
    }
    frame.state = ARRAY_ELEMENT_END;
    return this;
  }

  public Notation appendElement(@Nullable Object element) {
    this.beginElement();
    this.appendMarkup(element);
    this.endElement();
    return this;
  }

  public Notation endArray() {
    final NotationFrame frame = this.stack;
    if (frame.state != ARRAY_BEGIN && frame.state != ARRAY_ELEMENT_END) {
      throw new IllegalStateException();
    }
    this.unindent();
    if (frame.state == ARRAY_ELEMENT_END && (frame.flags & INLINE_FLAG) == 0) {
      this.appendLineIndent();
    }
    this.append(']');
    frame.state = -1;
    this.popStack();
    return this;
  }

  public Notation beginObject() {
    this.pushStack(OBJECT_BEGIN, this.stack.flags & INLINE_FLAG);
    this.append('{');
    this.indent();
    return this;
  }

  public Notation beginObject(@Nullable String tag) {
    this.pushStack(OBJECT_BEGIN, this.stack.flags & INLINE_FLAG);
    if (tag != null) {
      this.append('@');
      this.appendIdentifier(tag);
      this.appendSpace();
    }
    this.append('{');
    this.indent();
    return this;
  }

  public Notation beginInlineObject() {
    this.pushStack(OBJECT_BEGIN, INLINE_FLAG);
    this.append('{');
    this.indent();
    return this;
  }

  public Notation beginInlineObject(@Nullable String tag) {
    this.pushStack(OBJECT_BEGIN, INLINE_FLAG);
    if (tag != null) {
      this.append('@');
      this.appendIdentifier(tag);
      this.appendSpace();
    }
    this.append('{');
    this.indent();
    return this;
  }

  public Notation beginKey() {
    final NotationFrame frame = this.stack;
    if (frame.state != OBJECT_BEGIN && frame.state != OBJECT_VALUE_END) {
      throw new IllegalStateException();
    }
    if (frame.state == OBJECT_VALUE_END) {
      this.append(',');
    }
    if (frame.state == OBJECT_BEGIN && (frame.flags & INLINE_FLAG) == 0) {
      this.appendLineIndent();
    } else if ((frame.flags & INLINE_FLAG) == 0) {
      this.appendLineIndentOrSpace();
    } else if (frame.state == OBJECT_VALUE_END) {
      this.appendSpace();
    }
    frame.state = OBJECT_KEY_BEGIN;
    return this;
  }

  public Notation endKey() {
    final NotationFrame frame = this.stack;
    if (frame.state != OBJECT_KEY_BEGIN) {
      throw new IllegalStateException();
    }
    this.append(':');
    frame.state = OBJECT_KEY_END;
    return this;
  }

  public Notation appendKey(@Nullable Object key) {
    this.beginKey();
    this.appendIdentifier(key);
    this.endKey();
    return this;
  }

  public Notation beginValue() {
    final NotationFrame frame = this.stack;
    if (frame.state != OBJECT_KEY_END) {
      throw new IllegalStateException();
    }
    this.appendSpace();
    frame.state = OBJECT_VALUE_BEGIN;
    return this;
  }

  public Notation endValue() {
    final NotationFrame frame = this.stack;
    if (frame.state != OBJECT_VALUE_BEGIN) {
      throw new IllegalStateException();
    }
    frame.state = OBJECT_VALUE_END;
    return this;
  }

  public Notation appendValue(@Nullable Object value) {
    this.beginValue();
    this.appendMarkup(value);
    this.endValue();
    return this;
  }

  public Notation appendField(@Nullable Object key, @Nullable Object value) {
    this.appendKey(key);
    this.appendValue(value);
    return this;
  }

  public Notation endObject() {
    final NotationFrame frame = this.stack;
    if (frame.state != OBJECT_BEGIN && frame.state != OBJECT_VALUE_END) {
      throw new IllegalStateException();
    }
    this.unindent();
    if (frame.state == OBJECT_VALUE_END && (frame.flags & INLINE_FLAG) == 0) {
      this.appendLineIndent();
    }
    this.append('}');
    frame.state = -1;
    this.popStack();
    return this;
  }

  public Notation beginInvoke() {
    this.pushStack(INVOKE_BEGIN, INLINE_FLAG);
    this.append('(');
    return this;
  }

  public Notation beginInvoke(String methodName) {
    this.pushStack(INVOKE_BEGIN, INLINE_FLAG);
    this.append('.');
    this.append(methodName);
    this.append('(');
    return this;
  }

  public Notation beginInvoke(String className, String methodName) {
    this.pushStack(INVOKE_BEGIN, INLINE_FLAG);
    this.append(className);
    this.append('.');
    this.append(methodName);
    this.append('(');
    return this;
  }

  public Notation beginInvoke(String className, String... qname) {
    this.pushStack(INVOKE_BEGIN, INLINE_FLAG);
    this.append(className);
    for (int i = 0; i < qname.length; i += 1) {
      this.append('.');
      this.append(qname[i]);
    }
    this.append('(');
    return this;
  }

  public Notation beginInvokeNew(String className) {
    this.pushStack(INVOKE_BEGIN, INLINE_FLAG);
    this.append("new");
    this.append(' ');
    this.append(className);
    this.append('(');
    return this;
  }

  public Notation beginInvokeNew(String className, String... qname) {
    this.pushStack(INVOKE_BEGIN, INLINE_FLAG);
    this.append("new");
    this.append(' ');
    this.append(className);
    for (int i = 0; i < qname.length; i += 1) {
      this.append('.');
      this.append(qname[i]);
    }
    this.append('(');
    return this;
  }

  public Notation beginArgument() {
    final NotationFrame frame = this.stack;
    if (frame.state != INVOKE_BEGIN && frame.state != INVOKE_ARGUMENT_END) {
      throw new IllegalStateException();
    }
    if (frame.state == INVOKE_ARGUMENT_END) {
      this.append(',');
      this.appendSpace();
    }
    frame.state = INVOKE_ARGUMENT_BEGIN;
    return this;
  }

  public Notation endArgument() {
    final NotationFrame frame = this.stack;
    if (frame.state != INVOKE_ARGUMENT_BEGIN) {
      throw new IllegalStateException();
    }
    frame.state = INVOKE_ARGUMENT_END;
    return this;
  }

  public Notation appendArgument(@Nullable Object argument) {
    this.beginArgument();
    this.appendSource(argument);
    this.endArgument();
    return this;
  }

  public Notation endInvoke() {
    final NotationFrame frame = this.stack;
    if (frame.state != INVOKE_BEGIN && frame.state != INVOKE_ARGUMENT_END) {
      throw new IllegalStateException();
    }
    this.append(')');
    frame.state = -1;
    this.popStack();
    return this;
  }

  /**
   * Appends the ANSI reset escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation reset() {
    if (this.options.stylize()) {
      this.append("\u001b[0m");
    }
    return this;
  }

  /**
   * Appends the ANSI black foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation black() {
    if (this.options.stylize()) {
      this.append("\u001b[0;30m");
    }
    return this;
  }

  /**
   * Appends the ANSI red foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation red() {
    if (this.options.stylize()) {
      this.append("\u001b[0;31m");
    }
    return this;
  }

  /**
   * Appends the ANSI green foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation green() {
    if (this.options.stylize()) {
      this.append("\u001b[0;32m");
    }
    return this;
  }

  /**
   * Appends the ANSI yellow foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation yellow() {
    if (this.options.stylize()) {
      this.append("\u001b[0;33m");
    }
    return this;
  }

  /**
   * Appends the ANSI blue foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation blue() {
    if (this.options.stylize()) {
      this.append("\u001b[0;34m");
    }
    return this;
  }

  /**
   * Appends the ANSI magenta foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation magenta() {
    if (this.options.stylize()) {
      this.append("\u001b[0;35m");
    }
    return this;
  }

  /**
   * Appends the ANSI cyan foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation cyan() {
    if (this.options.stylize()) {
      this.append("\u001b[0;36m");
    }
    return this;
  }

  /**
   * Appends the ANSI gray foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation gray() {
    if (this.options.stylize()) {
      this.append("\u001b[0;37m");
    }
    return this;
  }

  /**
   * Appends the ANSI bold (increased intensity) escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation bold() {
    if (this.options.stylize()) {
      this.append("\u001b[1m");
    }
    return this;
  }

  /**
   * Appends the ANSI bold black foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation boldBlack() {
    if (this.options.stylize()) {
      this.append("\u001b[1;30m");
    }
    return this;
  }

  /**
   * Appends the ANSI bold red foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation boldRed() {
    if (this.options.stylize()) {
      this.append("\u001b[1;31m");
    }
    return this;
  }

  /**
   * Appends the ANSI bold green foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation boldGreen() {
    if (this.options.stylize()) {
      this.append("\u001b[1;32m");
    }
    return this;
  }

  /**
   * Appends the ANSI bold yellow foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation boldYellow() {
    if (this.options.stylize()) {
      this.append("\u001b[1;33m");
    }
    return this;
  }

  /**
   * Appends the ANSI bold blue foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation boldBlue() {
    if (this.options.stylize()) {
      this.append("\u001b[1;34m");
    }
    return this;
  }

  /**
   * Appends the ANSI bold magenta foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation boldMagenta() {
    if (this.options.stylize()) {
      this.append("\u001b[1;35m");
    }
    return this;
  }

  /**
   * Appends the ANSI bold cyan foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation boldCyan() {
    if (this.options.stylize()) {
      this.append("\u001b[1;36m");
    }
    return this;
  }

  /**
   * Appends the ANSI bold gray foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation boldGray() {
    if (this.options.stylize()) {
      this.append("\u001b[1;37m");
    }
    return this;
  }

  /**
   * Appends the ANSI faint (decreased intensity) escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation faint() {
    if (this.options.stylize()) {
      this.append("\u001b[2m");
    }
    return this;
  }

  /**
   * Appends the ANSI faint black foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation faintBlack() {
    if (this.options.stylize()) {
      this.append("\u001b[2;30m");
    }
    return this;
  }

  /**
   * Appends the ANSI faint red foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation faintRed() {
    if (this.options.stylize()) {
      this.append("\u001b[2;31m");
    }
    return this;
  }

  /**
   * Appends the ANSI faint green foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation faintGreen() {
    if (this.options.stylize()) {
      this.append("\u001b[2;32m");
    }
    return this;
  }

  /**
   * Appends the ANSI faint yellow foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation faintYellow() {
    if (this.options.stylize()) {
      this.append("\u001b[2;33m");
    }
    return this;
  }

  /**
   * Appends the ANSI faint blue foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation faintBlue() {
    if (this.options.stylize()) {
      this.append("\u001b[2;34m");
    }
    return this;
  }

  /**
   * Appends the ANSI faint magenta foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation faintMagenta() {
    if (this.options.stylize()) {
      this.append("\u001b[2;35m");
    }
    return this;
  }

  /**
   * Appends the ANSI faint cyan foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation faintCyan() {
    if (this.options.stylize()) {
      this.append("\u001b[2;36m");
    }
    return this;
  }

  /**
   * Appends the ANSI faint gray foreground color escape sequence if
   * {@link NotationOptions#stylize() options().stylize()} is {@code true}.
   */
  public Notation faintGray() {
    if (this.options.stylize()) {
      this.append("\u001b[2;37m");
    }
    return this;
  }

  @Override
  public String toString() {
    return this.output.toString();
  }

  static final int ARRAY_STATE_SHIFT = 0;
  static final int ARRAY_STATE_BITS = 2;
  static final int ARRAY_STATE_MASK = ((1 << ARRAY_STATE_BITS) - 1) << ARRAY_STATE_SHIFT;
  static final int ARRAY_BEGIN = 1 << ARRAY_STATE_SHIFT;
  static final int ARRAY_ELEMENT_BEGIN = 2 << ARRAY_STATE_SHIFT;
  static final int ARRAY_ELEMENT_END = 3 << ARRAY_STATE_SHIFT;

  static final int OBJECT_STATE_SHIFT = ARRAY_STATE_SHIFT + ARRAY_STATE_BITS;
  static final int OBJECT_STATE_BITS = 3;
  static final int OBJECT_STATE_MASK = ((1 << OBJECT_STATE_BITS) - 1) << OBJECT_STATE_SHIFT;
  static final int OBJECT_BEGIN = 1 << OBJECT_STATE_SHIFT;
  static final int OBJECT_KEY_BEGIN = 2 << OBJECT_STATE_SHIFT;
  static final int OBJECT_KEY_END = 3 << OBJECT_STATE_SHIFT;
  static final int OBJECT_VALUE_BEGIN = 4 << OBJECT_STATE_SHIFT;
  static final int OBJECT_VALUE_END = 5 << OBJECT_STATE_SHIFT;

  static final int INVOKE_STATE_SHIFT = OBJECT_STATE_SHIFT + OBJECT_STATE_BITS;
  static final int INVOKE_STATE_BITS = 2;
  static final int INVOKE_STATE_MASK = ((1 << INVOKE_STATE_BITS) - 1) << INVOKE_STATE_SHIFT;
  static final int INVOKE_BEGIN = 1 << INVOKE_STATE_SHIFT;
  static final int INVOKE_ARGUMENT_BEGIN = 2 << INVOKE_STATE_SHIFT;
  static final int INVOKE_ARGUMENT_END = 3 << INVOKE_STATE_SHIFT;

  static final int INLINE_FLAG = 1 << 0;

  public static Notation of() {
    return new Notation();
  }

  public static Notation of(@Nullable Object object) {
    return new Notation().append(object);
  }

  public static Notation from(Appendable output) {
    if (output instanceof Notation) {
      return (Notation) output;
    }
    return new Notation(output);
  }

}

final class NotationFrame {

  int state;
  int flags;
  int depth;
  final @Nullable NotationFrame next;

  NotationFrame(int state, int flags, int depth, @Nullable NotationFrame next) {
    this.state = state;
    this.flags = flags;
    this.depth = depth;
    this.next = next;
  }

}
