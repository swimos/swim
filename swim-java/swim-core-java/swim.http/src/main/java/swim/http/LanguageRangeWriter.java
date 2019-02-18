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

final class LanguageRangeWriter extends Writer<Object, Object> {
  final HttpWriter http;
  final String tag;
  final String subtag;
  final float weight;
  final Writer<?, ?> part;
  final int step;

  LanguageRangeWriter(HttpWriter http, String tag, String subtag, float weight,
                      Writer<?, ?> part, int step) {
    this.http = http;
    this.tag = tag;
    this.subtag = subtag;
    this.weight = weight;
    this.part = part;
    this.step = step;
  }

  LanguageRangeWriter(HttpWriter http, String tag, String subtag, float weight) {
    this(http, tag, subtag, weight, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.http, this.tag, this.subtag, this.weight, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String tag,
                                      String subtag, float weight, Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = http.writeField(tag, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        if (subtag != null) {
          step = 2;
        } else if (weight != 1f) {
          step = 4;
        } else {
          return done();
        }
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 2 && output.isCont()) {
      output = output.write('-');
      step = 3;
    }
    if (step == 3) {
      if (part == null) {
        part = http.writeField(subtag, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        if (weight != 1f) {
          step = 4;
        } else {
          return done();
        }
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 4) {
      if (part == null) {
        part = http.writeQValue(weight, output);
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
    return new LanguageRangeWriter(http, tag, subtag, weight, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String tag,
                                      String subtag, float weight) {
    return write(output, http, tag, subtag, weight, null, 1);
  }
}
