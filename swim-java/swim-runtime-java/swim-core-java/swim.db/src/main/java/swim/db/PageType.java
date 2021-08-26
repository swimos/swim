// Copyright 2015-2021 Swim Inc.
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

package swim.db;

import swim.codec.Debug;
import swim.codec.Output;

public enum PageType implements Debug {

  NODE("node"),
  LEAF("leaf");

  final String tag;

  PageType(String tag) {
    this.tag = tag;
  }

  public boolean isNode() {
    return this == PageType.NODE;
  }

  public boolean isLeaf() {
    return this == PageType.LEAF;
  }

  public String tag() {
    return this.tag;
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("PageType").write('.').write(this.name());
    return output;
  }

  public static PageType fromTag(String tag) {
    if ("node".equals(tag)) {
      return PageType.NODE;
    } else if ("leaf".equals(tag)) {
      return PageType.LEAF;
    } else {
      return null;
    }
  }

}
