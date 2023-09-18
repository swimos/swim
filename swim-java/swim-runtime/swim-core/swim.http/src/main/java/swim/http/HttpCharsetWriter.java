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

final class HttpCharsetWriter extends Writer<Object, Object> {

  final HttpWriter http;
  final String name;
  final float weight;
  final Writer<?, ?> part;
  final int step;

  HttpCharsetWriter(HttpWriter http, String name, float weight, Writer<?, ?> part, int step) {
    this.http = http;
    this.name = name;
    this.weight = weight;
    this.part = part;
    this.step = step;
  }

  HttpCharsetWriter(HttpWriter http, String name, float weight) {
    this(http, name, weight, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return HttpCharsetWriter.write(output, this.http, this.name, this.weight, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String name,
                                      float weight, Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = http.writeToken(output, name);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        if (weight == 1f) {
          return Writer.done();
        } else {
          step = 2;
        }
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 2) {
      if (part == null) {
        part = http.writeQValue(output, weight);
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
    return new HttpCharsetWriter(http, name, weight, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String name, float weight) {
    return HttpCharsetWriter.write(output, http, name, weight, null, 1);
  }

}
