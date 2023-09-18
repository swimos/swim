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

package swim.http;

import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class CookieWriter extends Writer<Object, Object> {

  final HttpWriter http;
  final String name;
  final String value;
  final Writer<?, ?> part;
  final int step;

  CookieWriter(HttpWriter http, String name, String value, Writer<?, ?> part, int step) {
    this.http = http;
    this.name = name;
    this.value = value;
    this.part = part;
    this.step = step;
  }

  CookieWriter(HttpWriter http, String name, String value) {
    this(http, name, value, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return CookieWriter.write(output, this.http, this.name, this.value, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String name,
                                      String value, Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = http.writeToken(output, name);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        step = 2;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 2 && output.isCont()) {
      output = output.write('=');
      if (value.isEmpty()) {
        return Writer.done();
      } else {
        step = 3;
      }
    }
    if (step == 3) {
      if (part == null) {
        part = http.writePhrase(output, value);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        return Writer.done();
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new CookieWriter(http, name, value, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String name, String value) {
    return CookieWriter.write(output, http, name, value, null, 1);
  }

}
