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

package swim.http;

import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class FieldWriter extends Writer<Object, Object> {
  final String field;
  final int index;

  FieldWriter(String field, int index) {
    this.field = field;
    this.index = index;
  }

  FieldWriter(String field) {
    this(field, 0);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.field, this.index);
  }

  static Writer<Object, Object> write(Output<?> output, String field, int index) {
    final int length = field.length();
    while (index < length && output.isCont()) {
      final int c = field.codePointAt(index);
      if (Http.isFieldChar(c)) {
        output = output.write(c);
        index = field.offsetByCodePoints(index, 1);
      } else {
        return error(new HttpException("invalid field: " + field));
      }
    }
    if (index >= length) {
      return done();
    } else if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new FieldWriter(field, index);
  }

  static Writer<Object, Object> write(Output<?> output, String field) {
    return write(output, field, 0);
  }
}
