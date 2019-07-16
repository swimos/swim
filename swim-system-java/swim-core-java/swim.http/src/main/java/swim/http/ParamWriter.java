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

final class ParamWriter extends Writer<Object, Object> {
  final HttpWriter http;
  final String key;
  final String value;
  final Writer<?, ?> part;
  final int step;

  ParamWriter(HttpWriter http, String key, String value, Writer<?, ?> part, int step) {
    this.http = http;
    this.key = key;
    this.value = value;
    this.part = part;
    this.step = step;
  }

  ParamWriter(HttpWriter http, String key, String value) {
    this(http, key, value, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.http, this.key, this.value, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String key,
                                      String value, Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = http.writeToken(key, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        if (value.isEmpty()) {
          return done();
        } else {
          step = 2;
        }
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 2 && output.isCont()) {
      output = output.write('=');
      step = 3;
    }
    if (step == 3) {
      if (part == null) {
        part = http.writeValue(value, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        return done();
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new ParamWriter(http, key, value, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String key, String value) {
    return write(output, http, key, value, null, 1);
  }
}
