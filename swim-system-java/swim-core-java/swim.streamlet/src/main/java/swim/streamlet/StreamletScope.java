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

package swim.streamlet;

public interface StreamletScope<O> {
  /**
   * Returns the lexically scoped parent of this {@code StreamletScope}.
   * Returns {@code null} if this {@code StreamletScope} has no lexical parent.
   */
  StreamletScope<? extends O> streamletScope();

  /**
   * Returns the environment in which this {@code StreamletScope} operates.
   */
  StreamletContext streamletContext();

  /**
   * Returns an {@code Outlet} that updates when the specified {@code key}
   * updates.
   */
  Outlet<O> outlet(String key);
}
