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
import java.util.Map;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class ParamMapWriter extends Writer<Object, Object> {
  final HttpWriter http;
  final Iterator<? extends Map.Entry<?, ?>> params;
  final Writer<?, ?> part;
  final int step;

  ParamMapWriter(HttpWriter http, Iterator<? extends Map.Entry<?, ?>> params,
                 Writer<?, ?> part, int step) {
    this.http = http;
    this.params = params;
    this.part = part;
    this.step = step;
  }

  ParamMapWriter(HttpWriter http, Iterator<? extends Map.Entry<?, ?>> params) {
    this(http, params, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.http, this.params, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http,
                                      Iterator<? extends Map.Entry<?, ?>> params,
                                      Writer<?, ?> part, int step) {
    do {
      if (step == 1) {
        if (!params.hasNext()) {
          return done();
        } else if (output.isCont()) {
          output = output.write(';');
          step = 2;
        }
      }
      if (step == 2 && output.isCont()) {
        output = output.write(' ');
        step = 3;
      }
      if (step == 3) {
        if (part == null) {
          final Map.Entry<?, ?> param = params.next();
          part = http.writeParam(param.getKey().toString(), param.getValue().toString(), output);
        } else {
          part = part.pull(output);
        }
        if (part.isDone()) {
          part = null;
          step = 1;
          continue;
        } else if (part.isError()) {
          return part.asError();
        }
      }
      break;
    } while (true);
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new ParamMapWriter(http, params, part, step);
  }

  public static Writer<Object, Object> write(Output<?> output, HttpWriter http,
                                             Iterator<? extends Map.Entry<?, ?>> params) {
    return write(output, http, params, null, 1);
  }
}
