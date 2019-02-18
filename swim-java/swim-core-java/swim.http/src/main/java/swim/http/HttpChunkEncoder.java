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

import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;
import swim.codec.Writer;

final class HttpChunkEncoder extends Encoder<Object, Object> {
  final HttpWriter http;
  final HttpChunkHeader header;
  final Encoder<?, ?> content;
  final Writer<?, ?> part;
  final int step;

  HttpChunkEncoder(HttpWriter http, HttpChunkHeader header, Encoder<?, ?> content,
                   Writer<?, ?> part, int step) {
    this.http = http;
    this.header = header;
    this.content = content;
    this.part = part;
    this.step = step;
  }

  HttpChunkEncoder(HttpWriter http, HttpChunkHeader header, Encoder<?, ?> content) {
    this(http, header, content, null, 1);
  }

  @Override
  public Encoder<Object, Object> pull(OutputBuffer<?> output) {
    return encode(output, this.http, this.header, this.content, this.part, this.step);
  }

  static Encoder<Object, Object> encode(OutputBuffer<?> output, HttpWriter http, HttpChunkHeader header,
                                        Encoder<?, ?> content, Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = Utf8.writeEncoded(header.httpWriter(http), output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        step = 2;
      } else if (part.isError()) {
        return error(part.trap());
      }
    }
    if (step == 2) {
      content = content.pull(output);
      if (content.isDone()) {
        step = 3;
      } else if (content.isError()) {
        return content.asError();
      }
    }
    if (step == 3 && output.isCont()) {
      output = output.write('\r');
      step = 4;
    }
    if (step == 4 && output.isCont()) {
      output = output.write('\n');
      return done();
    }
    if (output.isDone()) {
      return error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new HttpChunkEncoder(http, header, content, part, step);
  }

  static Encoder<Object, Object> encode(OutputBuffer<?> output, HttpWriter http,
                                        HttpChunkHeader header, Encoder<?, ?> content) {
    return encode(output, http, header, content, null, 1);
  }
}
