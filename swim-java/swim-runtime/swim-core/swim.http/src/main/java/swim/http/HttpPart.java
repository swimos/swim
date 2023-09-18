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
import swim.codec.Utf8;
import swim.codec.Writer;

public abstract class HttpPart {

  public HttpPart() {
    // nop
  }

  public abstract Writer<?, ?> httpWriter(HttpWriter http);

  public Writer<?, ?> httpWriter() {
    return this.httpWriter(Http.standardWriter());
  }

  public abstract Writer<?, ?> writeHttp(Output<?> output, HttpWriter http);

  public Writer<?, ?> writeHttp(Output<?> output) {
    return this.writeHttp(output, Http.standardWriter());
  }

  public String toHttp() {
    final Output<String> output = Utf8.decodedString();
    this.writeHttp(output).bind();
    return output.bind();
  }

}
