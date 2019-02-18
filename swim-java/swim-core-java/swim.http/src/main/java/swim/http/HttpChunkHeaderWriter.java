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
import swim.codec.Base16;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class HttpChunkHeaderWriter extends Writer<Object, Object> {
  final HttpWriter http;
  final long size;
  final Iterator<ChunkExtension> extensions;
  final Writer<?, ?> part;
  final int step;

  HttpChunkHeaderWriter(HttpWriter http, long size, Iterator<ChunkExtension> extensions,
                        Writer<?, ?> part, int step) {
    this.http = http;
    this.size = size;
    this.extensions = extensions;
    this.part = part;
    this.step = step;
  }

  HttpChunkHeaderWriter(HttpWriter http, long size, Iterator<ChunkExtension> extensions) {
    this(http, size, extensions, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.http, this.size, this.extensions, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, long size,
                                      Iterator<ChunkExtension> extensions,
                                      Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = Base16.uppercase().writeLong(size, output);
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
    do {
      if (step == 2) {
        if (!extensions.hasNext()) {
          step = 4;
        } else if (output.isCont()) {
          output = output.write(';');
          step = 3;
        }
      }
      if (step == 3) {
        if (part == null) {
          part = extensions.next().writeHttp(output, http);
        } else {
          part = part.pull(output);
        }
        if (part.isDone()) {
          part = null;
          step = 2;
          continue;
        } else if (part.isError()) {
          return part.asError();
        }
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
    return new HttpChunkHeaderWriter(http, size, extensions, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, long size,
                                      Iterator<ChunkExtension> extensions) {
    return write(output, http, size, extensions, null, 1);
  }
}
