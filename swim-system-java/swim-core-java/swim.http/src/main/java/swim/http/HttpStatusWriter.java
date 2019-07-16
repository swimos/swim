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

import swim.codec.Base10;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class HttpStatusWriter extends Writer<Object, Object> {
  final HttpWriter http;
  final int code;
  final String phrase;
  final Writer<?, ?> part;
  final int step;

  HttpStatusWriter(HttpWriter http, int code, String phrase, Writer<?, ?> part, int step) {
    this.http = http;
    this.code = code;
    this.phrase = phrase;
    this.part = part;
    this.step = step;
  }

  HttpStatusWriter(HttpWriter http, int code, String phrase) {
    this(http, code, phrase, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.http, this.code, this.phrase, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, int code, String phrase,
                                      Writer<?, ?> part, int step) {
    if (step == 1 && output.isCont()) {
      if (code / 1000 != 0) {
        return error(new HttpException("invalid HTTP status code: " + code));
      }
      output = output.write(Base10.encodeDigit(code / 100 % 10));
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      output = output.write(Base10.encodeDigit(code / 10 % 10));
      step = 3;
    }
    if (step == 3 && output.isCont()) {
      output = output.write(Base10.encodeDigit(code % 10));
      step = 4;
    }
    if (step == 4 && output.isCont()) {
      output = output.write(' ');
      step = 5;
    }
    if (step == 5) {
      if (part == null) {
        part = http.writePhrase(phrase, output);
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
    return new HttpStatusWriter(http, code, phrase, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, int code, String phrase) {
    return write(output, http, code, phrase, null, 1);
  }
}
