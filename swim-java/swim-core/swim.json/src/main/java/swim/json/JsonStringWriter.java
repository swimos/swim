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

package swim.json;

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
public interface JsonStringWriter<@Contravariant T> extends JsonWriter<T> {

  @Nullable String intoString(@Nullable T value) throws JsonException;

  @Override
  default Write<?> write(Output<?> output, @Nullable T value, JsonWriterOptions options) {
    final String string;
    try {
      string = this.intoString(value);
    } catch (JsonException cause) {
      return Write.error(cause);
    }
    if (string == null) {
      return this.writeNull(output);
    }
    return this.writeString(output, string);
  }

  default Write<?> writeString(Output<?> output, String string) {
    return WriteJsonString.write(output, string, 0, 0, 1);
  }

}

final class WriteJsonString extends Write<Object> {

  final String string;
  final int index;
  final int escape;
  final int step;

  WriteJsonString(String string, int index, int escape, int step) {
    this.string = string;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteJsonString.write(output, this.string, this.index, this.escape, this.step);
  }

  static Write<Object> write(Output<?> output, String string, int index, int escape, int step) {
    if (step == 1 && output.isCont()) {
      output.write('"');
      step = 2;
    }
    do {
      if (step == 2 && output.isCont()) {
        if (index >= string.length()) {
          step = 9;
          break;
        }
        final int c = string.codePointAt(index);
        index = string.offsetByCodePoints(index, 1);
        if (c == '"' || c == '\\') {
          output.write('\\');
          escape = c;
          step = 3;
        } else if (c == '\b') {
          output.write('\\');
          escape = 'b';
          step = 3;
        } else if (c == '\f') {
          output.write('\\');
          escape = 'f';
          step = 3;
        } else if (c == '\n') {
          output.write('\\');
          escape = 'n';
          step = 3;
        } else if (c == '\r') {
          output.write('\\');
          escape = 'r';
          step = 3;
        } else if (c == '\t') {
          output.write('\\');
          escape = 't';
          step = 3;
        } else if (c < 0x20) {
          output.write('\\');
          escape = c;
          step = 4;
        } else {
          output.write(c);
          continue;
        }
      }
      if (step == 3 && output.isCont()) {
        output.write(escape);
        escape = 0;
        step = 2;
        continue;
      }
      if (step == 4 && output.isCont()) {
        output.write('u');
        step = 5;
      }
      if (step == 5 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 12) & 0xF));
        step = 6;
      }
      if (step == 6 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 8) & 0xF));
        step = 7;
      }
      if (step == 7 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 4) & 0xF));
        step = 8;
      }
      if (step == 8 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit(escape & 0xF));
        escape = 0;
        step = 2;
        continue;
      }
      break;
    } while (true);
    if (step == 9 && output.isCont()) {
      output.write('"');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteJsonString(string, index, escape, step);
  }

}
