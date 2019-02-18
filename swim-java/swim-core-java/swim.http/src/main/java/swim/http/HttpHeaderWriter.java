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

final class HttpHeaderWriter extends Writer<Object, Object> {
  final HttpWriter http;
  final HttpHeader header;
  final Writer<?, ?> part;
  final int step;

  HttpHeaderWriter(HttpWriter http, HttpHeader header, Writer<?, ?> part, int step) {
    this.http = http;
    this.header = header;
    this.part = part;
    this.step = step;
  }

  HttpHeaderWriter(HttpWriter http, HttpHeader header) {
    this(http, header, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.http, this.header, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http,
                                      HttpHeader header, Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = http.writeToken(header.name(), output);
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
      output = output.write(':');
      if (header.isBlank()) {
        return done();
      } else {
        step = 3;
      }
    }
    if (step == 3 && output.isCont()) {
      output = output.write(' ');
      step = 4;
    }
    if (step == 4) {
      if (part == null) {
        part = http.writeHeaderValue(header, output);
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
    return new HttpHeaderWriter(http, header, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, HttpHeader header) {
    return write(output, http, header, null, 1);
  }
}
