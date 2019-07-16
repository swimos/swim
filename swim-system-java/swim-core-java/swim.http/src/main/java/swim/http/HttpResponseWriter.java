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

final class HttpResponseWriter<T> extends Writer<Object, HttpResponse<T>> {
  final HttpWriter http;
  final HttpResponse<T> response;
  final Iterator<HttpHeader> headers;
  final Writer<?, ?> part;
  final int step;

  HttpResponseWriter(HttpWriter http, HttpResponse<T> response,
                     Iterator<HttpHeader> headers, Writer<?, ?> part, int step) {
    this.http = http;
    this.response = response;
    this.headers = headers;
    this.part = part;
    this.step = step;
  }

  HttpResponseWriter(HttpWriter http, HttpResponse<T> response) {
    this(http, response, null, null, 1);
  }

  @Override
  public Writer<Object, HttpResponse<T>> pull(Output<?> output) {
    return write(output, this.http, this.response, this.headers, this.part, this.step);
  }

  static <T> Writer<Object, HttpResponse<T>> write(Output<?> output, HttpWriter http, HttpResponse<T> response,
                                                   Iterator<HttpHeader> headers, Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = response.version.writeHttp(output, http);
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
      output = output.write(' ');
      step = 3;
    }
    if (step == 3) {
      if (part == null) {
        part = response.status.writeHttp(output, http);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        step = 4;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 4 && output.isCont()) {
      output = output.write('\r');
      step = 5;
    }
    if (step == 5 && output.isCont()) {
      output = output.write('\n');
      step = 6;
    }
    do {
      if (step == 6) {
        if (part == null) {
          if (headers == null) {
            headers = response.headers.iterator();
          }
          if (!headers.hasNext()) {
            step = 9;
            break;
          } else {
            part = headers.next().writeHttp(output, http);
          }
        } else {
          part = part.pull(output);
        }
        if (part.isDone()) {
          part = null;
          step = 7;
        } else if (part.isError()) {
          return part.asError();
        }
      }
      if (step == 7 && output.isCont()) {
        output = output.write('\r');
        step = 8;
      }
      if (step == 8 && output.isCont()) {
        output = output.write('\n');
        step = 6;
        continue;
      }
      break;
    } while (true);
    if (step == 9 && output.isCont()) {
      output = output.write('\r');
      step = 10;
    }
    if (step == 10 && output.isCont()) {
      output = output.write('\n');
      return done(response);
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new HttpResponseWriter<T>(http, response, headers, part, step);
  }

  static <T> Writer<Object, HttpResponse<T>> write(Output<?> output, HttpWriter http,
                                                   HttpResponse<T> response) {
    return write(output, http, response, null, null, 1);
  }
}
