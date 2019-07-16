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
import swim.collections.HashTrieMap;

final class TransferCodingWriter extends Writer<Object, Object> {
  final HttpWriter http;
  final String name;
  final HashTrieMap<String, String> params;
  final Writer<?, ?> part;
  final int step;

  TransferCodingWriter(HttpWriter http, String name, HashTrieMap<String, String> params,
                       Writer<?, ?> part, int step) {
    this.http = http;
    this.name = name;
    this.params = params;
    this.part = part;
    this.step = step;
  }

  TransferCodingWriter(HttpWriter http, String name, HashTrieMap<String, String> params) {
    this(http, name, params, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.http, this.name, this.params, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String name,
                                      HashTrieMap<String, String> params,
                                      Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = http.writeToken(name, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        if (params.isEmpty()) {
          return done();
        } else {
          step = 2;
        }
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 2) {
      if (part == null) {
        part = http.writeParamMap(params.iterator(), output);
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
    return new TransferCodingWriter(http, name, params, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String name,
                                      HashTrieMap<String, String> params) {
    return write(output, http, name, params, null, 1);
  }
}
