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

final class StringWriter extends Writer<Object, Object> {
  final Object value;
  final String input;
  final int index;

  StringWriter(Object value, String input, int index) {
    this.value = value;
    this.input = input;
    this.index = index;
  }

  StringWriter(Object value, Object input) {
    this(value, input != null ? input.toString() : "null", 0);
  }

  StringWriter() {
    this(null, "", 0);
  }

  @Override
  public Writer<Object, Object> feed(Object input) {
    if (input instanceof Integer) {
      return new Base10IntegerWriter(input, ((Integer) input).longValue());
    } else if (input instanceof Long) {
      return new Base10IntegerWriter(input, ((Long) input).longValue());
    } else {
      return new StringWriter(input, input);
    }
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, value, input, index);
  }

  static Writer<Object, Object> write(Output<?> output, Object value, String input, int index) {
    final int length = input != null ? input.length() : 0;
    while (index < length && output.isCont()) {
      output = output.write(input.codePointAt(index));
      index = input.offsetByCodePoints(index, 1);
    }
    if (index == length) {
      return done(value);
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new StringWriter(value, input, index);
  }

  static Writer<Object, Object> write(Output<?> output, Object value, Object input) {
    if (input instanceof Integer) {
      return Base10IntegerWriter.write(output, value, ((Integer) input).longValue());
    } else if (input instanceof Long) {
      return Base10IntegerWriter.write(output, value, ((Long) input).longValue());
    } else {
      return write(output, value, input != null ? input.toString() : "null", 0);
    }
  }
}
