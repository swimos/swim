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

package swim.uri;

import swim.codec.Output;

final class UriHostUndefined extends UriHost {

  @Override
  public boolean isDefined() {
    return false;
  }

  @Override
  public String address() {
    return "";
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("UriHost").write('.').write("undefined").write('(').write(')');
    return output;
  }

  @Override
  public <T> Output<T> display(Output<T> output) {
    return output; // blank
  }

  @Override
  public String toString() {
    return "";
  }

}
