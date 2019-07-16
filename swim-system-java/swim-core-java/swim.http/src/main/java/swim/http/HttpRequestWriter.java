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
import swim.codec.Unicode;
import swim.codec.Writer;
import swim.codec.WriterException;

final class HttpRequestWriter<T> extends Writer<Object, HttpRequest<T>> {
  final HttpWriter http;
  final HttpRequest<T> request;
  final Iterator<HttpHeader> headers;
  final Writer<?, ?> part;
  final int step;

  HttpRequestWriter(HttpWriter http, HttpRequest<T> request,
                    Iterator<HttpHeader> headers, Writer<?, ?> part, int step) {
    this.http = http;
    this.request = request;
    this.headers = headers;
    this.part = part;
    this.step = step;
  }

  HttpRequestWriter(HttpWriter http, HttpRequest<T> request) {
    this(http, request, null, null, 1);
  }

  @Override
  public Writer<Object, HttpRequest<T>> pull(Output<?> output) {
    return write(output, this.http, this.request, this.headers, this.part, this.step);
  }

  static <T> Writer<Object, HttpRequest<T>> write(Output<?> output, HttpWriter http, HttpRequest<T> request,
                                                  Iterator<HttpHeader> headers, Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = request.method.writeHttp(output, http);
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
        part = Unicode.writeString(request.uri.toString(), output);
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
      output = output.write(' ');
      step = 5;
    }
    if (step == 5) {
      if (part == null) {
        part = request.version.writeHttp(output, http);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        step = 6;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 6 && output.isCont()) {
      output = output.write('\r');
      step = 7;
    }
    if (step == 7 && output.isCont()) {
      output = output.write('\n');
      step = 8;
    }
    do {
      if (step == 8) {
        if (part == null) {
          if (headers == null) {
            headers = request.headers.iterator();
          }
          if (!headers.hasNext()) {
            step = 11;
            break;
          } else {
            part = headers.next().writeHttp(output, http);
          }
        } else {
          part = part.pull(output);
        }
        if (part.isDone()) {
          part = null;
          step = 9;
        } else if (part.isError()) {
          return part.asError();
        }
      }
      if (step == 9 && output.isCont()) {
        output = output.write('\r');
        step = 10;
      }
      if (step == 10 && output.isCont()) {
        output = output.write('\n');
        step = 8;
        continue;
      }
      break;
    } while (true);
    if (step == 11 && output.isCont()) {
      output = output.write('\r');
      step = 12;
    }
    if (step == 12 && output.isCont()) {
      output = output.write('\n');
      return done(request);
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new HttpRequestWriter<T>(http, request, headers, part, step);
  }

  static <T> Writer<Object, HttpRequest<T>> write(Output<?> output, HttpWriter http, HttpRequest<T> request) {
    return write(output, http, request, null, null, 1);
  }
}
