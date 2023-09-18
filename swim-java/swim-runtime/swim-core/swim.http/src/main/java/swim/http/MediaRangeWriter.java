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
import swim.collections.HashTrieMap;

final class MediaRangeWriter extends Writer<Object, Object> {

  final HttpWriter http;
  final String type;
  final String subtype;
  final float weight;
  final HashTrieMap<String, String> params;
  final Writer<?, ?> part;
  final int step;

  MediaRangeWriter(HttpWriter http, String type, String subtype, float weight,
                   HashTrieMap<String, String> params, Writer<?, ?> part, int step) {
    this.http = http;
    this.type = type;
    this.subtype = subtype;
    this.weight = weight;
    this.params = params;
    this.part = part;
    this.step = step;
  }

  MediaRangeWriter(HttpWriter http, String type, String subtype, float weight,
                   HashTrieMap<String, String> params) {
    this(http, type, subtype, weight, params, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return MediaRangeWriter.write(output, this.http, this.type, this.subtype,
                                  this.weight, this.params, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String type, String subtype,
                                      float weight, HashTrieMap<String, String> params,
                                      Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = http.writeToken(output, type);
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
      output = output.write('/');
      step = 3;
    }
    if (step == 3) {
      if (part == null) {
        part = http.writeToken(output, subtype);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        if (weight != 1f) {
          step = 4;
        } else if (!params.isEmpty()) {
          step = 5;
        } else {
          return Writer.done();
        }
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 4) {
      if (part == null) {
        part = http.writeQValue(output, weight);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        if (!params.isEmpty()) {
          step = 5;
        } else {
          return Writer.done();
        }
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 5) {
      if (part == null) {
        part = http.writeParamMap(output, params.iterator());
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
    return new MediaRangeWriter(http, type, subtype, weight, params, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String type, String subtype,
                                      float weight, HashTrieMap<String, String> params) {
    return MediaRangeWriter.write(output, http, type, subtype, weight, params, null, 1);
  }

}
