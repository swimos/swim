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

import swim.annotations.Contravariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base16;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;

@Public
@Since("5.0")
public interface WamlStringWriter<@Contravariant T> extends WamlWriter<T> {

  @Nullable String intoString(@Nullable T value) throws WamlException;

  @Override
  default Write<?> write(Output<?> output, @Nullable Object attrs,
                         @Nullable T value, WamlWriterOptions options) {
    final String string;
    try {
      string = this.intoString(value);
    } catch (WamlException cause) {
      return Write.error(cause);
    }
    if (string == null) {
      return this.writeUnit(output, attrs, options);
    }
    return this.writeString(output, attrs, string, options);
  }

  default Write<?> writeString(Output<?> output, @Nullable Object attrs,
                               String string, WamlWriterOptions options) {
    return WriteWamlString.write(output, this, options, attrs, string, null, 0, 0, 1);
  }

}

final class WriteWamlString extends Write<Object> {

  final WamlWriter<?> writer;
  final WamlWriterOptions options;
  final @Nullable Object attrs;
  final String string;
  final @Nullable Write<?> write;
  final int index;
  final int escape;
  final int step;

  WriteWamlString(WamlWriter<?> writer, WamlWriterOptions options, @Nullable Object attrs,
                  String string, @Nullable Write<?> write, int index, int escape, int step) {
    this.writer = writer;
    this.options = options;
    this.attrs = attrs;
    this.string = string;
    this.write = write;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlString.write(output, this.writer, this.options, this.attrs, this.string,
                                 this.write, this.index, this.escape, this.step);
  }

  static Write<Object> write(Output<?> output, WamlWriter<?> writer, WamlWriterOptions options,
                             @Nullable Object attrs, String string, @Nullable Write<?> write,
                             int index, int escape, int step) {
    if (step == 1) {
      if (write == null) {
        write = writer.attrsWriter().writeAttrs(output, attrs, options, options.whitespace());
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 2;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 2 && output.isCont()) {
      output.write('"');
      step = 3;
    }
    do {
      if (step == 3 && output.isCont()) {
        if (index >= string.length()) {
          step = 10;
          break;
        }
        final int c = string.codePointAt(index);
        index = string.offsetByCodePoints(index, 1);
        if (c == '"' || c == '\\') {
          output.write('\\');
          escape = c;
          step = 4;
        } else if (c == '\b') {
          output.write('\\');
          escape = 'b';
          step = 4;
        } else if (c == '\f') {
          output.write('\\');
          escape = 'f';
          step = 4;
        } else if (c == '\n') {
          output.write('\\');
          escape = 'n';
          step = 4;
        } else if (c == '\r') {
          output.write('\\');
          escape = 'r';
          step = 4;
        } else if (c == '\t') {
          output.write('\\');
          escape = 't';
          step = 4;
        } else if (c < 0x20) {
          output.write('\\');
          escape = c;
          step = 5;
        } else {
          output.write(c);
          continue;
        }
      }
      if (step == 4 && output.isCont()) {
        output.write(escape);
        escape = 0;
        step = 3;
        continue;
      }
      if (step == 5 && output.isCont()) {
        output.write('u');
        step = 6;
      }
      if (step == 6 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 12) & 0xF));
        step = 7;
      }
      if (step == 7 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 8) & 0xF));
        step = 8;
      }
      if (step == 8 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 4) & 0xF));
        step = 9;
      }
      if (step == 9 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit(escape & 0xF));
        escape = 0;
        step = 3;
        continue;
      }
      break;
    } while (true);
    if (step == 10 && output.isCont()) {
      output.write('"');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlString(writer, options, attrs, string, write, index, escape, step);
  }

}
