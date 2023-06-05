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

package swim.waml;

import java.util.Iterator;
import swim.annotations.Contravariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base16;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.term.Term;
import swim.util.Assume;

@Public
@Since("5.0")
public interface WamlAttrsWriter<V, @Contravariant T> {

  <W extends V> WamlWriter<W> getAttrValueWriter(@Nullable T attrs, String name, @Nullable W value) throws WamlException;

  @Nullable Iterator<String> getAttrNames(@Nullable T attrs) throws WamlException;

  @Nullable V getAttrValue(@Nullable T attrs, String name) throws WamlException;

  boolean isEmptyAttrs(@Nullable T attrs);

  boolean isNullaryAttr(@Nullable T attrs, String name, @Nullable V value);

  default boolean filterAttr(@Nullable T attrs, String name, @Nullable V value) {
    return true;
  }

  default Write<?> writeAttrs(Output<?> output, @Nullable T attrs,
                              WamlWriterOptions options, boolean padded) {
    final Iterator<String> names;
    try {
      names = this.getAttrNames(attrs);
    } catch (WamlException cause) {
      return Write.error(cause);
    }
    if (names == null) {
      return Write.done();
    }
    return this.writeAttrs(output, attrs, names, options, padded);
  }

  default Write<?> writeAttrs(Output<?> output, @Nullable T attrs, Iterator<String> names,
                              WamlWriterOptions options, boolean padded) {
    return WriteWamlAttrs.write(output, this, options, padded, attrs, names, null, null, null, 1);
  }

  default Write<?> writeAttr(Output<?> output, @Nullable T attrs, String name,
                             @Nullable V value, WamlWriterOptions options) {
    return WriteWamlAttr.write(output, this, options, attrs, name, value, null, 0, 0, 1);
  }

}

final class WriteWamlAttrs<V, T> extends Write<Object> {

  final WamlAttrsWriter<V, T> writer;
  final WamlWriterOptions options;
  final boolean padded;
  final @Nullable T attrs;
  final Iterator<String> names;
  final @Nullable String name;
  final @Nullable V value;
  final @Nullable Write<?> write;
  final int step;

  WriteWamlAttrs(WamlAttrsWriter<V, T> writer, WamlWriterOptions options, boolean padded,
                 @Nullable T attrs, Iterator<String> names, @Nullable String name,
                 @Nullable V value, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.padded = padded;
    this.attrs = attrs;
    this.names = names;
    this.name = name;
    this.value = value;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlAttrs.write(output, this.writer, this.options, this.padded, this.attrs,
                                this.names, this.name, this.value, this.write, this.step);
  }

  static <V, T> Write<Object> write(Output<?> output, WamlAttrsWriter<V, T> writer,
                                    WamlWriterOptions options, boolean padded, @Nullable T attrs,
                                    Iterator<String> names, @Nullable String name,
                                    @Nullable V value, @Nullable Write<?> write, int step) {
    if (step == 1) {
      do {
        if (!names.hasNext()) {
          return Write.done();
        }
        name = names.next();
        try {
          value = writer.getAttrValue(attrs, name);
        } catch (WamlException cause) {
          return Write.error(cause);
        }
        if (writer.filterAttr(attrs, name, value)) {
          step = 2;
          break;
        } else {
          name = null;
          value = null;
          continue;
        }
      } while (true);
    }
    attrs: do {
      if (step == 2) {
        if (write == null) {
          write = writer.writeAttr(output, attrs, Assume.nonNull(name), value, options);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          name = null;
          value = null;
          write = null;
          do {
            if (!names.hasNext()) {
              step = 4;
              break attrs;
            }
            name = names.next();
            try {
              value = writer.getAttrValue(attrs, name);
            } catch (WamlException cause) {
              return Write.error(cause);
            }
            if (writer.filterAttr(attrs, name, value)) {
              if (options.whitespace()) {
                step = 3;
                break;
              } else {
                step = 2;
                continue attrs;
              }
            } else {
              name = null;
              value = null;
              continue;
            }
          } while (true);
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 3 && output.isCont()) {
        output.write(' ');
        step = 2;
        continue;
      }
      break;
    } while (true);
    if (step == 4) {
      if (!padded) {
        return Write.done();
      } else if (output.isCont()) {
        output.write(' ');
        return Write.done();
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlAttrs<V, T>(writer, options, padded, attrs,
                                    names, name, value, write, step);
  }

}

final class WriteWamlAttr<V, T> extends Write<Object> {

  final WamlAttrsWriter<V, T> writer;
  final WamlWriterOptions options;
  final @Nullable T attrs;
  final String name;
  final @Nullable V value;
  final @Nullable Write<?> write;
  final int index;
  final int escape;
  final int step;

  WriteWamlAttr(WamlAttrsWriter<V, T> writer, WamlWriterOptions options,
                @Nullable T attrs, String name, @Nullable V value,
                @Nullable Write<?> write, int index, int escape, int step) {
    this.writer = writer;
    this.options = options;
    this.attrs = attrs;
    this.name = name;
    this.value = value;
    this.write = write;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlAttr.write(output, this.writer, this.options, this.attrs, this.name,
                               this.value, this.write, this.index, this.escape, this.step);
  }

  static <V, T> Write<Object> write(Output<?> output, WamlAttrsWriter<V, T> writer,
                                    WamlWriterOptions options, @Nullable T attrs,
                                    String name, @Nullable V value, @Nullable Write<?> write,
                                    int index, int escape, int step) {
    int c;
    if (step == 1 && output.isCont()) {
      output.write('@');
      if (Term.isIdentifier(name)) {
        step = 2;
      } else {
        step = 3;
      }
    }
    if (step == 2) {
      if (name.length() == 0) {
        return Write.error(new WriteException("blank identifier"));
      }
      if (index == 0 && output.isCont()) {
        c = name.codePointAt(0);
        if (Term.isIdentifierStartChar(c)) {
          output.write(c);
          index = name.offsetByCodePoints(0, 1);
        }
      }
      while (index < name.length() && output.isCont()) {
        c = name.codePointAt(index);
        if (Term.isIdentifierChar(c)) {
          output.write(c);
          index = name.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid identifier"));
        }
      }
      if (index >= name.length()) {
        if (writer.isNullaryAttr(attrs, name, value)) {
          return Write.done();
        } else {
          step = 13;
        }
      }
    }
    if (step == 3 && output.isCont()) {
      output.write('"');
      step = 5;
    }
    do {
      if (step == 5 && output.isCont()) {
        if (index < name.length()) {
          c = name.codePointAt(index);
          index = name.offsetByCodePoints(index, 1);
          if (c == '"' || c == '\\') {
            output.write('\\');
            escape = c;
            step = 6;
          } else if (c == '\b') {
            output.write('\\');
            escape = 'b';
            step = 6;
          } else if (c == '\f') {
            output.write('\\');
            escape = 'f';
            step = 6;
          } else if (c == '\n') {
            output.write('\\');
            escape = 'n';
            step = 6;
          } else if (c == '\r') {
            output.write('\\');
            escape = 'r';
            step = 6;
          } else if (c == '\t') {
            output.write('\\');
            escape = 't';
            step = 6;
          } else if (c < 0x20) {
            output.write('\\');
            escape = c;
            step = 7;
          } else {
            output.write(c);
            continue;
          }
        } else {
          step = 12;
          break;
        }
      }
      if (step == 6 && output.isCont()) {
        output.write(escape);
        escape = 0;
        step = 5;
      }
      if (step == 7 && output.isCont()) {
        output.write('u');
        step = 8;
      }
      if (step == 8 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 12) & 0xF));
        step = 9;
      }
      if (step == 9 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 8) & 0xF));
        step = 10;
      }
      if (step == 10 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 4) & 0xF));
        step = 11;
      }
      if (step == 11 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit(escape & 0xF));
        escape = 0;
        step = 5;
        continue;
      }
      break;
    } while (true);
    if (step == 12 && output.isCont()) {
      output.write('"');
      if (writer.isNullaryAttr(attrs, name, value)) {
        return Write.done();
      } else {
        step = 13;
      }
    }
    if (step == 13 && output.isCont()) {
      output.write('(');
      step = 14;
    }
    if (step == 14) {
      if (write == null) {
        final WamlWriter<V> valueWriter;
        try {
          valueWriter = writer.getAttrValueWriter(attrs, name, value);
        } catch (WamlException cause) {
          return Write.error(cause);
        }
        write = valueWriter.writeBlock(output, value, options);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        step = 15;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 15 && output.isCont()) {
      output.write(')');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlAttr<V, T>(writer, options, attrs, name, value, write, index, escape, step);
  }

}
