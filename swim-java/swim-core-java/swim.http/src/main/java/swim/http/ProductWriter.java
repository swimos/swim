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

final class ProductWriter extends Writer<Object, Object> {
  final HttpWriter http;
  final String name;
  final String version;
  final Iterator<String> comments;
  final Writer<?, ?> part;
  final int step;

  ProductWriter(HttpWriter http, String name, String version, Iterator<String> comments,
                Writer<?, ?> part, int step) {
    this.http = http;
    this.name = name;
    this.version = version;
    this.comments = comments;
    this.part = part;
    this.step = step;
  }

  ProductWriter(HttpWriter http, String name, String version, Iterator<String> comments) {
    this(http, name, version, comments, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.http, this.name, this.version, this.comments,
                 this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String name,
                                      String version, Iterator<String> comments,
                                      Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = http.writeToken(name, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        if (version != null) {
          step = 2;
        } else if (comments.hasNext()) {
          step = 4;
        } else {
          return done();
        }
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
        part = http.writeToken(version, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        if (comments.hasNext()) {
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
        part = http.writeComments(comments, output);
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
    return new ProductWriter(http, name, version, comments, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, String name,
                                      String version, Iterator<String> comments) {
    return write(output, http, name, version, comments, null, 1);
  }
}
