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

import java.util.Iterator;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class HttpChunkTrailerWriter extends Writer<Object, Object> {
  final HttpWriter http;
  final Iterator<HttpHeader> headers;
  final Writer<?, ?> part;
  final int step;

  HttpChunkTrailerWriter(HttpWriter http, Iterator<HttpHeader> headers,
                         Writer<?, ?> part, int step) {
    this.http = http;
    this.headers = headers;
    this.part = part;
    this.step = step;
  }

  HttpChunkTrailerWriter(HttpWriter http, Iterator<HttpHeader> headers) {
    this(http, headers, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.http, this.headers, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http,
                                      Iterator<HttpHeader> headers,
                                      Writer<?, ?> part, int step) {
    do {
      if (step == 1) {
        if (part == null) {
          if (!headers.hasNext()) {
            step = 4;
            break;
          } else {
            part = headers.next().writeHttp(output, http);
          }
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
        output = output.write('\r');
        step = 3;
      }
      if (step == 3 && output.isCont()) {
        output = output.write('\n');
        step = 1;
        continue;
      }
      break;
    } while (true);
    if (step == 4 && output.isCont()) {
      output = output.write('\r');
      step = 5;
    }
    if (step == 5 && output.isCont()) {
      output = output.write('\n');
      return done();
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new HttpChunkTrailerWriter(http, headers, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http,
                                      Iterator<HttpHeader> headers) {
    return write(output, http, headers, null, 1);
  }
}
