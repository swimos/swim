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

package swim.http.header;

import swim.codec.Base10;
import swim.codec.Output;
import swim.codec.Unicode;
import swim.codec.Writer;
import swim.codec.WriterException;
import swim.uri.UriHost;
import swim.uri.UriPort;

final class HostHeaderWriter extends Writer<Object, Object> {

  final UriHost host;
  final UriPort port;
  final Writer<?, ?> part;
  final int step;

  HostHeaderWriter(UriHost host, UriPort port, Writer<?, ?> part, int step) {
    this.host = host;
    this.port = port;
    this.part = part;
    this.step = step;
  }

  HostHeaderWriter(UriHost host, UriPort port) {
    this(host, port, null, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return HostHeaderWriter.write(output, this.host, this.port, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, UriHost host, UriPort port,
                                      Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = Unicode.writeString(output, host.toString());
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        if (!port.isDefined()) {
          return Writer.done();
        } else {
          step = 2;
        }
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 2 && output.isCont()) {
      output = output.write(':');
      step = 3;
    }
    if (step == 3) {
      if (part == null) {
        part = Base10.writeInt(output, port.number());
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
    return new HostHeaderWriter(host, port, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, UriHost host, UriPort port) {
    return HostHeaderWriter.write(output, host, port, null, 1);
  }

}
